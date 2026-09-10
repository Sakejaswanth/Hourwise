import React, { useState } from 'react'
import {
  CalendarDays,
  DollarSign,
  Edit3,
  Flame,
  Play,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import { StatCard } from '../common/StatCard'
import { TrackerHero } from '../timer/TrackerHero'
import {
  formatDisplayDate,
  formatHM,
  formatHMS,
  getCurrentWeekDays,
  getRelativeDateStr,
  getTodayDateStr,
  toDecimalHours,
} from '../../utils/time'
import type { TimeEntry } from '../../types'

export const OverviewView: React.FC = () => {
  const {
    entries,
    projects,
    settings,
    resumeEntry,
    deleteEntry,
    setEditingEntry,
    setIsManualModalOpen,
    setActiveView,
    globalSearch,
  } = useTimeTracker()

  const [activeTab, setActiveTab] = useState<'Today' | 'Yesterday' | 'This week' | 'All'>('Today')
  const [hoveredBar, setHoveredBar] = useState<{ dayLabel: string; dateStr: string; hours: number } | null>(null)

  const currentDate = new Date()
  const hour = currentDate.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const dateLabel = currentDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const today = getTodayDateStr()
  const yesterday = getRelativeDateStr(-1)
  const weekDays = getCurrentWeekDays()
  const weekDateStrs = new Set(weekDays.map((d) => d.dateStr))

  // Project lookup
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  // Filter entries based on search if typed
  const searchedEntries = globalSearch
    ? entries.filter((e) => {
        const p = projectMap.get(e.projectId)
        const text = `${e.description} ${p?.name || ''} ${p?.client || ''} ${e.tags.join(' ')} ${e.note || ''}`.toLowerCase()
        return text.includes(globalSearch.toLowerCase())
      })
    : entries

  // Calculations for Today
  const todayEntries = searchedEntries.filter((e) => e.date === today)
  const todaySeconds = todayEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0)

  // Calculations for This Week
  const weekEntries = searchedEntries.filter((e) => weekDateStrs.has(e.date))
  const weekSeconds = weekEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0)

  // Billable revenue this week
  const weekEarnings = weekEntries.reduce((acc, curr) => {
    if (!curr.billable) return acc
    const p = projectMap.get(curr.projectId)
    const rate = p ? p.hourlyRate : settings.defaultHourlyRate
    return acc + toDecimalHours(curr.durationSeconds) * rate
  }, 0)

  // Focus score calculation (scale of 0-100 based on consistency and deep work)
  const todayGoalSec = settings.dailyGoalHours * 3600
  const progressRatio = Math.min(1.2, todaySeconds / (todayGoalSec || 1))
  const rawScore = Math.round(progressRatio * 85 + (todayEntries.length > 0 ? 10 : 0))
  const focusScore = Math.min(100, Math.max(15, rawScore))

  // Filter entries for the recent panel
  let filteredEntries: TimeEntry[] = []
  if (activeTab === 'Today') {
    filteredEntries = searchedEntries.filter((e) => e.date === today)
  } else if (activeTab === 'Yesterday') {
    filteredEntries = searchedEntries.filter((e) => e.date === yesterday)
  } else if (activeTab === 'This week') {
    filteredEntries = weekEntries
  } else {
    filteredEntries = searchedEntries
  }

  // Weekly bar chart data
  const weekBarData = weekDays.map((day) => {
    const daySec = entries
      .filter((e) => e.date === day.dateStr)
      .reduce((acc, curr) => acc + curr.durationSeconds, 0)
    const hours = toDecimalHours(daySec)
    return {
      ...day,
      hours,
      seconds: daySec,
    }
  })

  const maxBarHours = Math.max(8, ...weekBarData.map((d) => d.hours))

  // Project breakdown for sidebar widget
  const projectSecondsMap = new Map<string, number>()
  weekEntries.forEach((e) => {
    const prev = projectSecondsMap.get(e.projectId) || 0
    projectSecondsMap.set(e.projectId, prev + e.durationSeconds)
  })

  const sortedProjectBreakdown = Array.from(projectSecondsMap.entries())
    .map(([projectId, seconds]) => {
      const proj = projectMap.get(projectId)
      return {
        id: projectId,
        name: proj?.name || 'Unknown Project',
        color: proj?.color || 'coral',
        seconds,
        percent: weekSeconds > 0 ? Math.round((seconds / weekSeconds) * 100) : 0,
      }
    })
    .sort((a, b) => b.seconds - a.seconds)
    .slice(0, 4)

  return (
    <div className="page-content">
      {/* Page Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">{dateLabel}</p>
          <h1>
            {greeting}, {settings.userName} <span>✦</span>
          </h1>
          <p className="subheading">
            Make today meaningful. One focused hour at a time.
          </p>
        </div>
        <div className="heading-actions">
          <button
            className="new-entry"
            onClick={() => setIsManualModalOpen(true)}
          >
            <Plus size={17} />
            <span>Manual Entry</span>
          </button>
        </div>
      </section>

      {/* Hero Tracker Section */}
      <TrackerHero />

      {/* Stats KPI Grid */}
      <section className="stats-grid">
        <StatCard
          label="Today's Focus"
          value={formatHM(todaySeconds)}
          icon={<CalendarDays size={18} />}
          iconColorClass="sun"
          subtext={
            <span>
              Goal: {settings.dailyGoalHours}h ({Math.min(100, Math.round((todaySeconds / (todayGoalSec || 1)) * 100))}%)
            </span>
          }
        />

        <StatCard
          label="This Week"
          value={formatHM(weekSeconds)}
          icon={<Target size={18} />}
          iconColorClass="violet"
          subtext={
            <span className="streak-tag">
              <Flame size={12} color="#f47f68" /> 5-day streak active
            </span>
          }
        />

        <StatCard
          label="Billable Earnings"
          value={`${settings.currency}${weekEarnings.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign size={18} />}
          iconColorClass="emerald"
          subtext={
            <span className="positive">
              <TrendingUp size={12} /> {weekEntries.filter((e) => e.billable).length} billable tasks
            </span>
          }
        />

        <StatCard
          label="Focus Score"
          value={`${focusScore}/100`}
          icon={<Flame size={18} />}
          iconColorClass="yellow"
          subtext={<span className="positive">Top 10% deep work consistency</span>}
        />
      </section>

      {/* Main Dashboard Two-Column Grid */}
      <section className="dashboard-grid">
        {/* Left Column: Recent Entries Log */}
        <div className="entries-panel">
          <div className="section-heading">
            <div>
              <h3>Recent time entries</h3>
              <p>Your work captured in real time.</p>
            </div>
            <button className="text-button" onClick={() => setActiveView('entries')}>
              View all entries <span>→</span>
            </button>
          </div>

          <div className="tabs">
            {(['Today', 'Yesterday', 'This week', 'All'] as const).map((tab) => (
              <button
                key={tab}
                className={activeTab === tab ? 'selected' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="entry-list">
            {filteredEntries.length === 0 ? (
              <div className="empty-state-card">
                <p>No time entries found for {activeTab.toLowerCase()}.</p>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setIsManualModalOpen(true)}
                >
                  <Plus size={13} /> Add an entry
                </button>
              </div>
            ) : (
              filteredEntries.slice(0, 6).map((entry) => {
                const proj = projectMap.get(entry.projectId)
                return (
                  <article className="entry-row" key={entry.id}>
                    <span className={`entry-color ${proj?.color || 'coral'}`} />

                    <div className="entry-details">
                      <div className="entry-title-line">
                        <strong>{entry.description}</strong>
                        {entry.billable && (
                          <span className="billable-icon-badge" title="Billable entry">
                            $
                          </span>
                        )}
                      </div>
                      <small>
                        <span className="entry-proj-name">{proj?.name || 'General'}</span>
                        {proj?.client && (
                          <>
                            <span>·</span>
                            <span>{proj.client}</span>
                          </>
                        )}
                        {entry.tags.length > 0 && (
                          <>
                            <span>·</span>
                            <span className="entry-tag-list">
                              {entry.tags.map((t) => `#${t}`).join(' ')}
                            </span>
                          </>
                        )}
                      </small>
                    </div>

                    <time className="entry-duration">{formatHMS(entry.durationSeconds)}</time>

                    <div className="entry-actions-group">
                      <button
                        className="entry-action-btn play-again"
                        onClick={() => resumeEntry(entry)}
                        title="Resume / Start timer for this task"
                        aria-label="Resume task timer"
                      >
                        <Play size={13} fill="currentColor" />
                      </button>

                      <button
                        className="entry-action-btn"
                        onClick={() => {
                          setEditingEntry(entry)
                          setIsManualModalOpen(true)
                        }}
                        title="Edit entry"
                        aria-label="Edit entry"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        className="entry-action-btn delete"
                        onClick={() => deleteEntry(entry.id)}
                        title="Delete entry"
                        aria-label="Delete entry"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Weekly Focus Chart & Project Breakdown */}
        <div className="focus-panel">
          <div className="section-heading">
            <div>
              <h3>Weekly focus & activity</h3>
              <p>Goal: {settings.weeklyGoalHours}h / week</p>
            </div>
            <button className="text-button" onClick={() => setActiveView('reports')}>
              Full report <span>→</span>
            </button>
          </div>

          <div className="chart">
            <div className="chart-labels">
              <span>Goal: {settings.weeklyGoalHours}h</span>
              <strong>{formatHM(weekSeconds)} tracked</strong>
            </div>

            {/* Custom SVG Interactive Bar Chart */}
            <div className="svg-chart-container">
              <svg viewBox="0 0 320 120" className="weekly-activity-svg">
                {/* Horizontal reference lines */}
                <line x1="10" y1="30" x2="310" y2="30" stroke="var(--line)" strokeDasharray="3 3" />
                <line x1="10" y1="70" x2="310" y2="70" stroke="var(--line)" strokeDasharray="3 3" />
                <line x1="10" y1="100" x2="310" y2="100" stroke="var(--line)" />

                {weekBarData.map((d, index) => {
                  const barWidth = 24
                  const spacing = 42
                  const x = 20 + index * spacing
                  const barHeight = Math.min(85, Math.max(6, (d.hours / maxBarHours) * 85))
                  const y = 100 - barHeight
                  const isCurrent = d.isToday

                  return (
                    <g
                      key={d.dateStr}
                      className="bar-group"
                      onMouseEnter={() => setHoveredBar(d)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx={4}
                        className={`bar-rect ${isCurrent ? 'current-day' : ''}`}
                      />
                      <text
                        x={x + barWidth / 2}
                        y={116}
                        textAnchor="middle"
                        className={`bar-label-text ${isCurrent ? 'active' : ''}`}
                      >
                        {d.dayLabel}
                      </text>
                    </g>
                  )
                })}
              </svg>

              {/* Hover Tooltip */}
              {hoveredBar && (
                <div className="chart-tooltip">
                  <strong>{formatDisplayDate(hoveredBar.dateStr)}</strong>
                  <span>{hoveredBar.hours} hours tracked</span>
                </div>
              )}
            </div>
          </div>

          {/* Project distribution list */}
          <div className="project-distribution-section">
            <h4 className="subheading-small">Project distribution this week</h4>
            {sortedProjectBreakdown.length === 0 ? (
              <small className="muted-text">No project hours logged yet this week.</small>
            ) : (
              <div className="dist-list">
                {sortedProjectBreakdown.map((item) => (
                  <div className="dist-row" key={item.id}>
                    <div className="dist-header">
                      <span className="dist-name">
                        <span className={`swatch-circle ${item.color}`} />
                        {item.name}
                      </span>
                      <span className="dist-meta">
                        {formatHM(item.seconds)} <strong>({item.percent}%)</strong>
                      </span>
                    </div>
                    <div className="dist-bar-track">
                      <div
                        className={`dist-bar-fill ${item.color}`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
