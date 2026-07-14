# Finnex: Invoice & Expense Intelligence Dashboard

This document provides a comprehensive breakdown of the Finnex application architecture, database schemas, backend services, and frontend design patterns.

---

## 1. System Architecture

```mermaid
graph TD
    subgraph Frontend (React + Vite)
        UI[Dashboard UI] --> Context[InvoiceContext]
        Context --> API[API Client Layer]
    end

    subgraph Backend (FastAPI)
        API --> Routes[API Routes]
        Routes --> Services[OCR & Sync Services]
        Services --> GoogleAPI[Gmail API]
    end

    subgraph Database (Supabase PostgreSQL)
        Routes --> DB[(PostgreSQL)]
        RLS[Row Level Security] --> DB
    end
```

---

## 2. Directory Structure

```
finnex-invoice/
├── backend/                  # FastAPI Backend Application
│   ├── app/
│   │   ├── api/              # Route controllers (auth, invoices)
│   │   ├── services/         # Sync & OCR (Gmail extraction, text parsing)
│   │   ├── main.py           # Application entry point (Port 8000)
│   │   ├── database.py       # SQLAlchemy engine & session configurations
│   │   └── models.py         # SQLAlchemy database models mapping
├── frontend/                 # React Frontend Application
│   ├── src/
│   │   ├── api/              # API Client fetch methods
│   │   ├── components/       # Reusable components (drawers, charts, layout)
│   │   ├── context/          # Shared state context (InvoiceContext)
│   │   ├── pages/            # Core views (Dashboard, Invoices, Settings, etc.)
│   │   ├── App.tsx           # Application router and entrypoint
│   │   └── index.css         # Styling system & theme variables (Port 3000)
```

---

## 3. Technology Stack

### Backend
- **Core Framework:** FastAPI (Python)
- **Database Engine:** SQLAlchemy ORM (asyncpg driver)
- **Email Ingestion:** Google Gmail API (OAuth 2.0)
- **Data Extraction:** PDF text parsing & Gemini OCR extraction pipelines

### Frontend
- **Core Framework:** React 19 (TypeScript)
- **Bundler:** Vite
- **Styling:** Vanilla CSS variables + Tailwind tokens
- **Theme Palette:** 
  - Primary Dark Surface: `#0B0F3D` (Deep Navy)
  - Accent Highlight: `#D9FF4A` (Electric Lime)
  - Base Canvas: `#FFFFFF` / `#FAFAFA`
- **Charts:** Recharts (Money Flow, Sparklines, Spend Areas)

### Database
- **Provider:** Supabase PostgreSQL
- **Security:** Row Level Security (RLS) policies scoped to `auth.uid()` isolating workspace organizations and invoice records.

---

## 4. Frontend View Directories

1. **Overview Dashboard (`Dashboard.tsx`)**
   - Single-purpose dashboard cards with toggleable **Simple** (plain language labels) and **Detailed** (recharts sparklines) modes.
   - Money Flow composed charts with thick columns comparing monthly income vs expenses.
2. **Invoices spreadsheet (`Invoices.tsx`)**
   - Grid table with row checkboxes, multi-factor filter toolbar, and a floating bulk action drawer (Mark Paid, Recategorize).
   - Side panel drawer (`InvoiceDetailModal.tsx`) sliding in from the right to review extraction details, line items, and attachments.
3. **Vendors (`Vendors.tsx`)**
   - Directory listing of suppliers, total spending metrics, YTD transaction volumes, and spend trend Area Charts.
4. **Categories (`Categories.tsx`)**
   - Spend ratio breakdowns, quick-rename category fields, and category invoice lookups.
5. **Recurring (`Recurring.tsx`)**
   - Automatic heuristic detection of monthly subscriptions or cadence charges.
6. **Settings (`Settings.tsx`)**
   - Sub-navigation view enclosing Profile adjustments, team rosters, Gmail connections, and data export mechanisms. Includes a test toggle for Admin/Member privileges.
