import { useState, useMemo } from 'react'
import { RefreshCw, Download, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { fetchInvoices, triggerSync, fetchLedgers } from '@/api/invoices'
import { InvoiceDetailModal, type Invoice } from '@/components/InvoiceDetailModal'
import { FilterToolbar } from '@/components/FilterToolbar'
import { InvoiceTable } from '@/components/InvoiceTable'

export const Invoices = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [txTypeFilter, setTxTypeFilter] = useState('all')
  const [docTypeFilter, setDocTypeFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState('all')
  const [eventFilter, setEventFilter] = useState('all')
  const [ledgerFilter, setLedgerFilter] = useState('all')
  const [showOnlyOriginal, setShowOnlyOriginal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [datePreset, setDatePreset] = useState('all')

  const { data: ledgers = [] } = useQuery<{
    ledger_code: string
    ledger_name: string
  }[]>({
    queryKey: ['ledgers'],
    queryFn: fetchLedgers
  })

  const handleDatePresetChange = (preset: string) => {
    setDatePreset(preset)
    const today = new Date()
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear()
      const mm = String(date.getMonth() + 1).padStart(2, '0')
      const dd = String(date.getDate()).padStart(2, '0')
      return `${yyyy}-${mm}-${dd}`
    }

    if (preset === 'all') {
      setStartDate('')
      setEndDate('')
    } else if (preset === 'today') {
      setStartDate(formatDate(today))
      setEndDate(formatDate(today))
    } else if (preset === 'last-7-days') {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(today.getDate() - 7)
      setStartDate(formatDate(sevenDaysAgo))
      setEndDate(formatDate(today))
    } else if (preset === 'last-30-days') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)
      setStartDate(formatDate(thirtyDaysAgo))
      setEndDate(formatDate(today))
    } else if (preset === 'last-90-days') {
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(today.getDate() - 90)
      setStartDate(formatDate(ninetyDaysAgo))
      setEndDate(formatDate(today))
    } else if (preset === 'this-month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      setStartDate(formatDate(startOfMonth))
      setEndDate(formatDate(endOfMonth))
    }
  }

  const queryClient = useQueryClient()
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null)

  const syncMutation = useMutation({
    mutationFn: triggerSync,
    onSuccess: (data) => {
      setSyncStatusMsg(data.message || 'Sync successfully triggered in the background!')
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] })
      setTimeout(() => setSyncStatusMsg(null), 5000)
    },
    onError: (err: any) => {
      setSyncStatusMsg(err.response?.data?.detail || 'Sync failed to trigger. Is Gmail connected?')
      setTimeout(() => setSyncStatusMsg(null), 5000)
    }
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['invoices'],
    queryFn: ({ pageParam }) => fetchInvoices({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage: any) => lastPage.next_offset,
  })

  const invoices = data ? data.pages.flatMap((page: any) => page.items) : []

  // Filter out invoices based on filter selections
  const filteredInvoices = useMemo(() => invoices.filter((inv: Invoice) => {
    if (showOnlyOriginal && inv.is_duplicate) {
      return false
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      const matchesNum = inv.invoice_number?.toLowerCase().includes(query)
      const matchesVendor = inv.vendor_name?.toLowerCase().includes(query)
      const matchesSender = inv.sender?.toLowerCase().includes(query)
      const matchesNotes = inv.notes?.toLowerCase().includes(query)
      if (!matchesNum && !matchesVendor && !matchesSender && !matchesNotes) {
        return false
      }
    }

    if (statusFilter && statusFilter !== 'all') {
      if (inv.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false
      }
    }

    if (txTypeFilter && txTypeFilter !== 'all') {
      if ((inv.transaction_type || 'EXPENSE').toLowerCase() !== txTypeFilter.toLowerCase()) {
        return false
      }
    }

    if (directionFilter && directionFilter !== 'all') {
      if ((inv.email_direction || 'MAIL_RECEIVED').toLowerCase() !== directionFilter.toLowerCase()) {
        return false
      }
    }

    if (docTypeFilter && docTypeFilter !== 'all') {
      if ((inv.document_type || 'other').toLowerCase() !== docTypeFilter.toLowerCase()) {
        return false
      }
    }

    if (eventFilter && eventFilter !== 'all') {
      if ((inv.financial_event || 'RAISED').toLowerCase() !== eventFilter.toLowerCase()) {
        return false
      }
    }

    if (ledgerFilter && ledgerFilter !== 'all') {
      if ((inv.ledger_code || 'UNCATEGORIZED').toLowerCase() !== ledgerFilter.toLowerCase()) {
        return false
      }
    }

    if (startDate) {
      if (!inv.invoice_date || inv.invoice_date < startDate) {
        return false
      }
    }
    if (endDate) {
      if (!inv.invoice_date || inv.invoice_date > endDate) {
        return false
      }
    }

    return true
  }), [
    invoices,
    showOnlyOriginal,
    searchQuery,
    statusFilter,
    txTypeFilter,
    directionFilter,
    docTypeFilter,
    eventFilter,
    ledgerFilter,
    startDate,
    endDate,
  ])

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) return

    const headers = [
      'Invoice Number',
      'Vendor Name',
      'Received Date',
      'Invoice Date',
      'Due Date',
      'Total Amount',
      'Currency',
      'Status',
      'Document Type',
      'AI Confidence',
      'Received From',
      'Purpose/Notes'
    ]

    const escapeCsvValue = (val?: string | number | null) => {
      if (val === undefined || val === null) return ''
      const str = String(val)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }

    const rows = filteredInvoices.map((inv: Invoice) => [
      escapeCsvValue(inv.invoice_number),
      escapeCsvValue(inv.vendor_name),
      escapeCsvValue(inv.received_at ? new Date(inv.received_at).toLocaleString() : ''),
      escapeCsvValue(inv.invoice_date),
      escapeCsvValue(inv.due_date),
      inv.total_amount || 0,
      escapeCsvValue(inv.currency || 'INR'),
      escapeCsvValue(inv.status),
      escapeCsvValue(inv.document_type || 'other'),
      inv.confidence_score || 0,
      escapeCsvValue(inv.sender),
      escapeCsvValue(inv.notes)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any) => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `Finnex_Invoices_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    setStatusFilter('all')
    setTxTypeFilter('all')
    setDocTypeFilter('all')
    setDirectionFilter('all')
    setEventFilter('all')
    setLedgerFilter('all')
    setShowOnlyOriginal(false)
    setDatePreset('all')
  }

  return (
    <div className="space-y-6">
      {syncStatusMsg && (
        <div className={`border p-4.5 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${syncStatusMsg.toLowerCase().includes('fail') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/10 border-primary/20 text-foreground'}`}>
          <div className="flex items-center gap-3">
            <RefreshCw className="h-4 w-4 text-primary animate-pulse" />
            <p className="text-sm font-bold">{syncStatusMsg}</p>
          </div>
          <button 
            onClick={() => setSyncStatusMsg(null)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Invoices</h2>
          <p className="text-muted-foreground text-sm mt-1 font-semibold">Manage and track all extracted invoices.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            disabled={syncMutation.isPending}
            onClick={() => syncMutation.mutate()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-55 px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Syncing...' : 'Sync Gmail'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-card text-foreground hover:bg-muted px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-border/80 shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-muted-foreground" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card border border-border/60 rounded-[24px] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        {/* Filter Toolbar Component */}
        <FilterToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          txTypeFilter={txTypeFilter}
          setTxTypeFilter={setTxTypeFilter}
          docTypeFilter={docTypeFilter}
          setDocTypeFilter={setDocTypeFilter}
          directionFilter={directionFilter}
          setDirectionFilter={setDirectionFilter}
          eventFilter={eventFilter}
          setEventFilter={setEventFilter}
          ledgerFilter={ledgerFilter}
          setLedgerFilter={setLedgerFilter}
          datePreset={datePreset}
          handleDatePresetChange={handleDatePresetChange}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          showOnlyOriginal={showOnlyOriginal}
          setShowOnlyOriginal={setShowOnlyOriginal}
          filteredInvoicesCount={filteredInvoices.length}
          ledgers={ledgers}
          clearAllFilters={clearAllFilters}
        />

        {/* Invoice Table Component */}
        <InvoiceTable 
          data={filteredInvoices} 
          isLoading={isLoading} 
          onInvoiceClick={setSelectedInvoice} 
        />
      </div>

      {/* Load More Button for Infinite Scroll */}
      {hasNextPage && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-bold text-sm shadow-sm transition-colors cursor-pointer"
          >
            {isFetchingNextPage ? 'Loading more...' : 'Load More Invoices'}
          </button>
        </div>
      )}

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}
