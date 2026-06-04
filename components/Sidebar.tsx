'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', requireRole: null },
  { name: 'Organisers', href: '/organisers', icon: '👔', requireRole: 'admin' },
  { name: 'Tournaments', href: '/tournaments', icon: '🏆', requireRole: null },
  { name: 'Teams', href: '/teams', icon: '👥', requireRole: null },
  { name: 'Players', href: '/players', icon: '👤', requireRole: null },
  { name: 'Schedule', href: '/schedule', icon: '📅', requireRole: null },
  { name: 'Results', href: '/results', icon: '📈', requireRole: null },
]

const settingsItems = [
  { name: 'Settings', href: '/settings', icon: '⚙️' },
  { name: 'Profile', href: '/profile', icon: '👨‍💻' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [user, setUser] = useState<{ role: string } | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  useEffect(() => {
    // Fetch user data to get role
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setIsLoadingUser(false)
      }
    }

    fetchUser()
  }, [])

  const hiddenForTeamAdmin = ['/organisers', '/teams']

  // Filter navigation items based on user role
  const filteredNavigationItems = navigationItems.filter((item) => {
    if (user?.role === 'team_admin' && hiddenForTeamAdmin.includes(item.href)) {
      return false
    }
    if (!item.requireRole) return true
    // super_admin can see all items
    if (user?.role === 'super_admin') return true
    return user?.role === item.requireRole
  })

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
      } else {
        setIsLoggingOut(false)
        console.error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen left-0 top-0 flex flex-col transition-all duration-300 shadow-lg`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
        {!isCollapsed && (
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Tournament
            </h1>
            <p className="text-xs text-slate-400">Hub</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
          type="button"
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        <div className={!isCollapsed ? 'text-xs font-semibold text-slate-400 mb-3 px-3' : ''}>
          {!isCollapsed && 'MAIN'}
        </div>
        <ul className="space-y-2">
          {filteredNavigationItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings Section */}
      <nav className="p-4 border-t border-slate-700 space-y-2 flex-shrink-0">
        <div className={!isCollapsed ? 'text-xs font-semibold text-slate-400 mb-3 px-3' : ''}>
          {!isCollapsed && 'OTHER'}
        </div>
        <ul className="space-y-2">
          {settingsItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive(item.href)
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
                title={isCollapsed ? item.name : ''}
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-slate-300 hover:bg-red-600/20 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
              title={isCollapsed ? 'Logout' : ''}
              type="button"
            >
              <span className="text-lg flex-shrink-0">🚪</span>
              {!isCollapsed && <span className="text-sm font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Version */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500 flex-shrink-0">
          v0.1.0
        </div>
      )}
    </aside>
  )
}
