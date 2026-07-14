import { useState } from 'react'
import { useInvoices } from '@/context/InvoiceContext'
import { RefreshCw, Shield, Lock, FileSpreadsheet } from 'lucide-react'

export const ConnectedAccounts = () => {
  const { isSyncing, syncError, syncSuccess, triggerMailSync, invoices } = useInvoices()
  const [syncFreq, setSyncFreq] = useState('hourly')
  const [csvExporting, setCsvExporting] = useState(false)

  const handleExportCSV = () => {
    setCsvExporting(true)
    setTimeout(() => {
      // Build simple CSV string
      const headers = ['Invoice ID', 'Vendor', 'Date', 'Amount', 'Currency', 'Status', 'Category']
      const rows = invoices.map(inv => [
        inv.id,
        inv.vendor_name || 'Unknown',
        inv.invoice_date || '',
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
      link.setAttribute("download", `finnex_export_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setCsvExporting(false)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Settings & Connected Accounts</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Integrations, auto-sync cadences, and exports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Connected Accounts */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-foreground">Email Connections</h3>
          
          <div className="p-4 border border-border bg-background rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                G
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Gmail Integration</h4>
                <p className="text-[10px] text-muted-foreground font-semibold">finance-inbox@corporation.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Connected</span>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">Sync Frequency</label>
              <div className="flex gap-2">
                {['real-time', 'hourly', 'daily', 'manual'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setSyncFreq(freq)}
                    className={`px-3.5 py-1.5 border border-border rounded-xl font-bold text-[10px] capitalize transition-all ${
                      syncFreq === freq 
                        ? 'bg-primary text-primary-foreground border-transparent shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted bg-card'
                    }`}
                  >
                    {freq.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={triggerMailSync}
                disabled={isSyncing}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Gmail Now'}</span>
              </button>
            </div>

            {syncSuccess && (
              <p className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
                {syncSuccess}
              </p>
            )}
            {syncError && (
              <p className="text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg">
                {syncError}
              </p>
            )}
          </div>
        </div>

        {/* Data Security & Export */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-foreground">Data Export</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Download your ledger records, categorization values, and amounts in a standard CSV format for reconciliation or backup.
          </p>

          <button
            onClick={handleExportCSV}
            disabled={csvExporting}
            className="w-full flex items-center justify-center gap-2 border border-border hover:bg-muted bg-card text-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>{csvExporting ? 'Exporting...' : 'Download CSV Report'}</span>
          </button>

          <div className="pt-4 border-t border-border space-y-3.5">
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span>TLS 1.3 encrypted sync channels</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
              <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>Secure OAuth token storage</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
