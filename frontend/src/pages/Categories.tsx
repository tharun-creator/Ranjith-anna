import { useState, useMemo } from 'react'
import { useInvoices, type Invoice } from '@/context/InvoiceContext'
import { X, Edit, Folder } from 'lucide-react'

export const Categories = () => {
  const { invoices, modifyInvoice } = useInvoices()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingCategoryCode, setEditingCategoryCode] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')

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

  // Calculate category aggregates
  const categoryStats = useMemo(() => {
    const stats: Record<string, {
      code: string
      name: string
      total: number
      count: number
      invoicesList: Invoice[]
    }> = {}

    invoices.forEach(inv => {
      const code = inv.ledger_code || 'UNCATEGORIZED'
      const name = inv.ledger_name || 'Uncategorized'
      const amt = getAmountINR(inv)

      if (!stats[code]) {
        stats[code] = {
          code,
          name,
          total: 0,
          count: 0,
          invoicesList: []
        }
      }

      stats[code].total += amt
      stats[code].count += 1
      stats[code].invoicesList.push(inv)
    })

    const sorted = Object.values(stats).sort((a, b) => b.total - a.total)
    const grandTotal = sorted.reduce((sum, c) => sum + c.total, 0)

    return {
      items: sorted,
      grandTotal
    }
  }, [invoices])

  const handleSaveRename = (code: string) => {
    if (!newCategoryName.trim()) return
    
    // Modify all invoices with this ledger code
    invoices.forEach(inv => {
      if (inv.ledger_code === code) {
        modifyInvoice(inv.id, {
          ledger_name: newCategoryName
        })
      }
    })

    setEditingCategoryCode(null)
    setNewCategoryName('')
  }

  const selectedCategoryDetails = useMemo(() => {
    if (!selectedCategory) return null
    return categoryStats.items.find(c => c.code === selectedCategory)
  }, [selectedCategory, categoryStats])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Categories</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Expense classification & ledger mapping</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Horizontal Bar Chart (Column 1 & 2) */}
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <h3 className="font-bold text-sm text-foreground">Spend by Category</h3>
          <div className="space-y-4">
            {categoryStats.items.map(cat => {
              const percentage = categoryStats.grandTotal > 0 
                ? (cat.total / categoryStats.grandTotal) * 100 
                : 0
              return (
                <div 
                  key={cat.code}
                  onClick={() => setSelectedCategory(cat.code)}
                  className="space-y-1 group cursor-pointer"
                >
                  <div className="flex justify-between text-xs font-bold text-foreground">
                    <span className="flex items-center gap-2 group-hover:text-accent">
                      <Folder className="w-3.5 h-3.5 text-muted-foreground" />
                      {cat.name} <span className="text-[10px] text-muted-foreground font-mono">({cat.code})</span>
                    </span>
                    <span className="font-mono">{formatINR(cat.total)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-accent h-full rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Category Edit & Management (Column 3) */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground">Quick Rules & Edit</h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {categoryStats.items.map(cat => (
              <div 
                key={cat.code}
                className="p-3 border border-border bg-card rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex-1 min-w-0 mr-2">
                  {editingCategoryCode === cat.code ? (
                    <div className="flex items-center gap-1.5">
                      <input 
                        type="text" 
                        defaultValue={cat.name}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="w-full px-2 py-1 border border-border rounded-lg bg-background text-foreground text-xs font-semibold focus:outline-none"
                      />
                      <button 
                        onClick={() => handleSaveRename(cat.code)}
                        className="px-2 py-1 bg-primary text-primary-foreground rounded-lg font-bold text-[10px] cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="font-bold text-foreground truncate">{cat.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono font-semibold">{cat.code}</div>
                    </>
                  )}
                </div>
                {editingCategoryCode !== cat.code && (
                  <button 
                    onClick={() => {
                      setEditingCategoryCode(cat.code)
                      setNewCategoryName(cat.name)
                    }}
                    className="p-1.5 border border-border rounded-lg text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Slide-open category details */}
      {selectedCategoryDetails && (
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">
                Invoices mapped to: {selectedCategoryDetails.name}
              </h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Code {selectedCategoryDetails.code} · {selectedCategoryDetails.count} invoices
              </p>
            </div>
            <button 
              onClick={() => setSelectedCategory(null)}
              className="p-1 border border-border rounded-lg text-muted-foreground hover:text-foreground cursor-pointer hover:bg-muted"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                  <th className="p-4">Invoice ID</th>
                  <th className="p-4">Vendor</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-medium">
                {selectedCategoryDetails.invoicesList.map(inv => (
                  <tr key={inv.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-muted-foreground">{inv.id}</td>
                    <td className="p-4 font-bold text-foreground">{inv.vendor_name}</td>
                    <td className="p-4 font-mono">{inv.invoice_date}</td>
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
      )}
    </div>
  )
}
