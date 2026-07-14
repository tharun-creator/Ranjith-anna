import { Search, X } from 'lucide-react'
import { DOCUMENT_TYPES } from './InvoiceDetailModal'

interface Ledger {
  ledger_code: string
  ledger_name: string
}

interface FilterToolbarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  statusFilter: string
  setStatusFilter: (status: string) => void
  txTypeFilter: string
  setTxTypeFilter: (type: string) => void
  docTypeFilter: string
  setDocTypeFilter: (type: string) => void
  directionFilter: string
  setDirectionFilter: (direction: string) => void
  eventFilter: string
  setEventFilter: (event: string) => void
  ledgerFilter: string
  setLedgerFilter: (ledger: string) => void
  datePreset: string
  handleDatePresetChange: (preset: string) => void
  startDate: string
  setStartDate: (date: string) => void
  endDate: string
  setEndDate: (date: string) => void
  showOnlyOriginal: boolean
  setShowOnlyOriginal: (val: boolean) => void
  filteredInvoicesCount: number
  ledgers: Ledger[]
  clearAllFilters: () => void
}

export const FilterToolbar = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  txTypeFilter,
  setTxTypeFilter,
  docTypeFilter,
  setDocTypeFilter,
  directionFilter,
  setDirectionFilter,
  eventFilter,
  setEventFilter,
  ledgerFilter,
  setLedgerFilter,
  datePreset,
  handleDatePresetChange,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showOnlyOriginal,
  setShowOnlyOriginal,
  filteredInvoicesCount,
  ledgers,
  clearAllFilters,
}: FilterToolbarProps) => {
  const isAnyFilterActive = searchQuery || startDate || endDate || statusFilter !== 'all' || 
    txTypeFilter !== 'all' || docTypeFilter !== 'all' || directionFilter !== 'all' || 
    eventFilter !== 'all' || ledgerFilter !== 'all' || showOnlyOriginal || datePreset !== 'all'

  return (
    <div className="p-6 border-b border-border bg-card/45 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* Search Input */}
        <div className="relative col-span-1 lg:col-span-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3.5 py-1.5 border border-border/80 rounded-xl leading-5 bg-card text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground font-medium"
            placeholder="Search number, vendor..."
          />
        </div>

        {/* Status Dropdown */}
        <div className="col-span-1 lg:col-span-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="block w-full px-3 py-1.5 border border-border/80 rounded-xl bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Statuses ▾</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="unpaid">Unpaid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Tx Type Dropdown */}
        <div className="col-span-1 lg:col-span-2">
          <select
            value={txTypeFilter}
            onChange={e => setTxTypeFilter(e.target.value)}
            className="block w-full px-3 py-1.5 border border-border/80 rounded-xl bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Tx Types ▾</option>
            <option value="expense">Expense</option>
            <option value="revenue">Revenue</option>
          </select>
        </div>

        {/* Doc Type Dropdown */}
        <div className="col-span-1 lg:col-span-2">
          <select
            value={docTypeFilter}
            onChange={e => setDocTypeFilter(e.target.value)}
            className="block w-full px-3 py-1.5 border border-border/80 rounded-xl bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Doc Types ▾</option>
            {DOCUMENT_TYPES.map(dt => (
              <option key={dt.code} value={dt.code}>
                {dt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Email Direction Dropdown */}
        <div className="col-span-1 lg:col-span-3">
          <select
            value={directionFilter}
            onChange={e => setDirectionFilter(e.target.value)}
            className="block w-full px-3 py-1.5 border border-border/80 rounded-xl bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Directions ▾</option>
            <option value="mail_received">Received</option>
            <option value="mail_sent">Sent</option>
          </select>
        </div>

        {/* Financial Event Dropdown */}
        <div className="col-span-1 lg:col-span-2">
          <select
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            className="block w-full px-3 py-1.5 border border-border/80 rounded-xl bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Events ▾</option>
            <option value="requested">Requested</option>
            <option value="raised">Raised</option>
            <option value="pending">Pending</option>
            <option value="reminder">Reminder</option>
            <option value="paid">Paid</option>
            <option value="payment_completed">Payment Completed</option>
            <option value="payment_received">Payment Received</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="payment_overdue">Payment Overdue</option>
            <option value="cancelled">Cancelled</option>
            <option value="renewal">Renewal</option>
            <option value="refund">Refund</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Ledger Dropdown */}
        <div className="col-span-1 lg:col-span-2">
          <select
            value={ledgerFilter}
            onChange={e => setLedgerFilter(e.target.value)}
            className="block w-full px-3 py-1.5 border border-border/80 rounded-xl bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Ledgers ▾</option>
            <option value="uncategorized">Uncategorized</option>
            {ledgers.map(l => (
              <option key={l.ledger_code} value={l.ledger_code}>
                {l.ledger_code} - {l.ledger_name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Preset Dropdown */}
        <div className="col-span-1 lg:col-span-2">
          <select
            value={datePreset}
            onChange={e => handleDatePresetChange(e.target.value)}
            className="block w-full px-3 py-1.5 border border-border/80 rounded-xl bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium"
          >
            <option value="all">All Time ▾</option>
            <option value="today">Today</option>
            <option value="last-7-days">Last 7 Days</option>
            <option value="last-30-days">Last 30 Days</option>
            <option value="last-90-days">Last 90 Days</option>
            <option value="this-month">This Month</option>
            <option value="custom">Custom Date Range</option>
          </select>
        </div>

        {/* Date Range Start */}
        <div className="col-span-1 lg:col-span-2 flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-semibold uppercase">From</span>
          <input
            type="date"
            value={startDate}
            onChange={e => {
              setStartDate(e.target.value)
              handleDatePresetChange('custom')
            }}
            className="block w-full px-2 py-1.5 border border-border/80 rounded-xl bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>

        {/* Date Range End */}
        <div className="col-span-1 lg:col-span-2 flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground font-semibold uppercase">To</span>
          <input
            type="date"
            value={endDate}
            onChange={e => {
              setEndDate(e.target.value)
              handleDatePresetChange('custom')
            }}
            className="block w-full px-2 py-1.5 border border-border/80 rounded-xl bg-card text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
          />
        </div>

        {/* Clear Filters Button */}
        <div className="col-span-1 lg:col-span-2 flex items-center justify-end">
          {isAnyFilterActive && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 px-3 py-1.5 w-full justify-center lg:w-auto text-xs font-bold text-red-650 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl transition-colors border border-red-500/20 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Toggle / Extra Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-border/50 gap-2">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none font-semibold hover:text-foreground transition-colors">
            <input
              type="checkbox"
              checked={showOnlyOriginal}
              onChange={e => setShowOnlyOriginal(e.target.checked)}
              className="rounded-md border-border text-primary focus:ring-primary h-4 w-4 bg-card transition-all cursor-pointer"
            />
            Show only original invoices
          </label>
        </div>
        
        <div className="text-xs text-muted-foreground font-bold">
          Found {filteredInvoicesCount} invoices
          {showOnlyOriginal && " (excluding duplicates)"}
        </div>
      </div>
    </div>
  )
}
