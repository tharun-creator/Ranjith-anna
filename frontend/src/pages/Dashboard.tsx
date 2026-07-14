import { useState, useMemo } from 'react'
import { useInvoices, type Invoice } from '@/context/InvoiceContext'
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ChevronRight,
  ShieldAlert,
  Calendar,
  FolderClosed,
  ChevronDown
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
  const [timePeriod, setTimePeriod] = useState('Weekly')

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
    const currentMonthInvoices = invoices.filter(inv => inv.invoice_date?.startsWith('2026-07'))
    const totalSpend = currentMonthInvoices
      .filter(inv => (inv.transaction_type || 'EXPENSE') === 'EXPENSE')
      .reduce((sum, inv) => sum + getAmountINR(inv), 0)

    const prevMonthInvoices = invoices.filter(inv => inv.invoice_date?.startsWith('2026-06'))
    const prevSpend = prevMonthInvoices
      .filter(inv => (inv.transaction_type || 'EXPENSE') === 'EXPENSE')
      .reduce((sum, inv) => sum + getAmountINR(inv), 0)

    const spendDiff = totalSpend - prevSpend
    const spendPercent = prevSpend > 0 ? (Math.abs(spendDiff) / prevSpend) * 100 : 0

    const overdueList = invoices.filter(inv => inv.status === 'overdue')
    const overdueCount = overdueList.length
    const overdueAmount = overdueList.reduce((sum, inv) => sum + getAmountINR(inv), 0)

    const upcomingList = invoices
      .filter(inv => inv.status === 'pending')
      .sort((a, b) => new Date(a.due_date || '').getTime() - new Date(b.due_date || '').getTime())
    const upcomingCount = upcomingList.length
    const upcomingAmount = upcomingList.reduce((sum, inv) => sum + getAmountINR(inv), 0)

    const categorySpends: Record<string, { name: string, total: number }> = {}
    currentMonthInvoices.forEach(inv => {
      const code = inv.ledger_code || 'UNCATEGORIZED'
      const name = inv.ledger_name || 'Uncategorized'
      categorySpends[code] = categorySpends[code] || { name, total: 0 }
      categorySpends[code].total += getAmountINR(inv)
    })
    const topCategory = Object.values(categorySpends).sort((a, b) => b.total - a.total)[0] || { name: 'None', total: 0 }

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
      upcomingInvoices: upcomingList.slice(0, 4),
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

  // Money Flow Data
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

  // Soft chip color rotation helper
  const getCategoryChipColors = (code: string) => {
    const hash = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const options = [
      { bg: 'var(--chip-purple-bg)', fg: 'var(--chip-purple-fg)' },
      { bg: 'var(--chip-green-bg)', fg: 'var(--chip-green-fg)' },
      { bg: 'var(--chip-peach-bg)', fg: 'var(--chip-peach-fg)' },
      { bg: 'var(--chip-blue-bg)', fg: 'var(--chip-blue-fg)' }
    ]
    return options[hash % options.length]
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)] select-none">Overview</h2>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold">
            {expertMode ? 'Finance dashboard & ledger stats' : 'Your spending summary at a glance'}
          </p>
        </div>

        {/* Simple vs Detailed controls */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-[var(--text-secondary)] font-extrabold uppercase tracking-wider">Mode:</span>
          <div className="bg-white border border-[var(--border)] p-0.5 rounded-full shadow-xs flex">
            <button
              onClick={() => setSimpleMode(true)}
              className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${
                simpleMode 
                  ? 'bg-[var(--primary)] text-white shadow-xs' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setSimpleMode(false)}
              className={`px-3 py-1 rounded-full text-[9px] font-bold transition-all ${
                !simpleMode 
                  ? 'bg-[var(--primary)] text-white shadow-xs' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Side: Stats, Charts, Activity (Width: ~70%) */}
        <div className="flex-1 w-full space-y-6 lg:max-w-[70%]">
          
          {/* Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Stat 1: Total Spend */}
            <div className="bg-white border border-[var(--border)] p-5 rounded-[var(--radius-lg)] shadow-sm flex flex-col justify-between min-h-[150px] relative transition-all hover:shadow-md">
              <div className="flex justify-between items-start">
                <span className="text-[var(--text-secondary)] text-[10px] font-extrabold uppercase tracking-wider">
                  {expertMode ? 'Expenses' : 'Spent'}
                </span>
                <span className="p-1.5 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--chip-green-bg)', color: 'var(--chip-green-fg)' }}>
                  <Wallet className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl font-black tracking-tight text-[var(--text-primary)] font-mono leading-none">
                  {formatINR(aggregates.totalSpend)}
                </h3>
                
                {!simpleMode && (
                  <div className="h-6 w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <Area type="monotone" dataKey="val" stroke="var(--accent-lime)" strokeWidth={1.5} fill="none" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-2 text-[9px] font-extrabold">
                  <span className={`flex items-center gap-0.5 ${aggregates.isSpendUp ? 'text-red-500' : 'text-emerald-600'}`}>
                    {aggregates.isSpendUp ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    {Math.round(aggregates.spendPercent)}%
                  </span>
                  <span className="text-[var(--text-secondary)]">vs June</span>
                </div>
              </div>
            </div>

            {/* Stat 2: Bills Due */}
            <div 
              onClick={() => setActiveTab('invoices')}
              className="bg-white border border-[var(--border)] p-5 rounded-[var(--radius-lg)] shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-[var(--text-secondary)] text-[10px] font-extrabold uppercase tracking-wider">
                  {expertMode ? 'Outstanding' : 'Due Soon'}
                </span>
                <span className="p-1.5 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--chip-blue-bg)', color: 'var(--chip-blue-fg)' }}>
                  <Calendar className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl font-black tracking-tight text-[var(--text-primary)] font-mono leading-none">
                  {formatINR(aggregates.upcomingAmount)}
                </h3>
                <p className="text-[9px] text-[var(--text-secondary)] font-extrabold mt-2 uppercase">
                  {aggregates.upcomingCount} pending bills
                </p>
              </div>
            </div>

            {/* Stat 3: Overdue Invoices */}
            <div 
              onClick={() => setActiveTab('invoices')}
              className={`p-5 rounded-[var(--radius-lg)] shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:shadow-md cursor-pointer border ${
                aggregates.overdueCount > 0 
                  ? 'border-red-200 bg-red-50/20' 
                  : 'bg-white border-[var(--border)]'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[var(--text-secondary)] text-[10px] font-extrabold uppercase tracking-wider">
                  Overdue
                </span>
                <span className="p-1.5 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--chip-peach-bg)', color: 'var(--chip-peach-fg)' }}>
                  <ShieldAlert className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <h3 className="text-xl font-black tracking-tight text-[var(--text-primary)] font-mono leading-none">
                  {formatINR(aggregates.overdueAmount)}
                </h3>
                <p className={`text-[9px] font-extrabold mt-2 uppercase ${aggregates.overdueCount > 0 ? 'text-[var(--status-overdue-text)]' : 'text-[var(--text-secondary)]'}`}>
                  {aggregates.overdueCount} require action
                </p>
              </div>
            </div>

            {/* Stat 4: Top Category */}
            <div 
              onClick={() => setActiveTab('categories')}
              className="bg-white border border-[var(--border)] p-5 rounded-[var(--radius-lg)] shadow-sm flex flex-col justify-between min-h-[150px] transition-all hover:shadow-md cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className="text-[var(--text-secondary)] text-[10px] font-extrabold uppercase tracking-wider">
                  Top Category
                </span>
                <span className="p-1.5 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--chip-purple-bg)', color: 'var(--chip-purple-fg)' }}>
                  <FolderClosed className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-extrabold text-[var(--text-primary)] truncate">
                  {aggregates.topCategory.name}
                </h3>
                <p className="text-[9px] text-[var(--text-secondary)] font-extrabold mt-2 uppercase font-mono">
                  {formatINR(aggregates.topCategory.total)} YTD
                </p>
              </div>
            </div>

          </div>

          {/* Money Flow composed chart */}
          <div className="bg-white border border-[var(--border)] p-6 rounded-[var(--radius-lg)] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Money Flow</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium">Income cash vs business expenses</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Period dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setTimePeriod(timePeriod === 'Weekly' ? 'Monthly' : 'Weekly')}
                    className="flex items-center gap-1.5 px-3 py-1 border border-[var(--border)] rounded-full text-[9px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-white cursor-pointer"
                  >
                    <span>{timePeriod}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 text-[9px] font-extrabold text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-lime)]" />
                    <span>Income</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                    <span>Expenses</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={annualChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 'bold' }} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} tick={{ fill: 'var(--text-secondary)', fontSize: 9, fontWeight: 'bold' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'transparent', borderRadius: '12px' }}
                    labelStyle={{ color: 'var(--text-on-dark)', fontWeight: 'bold', fontSize: '10px' }}
                    itemStyle={{ color: 'var(--accent-lime)', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Income" fill="var(--accent-lime)" radius={[6, 6, 0, 0]} barSize={16} />
                  <Bar dataKey="Expense" fill="var(--border)" radius={[6, 6, 0, 0]} barSize={16} />
                  <Line type="monotone" dataKey="Income" stroke="var(--text-primary)" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity hybrid list/table */}
          <div className="bg-white border border-[var(--border)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-[var(--text-primary)]">Recent Activity</h3>
                <p className="text-[10px] text-[var(--text-secondary)] font-medium">Invoices parsed from connected accounts</p>
              </div>
              <button 
                onClick={onViewAllInvoices}
                className="text-[10px] text-[var(--text-secondary)] font-extrabold hover:text-[var(--text-primary)] flex items-center gap-0.5 cursor-pointer"
              >
                <span>View all</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[9px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold bg-muted/20">
                    <th className="p-3">Sender / Vendor</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-xs font-semibold">
                  {invoices.slice(0, 5).map(inv => {
                    const status = inv.status?.toLowerCase() || 'pending'
                    const chipColors = getCategoryChipColors(inv.ledger_code || 'UNCATEGORIZED')
                    return (
                      <tr key={inv.id} className="hover:bg-[var(--bg-page)]/40 transition-colors group cursor-pointer">
                        <td className="p-3 font-extrabold text-[var(--text-primary)]">
                          {inv.vendor_name}
                        </td>
                        <td className="p-3 font-mono text-[var(--text-secondary)] text-[10px]">
                          {inv.invoice_date}
                        </td>
                        <td className="p-3">
                          <span 
                            className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: chipColors.bg, color: chipColors.fg }}
                          >
                            {inv.ledger_code}
                          </span>
                        </td>
                        <td className="p-3">
                          <span 
                            className="px-2.5 py-0.5 rounded-[var(--radius-pill)] text-[9px] font-bold uppercase tracking-wider inline-block"
                            style={{
                              backgroundColor: status === 'paid' ? 'var(--status-paid-bg)' : status === 'pending' ? 'var(--status-pending-bg)' : 'var(--status-overdue-bg)',
                              color: status === 'paid' ? 'var(--status-paid-text)' : status === 'pending' ? 'var(--status-pending-text)' : 'var(--status-overdue-text)'
                            }}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-extrabold text-right text-[var(--text-primary)]">
                          {formatINR(getAmountINR(inv))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Spotlight & Due Calendar (Width: ~30%) */}
        <div className="w-full lg:w-80 space-y-6">
          
          {/* Spotlight Supplier Promo card */}
          <div className="bg-[var(--bg-sidebar)] text-white p-6 rounded-[var(--radius-lg)] shadow-md flex flex-col justify-between min-h-[220px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-lime)]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-4">
              <span className="inline-block px-2 py-0.5 bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] rounded-full text-[9px] font-bold uppercase tracking-wider">
                Supplier Spotlight
              </span>
              <div>
                <h4 className="text-base font-black tracking-tight">{aggregates.topVendorName}</h4>
                <p className="text-[10px] text-[var(--text-on-dark-secondary)] mt-0.5">Most active service billing provider YTD</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-end justify-between">
              <div>
                <span className="text-[9px] text-[var(--text-on-dark-secondary)] font-bold uppercase tracking-wider block">YTD Spent</span>
                <span className="text-lg font-black font-mono text-[var(--accent-lime)]">{formatINR(aggregates.topVendorAmount)}</span>
              </div>
              <button 
                onClick={() => setActiveTab('vendors')}
                className="p-2 bg-[var(--accent-lime)] hover:opacity-90 text-[var(--accent-lime-text)] rounded-full shadow-sm cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Upcoming Bills List Calendar Widget */}
          <div className="bg-white border border-[var(--border)] p-5 rounded-[var(--radius-lg)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-2.5">
              <h4 className="font-extrabold text-xs text-[var(--text-primary)]">Upcoming Bills</h4>
              <span className="text-[9px] text-[var(--text-secondary)] font-extrabold uppercase">Next 30 Days</span>
            </div>

            <div className="space-y-2.5">
              {aggregates.upcomingInvoices.map(inv => (
                <div 
                  key={inv.id}
                  onClick={() => {
                    setActiveTab('invoices')
                  }}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-page)]/20 hover:bg-[var(--bg-page)]/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-[var(--chip-blue-bg)] text-[var(--chip-blue-fg)] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      {inv.vendor_name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <div className="font-extrabold text-[11px] text-[var(--text-primary)] truncate">{inv.vendor_name}</div>
                      <div className="text-[9px] text-[var(--text-secondary)] font-mono mt-0.5">Due: {inv.due_date}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                </div>
              ))}

              {aggregates.upcomingInvoices.length === 0 && (
                <div className="text-center py-6 text-[var(--text-secondary)] text-[10px]">
                  No upcoming bills detected.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
