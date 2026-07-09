import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Invoices } from '@/pages/Invoices'
import { Login } from '@/pages/Login'
import { getToken, setToken } from '@/api/auth'

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'invoices'>('dashboard')
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())

  useEffect(() => {
    const url = new URL(window.location.href)
    const tokenFromUrl = url.searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.toString())
      setIsAuthenticated(true)
    }
  }, [])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <DashboardLayout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {currentPage === 'dashboard' ? (
        <Dashboard onViewAllInvoices={() => setCurrentPage('invoices')} />
      ) : (
        <Invoices />
      )}
    </DashboardLayout>
  )
}

export default App
