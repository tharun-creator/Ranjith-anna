import { useState, useMemo } from 'react'
import { useInvoices, type Invoice } from '@/context/InvoiceContext'
import { ArrowLeft, ExternalLink, Receipt, TrendingUp, DollarSign } from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'

export const Vendors = () => {
  const { invoices } = useInvoices()
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null)

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

  // Calculate unique vendor summaries
  const vendorsSummary = useMemo(() => {
    const summary: Record<string, {
      name: string
      totalSpent: number
      invoiceCount: number
      lastInvoiceDate: string
      history: { val: number }[]
    }> = {}

    invoices.forEach(inv => {
      const vName = inv.vendor_name || 'Unknown Vendor'
      const amt = getAmountINR(inv)
      
      if (!summary[vName]) {
        summary[vName] = {
          name: vName,
          totalSpent: 0,
          invoiceCount: 0,
          lastInvoiceDate: '',
          history: []
        }
      }

      summary[vName].totalSpent += amt
      summary[vName].invoiceCount += 1
      if (!summary[vName].lastInvoiceDate || (inv.invoice_date && inv.invoice_date > summary[vName].lastInvoiceDate)) {
        summary[vName].lastInvoiceDate = inv.invoice_date || ''
      }
      summary[vName].history.push({ val: amt })
    })

    return Object.values(summary).sort((a, b) => b.totalSpent - a.totalSpent)
  }, [invoices])

  // Get details for selected vendor
  const vendorDetails = useMemo(() => {
    if (!selectedVendor) return null
    
    const vendorInvoices = invoices.filter(inv => (inv.vendor_name || 'Unknown Vendor') === selectedVendor)
    const total = vendorInvoices.reduce((sum, inv) => sum + getAmountINR(inv), 0)
    const avg = vendorInvoices.length > 0 ? total / vendorInvoices.length : 0

    // Group by month for trend chart
    const monthlyGroups: Record<string, number> = {}
    vendorInvoices.forEach(inv => {
      if (inv.invoice_date) {
        const month = new Date(inv.invoice_date).toLocaleString('default', { month: 'short' })
        monthlyGroups[month] = (monthlyGroups[month] || 0) + getAmountINR(inv)
      }
    })

    const chartData = Object.entries(monthlyGroups).map(([name, Spent]) => ({
      name,
      Spent: Math.round(Spent)
    }))

    return {
      name: selectedVendor,
      invoices: vendorInvoices,
      totalSpent: total,
      avgAmount: avg,
      chartData: chartData.length > 0 ? chartData : [{ name: 'Jul', Spent: total }]
    }
  }, [selectedVendor, invoices])

  if (selectedVendor && vendorDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setSelectedVendor(null)}
            className="p-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{vendorDetails.name}</h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Vendor details & profile</p>
          </div>
        </div>

        {/* Info stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm min-h-[120px]">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Total Spent YTD
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-foreground font-mono">
              {formatINR(vendorDetails.totalSpent)}
            </h3>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm min-h-[120px]">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5" /> Total Invoices
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-foreground font-mono">
              {vendorDetails.invoices.length}
            </h3>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between shadow-sm min-h-[120px]">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Average Invoice
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-foreground font-mono">
              {formatINR(vendorDetails.avgAmount)}
            </h3>
          </div>
        </div>

        {/* Spend Chart */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="font-bold text-sm mb-4 text-foreground">Spend History</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={vendorDetails.chartData}>
                <defs>
                  <linearGradient id="vendorGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent-light, #2D6A4F)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--accent-light, #2D6A4F)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="Spent" stroke="var(--accent)" strokeWidth={2.5} fillOpacity={1} fill="url(#vendorGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice List */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="font-bold text-sm text-foreground">Invoices & Receipts</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium">
                {vendorDetails.invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-muted-foreground">{inv.id}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Vendors & Senders</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Organized vendor profiles and spend analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendorsSummary.map(v => (
          <div 
            key={v.name}
            onClick={() => setSelectedVendor(v.name)}
            className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-accent cursor-pointer transition-all hover:shadow-md flex flex-col justify-between min-h-[160px]"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">
                  {v.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{v.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold">{v.invoiceCount} invoices</p>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </div>

            <div className="mt-4">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Total Spent YTD</span>
              <div className="text-xl font-extrabold text-foreground font-mono mt-0.5">{formatINR(v.totalSpent)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
