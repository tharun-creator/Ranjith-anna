import { useMemo } from 'react'
import { useInvoices, type Invoice } from '@/context/InvoiceContext'
import { Calendar, RefreshCw, Info, TrendingUp, TrendingDown } from 'lucide-react'

export const Recurring = () => {
  const { invoices } = useInvoices()

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

  // Detect recurring subscriptions
  const recurringCharges = useMemo(() => {
    // Group by vendor
    const groups: Record<string, Invoice[]> = {}
    invoices.forEach(inv => {
      const vName = inv.vendor_name || 'Unknown Vendor'
      if (!groups[vName]) groups[vName] = []
      groups[vName].push(inv)
    })

    const detected: {
      id: string
      vendor: string
      cadence: string
      amount: number
      nextExpectedDate: string
      trend: 'up' | 'down' | 'stable'
      percentChange: number
    }[] = []

    Object.entries(groups).forEach(([vendor, list]) => {
      // Sort by date
      const sorted = list
        .filter(inv => inv.invoice_date)
        .sort((a, b) => new Date(a.invoice_date!).getTime() - new Date(b.invoice_date!).getTime())

      if (sorted.length >= 2) {
        // Simple recurrence heuristic: multiple invoices from same vendor
        const last = sorted[sorted.length - 1]
        const prev = sorted[sorted.length - 2]
        const amtLast = getAmountINR(last)
        const amtPrev = getAmountINR(prev)

        // Calculate time gap in days
        const lastDate = new Date(last.invoice_date!)
        const prevDate = new Date(prev.invoice_date!)
        const gapDays = Math.round((lastDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

        // If the gap is close to weekly, monthly, or quarterly (say 5 to 100 days)
        if (gapDays >= 5 && gapDays <= 95) {
          let cadence = 'monthly'
          if (gapDays >= 5 && gapDays <= 10) cadence = 'weekly'
          else if (gapDays >= 11 && gapDays <= 18) cadence = 'bi-weekly'
          else if (gapDays >= 25 && gapDays <= 35) cadence = 'monthly'
          else cadence = `every ${gapDays} days`

          // Project next date
          const nextDate = new Date(lastDate)
          nextDate.setDate(nextDate.getDate() + gapDays)

          const diff = amtLast - amtPrev
          let trend: 'up' | 'down' | 'stable' = 'stable'
          let percent = 0
          if (Math.abs(diff) > 2) {
            trend = diff > 0 ? 'up' : 'down'
            percent = Math.round((Math.abs(diff) / amtPrev) * 100)
          }

          detected.push({
            id: last.id,
            vendor,
            cadence,
            amount: amtLast,
            nextExpectedDate: nextDate.toISOString().split('T')[0],
            trend,
            percentChange: percent
          })
        }
      }
    })

    return detected
  }, [invoices])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Recurring Subscriptions</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Auto-detected recurring payments and SaaS cadence</p>
      </div>

      <div className="bg-[#EBF5FF] dark:bg-muted/15 border border-blue-100 dark:border-border p-4.5 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-xs font-semibold text-blue-900 dark:text-foreground">
          <p className="font-bold">How does this work?</p>
          <p className="mt-0.5 opacity-90 leading-relaxed">
            We automatically audit invoices with similar names and intervals to alert you of active subscriptions, monthly software bills, or regular payments you might want to review.
          </p>
        </div>
      </div>

      {recurringCharges.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-2xl text-center space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
          <h4 className="font-bold text-foreground">Analyzing payments...</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Once you receive multiple billing cycles from a vendor, they will appear here as auto-detected subscriptions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recurringCharges.map(charge => (
            <div 
              key={charge.vendor}
              className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-accent transition-all flex flex-col justify-between min-h-[180px]"
            >
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{charge.vendor}</h4>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-accent/15 text-foreground border border-border">
                      {charge.cadence}
                    </span>
                  </div>
                  <Calendar className="w-4.5 h-4.5 text-muted-foreground" />
                </div>

                <div className="mt-4">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Expected payment amount</span>
                  <div className="text-xl font-extrabold text-foreground font-mono mt-0.5">
                    {formatINR(charge.amount)}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] font-bold">
                <span className="text-muted-foreground">
                  Next due: <span className="text-foreground font-mono">{charge.nextExpectedDate}</span>
                </span>
                
                {charge.trend !== 'stable' && (
                  <span className={`flex items-center gap-0.5 ${
                    charge.trend === 'up' ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {charge.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>{charge.percentChange}%</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
