import io
import os
import uuid
import pypdf
import logging
import asyncio
from typing import Any
from datetime import datetime, timezone
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Invoice, EmailRecord, GmailConnection, Attachment
from app.services.gmail_service import GmailService
from app.services.ai_extraction_service import AIExtractionService
from app.services.storage import FileStorage, get_storage
from app.database import AsyncSessionLocal

logger = logging.getLogger(__name__)

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        reader = pypdf.PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        return ""

async def process_single_email(
    email: dict,
    days_back: int,
    default_org_id: Any,
    default_user_id: Any,
    connection_email: str,
    storage: FileStorage,
    gmail_service: GmailService,
    ai_service: AIExtractionService,
    semaphore: asyncio.Semaphore,
    stats: dict
) -> None:
    """Processes a single email, downloads PDF attachments, calls LLM under a semaphore, and commits records."""
    msg_id = email["message_id"]
    try:
        # Create a dedicated session for this concurrent task to avoid shared session conflicts
        async with AsyncSessionLocal() as db:
            # Check if this email record is already in DB
            stmt = select(EmailRecord).filter(EmailRecord.gmail_message_id == msg_id)
            res = await db.execute(stmt)
            existing_record = res.scalars().first()
            
            if existing_record:
                if existing_record.processing_status == "completed":
                    return
                email_record = existing_record
                email_record.processing_status = "processing"
            else:
                # Create a new EmailRecord
                import datetime as dt_module
                received_at_dt = None
                if email.get("received_at"):
                    received_at_dt = dt_module.datetime.fromtimestamp(email["received_at"] / 1000.0, tz=dt_module.timezone.utc)

                # Ignore emails older than 30 days unless a full sync is triggered (days_back > 30)
                if received_at_dt and days_back <= 30:
                    cutoff = dt_module.datetime.now(dt_module.timezone.utc) - dt_module.timedelta(days=30)
                    if received_at_dt < cutoff:
                        logger.info(f"Skipping email {msg_id} older than 30 days: received_at={received_at_dt}")
                        return

                email_record = EmailRecord(
                    org_id=default_org_id,
                    gmail_message_id=msg_id,
                    sender=email["sender"],
                    subject=email["subject"],
                    has_attachments=len(email.get("attachments", [])) > 0,
                    processing_status="processing",
                    received_at=received_at_dt
                )
                db.add(email_record)
                await db.flush() # Populate id
            
            pdf_text = ""
            first_pdf_bytes = None
            attachments = email.get("attachments", [])
            
            # Process PDF attachments
            for att in attachments:
                if att["filename"].lower().endswith(".pdf"):
                    pdf_bytes = gmail_service.download_attachment(msg_id, att["attachment_id"])
                    if pdf_bytes:
                        if first_pdf_bytes is None:
                            first_pdf_bytes = pdf_bytes
                        extracted_text = extract_text_from_pdf(pdf_bytes)
                        if extracted_text:
                            pdf_text += f"\n--- Attachment: {att['filename']} ---\n" + extracted_text
                        
                        # Save attachment file to storage backend and add Attachment record to DB
                        try:
                            att_id = uuid.uuid4()
                            storage_key = f"{att_id}.pdf"
                            storage.save(pdf_bytes, storage_key, "application/pdf")
                                
                            attachment_record = Attachment(
                                id=att_id,
                                org_id=default_org_id,
                                email_record_id=email_record.id,
                                gmail_attachment_id=att["attachment_id"],
                                filename=att["filename"],
                                mime_type="application/pdf",
                                file_size_bytes=len(pdf_bytes),
                                storage_path=storage_key,
                                processing_status="completed",
                                extracted_text=extracted_text
                            )
                            db.add(attachment_record)
                        except Exception as store_err:
                            logger.error(f"Failed to save PDF attachment to storage backend or to DB: {store_err}", exc_info=True)
            
            # Fallback to email body text if no PDF text is available
            extraction_source_text = pdf_text.strip()
            if not extraction_source_text:
                extraction_source_text = email.get("body", "").strip()
            
            if not extraction_source_text and not first_pdf_bytes:
                email_record.processing_status = "failed"
                email_record.raw_body_preview = "No text extracted from PDF or email body."
                await db.commit()
                stats["failed"] += 1
                return
                
            # Run AI extraction under the bounded semaphore to prevent API rate-limit bursts
            async with semaphore:
                extracted_data = await ai_service.extract_invoice_data(
                    text_content=extraction_source_text,
                    pdf_bytes=first_pdf_bytes,
                    email_sender=email_record.sender or "",
                    email_subject=email_record.subject or "",
                    connection_email=connection_email or ""
                )
            
            if not extracted_data or (not extracted_data.get("vendor_name") and not extracted_data.get("vendor_or_customer_name") and not extracted_data.get("total_amount")):
                email_record.processing_status = "failed"
                email_record.raw_body_preview = f"AI extraction did not identify this PDF or email as a financial event. Result: {extracted_data}"
                await db.commit()
                stats["failed"] += 1
                return
                
            # Parse dates
            invoice_date = None
            if extracted_data.get("invoice_date"):
                try:
                    invoice_date = datetime.strptime(extracted_data["invoice_date"], "%Y-%m-%d")
                except ValueError:
                    pass
                    
            due_date = None
            if extracted_data.get("due_date"):
                try:
                    due_date = datetime.strptime(extracted_data["due_date"], "%Y-%m-%d")
                except ValueError:
                    pass
            
            # Validate total_amount (not null constraint in PostgreSQL)
            total_amount = extracted_data.get("total_amount")
            if total_amount is None:
                subtotal = extracted_data.get("subtotal")
                tax_amount = extracted_data.get("tax_amount") or 0.0
                if subtotal is not None:
                    total_amount = subtotal + tax_amount
            
            if total_amount is None:
                total_amount = extracted_data.get("amount") or 0.0
            
            # Extract communication intelligence fields
            email_direction = extracted_data.get("email_direction", "MAIL_RECEIVED")
            financial_event = extracted_data.get("financial_event", "RAISED")
            transaction_type = extracted_data.get("transaction_type", "EXPENSE")
            financial_impact = extracted_data.get("financial_impact", "NONE")
            cashflow = extracted_data.get("cashflow", "NONE")
            event_status = extracted_data.get("status", "pending")
            
            # Apply Golden Rule: Status-only events must never modify financial balances (impact/cashflow = NONE)
            status_only_events = ["REQUESTED", "RAISED", "PENDING", "REMINDER", "PAYMENT_OVERDUE", "RENEWAL", "CANCELLED", "APPROVED", "REJECTED"]
            if financial_event in status_only_events:
                financial_impact = "NONE"
                cashflow = "NONE"
            
            # Get ledger classification from extracted data
            l_code = extracted_data.get("ledger_code")
            l_name = extracted_data.get("ledger_name")
            l_category = extracted_data.get("ledger_category")
            l_group = extracted_data.get("ledger_group")
            l_confidence = extracted_data.get("ledger_confidence") or 0.0

            # If confidence is below 80% or code is empty, map as Uncategorized
            if l_confidence < 80.0 or not l_code:
                l_code = "UNCATEGORIZED"
                l_name = "Uncategorized"
                l_category = "Uncategorized"
                l_group = "Uncategorized"

            document_type = extracted_data.get("document_type", "other")

            # Save invoice to DB
            invoice = Invoice(
                org_id=default_org_id,
                user_id=default_user_id,
                email_record_id=email_record.id,
                invoice_number=extracted_data.get("invoice_number"),
                vendor_name=extracted_data.get("vendor_or_customer_name") or extracted_data.get("vendor_name"),
                vendor_email=extracted_data.get("vendor_email"),
                vendor_address=extracted_data.get("vendor_address"),
                invoice_type=l_code, # Save category ledger code for backward compatibility
                invoice_date=invoice_date,
                due_date=due_date,
                subtotal=extracted_data.get("subtotal"),
                total_tax=extracted_data.get("tax_amount"),
                total_amount=total_amount,
                currency=extracted_data.get("currency") or "INR",
                confidence_score=extracted_data.get("confidence_score"),
                notes=extracted_data.get("purpose"),
                line_items=extracted_data.get("line_items"),
                payment_terms=extracted_data.get("payment_terms"),
                payment_status=event_status,
                approval_status="pending",
                email_direction=email_direction,
                financial_event=financial_event,
                transaction_type=transaction_type,
                financial_impact=financial_impact,
                cashflow=cashflow,
                event_status=event_status,
                event_timestamp=email_record.received_at,
                ledger_code=l_code,
                ledger_name=l_name,
                ledger_category=l_category,
                ledger_group=l_group,
                ledger_confidence=l_confidence,
                document_type=document_type
            )
            db.add(invoice)
            await db.flush() # Ensure invoice.id is generated
            
            # Save FinancialEvent record
            from app.models import FinancialEvent
            fe = FinancialEvent(
                invoice_id=invoice.id,
                email_id=email_record.id,
                email_direction=email_direction,
                financial_event=financial_event,
                transaction_type=transaction_type,
                financial_impact=financial_impact,
                cashflow=cashflow,
                amount=total_amount,
                status=event_status,
                created_at=email_record.received_at or datetime.now(timezone.utc)
            )
            db.add(fe)

            # Update EmailRecord status
            email_record.processing_status = "completed"
            email_record.raw_body_preview = extraction_source_text[:500]
            
            await db.commit()
            stats["emails_processed"] += 1
            stats["invoices_created"] += 1

    except Exception as single_err:
        logger.error(f"Failed to sync individual email {msg_id}: {single_err}", exc_info=True)
        stats["failed"] += 1

