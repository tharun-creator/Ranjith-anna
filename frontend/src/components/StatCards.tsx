import { TrendingUp, TrendingDown, FileText, IndianRupee, AlertTriangle, ShieldAlert } from 'lucide-react'

interface StatCardsProps {
  stats: {
    totalCount: number
    totalAmount: number
    pendingReview: number
    overdueCount: number
  }
  formatINR: (value: number) => string
}

export const StatCards = ({ stats, formatINR }: StatCardsProps) => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Hero Card: Total processed value ("My Balance" style) */}
      <div className="bg-card text-card-foreground border border-border/60 p-8 rounded-[24px] shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-200 hover:shadow-md min-h-[180px]">
        <div>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Processed Value</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="font-mono text-3xl font-extrabold tracking-tight text-foreground select-all leading-none">
              {formatINR(stats.totalAmount)}
            </h2>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.3%</span>
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">vs last month</span>
        </div>
        {/* Subtle decorative background gradient accent */}
        <div className="absolute right-0 bottom-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Card 2: Total Invoices */}
      <div className="bg-card text-card-foreground border border-border/60 p-8 rounded-[24px] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md min-h-[180px]">
        <div>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Total Invoices</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="font-mono text-4xl font-extrabold tracking-tight text-foreground leading-none">
              {stats.totalCount}
            </h2>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1 bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12%</span>
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">this period</span>
        </div>
      </div>

      {/* Card 3: Needs Review */}
      <div className="bg-card text-card-foreground border border-border/60 p-8 rounded-[24px] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md min-h-[180px]">
        <div>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Needs Review</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="font-mono text-4xl font-extrabold tracking-tight text-foreground leading-none">
              {stats.pendingReview}
            </h2>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="flex items-center gap-1 bg-amber-550/10 text-amber-600 dark:text-amber-500 px-2.5 py-1 rounded-full text-[11px] font-bold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-24%</span>
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">confidence &lt; 80%</span>
        </div>
      </div>

      {/* Card 4: Overdue Invoices */}
      <div className="bg-card text-card-foreground border border-border/60 p-8 rounded-[24px] shadow-sm flex flex-col justify-between transition-all duration-200 hover:shadow-md min-h-[180px]">
        <div>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Overdue Invoices</span>
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h2 className="font-mono text-4xl font-extrabold tracking-tight text-red-650 dark:text-red-400 leading-none">
              {stats.overdueCount}
            </h2>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="bg-red-500/10 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full text-[11px] font-bold">
            At Risk
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">immediate action</span>
        </div>
      </div>
    </section>
  )
}
