import { useState, useMemo } from 'react'
import { Sun, Moon, AlertTriangle } from 'lucide-react'
import { BarChart as RechartsBarChart, Bar as RechartsBar, ResponsiveContainer as RechartsResponsiveContainer, Tooltip as RechartsTooltip, XAxis as RechartsXAxis, YAxis as RechartsYAxis, CartesianGrid as RechartsCartesianGrid } from 'recharts'
import { StatCards } from '@/components/StatCards'
import { CalendarHeatmap } from '@/components/CalendarHeatmap'

// --- Mock Data ---
interface MockInvoice {
  id: string
  vendor: string
  date: string // YYYY-MM-DD
  ledgerCode: string
  ledgerName: string
  confidence: number
  status: 'paid' | 'pending' | 'overdue'
  amount: number
  currency: string
}

const MOCK_INVOICES: MockInvoice[] = [
  { id: 'INV-2026-001', vendor: 'Amazon Web Services', date: '2026-07-01', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 95, status: 'paid', amount: 1420.50, currency: 'USD' },
  { id: 'INV-2026-002', vendor: 'Google Cloud Platform', date: '2026-07-01', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 92, status: 'paid', amount: 890.00, currency: 'USD' },
  { id: 'INV-2026-003', vendor: 'Figma Inc.', date: '2026-07-03', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 98, status: 'paid', amount: 150.00, currency: 'USD' },
  { id: 'INV-2026-004', vendor: 'Razorpay Software', date: '2026-07-06', ledgerCode: 'ASP-26', ledgerName: 'Vendors, Partners, Freelancers', confidence: 72, status: 'pending', amount: 3500.00, currency: 'INR' },
  { id: 'INV-2026-005', vendor: 'WeWork India', date: '2026-07-06', ledgerCode: 'SISU-61', ledgerName: 'Rent for Office Space', confidence: 99, status: 'paid', amount: 45000.00, currency: 'INR' },
  { id: 'INV-2026-006', vendor: 'Vercel Inc.', date: '2026-07-08', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 96, status: 'paid', amount: 40.00, currency: 'USD' },
  { id: 'INV-2026-007', vendor: 'Fly Emirates', date: '2026-07-08', ledgerCode: 'ASP-59', ledgerName: 'Travelling & Conveyance', confidence: 89, status: 'paid', amount: 1200.00, currency: 'USD' },
  { id: 'INV-2026-008', vendor: 'DigitalOcean', date: '2026-07-10', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 91, status: 'paid', amount: 240.00, currency: 'USD' },
  { id: 'INV-2026-009', vendor: 'Adobe Systems', date: '2026-07-10', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 65, status: 'pending', amount: 80.00, currency: 'USD' },
  { id: 'INV-2026-010', vendor: 'HDFC Corporate Card', date: '2026-07-12', ledgerCode: 'ASP-33', ledgerName: 'Professional & Legal Expense', confidence: 88, status: 'overdue', amount: 12450.00, currency: 'INR' },
  { id: 'INV-2026-011', vendor: 'Uber India', date: '2026-07-12', ledgerCode: 'ASP-59', ledgerName: 'Travelling & Conveyance', confidence: 84, status: 'paid', amount: 450.00, currency: 'INR' },
  { id: 'INV-2026-012', vendor: 'Figma Inc.', date: '2026-07-15', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 97, status: 'paid', amount: 150.00, currency: 'USD' },
  { id: 'INV-2026-013', vendor: 'Amazon Web Services', date: '2026-07-15', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 94, status: 'paid', amount: 1395.20, currency: 'USD' },
  { id: 'INV-2026-014', vendor: 'GitHub Inc.', date: '2026-07-17', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 98, status: 'paid', amount: 2500.00, currency: 'USD' },
  { id: 'INV-2026-015', vendor: 'Slack Technologies', date: '2026-07-20', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 95, status: 'paid', amount: 320.00, currency: 'USD' },
  { id: 'INV-2026-016', vendor: 'BlueTokai Coffee', date: '2026-07-20', ledgerCode: 'ASP-35', ledgerName: 'Food, Beverages, Event', confidence: 78, status: 'pending', amount: 1200.00, currency: 'INR' },
  { id: 'INV-2026-017', vendor: 'Stripe Payments', date: '2026-07-22', ledgerCode: 'ASP-33', ledgerName: 'Professional & Legal Expense', confidence: 93, status: 'paid', amount: 75.00, currency: 'USD' },
  { id: 'INV-2026-018', vendor: 'Swiggy Desktop Lunch', date: '2026-07-22', ledgerCode: 'ASP-23', ledgerName: 'Team Lunch & Outing', confidence: 55, status: 'pending', amount: 2450.00, currency: 'INR' },
  { id: 'INV-2026-019', vendor: 'OpenAI API Charge', date: '2026-07-24', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 96, status: 'paid', amount: 480.00, currency: 'USD' },
  { id: 'INV-2026-020', vendor: 'Anthropic Claude Billing', date: '2026-07-24', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 94, status: 'paid', amount: 310.00, currency: 'USD' },
  { id: 'INV-2026-021', vendor: 'Canva Pro', date: '2026-07-27', ledgerCode: 'ASP-28', ledgerName: 'Softwares, Laptop Rental', confidence: 92, status: 'paid', amount: 120.00, currency: 'USD' },
  { id: 'INV-2026-022', vendor: 'Salesforce Inc.', date: '2026-07-27', ledgerCode: 'ASP-30', ledgerName: 'Marketing & Branding Expenses', confidence: 89, status: 'paid', amount: 980.00, currency: 'USD' },
  { id: 'INV-2026-023', vendor: 'Mailchimp Monthly', date: '2026-07-29', ledgerCode: 'ASP-30', ledgerName: 'Marketing & Branding Expenses', confidence: 91, status: 'paid', amount: 150.00, currency: 'USD' },
  { id: 'INV-2026-024', vendor: 'HDFC Corporate Card', date: '2026-07-29', ledgerCode: 'ASP-33', ledgerName: 'Professional & Legal Expense', confidence: 85, status: 'overdue', amount: 8400.00, currency: 'INR' }
]

