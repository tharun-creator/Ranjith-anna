import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarCell {
  dateString: string
  dayNumber: number
  invoiceCount: number
  isToday: boolean
}

interface CalendarHeatmapProps {
  currentMonth: Date
  selectedDate: string | null
  calendarCells: (CalendarCell | null)[]
  handlePrevMonth: () => void
  handleNextMonth: () => void
  setSelectedDate: (date: string | null) => void
}

export const CalendarHeatmap = ({
  currentMonth,
  selectedDate,
  calendarCells,
  handlePrevMonth,
  handleNextMonth,
  setSelectedDate,
}: CalendarHeatmapProps) => {
  return (
    <div className="bg-card text-card-foreground border border-border/60 p-6 rounded-[24px] shadow-sm space-y-4 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Invoice Tracking Calendar</h3>
          <p className="text-xs text-muted-foreground">Activity-based mapping & day selection filter</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevMonth}
            className="p-2 rounded-xl hover:bg-muted border border-border/60 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="text-xs font-mono font-bold min-w-[100px] text-center text-foreground">
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={handleNextMonth}
            className="p-2 rounded-xl hover:bg-muted border border-border/60 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Grid Headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {calendarCells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} className="h-10"></div>
          
          // Re-color intensity scale using the teal -> lime gradient
          let intensityStyle = {}
          if (cell.invoiceCount === 1) {
            // Low intensity: soft pale forest green
            intensityStyle = { backgroundColor: 'rgba(27, 67, 50, 0.12)', color: 'var(--foreground)' }
          } else if (cell.invoiceCount === 2) {
            // Medium intensity: forest green/teal
            intensityStyle = { backgroundColor: 'rgba(27, 67, 50, 0.45)', color: '#ffffff' }
          } else if (cell.invoiceCount > 2) {
            // High intensity: lime/chartreuse green accent
            intensityStyle = { backgroundColor: '#B8E020', color: '#1B4332', fontWeight: 'bold' }
          } else {
            // Quiet day: warm paper background with subtle border
            intensityStyle = { border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
          }

          const isSelected = selectedDate === cell.dateString

          return (
            <button
              key={cell.dateString}
              onClick={() => setSelectedDate(isSelected ? null : cell.dateString)}
              style={intensityStyle}
              className={`h-10 rounded-xl relative flex flex-col items-center justify-center transition-all duration-150 cursor-pointer ${
                isSelected ? 'ring-2 ring-primary border-transparent scale-105 shadow-sm' : 'hover:scale-102'
              }`}
            >
              <span className={`font-mono text-xs ${cell.isToday ? 'underline decoration-2 underline-offset-2' : ''}`}>
                {cell.dayNumber}
              </span>
              {cell.invoiceCount > 0 && (
                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${cell.invoiceCount > 2 ? 'bg-primary' : 'bg-secondary'}`} />
              )}
            </button>
          )
        })}
      </div>

      {/* Legend & Action Panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-[11px] text-muted-foreground border-t border-border/55">
        <div className="flex items-center gap-1.5 font-medium">
          <span>Fewer</span>
          <span className="w-3.5 h-3.5 rounded-md border border-border/70" />
          <span className="w-3.5 h-3.5 rounded-md bg-[rgba(27,67,50,0.12)]" />
          <span className="w-3.5 h-3.5 rounded-md bg-[rgba(27,67,50,0.45)]" />
          <span className="w-3.5 h-3.5 rounded-md bg-[#B8E020]" />
          <span>More</span>
        </div>

        {selectedDate && (
          <button 
            onClick={() => setSelectedDate(null)}
            className="text-primary hover:text-primary/80 font-mono font-bold hover:underline cursor-pointer"
          >
            Clear Date Filter [ {selectedDate} ]
          </button>
        )}
      </div>
    </div>
  )
}
