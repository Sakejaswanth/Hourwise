import { createContext } from 'react'
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

export interface TimeTrackerContextType {
  // State
  projects: Project[]
  entries: TimeEntry[]
  activeTimer: ActiveTimer
  settings: UserSettings
  activeView: ViewType
  toasts: ToastMessage[]
  currentElapsed: number
  globalSearch: string

  // Modals
  isManualModalOpen: boolean
  editingEntry: TimeEntry | null
  isProjectModalOpen: boolean
  editingProject: Project | null
  isShortcutsOpen: boolean
  isMobileNavOpen: boolean

  // Setters
  setActiveView: (view: ViewType) => void
  setGlobalSearch: (q: string) => void
  setIsManualModalOpen: (open: boolean) => void
  setEditingEntry: (entry: TimeEntry | null) => void
  setIsProjectModalOpen: (open: boolean) => void
  setEditingProject: (project: Project | null) => void
  setIsShortcutsOpen: (open: boolean) => void
  setIsMobileNavOpen: (open: boolean) => void

  // Timer actions
  startTimer: () => void
  pauseTimer: () => void
  toggleTimer: () => void
  stopAndSaveTimer: () => void
  discardTimer: () => void
  setTimerMode: (mode: TimerMode, phase?: PomodoroPhase) => void
  updateTimerField: <K extends keyof ActiveTimer>(field: K, value: ActiveTimer[K]) => void
  resumeEntry: (entry: TimeEntry) => void

  // Entries actions
  addManualEntry: (data: Omit<TimeEntry, 'id'>) => void
  updateEntry: (id: string, data: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void
  duplicateEntry: (id: string) => void

  // Projects actions
  addProject: (data: Omit<Project, 'id' | 'createdAt'>) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Settings & System actions
  updateSettings: (data: Partial<UserSettings>) => void
  toggleTheme: () => void
  resetAllDemoData: () => void
  importJsonBackup: (jsonContent: string) => boolean
  showToast: (title: string, description?: string, type?: 'success' | 'info' | 'warning') => void
  dismissToast: (id: string) => void
}

export const TimeTrackerContext = createContext<TimeTrackerContextType | undefined>(undefined)
