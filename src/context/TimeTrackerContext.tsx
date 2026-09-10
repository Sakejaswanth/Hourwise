import React, { useEffect, useState, useCallback, useRef } from 'react'
import type {
  ActiveTimer,
  Project,
  TimeEntry,
  UserSettings,
  ViewType,
  ToastMessage,
  TimerMode,
  PomodoroPhase,
} from '../types'
import {
  loadProjects,
  saveProjects,
  loadEntries,
  saveEntries,
  loadActiveTimer,
  saveActiveTimer,
  loadSettings,
  saveSettings,
  resetToDemoData,
} from '../utils/storage'
import { getCurrentElapsed, getTodayDateStr } from '../utils/time'
import { playCompleteSound, playPauseSound, playStartSound } from '../utils/sound'
import { TimeTrackerContext } from './timeTrackerContextDef'

export const TimeTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>(loadProjects)
  const [entries, setEntries] = useState<TimeEntry[]>(loadEntries)
  const [activeTimer, setActiveTimer] = useState<ActiveTimer>(loadActiveTimer)
  const [settings, setSettings] = useState<UserSettings>(loadSettings)
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [globalSearch, setGlobalSearch] = useState('')

  // Modals state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Current live elapsed seconds
  const [currentElapsed, setCurrentElapsed] = useState<number>(() => getCurrentElapsed(activeTimer))

  // Ref to hold latest activeTimer to avoid stale closure in timer intervals
  const timerRef = useRef(activeTimer)
  const settingsRef = useRef(settings)

  useEffect(() => {
    timerRef.current = activeTimer
  }, [activeTimer])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  // Toast helper
  const showToast = useCallback((title: string, description?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts((prev) => [...prev, { id, title, description, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  // Live timer interval
  useEffect(() => {
    if (!activeTimer.isRunning) {
      return
    }

    const interval = window.setInterval(() => {
      const elapsed = getCurrentElapsed(timerRef.current)
      setCurrentElapsed(elapsed)

      // Check for Pomodoro completion
      if (
        timerRef.current.mode === 'pomodoro' &&
        elapsed >= timerRef.current.pomodoroTargetSeconds
      ) {
        playCompleteSound(settingsRef.current.soundEnabled)
        const phaseName = timerRef.current.pomodoroPhase === 'work' ? 'Focus session' : 'Break'
        showToast(`🎉 ${phaseName} Complete!`, 'Take a moment to record your progress or take a break.', 'success')

        // Automatically pause timer upon completion
        setActiveTimer((prev) => {
          const updated: ActiveTimer = {
            ...prev,
            isRunning: false,
            elapsedSeconds: prev.pomodoroTargetSeconds,
            startTime: null,
          }
          saveActiveTimer(updated)
          return updated
        })
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [activeTimer.isRunning, showToast])

  // Timer controls
  const startTimer = useCallback(() => {
    playStartSound(settings.soundEnabled)
    setActiveTimer((prev) => {
      const updated: ActiveTimer = {
        ...prev,
        isRunning: true,
        startTime: Date.now(),
      }
      saveActiveTimer(updated)
      return updated
    })
    showToast('Timer started', 'Focus and make every minute count.', 'info')
  }, [settings.soundEnabled, showToast])

  const pauseTimer = useCallback(() => {
    playPauseSound(settings.soundEnabled)
    setActiveTimer((prev) => {
      const totalElapsed = getCurrentElapsed(prev)
      const updated: ActiveTimer = {
        ...prev,
        isRunning: false,
        startTime: null,
        elapsedSeconds: totalElapsed,
      }
      saveActiveTimer(updated)
      return updated
    })
    showToast('Timer paused', '', 'info')
  }, [settings.soundEnabled, showToast])

  const toggleTimer = useCallback(() => {
    if (activeTimer.isRunning) {
      pauseTimer()
    } else {
      startTimer()
    }
  }, [activeTimer.isRunning, pauseTimer, startTimer])

  const stopAndSaveTimer = useCallback(() => {
    const totalSec = getCurrentElapsed(activeTimer)
    if (totalSec < 5) {
      showToast('Timer discarded', 'Sessions shorter than 5 seconds are not saved.', 'warning')
      setActiveTimer((prev) => {
        const updated: ActiveTimer = {
          ...prev,
          isRunning: false,
          startTime: null,
          elapsedSeconds: 0,
        }
        saveActiveTimer(updated)
        return updated
      })
      setCurrentElapsed(0)
      return
    }

    const now = new Date()
    const start = new Date(now.getTime() - totalSec * 1000)
    const today = getTodayDateStr()

    const newEntry: TimeEntry = {
      id: `entry-${Date.now()}`,
      description: activeTimer.description.trim() || 'Untitled task',
      projectId: activeTimer.projectId,
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      durationSeconds: totalSec,
      billable: activeTimer.billable,
      tags: activeTimer.tags,
      date: today,
    }

    setEntries((prev) => {
      const updated = [newEntry, ...prev]
      saveEntries(updated)
      return updated
    })

    playCompleteSound(settings.soundEnabled)

    setActiveTimer((prev) => {
      const updated: ActiveTimer = {
        ...prev,
        isRunning: false,
        startTime: null,
        elapsedSeconds: 0,
      }
      saveActiveTimer(updated)
      return updated
    })
    setCurrentElapsed(0)

    showToast('Time entry saved! ✦', `${newEntry.description} logged successfully.`, 'success')
  }, [activeTimer, settings.soundEnabled, showToast])

  const discardTimer = useCallback(() => {
    setActiveTimer((prev) => {
      const updated: ActiveTimer = {
        ...prev,
        isRunning: false,
        startTime: null,
        elapsedSeconds: 0,
      }
      saveActiveTimer(updated)
      return updated
    })
    setCurrentElapsed(0)
    showToast('Timer reset to 00:00:00', '', 'info')
  }, [showToast])

  const setTimerMode = useCallback((mode: TimerMode, phase: PomodoroPhase = 'work') => {
    let targetSeconds = 25 * 60
    if (mode === 'pomodoro') {
      if (phase === 'work') targetSeconds = settings.pomodoroWorkMin * 60
      else if (phase === 'shortBreak') targetSeconds = settings.pomodoroShortBreakMin * 60
      else if (phase === 'longBreak') targetSeconds = settings.pomodoroLongBreakMin * 60
    }

    setActiveTimer((prev) => {
      const updated: ActiveTimer = {
        ...prev,
        mode,
        pomodoroPhase: phase,
        pomodoroTargetSeconds: targetSeconds,
        isRunning: false,
        startTime: null,
        elapsedSeconds: 0,
      }
      saveActiveTimer(updated)
      return updated
    })
    setCurrentElapsed(0)
  }, [settings])

  const updateTimerField = useCallback(<K extends keyof ActiveTimer>(field: K, value: ActiveTimer[K]) => {
    setActiveTimer((prev) => {
      const updated = { ...prev, [field]: value }
      saveActiveTimer(updated)
      return updated
    })
  }, [])

  const resumeEntry = useCallback((entry: TimeEntry) => {
    playStartSound(settings.soundEnabled)
    setActiveTimer((prev) => {
      const updated: ActiveTimer = {
        ...prev,
        projectId: entry.projectId,
        description: entry.description,
        billable: entry.billable,
        tags: [...entry.tags],
        mode: 'stopwatch',
        isRunning: true,
        startTime: Date.now(),
        elapsedSeconds: 0,
      }
      saveActiveTimer(updated)
      return updated
    })
    setCurrentElapsed(0)
    showToast('Timer resumed', `Tracking: ${entry.description}`, 'success')
  }, [settings.soundEnabled, showToast])

  // Entries CRUD
  const addManualEntry = useCallback((data: Omit<TimeEntry, 'id'>) => {
    const entry: TimeEntry = {
      ...data,
      id: `entry-${Date.now()}`,
    }
    setEntries((prev) => {
      const updated = [entry, ...prev]
      saveEntries(updated)
      return updated
    })
    showToast('Entry added', `${entry.description} added to log.`, 'success')
  }, [showToast])

  const updateEntry = useCallback((id: string, data: Partial<TimeEntry>) => {
    setEntries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...data } : e))
      saveEntries(updated)
      return updated
    })
    showToast('Entry updated', 'Changes saved successfully.', 'success')
  }, [showToast])

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id)
      saveEntries(updated)
      return updated
    })
    showToast('Entry deleted', '', 'info')
  }, [showToast])

  const duplicateEntry = useCallback((id: string) => {
    const target = entries.find((e) => e.id === id)
    if (!target) return
    const duplicated: TimeEntry = {
      ...target,
      id: `entry-${Date.now()}`,
      description: `${target.description} (Copy)`,
      date: getTodayDateStr(),
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + target.durationSeconds * 1000).toISOString(),
    }
    setEntries((prev) => {
      const updated = [duplicated, ...prev]
      saveEntries(updated)
      return updated
    })
    showToast('Entry duplicated', '', 'success')
  }, [entries, showToast])

  // Projects CRUD
  const addProject = useCallback((data: Omit<Project, 'id' | 'createdAt'>) => {
    const project: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    setProjects((prev) => {
      const updated = [...prev, project]
      saveProjects(updated)
      return updated
    })
    showToast('Project created', `${project.name} is now available.`, 'success')
  }, [showToast])

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      saveProjects(updated)
      return updated
    })
    showToast('Project updated', '', 'success')
  }, [showToast])

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id)
      saveProjects(updated)
      return updated
    })
    showToast('Project deleted', '', 'info')
  }, [showToast])

  // Settings
  const updateSettings = useCallback((data: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...data }
      saveSettings(updated)
      return updated
    })
    showToast('Preferences updated', '', 'success')
  }, [showToast])

  const toggleTheme = useCallback(() => {
    setSettings((prev) => {
      const nextTheme: 'light' | 'dark' = prev.theme === 'light' ? 'dark' : 'light'
      const updated: UserSettings = { ...prev, theme: nextTheme }
      saveSettings(updated)
      return updated
    })
  }, [])

  const resetAllDemoData = useCallback(() => {
    const reset = resetToDemoData()
    setProjects(reset.projects)
    setEntries(reset.entries)
    setSettings(reset.settings)
    setActiveTimer(loadActiveTimer())
    setCurrentElapsed(0)
    showToast('Demo data restored', 'Sample projects and entries have been refreshed.', 'info')
  }, [showToast])

  const importJsonBackup = useCallback((jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent)
      if (Array.isArray(parsed.projects) && Array.isArray(parsed.entries)) {
        setProjects(parsed.projects)
        saveProjects(parsed.projects)
        setEntries(parsed.entries)
        saveEntries(parsed.entries)
        if (parsed.settings) {
          setSettings(parsed.settings)
          saveSettings(parsed.settings)
        }
        showToast('Backup restored', 'Data imported successfully.', 'success')
        return true
      }
    } catch (e) {
      console.error(e)
    }
    showToast('Import failed', 'Invalid JSON backup format.', 'warning')
    return false
  }, [showToast])

  return (
    <TimeTrackerContext.Provider
      value={{
        projects,
        entries,
        activeTimer,
        settings,
        activeView,
        toasts,
        currentElapsed,
        globalSearch,

        isManualModalOpen,
        editingEntry,
        isProjectModalOpen,
        editingProject,
        isShortcutsOpen,
        isMobileNavOpen,

        setActiveView,
        setGlobalSearch,
        setIsManualModalOpen,
        setEditingEntry,
        setIsProjectModalOpen,
        setEditingProject,
        setIsShortcutsOpen,
        setIsMobileNavOpen,

        startTimer,
        pauseTimer,
        toggleTimer,
        stopAndSaveTimer,
        discardTimer,
        setTimerMode,
        updateTimerField,
        resumeEntry,

        addManualEntry,
        updateEntry,
        deleteEntry,
        duplicateEntry,

        addProject,
        updateProject,
        deleteProject,

        updateSettings,
        toggleTheme,
        resetAllDemoData,
        importJsonBackup,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </TimeTrackerContext.Provider>
  )
}
