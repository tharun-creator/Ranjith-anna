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
  Moon
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
    { id: 'vendors', label: 'Vendors & Senders', icon: Users },
    { id: 'categories', label: 'Categories', icon: FolderClosed },
    { id: 'recurring', label: 'Recurring', icon: RefreshCcw },
    { id: 'connected', label: 'Connected Accounts', icon: Mail },
  ]

  return (
    <div className={`min-h-screen bg-background flex text-foreground ${theme}`}>
      {/* Sidebar (dark navy #0B0F3D) */}
      <aside 
        style={{ backgroundColor: '#0B0F3D' }}
        className={`border-r border-white/10 text-white flex-col transition-all duration-200 hidden md:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="w-9 h-9 bg-[#D9FF4A] rounded-xl flex items-center justify-center mr-3 shadow-sm">
              <span className="text-[#0B0F3D] font-extrabold text-lg">F</span>
            </div>
            {!isCollapsed && <h1 className="font-extrabold text-lg tracking-tight text-white select-none">Finnex</h1>}
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
                className={`flex w-full items-center py-2.5 rounded-xl group font-semibold text-xs transition-all relative ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive 
                    ? 'bg-white/10 text-[#D9FF4A] font-bold border-l-2 border-[#D9FF4A]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
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
            className={`flex w-full items-center py-2.5 rounded-xl group font-semibold text-xs transition-all ${
              isCollapsed ? 'justify-center px-0' : 'px-4'
            } ${
              currentPage === 'settings' 
                ? 'bg-white/10 text-[#D9FF4A] font-bold border-l-2 border-[#D9FF4A]' 
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
            title="Settings"
          >
            <Settings className={`w-4 h-4 ${isCollapsed ? 'mr-0' : 'mr-3'}`} />
            {!isCollapsed && <span>Settings</span>}
          </button>
        </nav>
        
        {/* Connection status and user details */}
        {!isCollapsed && (
          <div className="p-4.5 mx-4 mb-4 bg-white/5 rounded-xl border border-white/5 space-y-2 text-[10px] text-white/70">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9FF4A] animate-pulse" />
              <span className="font-semibold text-white/90">Gmail connected</span>
            </div>
            <p className="opacity-80">synced 2 min ago</p>
          </div>
        )}

        <div className="p-4 border-t border-white/10 space-y-2">
          {/* Collapse Expert Toggle */}
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 text-[10px] text-white/60 font-semibold mb-2">
              <span>Show Jargon</span>
              <button 
                onClick={() => setExpertMode(!expertMode)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                {expertMode ? <ToggleRight className="w-5 h-5 text-[#D9FF4A]" /> : <ToggleLeft className="w-5 h-5" />}
              </button>
            </div>
          )}

          <button
            onClick={() => {
              clearToken()
              window.location.reload()
            }}
            className={`flex items-center w-full py-2.5 text-white/55 hover:bg-white/5 hover:text-white rounded-xl group font-semibold text-xs transition-all cursor-pointer ${
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
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-8 border-b border-border bg-card/65 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="max-w-md w-full relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3.5 py-2 border border-border rounded-xl leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D9FF4A]/40 focus:border-border sm:text-xs font-semibold transition-all"
                placeholder="Search invoices, vendors..."
              />
            </div>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6 gap-4">
            {/* Theme Toggle in Header */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted transition-all cursor-pointer border border-border"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            <button className="p-2 text-muted-foreground hover:text-foreground relative transition-all rounded-xl hover:bg-muted border border-border">
              <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-red-500 ring-2 ring-card" />
              <Bell className="h-4.5 w-4.5" />
            </button>
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground border border-border shadow-xs flex items-center justify-center font-bold text-xs">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
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
            style={{ backgroundColor: '#0B0F3D' }}
            className="relative flex flex-col w-64 max-w-xs h-full text-white border-r border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-20 flex items-center px-6 border-b border-white/10">
              <div className="w-8 h-8 bg-[#D9FF4A] rounded-xl flex items-center justify-center mr-3">
                <span className="text-[#0B0F3D] font-extrabold text-sm">F</span>
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
                    className={`flex w-full items-center px-4 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                      currentPage === item.id 
                        ? 'bg-white/10 text-[#D9FF4A] font-bold border-l-2 border-[#D9FF4A]' 
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
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
