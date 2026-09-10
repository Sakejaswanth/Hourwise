import React, { useEffect } from 'react'
import './App.css'
import { TimeTrackerProvider } from './context/TimeTrackerContext'
import { useTimeTracker } from './context/useTimeTracker'
import { Sidebar } from './components/layout/Sidebar'
import { Topbar } from './components/layout/Topbar'
import { OverviewView } from './components/views/OverviewView'
import { EntriesView } from './components/views/EntriesView'
import { ProjectsView } from './components/views/ProjectsView'
import { ReportsView } from './components/views/ReportsView'
import { CalendarView } from './components/views/CalendarView'
import { SettingsView } from './components/views/SettingsView'
import { ManualEntryModal } from './components/modals/ManualEntryModal'
import { ProjectModal } from './components/modals/ProjectModal'
import { ShortcutsModal } from './components/modals/ShortcutsModal'
import { ToastContainer } from './components/common/Toast'

const MainContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    toggleTimer,
    stopAndSaveTimer,
    setIsManualModalOpen,
    isManualModalOpen,
    isProjectModalOpen,
    setIsProjectModalOpen,
    isShortcutsOpen,
    setIsShortcutsOpen,
    setEditingEntry,
    setEditingProject,
    toggleTheme,
    setTimerMode,
    activeTimer,
    isMobileNavOpen,
    setIsMobileNavOpen,
  } = useTimeTracker()

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input, textarea or select
      const activeTag = (document.activeElement?.tagName || '').toLowerCase()
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select'

      if (e.key === 'Escape') {
        if (isManualModalOpen) {
          setIsManualModalOpen(false)
          setEditingEntry(null)
        }
        if (isProjectModalOpen) {
          setIsProjectModalOpen(false)
          setEditingProject(null)
        }
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false)
        }
        if (isMobileNavOpen) {
          setIsMobileNavOpen(false)
        }
        return
      }

      if (isInput) return

      if (e.code === 'Space') {
        e.preventDefault()
        toggleTimer()
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault()
        stopAndSaveTimer()
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setEditingEntry(null)
        setIsManualModalOpen(true)
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        setTimerMode(activeTimer.mode === 'stopwatch' ? 'pomodoro' : 'stopwatch')
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        toggleTheme()
      } else if (e.key === '?') {
        e.preventDefault()
        setIsShortcutsOpen(!isShortcutsOpen)
      } else if (e.key === '1') {
        setActiveView('overview')
      } else if (e.key === '2') {
        setActiveView('entries')
      } else if (e.key === '3') {
        setActiveView('projects')
      } else if (e.key === '4') {
        setActiveView('reports')
      } else if (e.key === '5') {
        setActiveView('calendar')
      } else if (e.key === '6') {
        setActiveView('settings')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    toggleTimer,
    stopAndSaveTimer,
    isManualModalOpen,
    setIsManualModalOpen,
    isProjectModalOpen,
    setIsProjectModalOpen,
    isShortcutsOpen,
    setIsShortcutsOpen,
    setEditingEntry,
    setEditingProject,
    toggleTheme,
    setTimerMode,
    activeTimer.mode,
    setActiveView,
    isMobileNavOpen,
    setIsMobileNavOpen,
  ])

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        <Topbar />
        {activeView === 'overview' && <OverviewView />}
        {activeView === 'entries' && <EntriesView />}
        {activeView === 'projects' && <ProjectsView />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'calendar' && <CalendarView />}
        {activeView === 'settings' && <SettingsView />}
      </main>

      {/* Global Modals & Notifications */}
      <ManualEntryModal />
      <ProjectModal />
      <ShortcutsModal />
      <ToastContainer />
    </div>
  )
}

function App() {
  return (
    <TimeTrackerProvider>
      <MainContent />
    </TimeTrackerProvider>
  )
}

export default App