const USD_TO_INR = 83.5
interface DashboardProps {
  onViewAllInvoices?: () => void
}

export const Dashboard = ({ onViewAllInvoices }: DashboardProps) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('light') // default light theme for warm cream feel
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'calendar' | 'ledger'>('overview')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 6, 12)) // July 2026 for mock data

  const handleTabChange = (tab: 'overview' | 'invoices' | 'calendar' | 'ledger') => {
    setActiveTab(tab)
    if (tab === 'invoices' && onViewAllInvoices) {
      onViewAllInvoices()
    }
    if (tab !== 'calendar') setSelectedDate(null)
  }

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Helper formatting functions
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const convertToINR = (invoice: MockInvoice): number => {
    if (invoice.currency === 'USD') {
      return invoice.amount * USD_TO_INR
    }
    return invoice.amount
  }

  // --- Aggregate Stats ---
  const stats = useMemo(() => {
    const totalCount = MOCK_INVOICES.length
    const totalAmount = MOCK_INVOICES.reduce((sum, inv) => sum + convertToINR(inv), 0)
    const pendingReview = MOCK_INVOICES.filter(inv => inv.confidence < 80).length
    const overdueCount = MOCK_INVOICES.filter(inv => inv.status === 'overdue').length
    
    return { totalCount, totalAmount, pendingReview, overdueCount }
  }, [])

  // --- Filter Logic for Table ---
  const filteredInvoices = useMemo(() => {
    if (!selectedDate) return MOCK_INVOICES
    return MOCK_INVOICES.filter(inv => inv.date === selectedDate)
  }, [selectedDate])

  // --- Chart Processing ---
  const chartData = useMemo(() => {
    // Group invoices by day of the month for July 2026
    const daysInMonth = 31
    const data = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `2026-07-${String(d).padStart(2, '0')}`
      
      const processedAmount = MOCK_INVOICES
        .filter(inv => inv.date === dateStr && inv.status === 'paid')
        .reduce((sum, inv) => sum + convertToINR(inv), 0)
        
      const pendingOverdueAmount = MOCK_INVOICES
        .filter(inv => inv.date === dateStr && (inv.status === 'pending' || inv.status === 'overdue'))
        .reduce((sum, inv) => sum + convertToINR(inv), 0)
      
      data.push({
        day: `07/${String(d).padStart(2, '0')}`,
        processed: Math.round(processedAmount),
        pendingOverdue: Math.round(pendingOverdueAmount)
      })
    }
    return data
  }, [])

  // --- Calendar Grid Computation ---
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const cells = []
    
    for (let i = 0; i < firstDay; i++) {
      cells.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayInvoices = MOCK_INVOICES.filter(inv => inv.date === dateStr)
      cells.push({
        dateString: dateStr,
        dayNumber: day,
        invoiceCount: dayInvoices.length,
        isToday: day === 12 && month === 6 && year === 2026 // Mocking Today as July 12, 2026
      })
    }
    
    return cells
  }, [currentMonth])

  // --- Calendar Navigation ---
  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDate(null)
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDate(null)
  }

  return (
    <div 
      className="finnex-root min-h-screen transition-colors duration-200 py-6"
      data-theme={theme}
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Theme Variable Injection */}
      <style>{`
        .finnex-root {
          --background: #F5F3EC;
          --foreground: #0D2418;
          --border: #E5E0D5;
          --card-bg: #ffffff;
          --accent: #1B4332;
          --accent-rgb: 27, 67, 50;
          --status-paid: #1B4332;
          --status-paid-bg: rgba(27, 67, 50, 0.1);
          --status-pending: #D97706;
          --status-pending-bg: rgba(217, 119, 6, 0.1);
          --status-overdue: #DC2626;
          --status-overdue-bg: rgba(220, 38, 38, 0.1);
          --muted: #8C867A;
          --hover: #F9F8F6;
          --focus-ring: 0 0 0 2px #1B4332;
        }

        .finnex-root[data-theme="dark"] {
          --background: #1B4332;
          --foreground: #FAF9F5;
          --border: rgba(250, 249, 245, 0.15);
          --card-bg: #FAF9F5;
          --accent: #B8E020;
          --accent-rgb: 184, 224, 32;
          --status-paid: #2D6A4F;
          --status-paid-bg: rgba(45, 106, 79, 0.1);
          --status-pending: #D97706;
          --status-pending-bg: rgba(217, 119, 6, 0.1);
          --status-overdue: #DC2626;
          --status-overdue-bg: rgba(220, 38, 38, 0.1);
          --muted: #6B7280;
          --hover: #F3F4F6;
          --focus-ring: 0 0 0 2px #B8E020;
        }

        .interactive-el:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
      `}</style>

      {/* --- Top Bar & Navigation --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-b border-[var(--border)] pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white dark:text-primary-foreground font-extrabold text-lg select-none">F</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight select-none">Finnex</h1>
            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">Ledger Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--border)] p-1 rounded-xl shadow-sm">
            {(['overview', 'invoices', 'calendar', 'ledger'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`interactive-el px-3 py-1.5 rounded-lg font-bold text-xs capitalize transition-all duration-150 ${
                  activeTab === tab 
                    ? 'bg-[var(--accent)] text-white dark:text-primary-foreground shadow-sm' 
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            className="interactive-el w-8.5 h-8.5 rounded-xl border border-[var(--border)] flex items-center justify-center hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* --- Main Dashboard Container --- */}
      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* --- Tab: Overview --- */}
        {activeTab === 'overview' && (
          <>
            {/* Stat Cards Component */}
            <StatCards stats={stats} formatINR={formatINR} />

            {/* Volume Timeline Chart */}
            <section className="bg-card text-card-foreground border border-border/60 p-6 rounded-[24px] shadow-sm transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-sm">Invoice Value Volume</h3>
                  <p className="text-xs text-muted-foreground">Daily cumulative processed transaction volume</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#1B4332] rounded-sm"></span>
                    <span>Processed (Teal)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#B8E020] rounded-sm"></span>
                    <span>Pending/Overdue (Lime)</span>
                  </div>
                </div>
              </div>
              <div className="h-72">
                <RechartsResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <RechartsCartesianGrid stroke="#E6E2D8" strokeDasharray="3 3" vertical={false} />
                    <RechartsXAxis 
                      dataKey="day" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 'bold', fontFamily: 'ui-monospace, JetBrains Mono, monospace' }}
                    />
                    <RechartsYAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `₹${val/1000}k`}
                      tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 'bold', fontFamily: 'ui-monospace, JetBrains Mono, monospace' }}
                    />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-[#0F241A] text-white p-4 rounded-xl shadow-lg border border-emerald-900/40 font-mono text-xs space-y-1.5">
                              <p className="font-bold text-[10px] text-emerald-400 uppercase tracking-wider">{payload[0].payload.day}</p>
                              <p className="flex justify-between gap-6">
                                <span className="opacity-70">Processed:</span>
                                <span className="font-bold">{formatINR(payload[0].value as number)}</span>
                              </p>
                              <p className="flex justify-between gap-6">
                                <span className="opacity-70">Pending/Overdue:</span>
                                <span className="font-bold text-[#B8E020]">{formatINR(payload[1].value as number)}</span>
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <RechartsBar 
                      dataKey="processed" 
                      fill="#1B4332" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={30}
                    />
                    <RechartsBar 
                      dataKey="pendingOverdue" 
                      fill="#B8E020" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={30}
                    />
                  </RechartsBarChart>
                </RechartsResponsiveContainer>
              </div>
            </section>

            {/* Signature Grid: Calendar, Needs Attention & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Calendar Grid (Column 1 & 2) */}
              <div className="lg:col-span-2">
                <CalendarHeatmap 
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  calendarCells={calendarCells}
                  handlePrevMonth={handlePrevMonth}
                  handleNextMonth={handleNextMonth}
                  setSelectedDate={setSelectedDate}
                />
              </div>

              {/* Needs Attention Panel (Column 3) */}
              <div className="bg-card text-card-foreground border border-border/60 p-6 rounded-[24px] shadow-sm space-y-4 transition-all duration-200 hover:shadow-md">
                <div>
                  <h3 className="font-bold text-sm">Needs Attention</h3>
                  <p className="text-xs text-muted-foreground">Overdue and pending ledger approval items</p>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {MOCK_INVOICES.filter(inv => inv.status === 'overdue' || inv.status === 'pending').map(inv => (
                    <div 
                      key={inv.id}
                      className="border border-border/60 bg-card p-3.5 rounded-xl flex items-center justify-between text-xs transition-all hover:border-border"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-foreground">{inv.vendor}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-semibold">
                          <span className="font-mono">{inv.id}</span>
                          <span>•</span>
                          <span className="font-mono">{inv.date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-mono font-bold text-foreground">{formatINR(convertToINR(inv))}</div>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          inv.status === 'overdue' 
                            ? 'bg-red-500/10 text-red-650'
                            : 'bg-amber-500/10 text-amber-600'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invoices Table View */}
            <section className="bg-card text-card-foreground border border-border/60 rounded-[24px] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
              <div className="p-6 border-b border-border/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm">
                    {selectedDate ? `Invoices Received on ${selectedDate}` : 'Recent Mapped Communications'}
                  </h3>
                  <p className="text-xs text-muted-foreground">Extracted metadata and structured transactional mapping</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                      <th className="p-5">Invoice ID</th>
                      <th className="p-5">Vendor</th>
                      <th className="p-5">Date</th>
                      <th className="p-5">Ledger Mappings</th>
                      <th className="p-5">Status</th>
                      <th className="p-5 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 text-xs font-medium">
                    {filteredInvoices.slice(0, 10).map(inv => (
                      <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-5 font-mono text-muted-foreground font-semibold">{inv.id}</td>
                        <td className="p-5 font-bold text-foreground">{inv.vendor}</td>
                        <td className="p-5 font-mono">{inv.date}</td>
                        <td className="p-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-bold text-foreground">{inv.ledgerCode}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                              <span>{inv.ledgerName}</span>
                              {inv.confidence < 80 && (
                                <span className="flex items-center gap-0.5 text-amber-600 font-mono font-bold bg-amber-500/10 px-1.5 py-0.2 rounded-full">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Unclassified ({inv.confidence}%)</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-800' :
                            inv.status === 'pending' ? 'bg-amber-500/10 text-amber-800' :
                            'bg-red-500/10 text-red-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className={`p-5 font-mono font-bold text-right ${
                          inv.status === 'paid' ? 'text-emerald-700' :
                          inv.status === 'pending' ? 'text-amber-600' :
                          'text-red-650'
                        }`}>{formatINR(convertToINR(inv))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
