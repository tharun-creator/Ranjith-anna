import { useState, useMemo } from 'react'
import { useInvoices } from '@/context/InvoiceContext'
import { 
  User, 
  Building2, 
  Users, 
  Mail, 
  FolderClosed, 
  Bell, 
  Database, 
  ShieldCheck, 
  RefreshCw, 
  ShieldAlert,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  Plus,
  Laptop
} from 'lucide-react'

export const Settings = () => {
  const { 
    invoices, 
    theme, 
    setTheme, 
    expertMode, 
    setExpertMode, 
    triggerMailSync 
  } = useInvoices()

  const [activeSection, setActiveSection] = useState('profile')
  const [userRole, setUserRole] = useState<'admin' | 'member'>('admin') // Toggle to test read-only state

  // Mock states for settings fields
  const [displayName, setDisplayName] = useState('John Doe')
  const [orgName, setOrgName] = useState('Finnex Corp')
  const [orgSlug, setOrgSlug] = useState('finnex-corp')
  const orgDomain = 'finnex.co'
  const [orgEmail, setOrgEmail] = useState('finance@finnex.co')
  const [orgCurrency, setOrgCurrency] = useState('INR')

  // Categories list from context + mock YTD values
  const categories = useMemo(() => {
    const stats: Record<string, { code: string, name: string, count: number, total: number }> = {}
    invoices.forEach(inv => {
      const code = inv.ledger_code || 'UNCATEGORIZED'
      const name = inv.ledger_name || 'Uncategorized'
      const amt = inv.total_amount || 0
      const inrAmt = inv.currency === 'USD' ? amt * 83.5 : amt

      if (!stats[code]) {
        stats[code] = { code, name, count: 0, total: 0 }
      }
      stats[code].count += 1
      stats[code].total += inrAmt
    })
    return Object.values(stats)
  }, [invoices])

  // Connected accounts list
  const [connections, setConnections] = useState([
    { id: '1', email: 'finance-inbox@finnex.co', provider: 'gmail', status: 'active', lastSynced: '2 mins ago', owner: 'John Doe' },
    { id: '2', email: 'billing@finnex.co', provider: 'gmail', status: 'error', errorMsg: 'Token expired', lastSynced: '1 day ago', owner: 'Sarah Jenkins' }
  ])

  // Notifications toggles
  const [notifications, setNotifications] = useState({
    invoiceDetected: true,
    invoiceDue: true,
    dueDays: 7,
    invoiceOverdue: true,
    syncFailed: true,
    weeklyDigest: false,
    channelInApp: true,
    channelEmail: true
  })

  // Security mock sessions
  const [sessions] = useState([
    { id: '1', device: 'Chrome on macOS (Current)', location: 'Mumbai, India', lastActive: 'Active now' },
    { id: '2', device: 'Safari on iPhone 15', location: 'Delhi, India', lastActive: '3 hours ago' }
  ])

  // Team members list
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'John Doe', email: 'john@finnex.co', role: 'admin', status: 'active', joined: '2026-01-10' },
    { id: '2', name: 'Sarah Jenkins', email: 'sarah@finnex.co', role: 'member', status: 'active', joined: '2026-02-14' },
    { id: '3', name: 'Ranjith Kumar', email: 'ranjith@finnex.co', role: 'member', status: 'invited', joined: 'Pending' }
  ])

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'team', label: 'Team & Roles', icon: Users },
    { id: 'connected', label: 'Connected Accounts', icon: Mail },
    { id: 'categories', label: 'Categories & Ledger', icon: FolderClosed },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Export', icon: Database },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ]

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
  }

  // --- Actions ---
  const handleTriggerSync = (id: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, status: 'syncing' } : c))
    setTimeout(() => {
      setConnections(prev => prev.map(c => c.id === id ? { ...c, status: 'active', lastSynced: 'Just now' } : c))
    }, 1500)
  }

  const handleToggleConnection = (id: string) => {
    setConnections(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'paused' ? 'active' : 'paused'
        return { ...c, status: nextStatus }
      }
      return c
    }))
  }

  const handleDisconnect = (id: string) => {
    if (confirm('Disconnect this account? Synced invoices will remain, but no new emails will sync.')) {
      setConnections(prev => prev.filter(c => c.id !== id))
    }
  }

  const handleExportCSV = () => {
    const headers = ['Invoice ID', 'Vendor', 'Date', 'Amount', 'Currency', 'Status', 'Category']
    const rows = invoices.map(inv => [
      inv.id,
      inv.vendor_name || 'Unknown',
      inv.invoice_date || '',
      inv.total_amount || 0,
      inv.currency || 'INR',
      inv.status || 'pending',
      inv.ledger_code || 'UNCATEGORIZED'
    ])
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", `finnex_settings_export_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleInviteMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const emailInput = form.elements.namedItem('email') as HTMLInputElement
    const roleInput = form.elements.namedItem('role') as HTMLSelectElement
    
    if (!emailInput.value) return
    
    setTeamMembers(prev => [
      ...prev,
      {
        id: String(prev.length + 1),
        name: emailInput.value.split('@')[0],
        email: emailInput.value,
        role: roleInput.value as 'admin' | 'member',
        status: 'invited',
        joined: 'Pending'
      }
    ])
    emailInput.value = ''
  }

  const handleRemoveMember = (id: string) => {
    if (confirm('Are you sure you want to remove this member from the organization?')) {
      setTeamMembers(prev => prev.filter(m => m.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Settings Top Bar with Mock Role switcher */}
      <div className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground select-none">Settings</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Configure workspace and member policies</p>
        </div>
        
        {/* Toggle to test Admin vs Member view */}
        <div className="flex items-center gap-2 bg-card border border-border p-1 rounded-xl shadow-xs">
          <span className="text-[10px] text-muted-foreground font-bold px-2">Test Role:</span>
          <button 
            onClick={() => setUserRole('admin')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              userRole === 'admin' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Admin
          </button>
          <button 
            onClick={() => setUserRole('member')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
              userRole === 'member' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
            }`}
          >
            Member
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side Sub-Nav */}
        <aside className="w-full lg:w-60 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-border pr-0 lg:pr-6">
          {sections.map(section => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all flex-shrink-0 lg:w-full ${
                  isActive 
                    ? 'bg-primary/10 text-accent font-bold border-l-2 border-accent' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            )
          })}
        </aside>

        {/* Right Side Content Panel */}
        <div className="flex-1 w-full bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
          
          {/* --- Section: Profile --- */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">Personal Profile</h3>
              
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary text-primary-foreground font-extrabold text-lg rounded-full flex items-center justify-center border border-border">
                  JD
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">John Doe</h4>
                  <p className="text-[10px] text-muted-foreground font-semibold">Workspace Owner</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Display Name</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full max-w-md px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Login Email</label>
                  <input 
                    type="text" 
                    value="john@finnex.co" 
                    disabled 
                    className="w-full max-w-md px-3.5 py-2 border border-border rounded-xl bg-muted text-muted-foreground text-xs font-semibold cursor-not-allowed"
                  />
                  <span className="text-[9px] text-muted-foreground block font-medium mt-0.5">Managed by your login provider</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Display Language Preference</label>
                  <div className="bg-background border border-border p-0.5 rounded-xl shadow-xs flex w-fit mt-1">
                    <button
                      onClick={() => setExpertMode(false)}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        !expertMode ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Simple Mode (Plain language)
                    </button>
                    <button
                      onClick={() => setExpertMode(true)}
                      className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        expertMode ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                      }`}
                    >
                      Detailed Mode (Technical jargon)
                    </button>
                  </div>
                  <div className="space-y-1 mt-4">
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Theme Preference</label>
                    <div className="bg-background border border-border p-0.5 rounded-xl shadow-xs flex w-fit mt-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          theme === 'light' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                        }`}
                      >
                        Light
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                          theme === 'dark' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground'
                        }`}
                      >
                        Dark
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          </div>
          )}

          {/* --- Section: Organization --- */}
          {activeSection === 'organization' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">Organization Settings</h3>
              
              {userRole === 'member' && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 p-3 rounded-xl flex items-center gap-2 text-[10px] font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Only organization admins can edit these settings. View-only access active.</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Company Name</label>
                  <input 
                    type="text" 
                    value={orgName} 
                    disabled={userRole === 'member'}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full max-w-md px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Organization Slug</label>
                  <input 
                    type="text" 
                    value={orgSlug} 
                    disabled={userRole === 'member'}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    className="w-full max-w-md px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold focus:outline-none disabled:bg-muted disabled:text-muted-foreground font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Official Email</label>
                  <input 
                    type="email" 
                    value={orgEmail} 
                    disabled={userRole === 'member'}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full max-w-md px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Domain</label>
                    <input 
                      type="text" 
                      value={orgDomain} 
                      disabled
                      className="w-full px-3.5 py-2 border border-border rounded-xl bg-muted text-muted-foreground text-xs font-semibold font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Default Currency</label>
                    <select 
                      value={orgCurrency}
                      disabled={userRole === 'member'}
                      onChange={(e) => setOrgCurrency(e.target.value)}
                      className="w-full px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Danger Zone (Admin Only) */}
              {userRole === 'admin' && (
                <div className="mt-8 border border-red-500/20 p-6 rounded-2xl bg-red-500/5 space-y-4">
                  <h4 className="text-red-500 font-bold text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> Danger Zone
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Deleting the organization will immediately terminate all active connected sync accounts, purge historical invoice details, and delete the workspace database. This action is irreversible.
                  </p>
                  <button 
                    onClick={() => {
                      const confirmName = prompt('Type the organization name to confirm deletion:')
                      if (confirmName === orgName) {
                        alert('Organization scheduled for deletion.')
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 bg-card rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Organization
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- Section: Team & Roles --- */}
          {activeSection === 'team' && (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-border pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Team Roster</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Manage access privileges and member roles</p>
                </div>
              </div>

              <div className="bg-[#EBF5FF] dark:bg-muted/15 border border-blue-100 dark:border-border p-4 rounded-xl flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-900 dark:text-foreground leading-relaxed font-semibold">
                  All members of this organization can view all invoices and connected inboxes. Only admins can manage team access and organization settings.
                </p>
              </div>

              {/* Roster table */}
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[9px] text-muted-foreground uppercase tracking-wider font-bold bg-muted/40">
                      <th className="p-3">Name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {teamMembers.map(member => (
                      <tr key={member.id} className="hover:bg-muted/30">
                        <td className="p-3 font-semibold text-foreground">
                          <div>{member.name}</div>
                          <div className="text-[10px] text-muted-foreground font-medium font-mono">{member.email}</div>
                        </td>
                        <td className="p-3 capitalize font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            member.role === 'admin' ? 'bg-primary/10 text-primary-foreground border border-border' : 'bg-muted text-muted-foreground'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-3 capitalize font-semibold text-[10px] text-muted-foreground">
                          {member.status}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            disabled={userRole === 'member' || member.role === 'admin'}
                            onClick={() => handleRemoveMember(member.id)}
                            className="p-1 border border-border hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg text-muted-foreground cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Invite Member form (Admin Only) */}
              {userRole === 'admin' && (
                <form onSubmit={handleInviteMember} className="mt-6 border-t border-border pt-4 space-y-4">
                  <h4 className="font-bold text-xs text-foreground">Invite New Colleague</h4>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                    <input 
                      type="email" 
                      name="email"
                      placeholder="colleague@domain.com"
                      className="flex-1 px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold focus:outline-none"
                    />
                    <select 
                      name="role"
                      className="px-3.5 py-2 border border-border rounded-xl bg-background text-foreground text-xs font-semibold focus:outline-none"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 rounded-xl font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Send Invite
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* --- Section: Connected Accounts --- */}
          {activeSection === 'connected' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">Sync Accounts</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connections.map(conn => (
                  <div 
                    key={conn.id}
                    className="bg-background border border-border p-5 rounded-2xl flex flex-col justify-between min-h-[180px] shadow-xs relative"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{conn.email}</h4>
                          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            conn.status === 'active' ? 'bg-emerald-500/10 text-emerald-800 border border-emerald-500/20' :
                            conn.status === 'paused' ? 'bg-amber-500/10 text-amber-800' :
                            'bg-red-500/10 text-red-800 animate-pulse'
                          }`}>
                            {conn.status}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">ID: {conn.id}</span>
                      </div>
                      
                      {conn.errorMsg && (
                        <p className="text-[10px] text-red-500 bg-red-500/5 px-2.5 py-1 rounded-lg mt-3 font-semibold flex items-center gap-1 border border-red-500/10">
                          <ShieldAlert className="w-3.5 h-3.5" /> Reconnect: {conn.errorMsg}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-2 items-center justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground">
                        Synced: <span className="text-foreground font-mono">{conn.lastSynced}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTriggerSync(conn.id)}
                          className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg font-bold text-[9px] flex items-center gap-1 cursor-pointer hover:opacity-90"
                        >
                          <RefreshCw className="w-3 h-3" /> Sync Now
                        </button>
                        <button
                          onClick={() => handleToggleConnection(conn.id)}
                          className="px-2.5 py-1 border border-border hover:bg-muted bg-card text-foreground rounded-lg font-bold text-[9px] cursor-pointer"
                        >
                          {conn.status === 'paused' ? 'Resume' : 'Pause'}
                        </button>
                        <button
                          onClick={() => handleDisconnect(conn.id)}
                          className="p-1 border border-border hover:bg-red-500/10 hover:text-red-500 text-muted-foreground rounded-lg cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-4">
                <button
                  onClick={triggerMailSync}
                  className="px-5 py-2 bg-accent text-[#0B0F3D] hover:bg-[#C8EB00] rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Connect Gmail Account
                </button>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold max-w-sm pt-2">
                  <span>Gmail API limit utilization</span>
                  <span>14% (1,400 of 10,000 daily quota)</span>
                </div>
              </div>
            </div>
          )}

          {/* --- Section: Categories & Ledger --- */}
          {activeSection === 'categories' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">Auto-Categorization Rules</h3>
              
              <div className="flex items-center justify-between p-3.5 border border-border bg-background rounded-xl">
                <div>
                  <h4 className="font-bold text-xs text-foreground">AI Automatic Categorization</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Scans Gmail PDFs and automatically categorizes mapping</p>
                </div>
                <button className="text-primary cursor-pointer">
                  <ToggleRight className="w-6 h-6 text-accent" />
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-xs text-foreground">Ledger Swatches</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map(cat => (
                    <div 
                      key={cat.code}
                      className="p-3 border border-border bg-background rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-accent" />
                        <div>
                          <div className="font-bold text-foreground">{cat.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono font-semibold">{cat.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold font-mono">{formatINR(cat.total)}</div>
                        <div className="text-[9px] text-muted-foreground font-semibold">{cat.count} invoices</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- Section: Notifications --- */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">Notification Preferences</h3>
              
              <div className="divide-y divide-border text-xs">
                
                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">New Invoice Detected</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Alert me when a new bill is ingested from Gmail</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, invoiceDetected: !prev.invoiceDetected }))}
                    className="cursor-pointer"
                  >
                    {notifications.invoiceDetected ? <ToggleRight className="w-6 h-6 text-accent" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                  </button>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">Invoice Due Alerts</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Send a notice before an invoice reaches its due date</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      value={notifications.dueDays}
                      onChange={(e) => setNotifications(prev => ({ ...prev, dueDays: Number(e.target.value) }))}
                      className="px-2 py-1 border border-border rounded-lg bg-background text-[10px] font-bold focus:outline-none"
                    >
                      <option value={3}>3 days before</option>
                      <option value={7}>7 days before</option>
                      <option value={14}>14 days before</option>
                    </select>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, invoiceDue: !prev.invoiceDue }))}
                      className="cursor-pointer"
                    >
                      {notifications.invoiceDue ? <ToggleRight className="w-6 h-6 text-accent" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">Invoice Overdue Warnings</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Send an immediate warning when an invoice payment status is overdue</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, invoiceOverdue: !prev.invoiceOverdue }))}
                    className="cursor-pointer"
                  >
                    {notifications.invoiceOverdue ? <ToggleRight className="w-6 h-6 text-accent" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                  </button>
                </div>

                <div className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-foreground">Gmail Sync Failed Alerts</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Notice when credentials fail or need re-validation</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, syncFailed: !prev.syncFailed }))}
                    className="cursor-pointer"
                  >
                    {notifications.syncFailed ? <ToggleRight className="w-6 h-6 text-accent" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- Section: Data & Export --- */}
          {activeSection === 'data' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">Data Control & Exports</h3>
              
              <div className="space-y-4">
                <div className="p-5 border border-border rounded-xl space-y-3.5">
                  <h4 className="font-bold text-xs text-foreground">Export Invoice Database</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Download a full snapshot of your ledger codes, vendors, dates, and amounts in a standard CSV format.
                  </p>
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-4 py-2 border border-border hover:bg-muted bg-card text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Download CSV Snapshot
                  </button>
                </div>

                {userRole === 'admin' && (
                  <div className="p-5 border border-red-500/20 rounded-xl bg-red-500/5 space-y-3.5">
                    <h4 className="text-red-500 font-bold text-xs flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Reset Synced Data
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Clears all synced email logs, attachments, and invoices. The team roster and Gmail connection keys are preserved.
                    </p>
                    <button 
                      onClick={() => {
                        if (confirm('Clear all synced data? Workspace will be reset, this action is irreversible.')) {
                          alert('Synced invoices and database rows cleared.')
                        }
                      }}
                      className="px-4 py-2 border border-red-500/20 hover:bg-red-500/10 text-red-500 bg-card rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Purge Synced Invoices
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- Section: Security --- */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <h3 className="font-extrabold text-sm text-foreground border-b border-border pb-3">Security & active sessions</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-2">Authentication Method</label>
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Laptop className="w-4.5 h-4.5 text-muted-foreground" /> Google OAuth SSO (Managed)
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block mb-2">Active login sessions</label>
                  <div className="space-y-3">
                    {sessions.map(sess => (
                      <div 
                        key={sess.id}
                        className="p-3.5 border border-border bg-background rounded-xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-foreground">{sess.device}</div>
                          <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{sess.location}</div>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          {sess.lastActive}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
