# Finnex: Invoice & Expense Intelligence System

This document outlines the complete specifications, directory architecture, database schemas, and AI models utilized to build the Finnex platform.

---

## 1. Product Summary & Design Philosophy
Finnex is a web application designed to automatically track a user's expenses and invoices from their email inbox, presenting them in a low-friction, Vercel-style dashboard. The design handles two types of users through **progressive disclosure**:
1. **The Novice:** Someone who wants plain-language explanations (e.g., "Money Owed To Me" instead of "Accounts Receivable"). Toggled via the "Show Jargon" sidebar setting.
2. **The Expert:** Someone who wants to drill into specific category codes, export raw CSV tables, and manage security.

---

## 2. Directory Layout & Key Files

```
finnex-invoice/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                    # Routers (auth.py, invoices.py)
│   │   ├── services/
│   │   │   ├── ai_extraction.py    # Ingestion Gemini 2.5 Flash / OpenAI fallback
│   │   │   ├── gmail_service.py    # Gmail API interface
│   │   │   └── sync_service.py     # Email polling worker
│   │   ├── models.py               # Database schemas (SQLAlchemy)
│   │   └── database.py             # DB sessions (Supabase PostgreSQL pooler)
│   └── init_db_tables.py           # Database tables initialization script
├── frontend/                       # React 19 Frontend
│   ├── src/
│   │   ├── context/
│   │   │   └── InvoiceContext.tsx  # Global hooks, sync actions, & theme states
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── DashboardLayout.tsx # Dark sidebar rail & top header greeting
│   │   │   └── InvoiceDetailModal.tsx  # Converted slide-in details drawer
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # Stat cards, money flow charts, split panels
│   │   │   ├── Invoices.tsx        # Grid, checkbox actions, & filter toolbar
│   │   │   ├── Settings.tsx        # Profile, roster lists, Gmail auth pages
│   │   │   ├── Vendors.tsx         # Supplier spends & Area trends
│   │   │   └── Categories.tsx      # Spend ratios & category mappings
│   │   └── index.css               # Warm off-white off-page theme variables
```

---

## 3. Database Schema (Supabase PostgreSQL)
The application utilizes the following relational database tables (mapped in `backend/app/models.py`):
1. **`organizations`:** Custom fields including name, slug, domain, and currency.
2. **`users`:** Roster profiles linked to organizations.
3. **`gmail_connections`:** Access/refresh tokens for OAuth email sync.
4. **`email_records`:** Sync ledger tracking downloaded Gmail messages.
5. **`invoices`:** Main records containing dates, amounts, and extracted metadata (transaction type, ledger codes, etc.).
6. **`attachments`:** Raw file sizes, paths, and metadata.
7. **`financial_events`:** Action logs tracking communication timeline events.
8. **`ledger_master`:** System defaults for categorizing transactions.

---

## 4. Ingestion & AI Pipeline
The system automates invoice processing through a multi-tiered pipeline:
1. **Ingestion:** Worker reads Gmail threads using queries for financial attachments, downloading raw `.pdf` files.
2. **AI Multimodal Extraction:** PDF bytes are fed directly to **Gemini 2.5 Flash** (`gemini-2.5-flash`), which returns a structured JSON payload representing vendor names, quantities, and totals.
3. **Fallback:** If multimodal parsing fails, text is extracted via `pypdf` and sent to **OpenAI GPT** models or text fallbacks.
4. **Commit:** Structured data is committed to the database and pulled by the frontend.
