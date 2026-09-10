import React from 'react'
import {
  CalendarDays,
  Command,
  Menu,
  Search,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'

export const Topbar: React.FC = () => {
  const {
    activeView,
    globalSearch,
    setGlobalSearch,
    settings,
    updateSettings,
    setIsShortcutsOpen,
    setIsMobileNavOpen,
  } = useTimeTracker()

  const viewTitles: Record<string, string> = {
    overview: 'Overview',
    entries: 'Time Entries',
    projects: 'Projects & Budgets',
    reports: 'Reports & Analytics',
    calendar: 'Calendar Timeline',
    settings: 'Workspace Settings',
  }

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={() => setIsMobileNavOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <span className="breadcrumb-divider">/</span>
          <strong>{viewTitles[activeView] || 'Overview'}</strong>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={14} className="search-icon" />
        <input
          type="text"
          placeholder="Search entries, projects, tags..."
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
        {globalSearch && (
          <button
            className="search-clear-btn"
            onClick={() => setGlobalSearch('')}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="top-actions">
        <button
          className="icon-button"
          onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
          title={settings.soundEnabled ? 'Audio chimes enabled' : 'Audio muted'}
          aria-label="Toggle audio effects"
        >
          {settings.soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>

        <button
          className="icon-button"
          onClick={() => setIsShortcutsOpen(true)}
          title="Keyboard shortcuts (?)"
          aria-label="View keyboard shortcuts"
        >
          <Command size={17} />
        </button>

        <div className="date-button">
          <CalendarDays size={15} />
          <span>{currentDateStr}</span>
        </div>
      </div>
    </header>
  )
}
