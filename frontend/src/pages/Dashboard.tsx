import { useState, useMemo } from 'react'
import { AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Calendar, Wallet, ChevronRight } from 'lucide-react'
import { 
  ComposedChart, 
  Bar, 
  Line, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  BarChart
} from 'recharts'
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
  { id: 'INV-2026-004', vendor: 'Razorpay Software', date: '2026-07-06', ledgerCode: 'ASP-26', ledgerName: 'Vendors, Freelancers', confidence: 72, status: 'pending', amount: 3500.00, currency: 'INR' },
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

// Money Flow Monthly Data (Annual aggregates)
const MONEY_FLOW_DATA = [
  { name: 'Jan', Income: 65000, Expense: 22000 },
  { name: 'Feb', Income: 82000, Expense: 28000 },
  { name: 'Mar', Income: 58000, Expense: 42000 },
  { name: 'Apr', Income: 75000, Expense: 31000 },
  { name: 'May', Income: 42000, Expense: 15000 },
  { name: 'Jun', Income: 92000, Expense: 48000 },
  { name: 'Jul', Income: 101333, Expense: 26830 },
  { name: 'Aug', Income: 120000, Expense: 62000 },
  { name: 'Sep', Income: 95000, Expense: 55000 },
  { name: 'Oct', Income: 110000, Expense: 59000 },
  { name: 'Nov', Income: 125000, Expense: 68000 },
  { name: 'Dec', Income: 98000, Expense: 45000 },
]

interface DashboardProps {
  onViewAllInvoices?: () => void
}

