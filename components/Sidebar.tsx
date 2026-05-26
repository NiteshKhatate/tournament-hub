'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Organisers', href: '/organisers', icon: '👔' },
  { name: 'Tournaments', href: '/tournaments', icon: '🏆' },
  { name: 'Teams', href: '/teams', icon: '👥' },
  { name: 'Players', href: '/players', icon: '👤' },
  { name: 'Schedule', href: '/schedule', icon: '📅' },
  { name: 'Results', href: '/results', icon: '📈' },
]

const settingsItems = [
  { name: 'Settings', href: '/settings', icon: '⚙️' },
  { name: 'Profile', href: '/profile', icon: '👨‍💻' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-300 shadow-lg`}
    >
      {/* Logo Section */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
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
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="p-4 space-y-2">
        <div className={!isCollapsed ? 'text-xs font-semibold text-slate-400 mb-3 px-3' : ''}>
          {!isCollapsed && 'MAIN'}
        </div>
        <ul className="space-y-2">
          {navigationItems.map((item) => (
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
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings Section */}
      <nav className="p-4 border-t border-slate-700 mt-auto space-y-2">
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
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Version */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700 text-center text-xs text-slate-500">
          v0.1.0
        </div>
      )}
    </aside>
  )
}
