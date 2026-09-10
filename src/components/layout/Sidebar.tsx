import React from 'react'
import {
  BarChart3,
  CalendarDays,
  Clock3,
  FolderKanban,
  LayoutDashboard,
  Moon,
  Settings,
  Sun,
  X,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import type { ViewType } from '../../types'
import { formatHMS } from '../../utils/time'

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    entries,
    projects,
    activeTimer,
    currentElapsed,
    settings,
    toggleTheme,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useTimeTracker()

  const navItems: { id: ViewType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    { id: 'entries', label: 'Time entries', icon: <Clock3 size={17} />, count: entries.length },
    { id: 'projects', label: 'Projects', icon: <FolderKanban size={17} />, count: projects.length },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={17} /> },
    { id: 'calendar', label: 'Calendar', icon: <CalendarDays size={17} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={17} /> },
  ]

  const activeProject = projects.find((p) => p.id === activeTimer.projectId)

  const handleNavClick = (id: ViewType) => {
    setActiveView(id)
    setIsMobileNavOpen(false)
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileNavOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isMobileNavOpen ? 'mobile-open' : ''}`}>
        <div className="brand-wrapper">
          <div className="brand">
            <span className="brand-mark">
              <Clock3 size={18} />
            </span>
            <span>hourly</span>
            <span className="brand-pro-tag">PRO</span>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switcher">
          <div className="avatar avatar-blue">
            {settings.userName.slice(0, 2).toUpperCase() || 'JS'}
          </div>
          <div className="workspace-meta">
            <strong>{settings.userName}</strong>
            <small>{settings.workspaceName}</small>
          </div>
        </div>

        {/* Running timer status pill */}
        {activeTimer.isRunning && (
          <div
            className="active-timer-pill"
            onClick={() => handleNavClick('overview')}
            title="Click to view timer"
          >
            <span className="pill-dot pulsing" />
            <div className="pill-info">
              <span className="pill-label">{activeProject?.name || 'Tracking'}</span>
              <strong className="pill-time">{formatHMS(currentElapsed)}</strong>
            </div>
          </div>
        )}

        <nav className="main-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.count !== undefined && <span className="nav-count">{item.count}</span>}
            </button>
          ))}

          <p className="nav-label nav-spacer">Manage</p>
          {navItems.slice(4).map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-panel">
            <span className="spark">✦</span>
            <strong>Productivity Power</strong>
            <p>Export invoices, track budgets, and automate Pomodoros.</p>
            <button onClick={() => handleNavClick('reports')}>
              View Reports <span>→</span>
            </button>
          </div>

          <div className="profile-row">
            <div className="profile">
              <div className="avatar avatar-orange">
                {settings.userName.slice(0, 2).toUpperCase() || 'JS'}
              </div>
              <div>
                <strong>{settings.userName}</strong>
                <small>{settings.userEmail}</small>
              </div>
            </div>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${settings.theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {settings.theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