export const Dashboard = ({ onViewAllInvoices }: DashboardProps) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 6, 12)) // July 2026 for mock data

  // Helper formatting functions
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const convertToINR = (invoice: MockInvoice): number => {
    if (invoice.currency === 'USD') {
      return invoice.amount * USD_TO_INR
    }
    return invoice.amount
  }

  // --- Filter Logic for Table ---
  const filteredInvoices = useMemo(() => {
    if (!selectedDate) return MOCK_INVOICES
    return MOCK_INVOICES.filter(inv => inv.date === selectedDate)
  }, [selectedDate])

  // --- Chart Processing (Daily Volume) ---
  const dailyChartData = useMemo(() => {
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
    <div className="space-y-6">
      
      {/* Neon Lime Full-Width Attention Banner */}
      <section className="attention-banner">
        <span className="flex items-center gap-2 font-black">
          <AlertTriangle className="w-4.5 h-4.5" />
          Attention Required: 3 Invoices Pending Manual Override Approval
        </span>
        <button 
          onClick={onViewAllInvoices}
          className="bg-black hover:bg-black/90 text-white rounded-full text-[10px] font-black uppercase px-4 py-1.5 transition-all select-none cursor-pointer"
        >
          Review Now
        </button>
      </section>

      {/* --- TOP METRICS GRID (My Balance, My Income, Total Expense cards) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: My Balance - Flat White Card */}
        <div className="flat-card flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="stat-label flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" /> My Balance
              </span>
              <h2 className="stat-value mt-3">
                {formatINR(74503)}
              </h2>
            </div>
            <span className="text-[9px] border border-black px-3 py-1 rounded-full font-black uppercase text-[#0A0A0A] bg-transparent">
              All time
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="flex items-center gap-1 bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-1.5 rounded-full text-[10px] font-bold text-[#666666]">
              <TrendingUp className="w-3 h-3 text-black" />
              <span>Last period +₹14,503</span>
            </span>
            <span className="flex items-center gap-1 bg-[#FAFAFA] border border-[#E5E5E5] px-3 py-1.5 rounded-full text-[10px] font-bold text-[#666666]">
              <span>Bonus +₹700</span>
            </span>
          </div>
        </div>

        {/* Card 2: My Income - Flat White Card */}
        <div className="flat-card flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="stat-label flex items-center gap-1.5">
                <ArrowUpRight className="w-4 h-4 text-black" /> My Income
              </span>
              <h2 className="stat-value mt-3">
                {formatINR(101333)}
              </h2>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-[#666666] font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" /> July 2026
            </div>
          </div>

          <div className="space-y-2 mt-4 text-[11px]">
            <div className="flex justify-between items-center font-bold">
              <span className="text-[#666666]">Salary</span>
              <span className="text-[#0A0A0A]">₹28.3K</span>
            </div>
            <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
              <div className="bg-black h-full rounded-full" style={{ width: '28%' }} />
            </div>

            <div className="flex justify-between items-center font-bold">
              <span className="text-[#666666]">Business</span>
              <span className="text-[#0A0A0A]">₹38.5K</span>
            </div>
            <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#D9FF4A] h-full rounded-full" style={{ width: '38%' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Total Expense Tracker - Flat White Card */}
        <div className="flat-card flex flex-col justify-between min-h-[220px]">
          <div className="flex justify-between items-start">
            <div>
              <span className="stat-label flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-black" /> Total Expense
              </span>
              <h2 className="stat-value mt-3">
                {formatINR(26830)}
              </h2>
            </div>
            <span className="bg-[#D9FF4A] border border-black text-[#0A0A0A] px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
              Goal 75%
            </span>
          </div>

          {/* Progress bar with 75% goal */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-[11px] font-black text-black">
              <span>Limit utilization</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-[#E5E5E5] h-3.5 rounded-full overflow-hidden p-0.5 border border-black">
              <div className="bg-black h-full rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* --- SIGNATURE MOTIF ACTION CARDS (Pure black card with circular lime arrow button in corner) --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Signature CTA Card 1 */}
        <div className="bg-[#0A0A0A] text-white p-8 rounded-[16px] flex justify-between items-center relative overflow-hidden transition-all hover:translate-y-[-2px] duration-150">
          <div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">Financial Intelligence Report</h4>
            <p className="text-xs text-white/60 mt-1">Review ledger mapping classification precision rates</p>
          </div>
          <button 
            onClick={onViewAllInvoices}
            className="w-12 h-12 bg-[#D9FF4A] text-[#0A0A0A] rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md select-none flex-shrink-0"
          >
            <ArrowUpRight className="w-6 h-6" />
          </button>
        </div>

        {/* Signature CTA Card 2 */}
        <div className="bg-[#0A0A0A] text-white p-8 rounded-[16px] flex justify-between items-center relative overflow-hidden transition-all hover:translate-y-[-2px] duration-150">
          <div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight">Gmail Connection Sync</h4>
            <p className="text-xs text-white/60 mt-1">Configure Gmail MCP server mapping filters</p>
          </div>
          <button 
            onClick={onViewAllInvoices}
            className="w-12 h-12 bg-[#D9FF4A] text-[#0A0A0A] rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer shadow-md select-none flex-shrink-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* --- MAIN GRAPHS GRID (Money Flow & Remaining Monthly Tracker) --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Money Flow Graph (Deep navy #0B0F3D & Electric lime #D9FF4A flat colors) */}
        <div className="lg:col-span-2 flat-card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-black text-base text-[#0A0A0A] uppercase select-none">Money Flow</h3>
              <p className="text-xs text-[#666666]">Annual income & expense ledger aggregates</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] uppercase font-black tracking-wider">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#0B0F3D]"></span>
                <span className="text-[#0A0A0A]">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#D9FF4A] border border-black"></span>
                <span className="text-[#0A0A0A]">Expense</span>
              </div>
            </div>
          </div>

          <div className="h-76 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={MONEY_FLOW_DATA} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#666666', fontSize: 10, fontWeight: 'bold' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `₹${val/1000}k`}
                  tick={{ fill: '#666666', fontSize: 10, fontWeight: 'bold' }}
                />
                <Tooltip 
                  cursor={{ fill: '#E5E5E5', opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#0A0A0A] text-white p-3.5 rounded-xl border border-black font-sans text-xs min-w-[130px]">
                          <p className="font-black text-[10px] text-[#D9FF4A] uppercase tracking-widest border-b border-white/10 pb-1">{payload[0].payload.name}</p>
                          <div className="space-y-1.5 mt-1.5 font-semibold">
                            <div className="flex justify-between gap-4">
                              <span className="opacity-75">Income:</span>
                              <span className="font-bold text-white">{formatINR(payload[0].value as number)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="opacity-75">Expense:</span>
                              <span className="font-bold text-[#D9FF4A]">{formatINR(payload[1].value as number)}</span>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                {/* Thick bars with rounded tops in flat colors (Deep Navy / Lime) */}
                <Bar 
                  dataKey="Income" 
                  fill="#0B0F3D" 
                  radius={[8, 8, 0, 0]} 
                  barSize={18}
                />
                <Bar 
                  dataKey="Expense" 
                  fill="#D9FF4A" 
                  radius={[8, 8, 0, 0]} 
                  barSize={18}
                />
                {/* Clean trend line */}
                <Line 
                  type="monotone" 
                  dataKey="Income" 
                  stroke="#0B0F3D" 
                  strokeWidth={2.5} 
                  strokeDasharray="4 4" 
                  dot={{ r: 3, fill: '#D9FF4A', stroke: '#0B0F3D', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Tracker details: Remaining Monthly & budget gauge */}
        <div className="flat-card flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="font-black text-base text-[#0A0A0A] uppercase">Remaining</h3>
            <p className="text-xs text-[#666666]">Calculated safe spend budget limit</p>
          </div>

          {/* SVG circular progress ring (High-Contrast Navy and Lime) */}
          <div className="relative flex items-center justify-center my-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle 
                cx="64" 
                cy="64" 
                r="48" 
                stroke="#0B0F3D"
                strokeWidth="10" 
                fill="transparent" 
              />
              <circle 
                cx="64" 
                cy="64" 
                r="48" 
                stroke="#D9FF4A" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={301.6} 
                strokeDashoffset={301.6 - (301.6 * 69) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black tracking-tight text-[#0A0A0A]">69%</span>
              <p className="text-[9px] text-[#666666] font-bold uppercase tracking-wider">Remaining</p>
            </div>
          </div>

          {/* Budget setting categories (thick sliders) */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0B0F3D]"></span> Needs
                </span>
                <span>89%</span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                <div className="bg-[#0B0F3D] h-full rounded-full" style={{ width: '89%' }} />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D9FF4A] border border-black"></span> Food
                </span>
                <span>78%</span>
              </div>
              <div className="w-full bg-[#E5E5E5] h-2 rounded-full overflow-hidden">
                <div className="bg-black h-full rounded-full" style={{ width: '78%' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Invoice Value Volume (Thicker columns) */}
      <section className="flat-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-black text-base text-[#0A0A0A] uppercase">Daily Activity</h3>
            <p className="text-xs text-[#666666]">Daily processed transaction volume (July 2026)</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-[#666666]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#0B0F3D] rounded-sm"></span>
              <span className="text-[#0A0A0A]">Processed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-[#D9FF4A] rounded-sm border border-black"></span>
              <span className="text-[#0A0A0A]">Pending</span>
            </div>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#E5E5E5" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="day" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: '#666666', fontSize: 10, fontWeight: 'bold', fontFamily: 'ui-monospace, monospace' }}
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `₹${val/1000}k`}
                tick={{ fill: '#666666', fontSize: 10, fontWeight: 'bold', fontFamily: 'ui-monospace, monospace' }}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#0A0A0A] text-white p-4 rounded-xl border border-black font-mono text-xs space-y-1.5">
                        <p className="font-bold text-[10px] text-[#D9FF4A] uppercase tracking-wider">{payload[0].payload.day}</p>
                        <p className="flex justify-between gap-6">
                          <span className="opacity-70">Processed:</span>
                          <span className="font-bold">{formatINR(payload[0].value as number)}</span>
                        </p>
                        <p className="flex justify-between gap-6">
                          <span className="opacity-70">Pending:</span>
                          <span className="font-bold text-[#D9FF4A]">{formatINR(payload[1].value as number)}</span>
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar 
                dataKey="processed" 
                fill="#0B0F3D" 
                radius={[3, 3, 0, 0]} 
                barSize={8}
              />
              <Bar 
                dataKey="pendingOverdue" 
                fill="#D9FF4A" 
                radius={[3, 3, 0, 0]} 
                barSize={8}
              />
            </BarChart>
          </ResponsiveContainer>
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
        <div className="flat-card flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-black text-base text-[#0A0A0A] uppercase">Needs Attention</h3>
            <p className="text-xs text-[#666666]">Overdue and pending ledger approval items</p>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 flex-1 mt-3">
            {MOCK_INVOICES.filter(inv => inv.status === 'overdue' || inv.status === 'pending').map(inv => (
              <div 
                key={inv.id}
                className="border border-[#E5E5E5] bg-[#FAFAFA] p-3.5 rounded-xl flex items-center justify-between text-xs transition-all hover:border-black"
              >
                <div className="space-y-1">
                  <div className="font-bold text-[#0A0A0A]">{inv.vendor}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#666666] font-semibold">
                    <span className="font-mono">{inv.id}</span>
                    <span>•</span>
                    <span className="font-mono">{inv.date}</span>
                  </div>
                </div>
                <div className="text-right space-y-1 flex-shrink-0">
                  <div className="font-mono font-bold text-[#0A0A0A]">{formatINR(convertToINR(inv))}</div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    inv.status === 'overdue' 
                      ? 'bg-red-500/15 text-red-650'
                      : 'bg-amber-500/15 text-amber-600'
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
      <section className="flat-card overflow-hidden !p-0">
        <div className="p-8 border-b border-[#E5E5E5] flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-[#0A0A0A] uppercase">
              {selectedDate ? `Invoices Received on ${selectedDate}` : 'Recent Mapped Communications'}
            </h3>
            <p className="text-xs text-[#666666]">Extracted metadata and structured transactional mapping</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA] text-[10px] text-[#666666] uppercase tracking-wider font-black">
                <th className="p-5">Invoice ID</th>
                <th className="p-5">Vendor</th>
                <th className="p-5">Date</th>
                <th className="p-5">Ledger Mappings</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] text-xs font-semibold">
              {filteredInvoices.slice(0, 10).map(inv => (
                <tr key={inv.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-5 font-mono text-[#666666]">{inv.id}</td>
                  <td className="p-5 font-black text-[#0A0A0A]">{inv.vendor}</td>
                  <td className="p-5 font-mono">{inv.date}</td>
                  <td className="p-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-mono font-bold text-[#0A0A0A]">{inv.ledgerCode}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#666666]">
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
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-800' :
                      inv.status === 'pending' ? 'bg-amber-500/10 text-amber-800' :
                      'bg-red-500/10 text-red-800'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className={`p-5 font-mono font-black text-right ${
                    inv.status === 'paid' ? 'text-emerald-700' :
                    inv.status === 'pending' ? 'text-amber-600' :
                    'text-red-500'
                  }`}>{formatINR(convertToINR(inv))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
