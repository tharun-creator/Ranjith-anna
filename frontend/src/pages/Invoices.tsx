import { useState, useMemo } from 'react'
import { RefreshCw, Download, X, AlertTriangle, Check } from 'lucide-react'
import { useInvoices, type Invoice } from '@/context/InvoiceContext'
import { InvoiceDetailModal } from '@/components/InvoiceDetailModal'
import { FilterToolbar } from '@/components/FilterToolbar'

export const Invoices = () => {
  const { invoices, isLoading, isSyncing, triggerMailSync, modifyInvoice } = useInvoices()
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

  // Selection states for bulk actions
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Record<string, boolean>>({})

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const USD_TO_INR = 83.5
  const getAmountINR = (inv: Invoice): number => {
    const amt = inv.total_amount || 0
    return inv.currency === 'USD' ? amt * USD_TO_INR : amt
  }

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

  // Filter invoices locally
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv: Invoice) => {
      if (showOnlyOriginal && inv.is_duplicate) return false

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
        if (inv.status?.toLowerCase() !== statusFilter.toLowerCase()) return false
      }

      if (txTypeFilter && txTypeFilter !== 'all') {
        if ((inv.transaction_type || 'EXPENSE').toLowerCase() !== txTypeFilter.toLowerCase()) return false
      }

      if (directionFilter && directionFilter !== 'all') {
        if ((inv.email_direction || 'MAIL_RECEIVED').toLowerCase() !== directionFilter.toLowerCase()) return false
      }

      if (docTypeFilter && docTypeFilter !== 'all') {
        if ((inv.document_type || 'other').toLowerCase() !== docTypeFilter.toLowerCase()) return false
      }

      if (eventFilter && eventFilter !== 'all') {
        if ((inv.financial_event || 'RAISED').toLowerCase() !== eventFilter.toLowerCase()) return false
      }

      if (ledgerFilter && ledgerFilter !== 'all') {
        if ((inv.ledger_code || 'UNCATEGORIZED').toLowerCase() !== ledgerFilter.toLowerCase()) return false
      }

      if (startDate && inv.invoice_date && inv.invoice_date < startDate) return false
      if (endDate && inv.invoice_date && inv.invoice_date > endDate) return false

      return true
    })
  }, [
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
    endDate
  ])

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) return
    const headers = ['Invoice Number', 'Vendor Name', 'Invoice Date', 'Due Date', 'Total Amount', 'Currency', 'Status', 'Category']
    const rows = filteredInvoices.map((inv: Invoice) => [
      inv.invoice_number || 'No Number',
      inv.vendor_name,
      inv.invoice_date || '',
      inv.due_date || '',
      inv.total_amount || 0,
      inv.currency || 'INR',
      inv.status || 'pending',
      inv.ledger_code || 'UNCATEGORIZED'
    ])

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `invoices_export_${Date.now()}.csv`)
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

  // Row selection helpers
  const handleSelectAll = (checked: boolean) => {
    const next: Record<string, boolean> = {}
    if (checked) {
      filteredInvoices.forEach(inv => {
        next[inv.id] = true
      })
    }
    setSelectedInvoiceIds(next)
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    setSelectedInvoiceIds(prev => ({
      ...prev,
      [id]: checked
    }))
  }

  const selectedCount = useMemo(() => {
    return Object.values(selectedInvoiceIds).filter(Boolean).length
  }, [selectedInvoiceIds])

  // Bulk Actions
  const handleBulkMarkPaid = () => {
    Object.keys(selectedInvoiceIds).forEach(id => {
      if (selectedInvoiceIds[id]) {
        modifyInvoice(id, { status: 'paid' })
      }
    })
    setSelectedInvoiceIds({})
  }

  const handleBulkRecategorize = (categoryCode: string) => {
    Object.keys(selectedInvoiceIds).forEach(id => {
      if (selectedInvoiceIds[id]) {
        modifyInvoice(id, { ledger_code: categoryCode })
      }
    })
    setSelectedInvoiceIds({})
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Invoices</h2>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">Manage and track all extracted invoices</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            disabled={isSyncing}
            onClick={triggerMailSync}
            className="bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-55 px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Gmail'}
          </button>
          <button 
            onClick={handleExportCSV}
            className="bg-card text-foreground hover:bg-muted px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 border border-border shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-muted-foreground" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[24px] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        {/* Filters */}
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
          ledgers={[]}
          clearAllFilters={clearAllFilters}
        />

        {/* Invoice Table with row checkboxes */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border">
              <tr className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                <th className="p-4 w-10">
                  <input 
                    type="checkbox" 
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={filteredInvoices.length > 0 && Object.values(selectedInvoiceIds).filter(Boolean).length === filteredInvoices.length}
                    className="rounded border-border focus:ring-accent"
                  />
                </th>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td colSpan={7} className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-16 text-center text-muted-foreground">
                    <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-25" />
                    <p className="text-base font-bold">No invoices found</p>
                    <p className="text-xs">Adjust your search or filter toolbar settings.</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => {
                  const isChecked = !!selectedInvoiceIds[inv.id]
                  return (
                    <tr 
                      key={inv.id}
                      className={`hover:bg-muted/20 transition-colors cursor-pointer ${isChecked ? 'bg-accent/5' : ''}`}
                      onClick={() => setSelectedInvoice(inv)}
                    >
                      <td className="p-4 w-10" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={(e) => handleSelectRow(inv.id, e.target.checked)}
                          className="rounded border-border focus:ring-accent cursor-pointer"
                        />
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">{inv.id}</td>
                      <td className="p-4 font-bold text-foreground">{inv.vendor_name}</td>
                      <td className="p-4 font-mono">{inv.invoice_date}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary-foreground border border-border">
                          {inv.ledger_code}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-800' : 'bg-amber-500/10 text-amber-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-right text-foreground">
                        {formatINR(getAmountINR(inv))}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar (only visible when rows are selected) */}
      {selectedCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-card border border-border px-6 py-3.5 rounded-full shadow-2xl z-40 flex items-center gap-6 animate-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-bold text-foreground">
            {selectedCount} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkPaid}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              Mark Paid
            </button>
            <button
              onClick={() => handleBulkRecategorize('ASP-28')}
              className="px-3.5 py-1.5 border border-border hover:bg-muted bg-card text-foreground rounded-full text-[10px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              Recategorize (Software)
            </button>
            <button
              onClick={() => setSelectedInvoiceIds({})}
              className="p-1.5 border border-border hover:bg-muted bg-card text-muted-foreground hover:text-foreground rounded-full cursor-pointer"
              title="Deselect All"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Invoice Details slide-in side panel (converted modal) */}
      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice as any}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  )
}
