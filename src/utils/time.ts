import type { ActiveTimer } from '../types'

/**
 * Accurately calculate the current elapsed seconds of an active timer
 * preventing drift when backgrounded.
 */
export function getCurrentElapsed(timer: ActiveTimer): number {
  if (!timer.isRunning || !timer.startTime) {
    return timer.elapsedSeconds
  }
  const additional = Math.max(0, Math.floor((Date.now() - timer.startTime) / 1000))
  return timer.elapsedSeconds + additional
}

export function formatHMS(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSec / 3600).toString().padStart(2, '0')
  const minutes = Math.floor((safeSec % 3600) / 60).toString().padStart(2, '0')
  const seconds = (safeSec % 60).toString().padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

export function formatHM(totalSeconds: number): string {
  const safeSec = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSec / 3600)
  const minutes = Math.floor((safeSec % 3600) / 60)
  if (hours === 0 && minutes === 0) return `${safeSec}s`
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function toDecimalHours(totalSeconds: number): number {
  return Number((totalSeconds / 3600).toFixed(2))
}

export function getTodayDateStr(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getRelativeDateStr(offsetDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatDisplayDate(dateStr: string): string {
  const today = getTodayDateStr()
  const yesterday = getRelativeDateStr(-1)
  
  const [y, m, d] = dateStr.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const formatted = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  })

  if (dateStr === today) return `Today, ${formatted}`
  if (dateStr === yesterday) return `Yesterday, ${formatted}`
  return formatted
}

export function formatTimeShort(isoString: string): string {
  try {
    const d = new Date(isoString)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return '--:--'
  }
}

/**
 * Returns the current Monday-Sunday week days info
 */
export function getCurrentWeekDays(): { dayLabel: string; dateStr: string; isToday: boolean }[] {
  const now = new Date()
  // Monday is 1, Sunday is 0
  const currentDay = now.getDay()
  const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay

  const monday = new Date(now)
  monday.setDate(now.getDate() + distanceToMonday)

  const days: { dayLabel: string; dateStr: string; isToday: boolean }[] = []
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const dateStr = `${y}-${m}-${day}`
    
    days.push({
      dayLabel: labels[i],
      dateStr,
      isToday: dateStr === getTodayDateStr(),
    })
  }

  return days
}