async def sync_gmail_invoices(db: AsyncSession, connection: GmailConnection, days_back: int = 30, storage: FileStorage = None) -> dict:
    """
    Syncs invoices from Gmail for the given connection.
    Parallelizes email processing with asyncio.gather and bounds LLM requests with Semaphore.
    """
    stats = {
        "emails_fetched": 0,
        "emails_processed": 0,
        "invoices_created": 0,
        "failed": 0
    }
    
    if not connection.encrypted_refresh_token:
        logger.error(f"No refresh token available for GmailConnection {connection.gmail_address}")
        return stats
        
    try:
        if not storage:
            storage = get_storage()
            
        gmail_service = GmailService(connection.encrypted_refresh_token)
        emails = gmail_service.fetch_invoice_emails(days_back=days_back)
        stats["emails_fetched"] = len(emails)
        
        ai_service = AIExtractionService()
        
        # Attribute synced invoices to whichever user owns this Gmail connection
        default_org_id = connection.org_id
        default_user_id = connection.user_id

        # Limit concurrent calls to external AI providers (max 3 concurrent)
        semaphore = asyncio.Semaphore(3)

        # Build list of async tasks for parallel execution
        tasks = [
            process_single_email(
                email=email,
                days_back=days_back,
                default_org_id=default_org_id,
                default_user_id=default_user_id,
                connection_email=connection.gmail_address,
                storage=storage,
                gmail_service=gmail_service,
                ai_service=ai_service,
                semaphore=semaphore,
                stats=stats
            )
            for email in emails
        ]

        # Process all emails in parallel
        if tasks:
            await asyncio.gather(*tasks)
            
    except Exception as e:
        logger.error(f"Gmail sync process failed: {e}", exc_info=True)
        stats["failed"] += 1
        
    return stats
