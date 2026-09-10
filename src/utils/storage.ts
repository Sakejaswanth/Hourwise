import type { ActiveTimer, Project, TimeEntry, UserSettings } from '../types'
import { getRelativeDateStr, getTodayDateStr } from './time'

const STORAGE_KEYS = {
  ENTRIES: 'hourly_entries_v2',
  PROJECTS: 'hourly_projects_v2',
  ACTIVE_TIMER: 'hourly_active_timer_v2',
  SETTINGS: 'hourly_settings_v2',
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Luma Redesign',
    client: 'Luma Labs',
    color: 'coral',
    hourlyRate: 95,
    budgetHours: 45,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'proj-2',
    name: 'Northstar Design System',
    client: 'Northstar Inc',
    color: 'mint',
    hourlyRate: 110,
    budgetHours: 60,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'proj-3',
    name: 'Fintech Mobile Flow',
    client: 'Apex Capital',
    color: 'lavender',
    hourlyRate: 125,
    budgetHours: 80,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'proj-4',
    name: 'Internal Ops & Strategy',
    client: 'Studio Internal',
    color: 'amber',
    hourlyRate: 0,
    budgetHours: 25,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'proj-5',
    name: 'Cloud Dashboard Portal',
    client: 'Orion Tech',
    color: 'sky',
    hourlyRate: 105,
    budgetHours: 50,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
]

export const INITIAL_SETTINGS: UserSettings = {
  userName: 'Jaswanth',
  userEmail: 'jaswanth@studio.co',
  workspaceName: 'Personal workspace',
  currency: '$',
  defaultHourlyRate: 95,
  dailyGoalHours: 6,
  weeklyGoalHours: 32,
  soundEnabled: true,
  theme: 'light',
  pomodoroWorkMin: 25,
  pomodoroShortBreakMin: 5,
  pomodoroLongBreakMin: 15,
}

export function generateSeedEntries(): TimeEntry[] {
  const today = getTodayDateStr()
  const d1 = getRelativeDateStr(-1)
  const d2 = getRelativeDateStr(-2)
  const d3 = getRelativeDateStr(-3)
  const d4 = getRelativeDateStr(-4)
  const d5 = getRelativeDateStr(-5)

  return [
    // Today entries
    {
      id: 'entry-1',
      description: 'Mobile onboarding flow & friction audit',
      projectId: 'proj-1',
      startTime: `${today}T09:30:00.000Z`,
      endTime: `${today}T11:44:32.000Z`,
      durationSeconds: 2 * 3600 + 14 * 60 + 32, // 02:14:32
      billable: true,
      tags: ['ux', 'mobile', 'wireframing'],
      note: 'Refined the activation path and drop-off funnel.',
      date: today,
    },
    {
      id: 'entry-2',
      description: 'Design system audit & form states',
      projectId: 'proj-2',
      startTime: `${today}T13:00:00.000Z`,
      endTime: `${today}T14:42:18.000Z`,
      durationSeconds: 1 * 3600 + 42 * 60 + 18, // 01:42:18
      billable: true,
      tags: ['ui-kit', 'tokens', 'accessibility'],
      note: 'Button and form states specification in Figma.',
      date: today,
    },
    {
      id: 'entry-3',
      description: 'Sprint planning & backlog grooming',
      projectId: 'proj-1',
      startTime: `${today}T15:15:00.000Z`,
      endTime: `${today}T16:03:09.000Z`,
      durationSeconds: 48 * 60 + 9, // 00:48:09
      billable: true,
      tags: ['planning', 'client-meeting'],
      note: 'Q3 roadmap alignment with engineering lead.',
      date: today,
    },

    // Yesterday entries
    {
      id: 'entry-4',
      description: 'Design review & Stakeholder showcase',
      projectId: 'proj-3',
      startTime: `${d1}T10:00:00.000Z`,
      endTime: `${d1}T12:30:00.000Z`,
      durationSeconds: 2 * 3600 + 30 * 60, // 02:30:00
      billable: true,
      tags: ['presentation', 'feedback'],
      note: 'Presented payment checkout animations to VP of Product.',
      date: d1,
    },
    {
      id: 'entry-5',
      description: 'Bi-weekly studio sync & operations',
      projectId: 'proj-4',
      startTime: `${d1}T14:00:00.000Z`,
      endTime: `${d1}T15:15:00.000Z`,
      durationSeconds: 1 * 3600 + 15 * 60, // 01:15:00
      billable: false,
      tags: ['internal', 'sync'],
      note: 'Resource capacity planning for upcoming quarter.',
      date: d1,
    },
    {
      id: 'entry-6',
      description: 'Security & compliance documentation',
      projectId: 'proj-3',
      startTime: `${d1}T15:45:00.000Z`,
      endTime: `${d1}T18:00:00.000Z`,
      durationSeconds: 2 * 3600 + 15 * 60, // 02:15:00
      billable: true,
      tags: ['compliance', 'security'],
      note: 'Biometric authentication error matrix document.',
      date: d1,
    },

    // 2 Days ago
    {
      id: 'entry-7',
      description: 'Cloud dashboard analytics widget architecture',
      projectId: 'proj-5',
      startTime: `${d2}T09:15:00.000Z`,
      endTime: `${d2}T13:00:00.000Z`,
      durationSeconds: 3 * 3600 + 45 * 60,
      billable: true,
      tags: ['frontend', 'react', 'dashboard'],
      note: 'Chart layout responsiveness & data caching.',
      date: d2,
    },
    {
      id: 'entry-8',
      description: 'Component documentation & Storybook setup',
      projectId: 'proj-2',
      startTime: `${d2}T14:30:00.000Z`,
      endTime: `${d2}T17:00:00.000Z`,
      durationSeconds: 2 * 3600 + 30 * 60,
      billable: true,
      tags: ['documentation', 'storybook'],
      note: 'Added interactive controls for DataGrid component.',
      date: d2,
    },

    // 3 Days ago
    {
      id: 'entry-9',
      description: 'High-fidelity prototyping of transaction detail',
      projectId: 'proj-3',
      startTime: `${d3}T10:00:00.000Z`,
      endTime: `${d3}T14:30:00.000Z`,
      durationSeconds: 4 * 3600 + 30 * 60,
      billable: true,
      tags: ['figma', 'prototype', 'micro-interactions'],
      note: 'Interactive micro-interactions and haptic feedbacks.',
      date: d3,
    },
    {
      id: 'entry-10',
      description: 'Architecture sync with backend team',
      projectId: 'proj-5',
      startTime: `${d3}T15:00:00.000Z`,
      endTime: `${d3}T16:45:00.000Z`,
      durationSeconds: 1 * 3600 + 45 * 60,
      billable: true,
      tags: ['backend', 'api-contracts'],
      note: 'Finalized GraphQL queries for the metrics widget.',
      date: d3,
    },

    // 4 Days ago
    {
      id: 'entry-11',
      description: 'User interviews analysis & synthesis',
      projectId: 'proj-1',
      startTime: `${d4}T09:30:00.000Z`,
      endTime: `${d4}T13:00:00.000Z`,
      durationSeconds: 3 * 3600 + 30 * 60,
      billable: true,
      tags: ['research', 'interviews'],
      note: 'Summarized 6 user feedback sessions into affinity map.',
      date: d4,
    },
    {
      id: 'entry-12',
      description: 'Weekly team retrospective',
      projectId: 'proj-4',
      startTime: `${d4}T14:00:00.000Z`,
      endTime: `${d4}T15:00:00.000Z`,
      durationSeconds: 1 * 3600,
      billable: false,
      tags: ['internal', 'retro'],
      note: 'Process improvements for handoffs to QA.',
      date: d4,
    },

    // 5 Days ago
    {
      id: 'entry-13',
      description: 'Design QA & Cross-browser verification',
      projectId: 'proj-2',
      startTime: `${d5}T10:30:00.000Z`,
      endTime: `${d5}T13:45:00.000Z`,
      durationSeconds: 3 * 3600 + 15 * 60,
      billable: true,
      tags: ['qa', 'testing'],
      note: 'Verified Safari, Chrome, and Firefox CSS rendering.',
      date: d5,
    },
  ]
}

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Failed to load projects from storage', e)
  }
  saveProjects(INITIAL_PROJECTS)
  return INITIAL_PROJECTS
}

