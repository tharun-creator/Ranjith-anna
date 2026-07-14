import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchInvoices, updateInvoice, triggerSync } from '@/api/invoices'

export interface Invoice {
  id: string
  vendor_name: string
  invoice_number?: string
  invoice_date?: string
  due_date?: string
  total_amount?: number
  currency?: string
  status?: string // 'paid' | 'pending' | 'overdue'
  payment_status?: string
  confidence_score?: number
  notes?: string
  ledger_code?: string
  ledger_name?: string
  ledger_category?: string
  ledger_group?: string
  ledger_confidence?: number
  document_type?: string
  email_direction?: string
  financial_event?: string
  transaction_type?: string
  sender?: string
  is_duplicate?: boolean
  line_items?: any[]
}

interface InvoiceContextProps {
  invoices: Invoice[]
  isLoading: boolean
  isSyncing: boolean
  syncError: string | null
  syncSuccess: string | null
  triggerMailSync: () => void
  modifyInvoice: (id: string, payload: Partial<Invoice>) => Promise<void>
  activeTab: string
  setActiveTab: (tab: string) => void
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  expertMode: boolean
  setExpertMode: (val: boolean) => void
}

const InvoiceContext = createContext<InvoiceContextProps | undefined>(undefined)

const DEFAULT_MOCK_INVOICES: Invoice[] = [
  { id: 'INV-2026-001', vendor_name: 'Amazon Web Services', invoice_number: 'AWS-9921', invoice_date: '2026-07-01', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 95, status: 'paid', payment_status: 'paid', total_amount: 1420.50, currency: 'USD', sender: 'billing@aws.amazon.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-002', vendor_name: 'Google Cloud Platform', invoice_number: 'GCP-8832', invoice_date: '2026-07-01', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 92, status: 'paid', payment_status: 'paid', total_amount: 890.00, currency: 'USD', sender: 'noreply-gcp@google.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-003', vendor_name: 'Figma Inc.', invoice_number: 'FIGMA-2231', invoice_date: '2026-07-03', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 98, status: 'paid', payment_status: 'paid', total_amount: 150.00, currency: 'USD', sender: 'billing@figma.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-004', vendor_name: 'Razorpay Software', invoice_number: 'RZP-8831', invoice_date: '2026-07-06', ledger_code: 'ASP-26', ledger_name: 'Vendors, Freelancers', confidence_score: 72, status: 'pending', payment_status: 'pending', total_amount: 3500.00, currency: 'INR', sender: 'payouts@razorpay.com', transaction_type: 'EXPENSE', document_type: 'payment_confirmation', email_direction: 'MAIL_RECEIVED', financial_event: 'PENDING' },
  { id: 'INV-2026-005', vendor_name: 'WeWork India', invoice_number: 'WW-0091', invoice_date: '2026-07-06', ledger_code: 'SISU-61', ledger_name: 'Rent for Office Space', confidence_score: 99, status: 'paid', payment_status: 'paid', total_amount: 45000.00, currency: 'INR', sender: 'billing@wework.co.in', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-006', vendor_name: 'Vercel Inc.', invoice_number: 'VRC-1123', invoice_date: '2026-07-08', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 96, status: 'paid', payment_status: 'paid', total_amount: 40.00, currency: 'USD', sender: 'billing@vercel.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-007', vendor_name: 'Fly Emirates', invoice_number: 'EK-77312', invoice_date: '2026-07-08', ledger_code: 'ASP-59', ledger_name: 'Travelling & Conveyance', confidence_score: 89, status: 'paid', payment_status: 'paid', total_amount: 1200.00, currency: 'USD', sender: 'booking@emirates.com', transaction_type: 'EXPENSE', document_type: 'payment_receipt', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-008', vendor_name: 'DigitalOcean', invoice_number: 'DO-5521', invoice_date: '2026-07-10', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 91, status: 'paid', payment_status: 'paid', total_amount: 240.00, currency: 'USD', sender: 'billing@digitalocean.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-009', vendor_name: 'Adobe Systems', invoice_number: 'ADB-9921', invoice_date: '2026-07-10', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 65, status: 'pending', payment_status: 'pending', total_amount: 80.00, currency: 'USD', sender: 'creativecloud@adobe.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PENDING' },
  { id: 'INV-2026-010', vendor_name: 'HDFC Corporate Card', invoice_number: 'HDFC-882', invoice_date: '2026-07-12', ledger_code: 'ASP-33', ledger_name: 'Professional & Legal Expense', confidence_score: 88, status: 'overdue', payment_status: 'overdue', total_amount: 12450.00, currency: 'INR', sender: 'alerts@hdfcbank.net', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAYMENT_OVERDUE' },
  { id: 'INV-2026-011', vendor_name: 'Uber India', invoice_number: 'UBR-33211', invoice_date: '2026-07-12', ledger_code: 'ASP-59', ledger_name: 'Travelling & Conveyance', confidence_score: 84, status: 'paid', payment_status: 'paid', total_amount: 450.00, currency: 'INR', sender: 'receipts.india@uber.com', transaction_type: 'EXPENSE', document_type: 'payment_receipt', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-012', vendor_name: 'Figma Inc.', invoice_number: 'FIGMA-9921', invoice_date: '2026-07-15', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 97, status: 'paid', payment_status: 'paid', total_amount: 150.00, currency: 'USD', sender: 'billing@figma.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-013', vendor_name: 'Amazon Web Services', invoice_number: 'AWS-4412', invoice_date: '2026-07-15', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 94, status: 'paid', payment_status: 'paid', total_amount: 1395.20, currency: 'USD', sender: 'billing@aws.amazon.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-014', vendor_name: 'GitHub Inc.', invoice_number: 'GH-8822', invoice_date: '2026-07-17', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 98, status: 'paid', payment_status: 'paid', total_amount: 2500.00, currency: 'USD', sender: 'billing@github.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-015', vendor_name: 'Slack Technologies', invoice_number: 'SLK-221', invoice_date: '2026-07-20', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 95, status: 'paid', payment_status: 'paid', total_amount: 320.00, currency: 'USD', sender: 'billing@slack.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-016', vendor_name: 'BlueTokai Coffee', invoice_number: 'BT-9921', invoice_date: '2026-07-20', ledger_code: 'ASP-35', ledger_name: 'Food, Beverages, Event', confidence_score: 78, status: 'pending', payment_status: 'pending', total_amount: 1200.00, currency: 'INR', sender: 'orders@bluetokaicoffee.com', transaction_type: 'EXPENSE', document_type: 'payment_receipt', email_direction: 'MAIL_RECEIVED', financial_event: 'PENDING' },
  { id: 'INV-2026-017', vendor_name: 'Stripe Payments', invoice_number: 'STR-9912', invoice_date: '2026-07-22', ledger_code: 'ASP-33', ledger_name: 'Professional & Legal Expense', confidence_score: 93, status: 'paid', payment_status: 'paid', total_amount: 75.00, currency: 'USD', sender: 'billing@stripe.com', transaction_type: 'EXPENSE', document_type: 'payment_confirmation', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-018', vendor_name: 'Swiggy Lunch', invoice_number: 'SWG-9921', invoice_date: '2026-07-22', ledger_code: 'ASP-23', ledger_name: 'Team Lunch & Outing', confidence_score: 55, status: 'pending', payment_status: 'pending', total_amount: 2450.00, currency: 'INR', sender: 'receipts@swiggy.in', transaction_type: 'EXPENSE', document_type: 'payment_receipt', email_direction: 'MAIL_RECEIVED', financial_event: 'PENDING' },
  { id: 'INV-2026-019', vendor_name: 'OpenAI API Charge', invoice_number: 'OPENAI-991', invoice_date: '2026-07-24', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 96, status: 'paid', payment_status: 'paid', total_amount: 480.00, currency: 'USD', sender: 'billing@openai.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-020', vendor_name: 'Anthropic Claude', invoice_number: 'CLD-991', invoice_date: '2026-07-24', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 94, status: 'paid', payment_status: 'paid', total_amount: 310.00, currency: 'USD', sender: 'billing@anthropic.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-021', vendor_name: 'Canva Pro', invoice_number: 'CNV-221', invoice_date: '2026-07-27', ledger_code: 'ASP-28', ledger_name: 'Softwares, Laptop Rental', confidence_score: 92, status: 'paid', payment_status: 'paid', total_amount: 120.00, currency: 'USD', sender: 'billing@canva.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-022', vendor_name: 'Salesforce Inc.', invoice_number: 'SF-88122', invoice_date: '2026-07-27', ledger_code: 'ASP-30', ledger_name: 'Marketing & Branding Expenses', confidence_score: 89, status: 'paid', payment_status: 'paid', total_amount: 980.00, currency: 'USD', sender: 'billing@salesforce.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-023', vendor_name: 'Mailchimp Monthly', invoice_number: 'MC-22311', invoice_date: '2026-07-29', ledger_code: 'ASP-30', ledger_name: 'Marketing & Branding Expenses', confidence_score: 91, status: 'paid', payment_status: 'paid', total_amount: 150.00, currency: 'USD', sender: 'billing@mailchimp.com', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAID' },
  { id: 'INV-2026-024', vendor_name: 'HDFC Corporate Card', invoice_number: 'HDFC-885', invoice_date: '2026-07-29', ledger_code: 'ASP-33', ledger_name: 'Professional & Legal Expense', confidence_score: 85, status: 'overdue', payment_status: 'overdue', total_amount: 8400.00, currency: 'INR', sender: 'alerts@hdfcbank.net', transaction_type: 'EXPENSE', document_type: 'invoice', email_direction: 'MAIL_RECEIVED', financial_event: 'PAYMENT_OVERDUE' }
]

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as 'light' | 'dark') || 'light'
  })
  const [expertMode, setExpertMode] = useState<boolean>(() => {
    return localStorage.getItem('expertMode') === 'true'
  })
  const [mockInvoices, setMockInvoices] = useState<Invoice[]>(DEFAULT_MOCK_INVOICES)

  useEffect(() => {
    localStorage.setItem('theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem('expertMode', String(expertMode))
  }, [expertMode])

  // React Query fetch
  const { data: apiInvoices, isLoading: apiLoading } = useQuery<any>({
    queryKey: ['invoices'],
    queryFn: () => fetchInvoices({ pageParam: 0 }),
    retry: false
  })

  const queryClient = useQueryClient()
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null)

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: (data) => {
      setSyncSuccessMsg(data.message || 'Sync successfully triggered!')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setTimeout(() => setSyncSuccessMsg(null), 5000)
    },
    onError: (err: any) => {
      setSyncStatusMsg(err.response?.data?.detail || 'Sync failed to trigger.')
      setTimeout(() => setSyncStatusMsg(null), 5000)
    }
  })

  // Combine backend + fallback mock data
  const invoices = useMemo(() => {
    if (apiInvoices?.items && apiInvoices.items.length > 0) {
      return apiInvoices.items.map((item: any) => ({
        id: item.id,
        vendor_name: item.vendor_name || 'Unknown Vendor',
        invoice_number: item.invoice_number,
        invoice_date: item.invoice_date,
        due_date: item.due_date,
        total_amount: item.total_amount,
        currency: item.currency,
        status: item.status || 'pending',
        payment_status: item.status,
        confidence_score: item.confidence_score,
        notes: item.notes,
        ledger_code: item.ledger_code,
        ledger_name: item.ledger_name,
        ledger_category: item.ledger_category,
        ledger_group: item.ledger_group,
        ledger_confidence: item.ledger_confidence,
        document_type: item.document_type,
        email_direction: item.email_direction,
        financial_event: item.financial_event,
        transaction_type: item.transaction_type,
        sender: item.sender,
        is_duplicate: item.is_duplicate,
        line_items: item.line_items || []
      }))
    }
    return mockInvoices
  }, [apiInvoices, mockInvoices])

  const triggerMailSync = () => {
    syncMutation.mutate()
  }

  const modifyInvoice = async (id: string, payload: Partial<Invoice>) => {
    try {
      // attempt API update first
      await updateInvoice(id, {
        status: payload.status,
        notes: payload.notes,
        ledger_code: payload.ledger_code,
        document_type: payload.document_type
      })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    } catch (err) {
      // Fallback: update local mock state
      setMockInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, ...payload } : inv))
    }
  }

  return (
    <InvoiceContext.Provider value={{
      invoices,
      isLoading: apiLoading && invoices.length === 0,
      isSyncing: syncMutation.isPending,
      syncError: syncStatusMsg,
      syncSuccess: syncSuccessMsg,
      triggerMailSync,
      modifyInvoice,
      activeTab,
      setActiveTab,
      theme,
      setTheme,
      expertMode,
      setExpertMode
    }}>
      {children}
    </InvoiceContext.Provider>
  )
}

export const useInvoices = () => {
  const context = useContext(InvoiceContext)
  if (context === undefined) {
    throw new Error('useInvoices must be used within an InvoiceProvider')
  }
  return context
}
