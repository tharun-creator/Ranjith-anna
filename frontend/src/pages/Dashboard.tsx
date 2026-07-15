import { useState, useMemo } from 'react'
import { useInvoices, type Invoice } from '@/context/InvoiceContext'
import { 
  ChevronRight,
  ChevronDown,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle
} from 'lucide-react'
import { 
  ComposedChart, 
  Bar, 
  Line, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from 'recharts'

export const Dashboard = ({ onViewAllInvoices }: { onViewAllInvoices?: () => void }) => {
  const { invoices, expertMode } = useInvoices()
  const [timePeriod, setTimePeriod] = useState('Monthly')
  const [expandedCounterparties, setExpandedCounterparties] = useState<Record<string, boolean>>({})

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

  // --- Derived Metrics ---
  const metrics = useMemo(() => {
    let totalSent = 0
    let totalCollected = 0
    let totalReceived = 0
    let totalPaidOut = 0

    invoices.forEach(inv => {
      const amt = getAmountINR(inv)
      const isPaid = inv.status?.toLowerCase() === 'paid'
      
      // Determine direction: MAIL_SENT is outgoing, MAIL_RECEIVED is incoming
      const direction = inv.email_direction === 'MAIL_SENT' ? 'outgoing' : 'incoming'

      if (direction === 'outgoing') {
        totalSent += amt
        if (isPaid) {
          totalCollected += amt
        }
      } else {
        totalReceived += amt
        if (isPaid) {
          totalPaidOut += amt
        }
      }
    })

    const outstandingReceivable = totalSent - totalCollected
    const outstandingPayable = totalReceived - totalPaidOut
    const netIncome = totalCollected - totalPaidOut

    return {
      totalSent,
      totalCollected,
      outstandingReceivable,
      totalReceived,
      totalPaidOut,
      outstandingPayable,
      netIncome
    }
  }, [invoices])

  // --- Monthly Series for Chart ---
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m, idx) => {
      const monthStr = `2026-${String(idx + 1).padStart(2, '0')}`
      const monthInvs = invoices.filter(inv => inv.invoice_date?.startsWith(monthStr))
      
      let incomeVal = 0
      let expenseVal = 0

      monthInvs.forEach(inv => {
        const amt = getAmountINR(inv)
        const direction = inv.email_direction === 'MAIL_SENT' ? 'outgoing' : 'incoming'
        const isPaid = inv.status?.toLowerCase() === 'paid'

        if (direction === 'outgoing' && isPaid) {
          incomeVal += amt
        } else if (direction === 'incoming' && isPaid) {
          expenseVal += amt
        }
      })

      return {
        name: m,
        Income: Math.round(incomeVal),
        Expense: Math.round(expenseVal)
      }
    })
  }, [invoices])

  // --- Group Invoices by Counterparty ---
  const counterpartiesData = useMemo(() => {
    const outgoingGroups: Record<string, Invoice[]> = {}
    const incomingGroups: Record<string, Invoice[]> = {}

    invoices.forEach(inv => {
      const name = inv.vendor_name || 'Unknown'
      const direction = inv.email_direction === 'MAIL_SENT' ? 'outgoing' : 'incoming'
      
      if (direction === 'outgoing') {
        if (!outgoingGroups[name]) outgoingGroups[name] = []
        outgoingGroups[name].push(inv)
      } else {
        if (!incomingGroups[name]) incomingGroups[name] = []
        incomingGroups[name].push(inv)
      }
    })

    const buildSummaryList = (groups: Record<string, Invoice[]>, isOutgoing: boolean) => {
      return Object.entries(groups).map(([name, list]) => {
        const totalAmount = list.reduce((sum, i) => sum + getAmountINR(i), 0)
        const settledAmount = list
          .filter(i => i.status?.toLowerCase() === 'paid')
          .reduce((sum, i) => sum + getAmountINR(i), 0)
        const outstanding = totalAmount - settledAmount

        let statusText = 'Unpaid'
        if (outstanding === 0) {
          statusText = isOutgoing ? 'Fully collected' : 'Fully paid'
        } else if (settledAmount > 0) {
          statusText = isOutgoing ? 'Partially collected' : 'Partially paid'
        }

        return {
          name,
          count: list.length,
          totalAmount,
          settledAmount,
          outstanding,
          statusText,
          invoicesList: list
        }
      }).sort((a, b) => b.outstanding - a.outstanding)
    };

    return {
      outgoing: buildSummaryList(outgoingGroups, true),
      incoming: buildSummaryList(incomingGroups, false)
    }
  }, [invoices])

  const toggleCounterparty = (name: string) => {
    setExpandedCounterparties(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">Overview</h2>
          <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider font-extrabold">
            {expertMode ? 'Finance dashboard & ledger stats' : 'Your Income, Expenses, and Receivables'}
          </p>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 text-[var(--card-foreground)]">
        
        {/* Card 1: Income (Sent) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg)] flex flex-col justify-between min-h-[140px] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[#5C6479] text-[10px] font-extrabold uppercase tracking-wider">
              {expertMode ? 'Total Billing (Sent)' : 'Income (Sent)'}
            </span>
            <span className="p-1.5 rounded-xl flex items-center justify-center bg-[var(--chip-green-bg)] text-[var(--chip-green-fg)]">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black tracking-tight text-[var(--card-foreground)] font-mono leading-none">
              {formatINR(metrics.totalSent)}
            </h3>
            <p className="text-[9px] text-[#5C6479] font-bold mt-2">
              Collected: <span className="text-emerald-700">{formatINR(metrics.totalCollected)}</span>
            </p>
          </div>
        </div>

        {/* Card 2: Outstanding Receivables */}
        <div className={`p-5 rounded-[var(--radius-lg)] flex flex-col justify-between min-h-[140px] transition-all border ${
          metrics.outstandingReceivable > 0 ? 'border-amber-400 bg-amber-50' : 'bg-[var(--bg-card)] border-[var(--border)]'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[#5C6479] text-[10px] font-extrabold uppercase tracking-wider">
              {expertMode ? 'Accounts Receivable' : 'Money Owed To Me'}
            </span>
            <span className="p-1.5 rounded-xl flex items-center justify-center bg-[var(--chip-peach-bg)] text-[var(--chip-peach-fg)]">
              <ShieldAlert className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black tracking-tight text-[var(--card-foreground)] font-mono leading-none">
              {formatINR(metrics.outstandingReceivable)}
            </h3>
            <p className="text-[9px] text-[#5C6479] font-bold mt-2">
              Outstanding client payments
            </p>
          </div>
        </div>

        {/* Card 3: Expense (Received) */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-[var(--radius-lg)] flex flex-col justify-between min-h-[140px] transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[#5C6479] text-[10px] font-extrabold uppercase tracking-wider">
              {expertMode ? 'Total Expenses (Received)' : 'Expense (Received)'}
            </span>
            <span className="p-1.5 rounded-xl flex items-center justify-center bg-[var(--chip-blue-bg)] text-[var(--chip-blue-fg)]">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black tracking-tight text-[var(--card-foreground)] font-mono leading-none">
              {formatINR(metrics.totalReceived)}
            </h3>
            <p className="text-[9px] text-[#5C6479] font-bold mt-2">
              Paid: <span className="text-blue-700">{formatINR(metrics.totalPaidOut)}</span>
            </p>
          </div>
        </div>

        {/* Card 4: Outstanding Payables */}
        <div className={`p-5 rounded-[var(--radius-lg)] flex flex-col justify-between min-h-[140px] transition-all border ${
          metrics.outstandingPayable > 0 ? 'border-red-300 bg-red-50' : 'bg-[var(--bg-card)] border-[var(--border)]'
        }`}>
          <div className="flex justify-between items-start">
            <span className="text-[#5C6479] text-[10px] font-extrabold uppercase tracking-wider">
              {expertMode ? 'Accounts Payable' : 'Money I Owe'}
            </span>
            <span className="p-1.5 rounded-xl flex items-center justify-center bg-red-100 text-red-700">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <h3 className="text-xl font-black tracking-tight text-[var(--card-foreground)] font-mono leading-none">
              {formatINR(metrics.outstandingPayable)}
            </h3>
            <p className="text-[9px] text-[#5C6479] font-bold mt-2">
              Pending supplier invoices
            </p>
          </div>
        </div>

      </div>

      {/* Money Flow Chart */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[var(--radius-lg)] text-[var(--card-foreground)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-sm text-[var(--card-foreground)]">Income vs Expense Flow</h3>
            <p className="text-[10px] text-[#5C6479] font-medium">Monthly cash flow tracker (paid items)</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setTimePeriod(timePeriod === 'Weekly' ? 'Monthly' : 'Weekly')}
              className="flex items-center gap-1.5 px-3 py-1 border border-[var(--border)] rounded-full text-[9px] font-bold text-[#5C6479] hover:text-[var(--card-foreground)] bg-[var(--bg-card)] cursor-pointer"
            >
              <span>{timePeriod}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="flex items-center gap-3 text-[9px] font-extrabold text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-lime)]" />
                <span>Collected Income</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--border)]" />
                <span>Paid Expenses</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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

      {/* Side-by-Side Direction Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-[var(--card-foreground)]">
        
        {/* Panel 1: Invoices I've Sent */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[var(--radius-lg)] space-y-4">
          <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--card-foreground)]">Invoices I've Sent</h3>
              <p className="text-[10px] text-[#5C6479] font-medium">Billed client totals and collections</p>
            </div>
            <button 
              onClick={onViewAllInvoices}
              className="text-[10px] text-[#5C6479] font-extrabold hover:text-[var(--card-foreground)] flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {counterpartiesData.outgoing.map(client => {
              const isExpanded = !!expandedCounterparties[client.name]
              return (
                <div key={client.name} className="border border-[var(--border)] rounded-xl overflow-hidden bg-white/40">
                  <div 
                    onClick={() => toggleCounterparty(client.name)}
                    className="p-3 hover:bg-white/60 cursor-pointer flex items-center justify-between text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-[var(--chip-green-bg)] text-[var(--chip-green-fg)] flex items-center justify-center flex-shrink-0 font-bold">
                        {client.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-[var(--card-foreground)] truncate">{client.name}</div>
                        <div className="text-[9px] text-[#5C6479] mt-0.5">{client.count} invoices</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-[var(--card-foreground)]">{formatINR(client.totalAmount)}</div>
                        <div className="text-[9px] text-emerald-700 font-bold font-mono">Coll: {formatINR(client.settledAmount)}</div>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-[var(--radius-pill)] text-[9px] font-bold ${
                        client.statusText.includes('Fully') 
                          ? 'bg-emerald-500/10 text-emerald-800' 
                          : 'bg-amber-500/10 text-amber-800'
                      }`}>
                        {client.statusText}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-[#5C6479]" /> : <ChevronRight className="w-4 h-4 text-[#5C6479]" />}
                    </div>
                  </div>

                  {/* Expanded individual invoice rows */}
                  {isExpanded && (
                    <div className="p-3 bg-white/80 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                      {client.invoicesList.map(inv => (
                        <div key={inv.id} className="py-2 flex items-center justify-between text-[10px]">
                          <div>
                            <div className="font-bold text-[var(--card-foreground)]">Inv #{inv.invoice_number || '—'}</div>
                            <div className="text-[9px] text-[#5C6479]">Due: {inv.due_date}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[var(--card-foreground)]">{formatINR(getAmountINR(inv))}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                              inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-800' : 'bg-amber-500/10 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {counterpartiesData.outgoing.length === 0 && (
              <div className="text-center py-8 text-[#5C6479] text-xs">
                No sent invoices detected.
              </div>
            )}
          </div>
        </div>

        {/* Panel 2: Invoices I've Received */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[var(--radius-lg)] space-y-4">
          <div className="border-b border-[var(--border)] pb-3 flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-[var(--card-foreground)]">Invoices I've Received</h3>
              <p className="text-[10px] text-[#5C6479] font-medium">Vendor bill totals and payouts</p>
            </div>
            <button 
              onClick={onViewAllInvoices}
              className="text-[10px] text-[#5C6479] font-extrabold hover:text-[var(--card-foreground)] flex items-center gap-0.5 cursor-pointer bg-transparent border-none"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {counterpartiesData.incoming.map(vendor => {
              const isExpanded = !!expandedCounterparties[vendor.name]
              return (
                <div key={vendor.name} className="border border-[var(--border)] rounded-xl overflow-hidden bg-white/40">
                  <div 
                    onClick={() => toggleCounterparty(vendor.name)}
                    className="p-3 hover:bg-white/60 cursor-pointer flex items-center justify-between text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-8 h-8 rounded-lg bg-[var(--chip-blue-bg)] text-[var(--chip-blue-fg)] flex items-center justify-center flex-shrink-0 font-bold">
                        {vendor.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <div className="font-bold text-[var(--card-foreground)] truncate">{vendor.name}</div>
                        <div className="text-[9px] text-[#5C6479] mt-0.5">{vendor.count} invoices</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-mono font-bold text-[var(--card-foreground)]">{formatINR(vendor.totalAmount)}</div>
                        <div className="text-[9px] text-blue-700 font-bold font-mono">Paid: {formatINR(vendor.settledAmount)}</div>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-[var(--radius-pill)] text-[9px] font-bold ${
                        vendor.statusText.includes('Fully') 
                          ? 'bg-emerald-500/10 text-emerald-800' 
                          : 'bg-amber-500/10 text-amber-800'
                      }`}>
                        {vendor.statusText}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-[#5C6479]" /> : <ChevronRight className="w-4 h-4 text-[#5C6479]" />}
                    </div>
                  </div>

                  {/* Expanded individual invoice rows */}
                  {isExpanded && (
                    <div className="p-3 bg-white/80 divide-y divide-[var(--border)] border-t border-[var(--border)]">
                      {vendor.invoicesList.map(inv => (
                        <div key={inv.id} className="py-2 flex items-center justify-between text-[10px]">
                          <div>
                            <div className="font-bold text-[var(--card-foreground)]">Inv #{inv.invoice_number || '—'}</div>
                            <div className="text-[9px] text-[#5C6479]">Due: {inv.due_date}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-[var(--card-foreground)]">{formatINR(getAmountINR(inv))}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                              inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-800' : 'bg-amber-500/10 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {counterpartiesData.incoming.length === 0 && (
              <div className="text-center py-8 text-[#5C6479] text-xs">
                No received invoices detected.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