export function saveProjects(projects: Project[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects))
  } catch (e) {
    console.error('Failed to save projects', e)
  }
}

export function loadEntries(): TimeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ENTRIES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) {
    console.error('Failed to load entries from storage', e)
  }
  const seed = generateSeedEntries()
  saveEntries(seed)
  return seed
}

export function saveEntries(entries: TimeEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries))
  } catch (e) {
    console.error('Failed to save entries', e)
  }
}

export function loadActiveTimer(): ActiveTimer {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_TIMER)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to load active timer', e)
  }
  return {
    isRunning: false,
    mode: 'stopwatch',
    pomodoroPhase: 'work',
    startTime: null,
    elapsedSeconds: 0,
    projectId: 'proj-1',
    description: 'Mobile onboarding flow',
    billable: true,
    tags: ['ux', 'mobile'],
    pomodoroTargetSeconds: 25 * 60,
  }
}

export function saveActiveTimer(timer: ActiveTimer): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TIMER, JSON.stringify(timer))
  } catch (e) {
    console.error('Failed to save active timer', e)
  }
}

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    if (raw) {
      return { ...INITIAL_SETTINGS, ...JSON.parse(raw) }
    }
  } catch (e) {
    console.error('Failed to load settings', e)
  }
  saveSettings(INITIAL_SETTINGS)
  return INITIAL_SETTINGS
}

export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  } catch (e) {
    console.error('Failed to save settings', e)
  }
}

export function resetToDemoData(): { projects: Project[]; entries: TimeEntry[]; settings: UserSettings } {
  saveProjects(INITIAL_PROJECTS)
  const seed = generateSeedEntries()
  saveEntries(seed)
  saveSettings(INITIAL_SETTINGS)
  saveActiveTimer({
    isRunning: false,
    mode: 'stopwatch',
    pomodoroPhase: 'work',
    startTime: null,
    elapsedSeconds: 0,
    projectId: 'proj-1',
    description: 'Mobile onboarding flow',
    billable: true,
    tags: ['ux', 'mobile'],
    pomodoroTargetSeconds: 25 * 60,
  })
  return { projects: INITIAL_PROJECTS, entries: seed, settings: INITIAL_SETTINGS }
}

export function exportBackupJSON(entries: TimeEntry[], projects: Project[], settings: UserSettings): string {
  return JSON.stringify(
    {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      settings,
      projects,
      entries,
    },
    null,
    2
  )
}
