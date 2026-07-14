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
    <div className="min-h-screen bg-[#FAFAFA] flex text-[#0A0A0A] font-sans">
      {/* Sidebar - Deep navy/indigo (#0B0F3D) */}
      <aside className="w-64 bg-[#0B0F3D] text-white flex flex-col border-r border-[#15194D]">
        <div className="h-20 flex items-center px-8 border-b border-[#15194D]">
          <div className="w-9 h-9 bg-[#D9FF4A] rounded-xl flex items-center justify-center mr-3 shadow-md">
            <span className="text-[#0B0F3D] font-extrabold text-xl font-sans leading-none">F</span>
          </div>
          <h1 className="font-extrabold text-xl tracking-tight text-white uppercase select-none">Finnex</h1>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-2">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className={`flex w-full items-center px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 ${
              currentPage === 'dashboard' 
                ? 'bg-[#D9FF4A] text-[#0B0F3D] shadow-md' 
                : 'text-white/70 hover:bg-[#12164A] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5 mr-3" />
            Dashboard
          </button>
          <button 
            onClick={() => setCurrentPage('invoices')}
            className={`flex w-full items-center px-5 py-3.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 ${
              currentPage === 'invoices' 
                ? 'bg-[#D9FF4A] text-[#0B0F3D] shadow-md' 
                : 'text-white/70 hover:bg-[#12164A] hover:text-white'
            }`}
          >
            <FileText className="w-4.5 h-4.5 mr-3" />
            Invoices
          </button>
          <a 
            href="#" 
            className="flex items-center px-5 py-3.5 text-white/70 hover:bg-[#12164A] hover:text-white rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150"
          >
            <Settings className="w-4.5 h-4.5 mr-3" />
            Settings
          </a>
        </nav>
        
        <div className="p-5 border-t border-[#15194D]">
          <button
            onClick={() => {
              clearToken()
              window.location.reload()
            }}
            className="flex items-center w-full px-5 py-3.5 text-white/70 hover:bg-red-600/20 hover:text-red-400 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 mr-3" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFAFA]">
        {/* Header - Deep navy/indigo (#0B0F3D) background with high contrast */}
        <header className="h-20 flex items-center justify-between px-6 sm:px-8 border-b border-[#E5E5E5] bg-white sticky top-0 z-30">
          <div className="flex items-center flex-1">
            <button className="md:hidden p-2 -ml-2 mr-2 text-[#666666] hover:text-[#0A0A0A]">
              <Menu className="w-5 h-5" />
            </button>
            <div className="max-w-md w-full relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4.5 w-4.5 text-[#666666]" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3.5 py-2.5 border border-[#E5E5E5] rounded-full leading-5 bg-[#FAFAFA] text-[#0A0A0A] placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#0B0F3D]/10 focus:border-[#0B0F3D] sm:text-xs font-semibold uppercase tracking-wider transition-all"
                placeholder="Search invoices, vendors..."
              />
            </div>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6 gap-4">
            <button className="p-2 text-[#666666] hover:text-[#0A0A0A] relative transition-all rounded-full hover:bg-[#FAFAFA]">
              <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-[#D9FF4A] ring-2 ring-white" />
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-9 w-9 rounded-full bg-[#0A0A0A] text-white border border-[#E5E5E5] shadow-sm flex items-center justify-center font-bold text-xs">
              JD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
