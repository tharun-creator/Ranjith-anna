import { useState, useMemo } from 'react'
import { useInvoices, type Invoice } from '@/context/InvoiceContext'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import { 
  ComposedChart, 
  Bar, 
  Line, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts'


export const Dashboard = ({ onViewAllInvoices }: { onViewAllInvoices?: () => void }) => {
  const { invoices, expertMode, setActiveTab } = useInvoices()
  const [simpleMode, setSimpleMode] = useState(true)

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

  // --- Aggregate Stats ---
  const aggregates = useMemo(() => {
    // Current month totals (July 2026 for mock context, or latest month present)
    const currentMonthInvoices = invoices.filter(inv => inv.invoice_date?.startsWith('2026-07'))
    const totalSpend = currentMonthInvoices
      .filter(inv => (inv.transaction_type || 'EXPENSE') === 'EXPENSE')
      .reduce((sum, inv) => sum + getAmountINR(inv), 0)

    // Previous month (June 2026) for trend calculation
    const prevMonthInvoices = invoices.filter(inv => inv.invoice_date?.startsWith('2026-06'))
    const prevSpend = prevMonthInvoices
      .filter(inv => (inv.transaction_type || 'EXPENSE') === 'EXPENSE')
      .reduce((sum, inv) => sum + getAmountINR(inv), 0)

    const spendDiff = totalSpend - prevSpend
    const spendPercent = prevSpend > 0 ? (Math.abs(spendDiff) / prevSpend) * 100 : 0

    // Overdue stats
    const overdueList = invoices.filter(inv => inv.status === 'overdue')
    const overdueCount = overdueList.length
    const overdueAmount = overdueList.reduce((sum, inv) => sum + getAmountINR(inv), 0)

    // Upcoming stats
    const upcomingList = invoices
      .filter(inv => inv.status === 'pending')
      .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
    const upcomingCount = upcomingList.length
    const upcomingAmount = upcomingList.reduce((sum, inv) => sum + getAmountINR(inv), 0)

    // Top Category this month
    const categorySpends: Record<string, { name: string, total: number }> = {}
    currentMonthInvoices.forEach(inv => {
      const code = inv.ledger_code || 'UNCATEGORIZED'
      const name = inv.ledger_name || 'Uncategorized'
      categorySpends[code] = categorySpends[code] || { name, total: 0 }
      categorySpends[code].total += getAmountINR(inv)
    })
    const topCategory = Object.values(categorySpends).sort((a, b) => b.total - a.total)[0] || { name: 'None', total: 0 }

    // Top Vendor this month
    const vendorSpends: Record<string, number> = {}
    currentMonthInvoices.forEach(inv => {
      const name = inv.vendor_name || 'Unknown Vendor'
      vendorSpends[name] = (vendorSpends[name] || 0) + getAmountINR(inv)
    })
    const topVendor = Object.entries(vendorSpends).sort((a, b) => b[1] - a[1])[0] || ['None', 0]

    return {
      totalSpend,
      spendPercent,
      isSpendUp: spendDiff > 0,
      overdueCount,
      overdueAmount,
      upcomingCount,
      upcomingAmount,
      upcomingInvoices: upcomingList.slice(0, 3),
      topCategory,
      topVendorName: topVendor[0],
      topVendorAmount: topVendor[1]
    }
  }, [invoices])

  // Sparkline data
  const sparklineData = useMemo(() => {
    return [
      { val: aggregates.totalSpend * 0.8 },
      { val: aggregates.totalSpend * 0.95 },
      { val: aggregates.totalSpend * 0.9 },
      { val: aggregates.totalSpend * 1.05 },
      { val: aggregates.totalSpend }
    ]
  }, [aggregates.totalSpend])

  // Money Flow Annual Data
  const annualChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m, idx) => {
      const monthStr = `2026-${String(idx + 1).padStart(2, '0')}`
      const monthInvs = invoices.filter(inv => inv.invoice_date?.startsWith(monthStr))
      const Income = monthInvs
        .filter(inv => inv.transaction_type === 'REVENUE')
        .reduce((sum, inv) => sum + getAmountINR(inv), 0)
      const Expense = monthInvs
        .filter(inv => (inv.transaction_type || 'EXPENSE') === 'EXPENSE')
        .reduce((sum, inv) => sum + getAmountINR(inv), 0)

      return {
        name: m,
        Income: Math.round(Income),
        Expense: Math.round(Expense)
      }
    })
  }, [invoices])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground select-none">Overview</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {expertMode ? 'Finance dashboard & ledger stats' : 'Your spending summary at a glance'}
          </p>
        </div>

        {/* Mode controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Mode:</span>
          <div className="bg-card border border-border p-0.5 rounded-xl shadow-xs flex">
            <button
              onClick={() => setSimpleMode(true)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                simpleMode 
                  ? 'bg-primary text-primary-foreground shadow-xs' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setSimpleMode(false)}
              className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                !simpleMode 
                  ? 'bg-primary text-primary-foreground shadow-xs' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* --- GRID: ONE IDEA PER COMPONENT --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Card 1: Total Spend */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[170px] relative overflow-hidden group hover:shadow-md transition-all">
          <div>
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" /> 
              {expertMode ? 'Total Expenses (Current Month)' : 'How much I spent this month'}
            </span>
            <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-foreground font-mono">
              {formatINR(aggregates.totalSpend)}
            </h3>
          </div>

          {/* Sparkline (Detailed mode only) */}
          {!simpleMode && (
            <div className="h-8 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <Area type="monotone" dataKey="val" stroke="var(--accent)" strokeWidth={1.5} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <span className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
              aggregates.isSpendUp 
                ? 'bg-red-500/10 text-red-500' 
                : 'bg-emerald-500/10 text-emerald-500'
            }`}>
              {aggregates.isSpendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              <span>{Math.round(aggregates.spendPercent)}%</span>
            </span>
            <span className="text-[10px] text-muted-foreground">vs last month</span>
          </div>
        </div>

        <div 
          onClick={() => {
            setActiveTab('invoices')
            if (onViewAllInvoices) onViewAllInvoices()
          }}
          className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-accent cursor-pointer transition-all flex flex-col justify-between min-h-[170px]"
        >
          <div>
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              {expertMode ? 'Outstanding Payments' : 'Bills due soon'}
            </span>
            <div className="flex justify-between items-baseline mt-3">
              <h3 className="text-2xl font-extrabold tracking-tight text-foreground font-mono">
                {formatINR(aggregates.upcomingAmount)}
              </h3>
              <span className="text-[10px] text-muted-foreground font-semibold">{aggregates.upcomingCount} pending</span>
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-3 space-y-1">
            {aggregates.upcomingInvoices.map(inv => (
              <div key={inv.id} className="flex justify-between text-[10px] font-medium text-muted-foreground">
                <span className="truncate max-w-[120px] text-foreground font-bold">{inv.vendor_name}</span>
                <span className="font-mono">{formatINR(getAmountINR(inv))}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Overdue (Only displayed if non-zero) */}
        {aggregates.overdueCount > 0 && (
          <div className="bg-card border border-red-500/30 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[170px] relative overflow-hidden">
            <div>
              <span className="text-red-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Overdue Invoices
              </span>
              <h3 className="text-2xl font-extrabold tracking-tight mt-3 text-red-550 dark:text-red-400 font-mono">
                {formatINR(aggregates.overdueAmount)}
              </h3>
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-xl">
              <span>{aggregates.overdueCount} need attention</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Card 4: Top Category */}
        <div 
          onClick={() => setActiveTab('categories')}
          className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-accent cursor-pointer transition-all flex flex-col justify-between min-h-[170px]"
        >
          <div>
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              Top category this month
            </span>
            <h4 className="text-base font-bold text-foreground mt-3 truncate">{aggregates.topCategory.name}</h4>
          </div>
          <div className="mt-4 flex justify-between items-baseline">
            <span className="text-[10px] text-muted-foreground">Monthly total</span>
            <span className="text-sm font-extrabold text-foreground font-mono">{formatINR(aggregates.topCategory.total)}</span>
          </div>
        </div>

        {/* Card 5: Top Vendor */}
        <div 
          onClick={() => setActiveTab('vendors')}
          className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-accent cursor-pointer transition-all flex flex-col justify-between min-h-[170px]"
        >
          <div>
            <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
              Top supplier/vendor
            </span>
            <h4 className="text-base font-bold text-foreground mt-3 truncate">{aggregates.topVendorName}</h4>
          </div>
          <div className="mt-4 flex justify-between items-baseline">
            <span className="text-[10px] text-muted-foreground">YTD spend</span>
            <span className="text-sm font-extrabold text-foreground font-mono">{formatINR(aggregates.topVendorAmount)}</span>
          </div>
        </div>

      </section>

      {/* --- TREND CHART: MONEY FLOW --- */}
      <section className="bg-card border border-border p-6 rounded-2xl shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-sm text-foreground">Money Flow</h3>
            <p className="text-xs text-muted-foreground">Annual view of incoming revenue vs business expenses</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: 'var(--accent)' }}></span>
              <span>Income</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: 'var(--border)' }}></span>
              <span>Expenses</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={annualChartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold' }} />
              <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 'bold' }} />
              <Tooltip cursor={{ fill: 'var(--hover)', opacity: 0.3 }} />
              <Bar dataKey="Income" fill="var(--accent)" radius={[8, 8, 0, 0]} barSize={16} />
              <Bar dataKey="Expense" fill="var(--border)" radius={[8, 8, 0, 0]} barSize={16} />
              <Line type="monotone" dataKey="Income" stroke="var(--accent-light, #2D6A4F)" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* --- RECENT ACTIVITY TABLE --- */}
      <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-extrabold text-sm text-foreground">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">The latest invoices and transactions synced from Gmail</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Sender / Vendor</th>
                <th className="p-4">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-medium">
              {invoices.slice(0, 10).map(inv => (
                <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-mono text-muted-foreground">{inv.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-bold text-foreground">{inv.vendor_name}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{inv.sender}</div>
                    </div>
                  </td>
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
      </section>
    </div>
  )
}
