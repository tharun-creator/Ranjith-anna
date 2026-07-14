import { useMemo } from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { type Invoice, formatDateOnly } from '@/components/InvoiceDetailModal'

const columnHelper = createColumnHelper<Invoice>()

interface InvoiceTableProps {
  data: Invoice[]
  isLoading: boolean
  onInvoiceClick: (invoice: Invoice) => void
}

export const InvoiceTable = ({ data, isLoading, onInvoiceClick }: InvoiceTableProps) => {
  const columns = useMemo(() => [
    columnHelper.accessor('invoice_number', {
      header: 'Invoice',
      cell: info => {
        const invoiceNumber = info.getValue()
        const row = info.row.original
        const invDate = formatDateOnly(row.invoice_date)
        const dueDate = formatDateOnly(row.due_date)
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm tracking-tight">{invoiceNumber || 'No Number'}</span>
              {row.is_duplicate && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-650">
                  Duplicate
                </span>
              )}
            </div>
            {(invDate || dueDate) && (
              <span className="text-[11px] text-muted-foreground font-semibold">
                {invDate && <span>Date: {invDate}</span>}
                {invDate && dueDate && <span className="mx-1.5">•</span>}
                {dueDate && <span>Due: {dueDate}</span>}
              </span>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('vendor_name', {
      header: 'Vendor',
      cell: info => {
        const vendorName = info.getValue()
        const row = info.row.original
        const displayName = row.sender 
          ? row.sender.split('<')[0].replace(/"/g, '').trim() 
          : null
        
        return (
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-foreground text-sm">{vendorName || 'Unknown Vendor'}</span>
            {(displayName || row.notes) && (
              <span className="text-[11px] text-muted-foreground truncate max-w-[240px] font-medium">
                {displayName && <span>From: {displayName}</span>}
                {displayName && row.notes && <span className="mx-1">•</span>}
                {row.notes && <span className="italic">{row.notes}</span>}
              </span>
            )}
          </div>
        )
      },
    }),
    columnHelper.accessor('transaction_type', {
      header: 'Tx Type',
      cell: info => {
        const val = info.getValue() || 'EXPENSE'
        const colors = val === 'REVENUE' 
          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' 
          : 'bg-orange-500/10 text-orange-700 dark:text-orange-400'
        return (
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${colors}`}>
            {val}
          </span>
        )
      }
    }),
    columnHelper.accessor('document_type', {
      header: 'Doc Type',
      cell: info => {
        const val = info.getValue() || 'other'
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold capitalize bg-muted text-muted-foreground border border-border/40">
            {val.replace(/_/g, ' ')}
          </span>
        )
      }
    }),
    columnHelper.accessor('ledger_code', {
      header: 'Ledger',
      cell: info => {
        const code = info.getValue()
        const name = info.row.original.ledger_name
        if (!code) return <span className="text-muted-foreground font-semibold">—</span>
        return (
          <div className="flex flex-col gap-0.5 max-w-[150px]">
            <span className="font-mono font-bold text-foreground text-xs">{code}</span>
            {name && <span className="text-[10px] text-muted-foreground truncate font-medium" title={name}>{name}</span>}
          </div>
        )
      }
    }),
    columnHelper.accessor('financial_event', {
      header: 'Event / Dir',
      cell: info => {
        const event = info.getValue() || 'RAISED'
        const direction = info.row.original.email_direction || 'MAIL_RECEIVED'
        const dirColors = direction === 'MAIL_SENT' 
          ? 'text-blue-600 bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-full text-[10px]' 
          : 'text-purple-600 bg-purple-500/10 dark:text-purple-400 px-2 py-0.5 rounded-full text-[10px]'
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className="font-bold text-foreground text-xs">{event}</span>
            <span className={`font-bold uppercase tracking-wider ${dirColors}`}>
              {direction === 'MAIL_SENT' ? 'Sent' : 'Received'}
            </span>
          </div>
        )
      }
    }),
    columnHelper.accessor('received_at', {
      header: 'Received Date',
      cell: info => {
        const val = info.getValue()
        if (!val) return <span className="text-muted-foreground font-semibold">—</span>
        try {
          return (
            <span className="text-foreground text-xs font-semibold">
              {new Date(val).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )
        } catch (e) {
          return <span className="text-muted-foreground font-semibold">—</span>
        }
      },
    }),
    columnHelper.accessor('total_amount', {
      header: 'Amount',
      cell: info => {
        const val = info.getValue() || 0
        const row = info.row.original
        // Right-align and color-code the amount column based on status
        const isPaid = row.status?.toLowerCase() === 'paid'
        const isPending = row.status?.toLowerCase() === 'pending'
        const color = isPaid ? 'text-emerald-700 dark:text-emerald-400'
          : isPending ? 'text-amber-600 dark:text-amber-400'
          : 'text-red-650 dark:text-red-400'

        return (
          <div className={`text-right font-mono font-bold tracking-tight text-sm ${color}`}>
            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(val)}
          </div>
        )
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue() || 'pending'
        const isPaid = status.toLowerCase() === 'paid'
        const isPending = status.toLowerCase() === 'pending'
        
        const colors = isPaid ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-400' 
          : isPending ? 'bg-amber-500/10 text-amber-800 dark:text-amber-400'
          : 'bg-red-500/10 text-red-800 dark:text-red-400'
        
        return (
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors}`}>
            {status}
          </span>
        )
      },
    }),
    columnHelper.accessor('confidence_score', {
      header: 'AI Confidence',
      cell: info => (
        <div className="flex items-center gap-2">
          <div className="w-full bg-muted rounded-full h-1.5 max-w-[60px]">
            <div
              className="bg-primary h-1.5 rounded-full"
              style={{ width: `${info.getValue() || 0}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-bold">{info.getValue() || 0}%</span>
        </div>
      ),
    }),
  ], [])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      sorting: [{ id: 'received_at', desc: true }],
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/80">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-6 py-4 cursor-pointer hover:text-foreground transition-colors text-xs uppercase tracking-wider" 
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5 font-bold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-55" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="animate-pulse">
                  {columns.map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-5">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-25" />
                  <p className="text-lg font-bold">No invoices found</p>
                  <p className="text-sm font-medium">Try adjusting or clearing your filters.</p>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  onClick={() => onInvoiceClick(row.original)}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4.5 whitespace-nowrap text-foreground align-middle font-medium">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="p-5 border-t border-border flex items-center justify-between text-sm text-muted-foreground font-semibold">
        <div>
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
          {table.getFilteredRowModel().rows.length} results
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-xl hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-border/80 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-xl hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-border/80 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
