import React, { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import {
  formatDisplayDate,
  formatHM,
  formatTimeShort,
  getTodayDateStr,
} from '../../utils/time'
import type { TimeEntry } from '../../types'

export const CalendarView: React.FC = () => {
  const { entries, projects, setEditingEntry, setIsManualModalOpen } = useTimeTracker()

  // Week offset from current week (0 = current week, -1 = last week, +1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0)

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  // Calculate the 7 days of the selected week
  const weekDays = useMemo(() => {
    const now = new Date()
    const currentDay = now.getDay()
    const distanceToMonday = (currentDay === 0 ? -6 : 1 - currentDay) + weekOffset * 7

    const monday = new Date(now)
    monday.setDate(now.getDate() + distanceToMonday)

    const days: { dayLabel: string; dateStr: string; dayNum: number; isToday: boolean }[] = []
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = getTodayDateStr()

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const dateStr = `${y}-${m}-${day}`

      days.push({
        dayLabel: dayNames[i],
        dateStr,
        dayNum: d.getDate(),
        isToday: dateStr === today,
      })
    }

    return days
  }, [weekOffset])

  const hoursGrid = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

  // Map entries to days
  const entriesByDay = useMemo(() => {
    const map = new Map<string, TimeEntry[]>()
    weekDays.forEach((d) => map.set(d.dateStr, []))

    entries.forEach((e) => {
      if (map.has(e.date)) {
        map.get(e.date)!.push(e)
      }
    })

    return map
  }, [entries, weekDays])

  // Calculate top & height for an entry within the 8 AM - 8 PM (12 hours) timeline
  const getEntryStyle = (entry: TimeEntry) => {
    let startHour = 9
    let startMin = 0
    try {
      const d = new Date(entry.startTime)
      startHour = d.getHours()
      startMin = d.getMinutes()
    } catch {}

    const timelineStartHour = 8
    const totalTimelineHours = 12 // 8am to 8pm

    const hoursFromStart = Math.max(0, Math.min(totalTimelineHours, startHour + startMin / 60 - timelineStartHour))
    const durationHours = Math.max(0.5, Math.min(totalTimelineHours - hoursFromStart, entry.durationSeconds / 3600))

    const topPercent = (hoursFromStart / totalTimelineHours) * 100
    const heightPercent = Math.max(4, (durationHours / totalTimelineHours) * 100)

    return {
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
    }
  }

  const rangeTitle = `${formatDisplayDate(weekDays[0].dateStr)} – ${formatDisplayDate(weekDays[6].dateStr)}`

  return (
    <div className="page-content calendar-page">
      {/* Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">Visual Schedule & Rhythms</p>
          <h1>Calendar Timeline <span>✦</span></h1>
          <p className="subheading">
            Map out your deep work blocks, client meetings, and breaks across the week.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="new-entry"
            onClick={() => setIsManualModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Entry</span>
          </button>
        </div>
      </section>

      {/* Week Navigator Bar */}
      <div className="calendar-nav-bar">
        <div className="calendar-nav-controls">
          <button
            className="cal-nav-btn"
            onClick={() => setWeekOffset((v) => v - 1)}
            aria-label="Previous week"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            className="cal-today-btn"
            onClick={() => setWeekOffset(0)}
            disabled={weekOffset === 0}
          >
            Current Week
          </button>

          <button
            className="cal-nav-btn"
            onClick={() => setWeekOffset((v) => v + 1)}
            aria-label="Next week"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <strong className="calendar-range-title">{rangeTitle}</strong>
      </div>

      {/* Calendar Grid Container */}
      <div className="calendar-grid-card">
        {/* Days Header */}
        <div className="calendar-header-row">
          <div className="calendar-time-gutter-header">
            <Clock size={14} />
          </div>
          {weekDays.map((day) => {
            const dayEntries = entriesByDay.get(day.dateStr) || []
            const daySec = dayEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0)

            return (
              <div
                className={`calendar-day-header ${day.isToday ? 'today' : ''}`}
                key={day.dateStr}
              >
                <div className="day-name">{day.dayLabel}</div>
                <div className="day-number">{day.dayNum}</div>
                {daySec > 0 && <small className="day-total">{formatHM(daySec)}</small>}
              </div>
            )
          })}
        </div>

        {/* Timeline Body */}
        <div className="calendar-body">
          {/* Time Gutter */}
          <div className="calendar-time-gutter">
            {hoursGrid.map((hour) => (
              <div className="time-gutter-slot" key={hour}>
                <span>{hour}:00</span>
              </div>
            ))}
          </div>

          {/* 7 Columns */}
          <div className="calendar-columns-container">
            {/* Horizontal Grid lines */}
            <div className="calendar-grid-lines" aria-hidden="true">
              {hoursGrid.map((hour) => (
                <div className="grid-hour-line" key={hour} />
              ))}
            </div>

            {/* Columns with Blocks */}
            <div className="calendar-days-columns">
              {weekDays.map((day) => {
                const dayEntries = entriesByDay.get(day.dateStr) || []

                return (
                  <div
                    key={day.dateStr}
                    className={`calendar-column ${day.isToday ? 'current-column' : ''}`}
                  >
                    {dayEntries.map((entry) => {
                      const proj = projectMap.get(entry.projectId)
                      const style = getEntryStyle(entry)

                      return (
                        <div
                          key={entry.id}
                          className={`calendar-entry-block ${proj?.color || 'coral'}`}
                          style={style}
                          onClick={() => {
                            setEditingEntry(entry)
                            setIsManualModalOpen(true)
                          }}
                          title={`${entry.description} (${formatHM(entry.durationSeconds)})`}
                        >
                          <div className="block-title">
                            <strong>{entry.description}</strong>
                            {entry.billable && <span className="block-billable-dot">$</span>}
                          </div>
                          <div className="block-meta">
                            <span>{proj?.name || 'General'}</span>
                            <small>{formatTimeShort(entry.startTime)}</small>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
