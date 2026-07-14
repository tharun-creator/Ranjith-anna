import { LayoutDashboard, FileText, Settings, LogOut, Bell, Search, Menu } from 'lucide-react'
import { clearToken } from '@/api/auth'

export const DashboardLayout = ({ 
  children, 
  currentPage, 
  setCurrentPage 
}: { 
  children: React.ReactNode,
  currentPage: 'dashboard' | 'invoices',
  setCurrentPage: (page: 'dashboard' | 'invoices') => void
}) => {
  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-20 flex items-center px-8 border-b border-border/80">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center mr-3 shadow-sm">
            <span className="text-primary-foreground font-extrabold text-lg">F</span>
          </div>
          <h1 className="font-extrabold text-xl tracking-tight text-foreground">Finnex</h1>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-1.5">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`flex w-full items-center px-4 py-3 rounded-xl group font-bold text-sm transition-all ${currentPage === 'dashboard' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('invoices')}
            className={`flex w-full items-center px-4 py-3 rounded-xl group font-bold text-sm transition-all ${currentPage === 'invoices' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            <FileText className="w-5 h-5 mr-3" />
            Invoices
          </button>
          <a href="#" className="flex items-center px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl group font-bold text-sm transition-all">
            <Settings className="w-5 h-5 mr-3" />
            Settings
          </a>
        </nav>
        
        <div className="p-5 border-t border-border/80">
          <button
            onClick={() => {
              clearToken()
              window.location.reload()
            }}
            className="flex items-center w-full px-4 py-3 text-muted-foreground hover:bg-muted hover:text-foreground rounded-xl group font-bold text-sm transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-8 border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center flex-1">
            <button className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="max-w-md w-full relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3.5 py-2 border border-border/80 rounded-xl leading-5 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm font-semibold transition-all"
                placeholder="Search invoices, vendors..."
              />
            </div>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6 gap-4">
            <button className="p-2 text-muted-foreground hover:text-foreground relative transition-all rounded-xl hover:bg-muted">
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-650 ring-2 ring-card" />
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground border border-border shadow-sm flex items-center justify-center font-bold text-sm">
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
    </div>
  )
}
