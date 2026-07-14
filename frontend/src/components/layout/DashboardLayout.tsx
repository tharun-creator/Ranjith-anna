import { useState } from 'react'
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  ChevronLeft, 
  ChevronRight, 
  FolderClosed, 
  Users, 
  RefreshCcw, 
  Mail,
  ToggleLeft,
  ToggleRight,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'
import { clearToken } from '@/api/auth'
import { useInvoices } from '@/context/InvoiceContext'

export const DashboardLayout = ({ 
  children, 
  currentPage, 
  setCurrentPage 
}: { 
  children: React.ReactNode,
  currentPage: string,
  setCurrentPage: (page: string) => void
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { theme, setTheme, expertMode, setExpertMode } = useInvoices()

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'categories', label: 'Categories', icon: FolderClosed },
    { id: 'recurring', label: 'Recurring', icon: RefreshCcw },
    { id: 'connected', label: 'Integrations', icon: Mail },
  ]

  return (
    <div className={`min-h-screen bg-[var(--bg-page)] flex text-[var(--text-primary)]`}>
      {/* Fixed Sidebar (dark navy --bg-sidebar) */}
      <aside 
        style={{ backgroundColor: 'var(--bg-sidebar)' }}
        className={`border-r border-white/5 text-white flex flex-col transition-all duration-200 hidden md:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-[var(--accent-lime)] rounded-xl flex items-center justify-center mr-3 shadow-sm">
              <span className="text-[var(--accent-lime-text)] font-black text-lg">F</span>
            </div>
            {!isCollapsed && <h1 className="font-extrabold text-base tracking-tight text-white select-none">Finnex</h1>}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-1.5">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            return (
              <button 
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex w-full items-center py-2.5 rounded-full group font-semibold text-xs transition-all relative ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive 
                    ? 'bg-[var(--accent-lime)] text-[var(--accent-lime-text)] font-bold shadow-md' 
                    : 'text-[var(--text-on-dark-secondary)] hover:bg-white/5 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
          
          <button 
            onClick={() => setCurrentPage('settings')}
            className={`flex w-full items-center py-2.5 rounded-full group font-semibold text-xs transition-all ${
              isCollapsed ? 'justify-center px-0' : 'px-4'
            } ${
              currentPage === 'settings' 
                ? 'bg-[var(--accent-lime)] text-[var(--accent-lime-text)] font-bold shadow-md' 
                : 'text-[var(--text-on-dark-secondary)] hover:bg-white/5 hover:text-white'
            }`}
            title="Settings"
          >
            <Settings className={`w-4 h-4 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
            {!isCollapsed && <span>Settings</span>}
          </button>
        </nav>
        
        {/* Bottom promo / CTA card in sidebar */}
        {!isCollapsed && (
          <div className="p-4 mx-4 mb-4 bg-white/5 rounded-2xl border border-white/5 text-xs text-white">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-lime)]" />
              <span className="font-bold">Sync Invoices</span>
            </div>
            <p className="text-[10px] text-[var(--text-on-dark-secondary)] leading-relaxed mb-3">
              Connect Gmail to automate daily ledger tracking.
            </p>
            <button 
              onClick={() => setCurrentPage('connected')}
              className="w-full py-1.5 bg-[var(--accent-lime)] text-[var(--accent-lime-text)] font-extrabold text-[10px] rounded-full text-center hover:opacity-90 shadow-sm cursor-pointer"
            >
              Connect Gmail
            </button>
          </div>
        )}

        <div className="p-4 border-t border-white/5 space-y-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 text-[10px] text-[var(--text-on-dark-secondary)] font-semibold mb-2">
              <span>Show Jargon</span>
              <button 
                onClick={() => setExpertMode(!expertMode)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                {expertMode ? <ToggleRight className="w-5 h-5 text-[var(--accent-lime)]" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              clearToken()
              window.location.reload()
            }}
            className={`flex items-center w-full py-2.5 text-[var(--text-on-dark-secondary)] hover:bg-white/5 hover:text-white rounded-full group font-semibold text-xs transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-0' : 'px-4'
            }`}
            title="Log out"
          >
            <LogOut className={`w-4 h-4 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-8 bg-white sticky top-0 z-30 border-b border-[var(--border)] shadow-sm">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h2 className="text-sm font-extrabold text-[var(--text-primary)]">Welcome back, John Doe</h2>
              <p className="text-[10px] text-[var(--text-secondary)] font-medium">Workspace: Finnex Corp</p>
            </div>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6 gap-4">
            <div className="max-w-xs w-56 relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-1.5 border border-[var(--border)] rounded-[var(--radius-pill)] leading-5 bg-[var(--bg-page)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-lime)] sm:text-xs font-semibold"
                placeholder="Search invoices, senders..."
              />
            </div>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-page)] rounded-full transition-all cursor-pointer border border-[var(--border)]"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <button className="p-2 text-[var(--text-primary)] hover:bg-[var(--bg-page)] relative transition-all rounded-full border border-[var(--border)]">
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-white" />
              <Bell className="h-4 w-4" />
            </button>
            
            <div className="h-9 w-9 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs border border-[var(--border)]">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[var(--bg-page)]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer (Hidden on Desktop) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <aside 
            style={{ backgroundColor: 'var(--bg-sidebar)' }}
            className="relative flex flex-col w-64 max-w-xs h-full text-white border-r border-white/5"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-20 flex items-center px-6 border-b border-white/5">
              <div className="w-8 h-8 bg-[var(--accent-lime)] rounded-xl flex items-center justify-center mr-3">
                <span className="text-[var(--accent-lime-text)] font-extrabold text-sm">F</span>
              </div>
              <h1 className="font-extrabold text-base tracking-tight text-white">Finnex</h1>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id)
                      setMobileOpen(false)
                    }}
                    className={`flex w-full items-center px-4 py-2.5 rounded-full font-semibold text-xs transition-all ${
                      currentPage === item.id 
                        ? 'bg-[var(--accent-lime)] text-[var(--accent-lime-text)] font-bold shadow-md' 
                        : 'text-[var(--text-on-dark-secondary)] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}
