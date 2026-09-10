export type ProjectColor = 
  | 'coral'
  | 'mint'
  | 'lavender'
  | 'amber'
  | 'sky'
  | 'rose'
  | 'emerald'
  | 'indigo'

export interface Project {
  id: string
  name: string
  client: string
  color: ProjectColor
  hourlyRate: number
  budgetHours?: number
  isArchived?: boolean
  createdAt: string
}

export interface TimeEntry {
  id: string
  description: string
  projectId: string
  startTime: string // ISO string
  endTime: string // ISO string
  durationSeconds: number
  billable: boolean
  tags: string[]
  note?: string
  date: string // YYYY-MM-DD
}

export type TimerMode = 'stopwatch' | 'pomodoro'
export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak'

export interface ActiveTimer {
  isRunning: boolean
  mode: TimerMode
  pomodoroPhase: PomodoroPhase
  startTime: number | null // epoch ms when current running stretch started
  elapsedSeconds: number // accumulated elapsed seconds before current stretch
  projectId: string
  description: string
  billable: boolean
  tags: string[]
  pomodoroTargetSeconds: number // e.g. 25 * 60
}

export interface UserSettings {
  userName: string
  userEmail: string
  workspaceName: string
  currency: string
  defaultHourlyRate: number
  dailyGoalHours: number
  weeklyGoalHours: number
  soundEnabled: boolean
  theme: 'light' | 'dark'
  pomodoroWorkMin: number
  pomodoroShortBreakMin: number
  pomodoroLongBreakMin: number
}

export type ViewType = 'overview' | 'entries' | 'projects' | 'reports' | 'calendar' | 'settings'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  type?: 'success' | 'info' | 'warning'
}

export interface DayActivity {
  dayLabel: string
  dateStr: string
  totalSeconds: number
  billableSeconds: number
  isToday: boolean
}
