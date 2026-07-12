import pytest
import datetime
import time
from unittest.mock import AsyncMock, MagicMock, patch
from app.api.auth import google_callback
from app.services.sync_service import sync_gmail_invoices
from app.api.invoices import update_invoice, InvoiceUpdatePayload
from app.models import User, Organization, GmailConnection, EmailRecord, Attachment, Invoice

@pytest.mark.asyncio
@patch('app.api.auth.Flow')
@patch('app.api.auth.build')
@patch('app.api.auth.create_access_token')
async def test_auth_callback_flow(mock_token, mock_build, mock_flow_class,):
    # Setup Google OAuth mocks
    mock_flow = MagicMock()
    mock_flow.credentials = MagicMock()
    mock_flow_class.from_client_config.return_value = mock_flow
    
    # Mock Google User Info API
    mock_service = MagicMock()
    mock_userinfo = MagicMock()
    mock_userinfo.execute.return_value = {
        "email": "user@example.com",
        "id": "google_12345",
        "name": "Test User"
    }
    mock_service.userinfo.return_value.get.return_value = mock_userinfo
    mock_build.return_value = mock_service
    
    # Mock FastAPI dependencies
    mock_request = MagicMock()
    mock_request.query_params = {"code": "auth_code_xyz", "state": "oauth_state"}
    mock_request.url = "http://localhost:8000/google/callback"
    mock_bg_tasks = MagicMock()
    
    # Mock Database Session
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.execute = AsyncMock()
    
    # Mock select execute results (return None for non-existing organization, user, connection)
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result
    
    # Trigger Callback
    response = await google_callback(request=mock_request, background_tasks=mock_bg_tasks, db=mock_db)
    
    # Verify DB registrations
    # User, Organization, and GmailConnection should be created & added
    added_types = [type(args[0]) for args, kwargs in mock_db.add.call_args_list]
    assert Organization in added_types
    assert User in added_types
    assert GmailConnection in added_types
    
    mock_db.commit.assert_called_once()
    assert response.status_code == 307  # Redirect response back to frontend

@pytest.mark.asyncio
@patch('app.services.sync_service.GmailService')
@patch('app.services.sync_service.AIExtractionService')
@patch('app.services.sync_service.AsyncSessionLocal')
async def test_sync_gmail_invoices_flow(mock_session_local, mock_ai_service_class, mock_gmail_service_class):
    current_time_ms = time.time() * 1000.0
    
    # Mock Gmail Service (returns one email with PDF attachment)
    mock_gmail = MagicMock()
    mock_gmail.fetch_invoice_emails.return_value = [{
        "message_id": "msg_111",
        "sender": "vendor@billing.com",
        "subject": "Invoice #55",
        "received_at": current_time_ms,
        "attachments": [{"filename": "invoice.pdf", "attachment_id": "att_111"}],
        "body": "Hi, please pay our invoice attached."
    }]
    mock_gmail.download_attachment.return_value = b"%PDF-1.4 dummy pdf bytes"
    mock_gmail_service_class.return_value = mock_gmail
    
    # Mock AI service to extract structured invoice data
    mock_ai = AsyncMock()
    mock_ai.extract_invoice_data.return_value = {
        "vendor_name": "Billing Vendor",
        "total_amount": 500.0,
        "invoice_number": "INV-55",
        "currency": "INR",
        "ledger_code": "ASP-28",
        "ledger_name": "Softwares, Laptop Rental"
    }
    mock_ai_service_class.return_value = mock_ai
    
    # Mock DB session
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.execute = AsyncMock()
    
    # Bind the mock session context manager returned by AsyncSessionLocal
    mock_session_local.return_value.__aenter__.return_value = mock_db
    mock_session_local.return_value.__aexit__ = AsyncMock()
    
    # Mock no existing record check (returns None)
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    mock_db.execute.return_value = mock_result
    
    # Mock FileStorage
    mock_storage = MagicMock()
    mock_storage.save.return_value = "storage_key_111.pdf"
    
    connection = GmailConnection(
        org_id=None,
        user_id=None,
        gmail_address="user@example.com",
        encrypted_access_token="tok_123",
        encrypted_refresh_token="ref_123"
    )
    
    stats = await sync_gmail_invoices(db=mock_db, connection=connection, days_back=30, storage=mock_storage)
    
    # Verify entities written to DB
    added_types = [type(args[0]) for args, kwargs in mock_db.add.call_args_list]
    assert EmailRecord in added_types
    assert Attachment in added_types
    assert Invoice in added_types

@pytest.mark.asyncio
async def test_invoice_override_flow():
    # Setup target invoice
    target_invoice = Invoice(
        id=None,
        user_id=None,
        vendor_name="Test Vendor",
        total_amount=150.0,
        ledger_confidence=40.0,  # Uncategorized
        ledger_code="UNCATEGORIZED"
    )
    
    # Mock DB session
    mock_db = MagicMock()
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.execute = AsyncMock()
    
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = target_invoice
    mock_db.execute.return_value = mock_result
    
    # Payload for updating/categorizing invoice manually
    payload = InvoiceUpdatePayload(
        ledger_code="ASP-28",
        invoice_type="ASP-28"
    )
    
    current_user = User(id=None, email="user@example.com")
    
    # Call Override endpoint
    res = await update_invoice(
        invoice_id="00000000-0000-0000-0000-000000000000",
        payload=payload,
        db=mock_db,
        current_user=current_user
    )
    
    # Manual categorization override MUST set confidence to 100.0
    assert target_invoice.ledger_confidence == 100.0
    assert target_invoice.ledger_code == "ASP-28"
    mock_db.commit.assert_called_once()
