import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Invoices } from '@/pages/Invoices'
import { Vendors } from '@/pages/Vendors'
import { Categories } from '@/pages/Categories'
import { Recurring } from '@/pages/Recurring'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import { getToken, setToken } from '@/api/auth'
import { InvoiceProvider, useInvoices } from '@/context/InvoiceContext'

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getToken())
  const { activeTab, setActiveTab } = useInvoices()

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

  const renderActivePage = () => {
    switch (activeTab) {
      case 'overview':
        return <Dashboard onViewAllInvoices={() => setActiveTab('invoices')} />
      case 'invoices':
        return <Invoices />
      case 'vendors':
        return <Vendors />
      case 'categories':
        return <Categories />
      case 'recurring':
        return <Recurring />
      case 'connected':
      case 'settings':
        return <Settings />
      default:
        return <Dashboard onViewAllInvoices={() => setActiveTab('invoices')} />
    }
  }

  return (
    <DashboardLayout currentPage={activeTab} setCurrentPage={setActiveTab}>
      {renderActivePage()}
    </DashboardLayout>
  )
}

function App() {
  return (
    <InvoiceProvider>
      <AppContent />
    </InvoiceProvider>
  )
}

export default App
