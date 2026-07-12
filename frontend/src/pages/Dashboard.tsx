import { useState, useMemo } from 'react'
import { 
  Sun, Moon, AlertTriangle, ChevronLeft, ChevronRight, 
  TrendingUp, TrendingDown
} from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
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
      const totalAmount = MOCK_INVOICES
        .filter(inv => inv.date === dateStr)
        .reduce((sum, inv) => sum + convertToINR(inv), 0)
      
      data.push({
        day: `07/${String(d).padStart(2, '0')}`,
        amount: Math.round(totalAmount)
      })
    }
    return data
  }, [])

  // --- Calendar Grid Computation ---
  const calendarCells = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1).getDay()
    // Days in the current month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const cells = []
    
    // Empty padded slots for first week offset
    for (let i = 0; i < firstDay; i++) {
      cells.push(null)
    }
    
    // Real days
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

  // --- Unclassified Warning Flag Helper ---
  const isUnclassified = (invoice: MockInvoice) => invoice.confidence < 80

  return (
    <div 
      className="finnex-root min-h-screen transition-colors duration-200 py-6 px-4 md:px-8"
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
          --background: #0a0a0a;
          --foreground: #fafafa;
          --border: #1f1f1f;
          --card-bg: #121212;
          --accent: #3291ff;
          --accent-rgb: 50, 145, 255;
          --status-paid: #00e676;
          --status-paid-bg: rgba(0, 230, 118, 0.1);
          --status-pending: #ffb300;
          --status-pending-bg: rgba(255, 179, 0, 0.1);
          --status-overdue: #ff3d00;
          --status-overdue-bg: rgba(255, 61, 0, 0.1);
          --muted: #888888;
          --hover: #1e1e1e;
          --focus-ring: 0 0 0 2px #3291ff;
        }

        .finnex-root[data-theme="light"] {
          --background: #ffffff;
          --foreground: #171717;
          --border: #eaeaea;
          --card-bg: #fafafa;
          --accent: #0070f3;
          --accent-rgb: 0, 112, 243;
          --status-paid: #00a000;
          --status-paid-bg: rgba(0, 160, 0, 0.08);
          --status-pending: #d97706;
          --status-pending-bg: rgba(217, 119, 6, 0.08);
          --status-overdue: #df1b1b;
          --status-overdue-bg: rgba(223, 27, 27, 0.08);
          --muted: #666666;
          --hover: #f5f5f5;
          --focus-ring: 0 0 0 2px #0070f3;
        }

        /* Keyboard Focus Outline */
        .interactive-el:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
      `}</style>

      {/* --- Top Bar & Navigation --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between border-b border-[var(--border)] pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--accent)] rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg select-none">F</span>
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight select-none">Finnex</h1>
            <p className="text-[11px] text-[var(--muted)] font-medium uppercase tracking-wider">Ledger Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--border)] p-1 rounded-lg">
            {(['overview', 'invoices', 'calendar', 'ledger'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`interactive-el px-3 py-1.5 rounded-md font-medium text-xs capitalize transition-all duration-150 ${
                  activeTab === tab 
                    ? 'bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] shadow-sm' 
                    : 'text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover)] border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <button
            onClick={toggleTheme}
            className="interactive-el w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center hover:bg-[var(--hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
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
            {/* Stat Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-[var(--muted)] text-xs font-medium">
                  <span>Total Invoices</span>
                  <div className="flex items-center text-[var(--status-paid)] gap-0.5 font-mono text-[10px]">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12%</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold tracking-tight">{stats.totalCount}</span>
                  <span className="text-[10px] text-[var(--muted)]">this month</span>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-[var(--muted)] text-xs font-medium">
                  <span>Processed Value</span>
                  <div className="flex items-center text-[var(--status-paid)] gap-0.5 font-mono text-[10px]">
                    <TrendingUp className="w-3 h-3" />
                    <span>+8.3%</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold tracking-tight">{formatINR(stats.totalAmount)}</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-[var(--muted)] text-xs font-medium">
                  <span>Needs Review</span>
                  <div className="flex items-center text-[var(--status-pending)] gap-0.5 font-mono text-[10px]">
                    <TrendingDown className="w-3 h-3" />
                    <span>-24%</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold tracking-tight">{stats.pendingReview}</span>
                  <span className="text-[10px] text-[var(--muted)]">confidence &lt; 80%</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-lg flex flex-col justify-between">
                <div className="flex items-center justify-between text-[var(--muted)] text-xs font-medium">
                  <span>Overdue Invoices</span>
                  <div className="flex items-center text-[var(--status-overdue)] gap-0.5 font-mono text-[10px]">
                    <TrendingUp className="w-3 h-3" />
                    <span>+10%</span>
                  </div>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="font-mono text-2xl font-semibold tracking-tight text-[var(--status-overdue)]">{stats.overdueCount}</span>
                  <span className="text-[10px] text-[var(--status-overdue)] bg-[var(--status-overdue-bg)] px-1.5 py-0.5 rounded font-mono font-medium">At Risk</span>
                </div>
              </div>
            </section>

            {/* Chart Section */}
            <section className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-sm">Invoice Value Volume</h3>
                  <p className="text-xs text-[var(--muted)]">Daily cumulative processed transaction volume</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                  <span className="w-2.5 h-2.5 bg-[var(--accent)] rounded-sm"></span>
                  <span>Amount (INR)</span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'ui-monospace, JetBrains Mono, monospace' }}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(val) => `₹${val/1000}k`}
                      tick={{ fill: 'var(--muted)', fontSize: 10, fontFamily: 'ui-monospace, JetBrains Mono, monospace' }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border)',
                        color: 'var(--foreground)',
                        fontFamily: 'ui-monospace, JetBrains Mono, monospace',
                        fontSize: 12,
                        borderRadius: 6
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="var(--accent)" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#chartGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Signature Grid: Calendar, Needs Attention & Table */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Calendar Grid (Column 1 & 2) */}
              <div className="lg:col-span-2 bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Invoice Tracking Calendar</h3>
                    <p className="text-xs text-[var(--muted)]">Activity-based mapping & day selection filter</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevMonth}
                      className="interactive-el p-1.5 rounded hover:bg-[var(--hover)] border border-[var(--border)] cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-medium min-w-[80px] text-center">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button 
                      onClick={handleNextMonth}
                      className="interactive-el p-1.5 rounded hover:bg-[var(--hover)] border border-[var(--border)] cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Layout */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-[var(--muted)] font-medium uppercase tracking-wider">
                  <div>Sun</div>
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                </div>

                <div className="grid grid-cols-7 gap-1.5">
                  {calendarCells.map((cell, idx) => {
                    if (!cell) return <div key={`empty-${idx}`} className="h-10"></div>
                    
                    // Intensity color coding (GitHub-like intensity scale using accent shades)
                    let intensityStyle = {}
                    if (cell.invoiceCount === 1) {
                      intensityStyle = { backgroundColor: 'rgba(var(--accent-rgb), 0.15)', color: 'var(--foreground)' }
                    } else if (cell.invoiceCount === 2) {
                      intensityStyle = { backgroundColor: 'rgba(var(--accent-rgb), 0.35)', color: 'var(--foreground)' }
                    } else if (cell.invoiceCount > 2) {
                      intensityStyle = { backgroundColor: 'rgba(var(--accent-rgb), 0.7)', color: '#fff' }
                    } else {
                      // Quiet day
                      intensityStyle = { border: '1px solid var(--border)', color: 'var(--muted)' }
                    }

                    const isSelected = selectedDate === cell.dateString

                    return (
                      <button
                        key={cell.dateString}
                        onClick={() => setSelectedDate(isSelected ? null : cell.dateString)}
                        style={intensityStyle}
                        className={`interactive-el h-10 rounded-md relative flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected ? 'ring-2 ring-[var(--accent)] border-transparent' : ''
                        }`}
                      >
                        <span className={`font-mono text-xs ${cell.isToday ? 'text-[var(--accent)] font-bold' : ''}`}>
                          {cell.dayNumber}
                        </span>
                        {cell.invoiceCount > 0 && (
                          <span className="absolute bottom-1 w-1 h-1 bg-[var(--accent)] rounded-full"></span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Legend & Clears */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[11px] text-[var(--muted)] border-t border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <span>Fewer</span>
                    <span className="w-3.5 h-3.5 rounded border border-[var(--border)]"></span>
                    <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.15)' }}></span>
                    <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.35)' }}></span>
                    <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: 'rgba(var(--accent-rgb), 0.7)' }}></span>
                    <span>More</span>
                  </div>

                  {selectedDate && (
                    <button 
                      onClick={() => setSelectedDate(null)}
                      className="interactive-el text-[var(--accent)] hover:underline font-mono"
                    >
                      Clear Date Filter [ {selectedDate} ]
                    </button>
                  )}
                </div>
              </div>

              {/* Needs Attention Panel (Column 3) */}
              <div className="bg-[var(--card-bg)] border border-[var(--border)] p-4 rounded-lg space-y-4">
                <div>
                  <h3 className="font-semibold text-sm">Needs Attention</h3>
                  <p className="text-xs text-[var(--muted)]">Overdue and pending ledger approval items</p>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {MOCK_INVOICES.filter(inv => inv.status === 'overdue' || inv.status === 'pending').map(inv => (
                    <div 
                      key={inv.id}
                      className="border border-[var(--border)] p-2.5 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-[var(--foreground)]">{inv.vendor}</div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
                          <span className="font-mono">{inv.id}</span>
                          <span>•</span>
                          <span className="font-mono">{inv.date}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-mono font-semibold">{formatINR(convertToINR(inv))}</div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          inv.status === 'overdue' 
                            ? 'bg-[var(--status-overdue-bg)] text-[var(--status-overdue)]'
                            : 'bg-[var(--status-pending-bg)] text-[var(--status-pending)]'
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
            <section className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">
                    {selectedDate ? `Invoices Received on ${selectedDate}` : 'Recent Mapped Communications'}
                  </h3>
                  <p className="text-xs text-[var(--muted)]">Extracted metadata and structured transactional mapping</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Vendor</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Ledger Mappings</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-xs">
                    {filteredInvoices.slice(0, 10).map(inv => (
                      <tr key={inv.id} className="hover:bg-[var(--hover)] transition-colors">
                        <td className="p-4 font-mono text-[var(--muted)]">{inv.id}</td>
                        <td className="p-4 font-semibold text-[var(--foreground)]">{inv.vendor}</td>
                        <td className="p-4 font-mono">{inv.date}</td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono font-medium text-[var(--foreground)]">{inv.ledgerCode}</span>
                            <div className="flex items-center gap-1 text-[10px] text-[var(--muted)]">
                              <span>{inv.ledgerName}</span>
                              {isUnclassified(inv) && (
                                <span className="flex items-center gap-0.5 text-[var(--status-pending)] font-mono font-semibold bg-[var(--status-pending-bg)] px-1 rounded">
                                  <AlertTriangle className="w-3 h-3" />
                                  <span>Unclassified ({inv.confidence}%)</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            inv.status === 'paid' ? 'bg-[var(--status-paid-bg)] text-[var(--status-paid)]' :
                            inv.status === 'pending' ? 'bg-[var(--status-pending-bg)] text-[var(--status-pending)]' :
                            'bg-[var(--status-overdue-bg)] text-[var(--status-overdue)]'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-semibold text-right">{formatINR(convertToINR(inv))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* --- Tab: Invoices --- */}
        {activeTab === 'invoices' && (
          <section className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[var(--border)]">
              <h3 className="font-semibold text-sm">All Invoices</h3>
              <p className="text-xs text-[var(--muted)]">Complete ledger of structured financial records</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Vendor</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Ledger Code</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-xs">
                  {MOCK_INVOICES.map(inv => (
                    <tr key={inv.id} className="hover:bg-[var(--hover)] transition-colors">
                      <td className="p-4 font-mono text-[var(--muted)]">{inv.id}</td>
                      <td className="p-4 font-semibold text-[var(--foreground)]">{inv.vendor}</td>
                      <td className="p-4 font-mono">{inv.date}</td>
                      <td className="p-4 font-mono">{inv.ledgerCode}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          inv.status === 'paid' ? 'bg-[var(--status-paid-bg)] text-[var(--status-paid)]' :
                          inv.status === 'pending' ? 'bg-[var(--status-pending-bg)] text-[var(--status-pending)]' :
                          'bg-[var(--status-overdue-bg)] text-[var(--status-overdue)]'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-right">{formatINR(convertToINR(inv))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* --- Tab: Calendar View --- */}
        {activeTab === 'calendar' && (
          <section className="bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-lg space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Monthly Communication Schedule</h3>
                <p className="text-xs text-[var(--muted)]">Visual intensity index of incoming document transactions</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="interactive-el p-1.5 rounded hover:bg-[var(--hover)] border border-[var(--border)] cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-medium min-w-[80px] text-center">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button onClick={handleNextMonth} className="interactive-el p-1.5 rounded hover:bg-[var(--hover)] border border-[var(--border)] cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--muted)] font-medium uppercase tracking-wider">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="grid grid-cols-7 gap-2.5">
              {calendarCells.map((cell, idx) => {
                if (!cell) return <div key={`empty-full-${idx}`} className="h-16"></div>

                let intensityStyle = {}
                if (cell.invoiceCount === 1) {
                  intensityStyle = { backgroundColor: 'rgba(var(--accent-rgb), 0.15)', color: 'var(--foreground)' }
                } else if (cell.invoiceCount === 2) {
                  intensityStyle = { backgroundColor: 'rgba(var(--accent-rgb), 0.35)', color: 'var(--foreground)' }
                } else if (cell.invoiceCount > 2) {
                  intensityStyle = { backgroundColor: 'rgba(var(--accent-rgb), 0.7)', color: '#fff' }
                } else {
                  intensityStyle = { border: '1px solid var(--border)', color: 'var(--muted)' }
                }

                const isSelected = selectedDate === cell.dateString

                return (
                  <button
                    key={`full-${cell.dateString}`}
                    onClick={() => {
                      setSelectedDate(isSelected ? null : cell.dateString)
                      setActiveTab('overview')
                    }}
                    style={intensityStyle}
                    className={`interactive-el h-16 rounded-lg relative flex flex-col items-center justify-between p-2 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-[var(--accent)] border-transparent' : ''
                    }`}
                  >
                    <span className={`font-mono text-xs self-start ${cell.isToday ? 'text-[var(--accent)] font-bold' : ''}`}>
                      {cell.dayNumber}
                    </span>
                    {cell.invoiceCount > 0 && (
                      <span className="font-mono text-[10px] font-bold self-end bg-black/10 dark:bg-white/10 px-1 rounded">
                        {cell.invoiceCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* --- Tab: Ledger --- */}
        {activeTab === 'ledger' && (
          <section className="bg-[var(--card-bg)] border border-[var(--border)] p-6 rounded-lg space-y-6">
            <div>
              <h3 className="font-semibold text-sm">Chart of Accounts Mapping Matrix</h3>
              <p className="text-xs text-[var(--muted)]">Rule-based category classification list</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="border border-[var(--border)] p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-2">Expense Ledgers</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="font-mono text-[var(--muted)]">ASP-28</span><span>Softwares, Laptop Rental</span></div>
                  <div className="flex justify-between"><span className="font-mono text-[var(--muted)]">ASP-59</span><span>Travelling & Conveyance</span></div>
                  <div className="flex justify-between"><span className="font-mono text-[var(--muted)]">ASP-33</span><span>Professional & Legal Expense</span></div>
                  <div className="flex justify-between"><span className="font-mono text-[var(--muted)]">SISU-61</span><span>Rent for Office Space</span></div>
                </div>
              </div>
              <div className="border border-[var(--border)] p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-[var(--foreground)] border-b border-[var(--border)] pb-2 mb-2">Income Ledgers</h4>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="font-mono text-[var(--muted)]">ARC-02</span><span>Management Consulting Service</span></div>
                  <div className="flex justify-between"><span className="font-mono text-[var(--muted)]">SUBSCRIPTION</span><span>Subscription Income</span></div>
                </div>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  )
}
