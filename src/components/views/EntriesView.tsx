import React, { useState, useMemo } from 'react'
import {
  Copy,
  Download,
  Edit3,
  Filter,
  Play,
  Plus,
  Trash2,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import { formatDisplayDate, formatHM, formatHMS, formatTimeShort, toDecimalHours } from '../../utils/time'
import { exportEntriesToCSV } from '../../utils/export'
import type { TimeEntry } from '../../types'

export const EntriesView: React.FC = () => {
  const {
    entries,
    projects,
    settings,
    resumeEntry,
    deleteEntry,
    duplicateEntry,
    setEditingEntry,
    setIsManualModalOpen,
    globalSearch,
  } = useTimeTracker()

  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL')
  const [selectedBillable, setSelectedBillable] = useState<'ALL' | 'BILLABLE' | 'NON_BILLABLE'>('ALL')
  const [selectedTag, setSelectedTag] = useState<string>('ALL')
  const [localSearch, setLocalSearch] = useState<string>('')

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>()
    entries.forEach((e) => e.tags.forEach((t) => set.add(t)))
    return Array.from(set).sort()
  }, [entries])

  // Filter entries
  const filteredEntries = useMemo(() => {
    const activeSearch = (localSearch || globalSearch).toLowerCase().trim()

    return entries.filter((e) => {
      // Project filter
      if (selectedProjectId !== 'ALL' && e.projectId !== selectedProjectId) return false

      // Billable filter
      if (selectedBillable === 'BILLABLE' && !e.billable) return false
      if (selectedBillable === 'NON_BILLABLE' && e.billable) return false

      // Tag filter
      if (selectedTag !== 'ALL' && !e.tags.includes(selectedTag)) return false

      // Search filter
      if (activeSearch) {
        const proj = projectMap.get(e.projectId)
        const combined = `${e.description} ${proj?.name || ''} ${proj?.client || ''} ${e.tags.join(' ')} ${e.note || ''}`.toLowerCase()
        if (!combined.includes(activeSearch)) return false
      }

      return true
    })
  }, [entries, selectedProjectId, selectedBillable, selectedTag, localSearch, globalSearch, projectMap])

  // Group entries by Date string (descending)
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, TimeEntry[]>()
    filteredEntries.forEach((entry) => {
      const list = groups.get(entry.date) || []
      list.push(entry)
      groups.set(entry.date, list)
    })

    // Sort dates descending
    return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredEntries])

  // Summary of filtered entries
  const totalFilteredSeconds = useMemo(
    () => filteredEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0),
    [filteredEntries]
  )

  const totalFilteredEarnings = useMemo(() => {
    return filteredEntries.reduce((acc, curr) => {
      if (!curr.billable) return acc
      const proj = projectMap.get(curr.projectId)
      const rate = proj ? proj.hourlyRate : settings.defaultHourlyRate
      return acc + toDecimalHours(curr.durationSeconds) * rate
    }, 0)
  }, [filteredEntries, projectMap, settings.defaultHourlyRate])

  return (
    <div className="page-content">
      {/* Heading & Top Actions */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">Detailed Timesheet Log</p>
          <h1>Time Entries <span>✦</span></h1>
          <p className="subheading">
            Review, edit, and organize your tracked hours by date and project.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="btn-secondary"
            onClick={() => exportEntriesToCSV(filteredEntries, projects)}
            title="Download CSV report of filtered entries"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            className="new-entry"
            onClick={() => setIsManualModalOpen(true)}
          >
            <Plus size={16} />
            <span>Add Entry</span>
          </button>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="entries-filter-bar">
        <div className="filter-input-wrapper">
          <Filter size={14} className="filter-icon" />
          <input
            type="text"
            placeholder="Filter by description or notes..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          {/* Project filter */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Billable filter */}
          <select
            value={selectedBillable}
            onChange={(e) => setSelectedBillable(e.target.value as any)}
            className="filter-select"
          >
            <option value="ALL">All Rates</option>
            <option value="BILLABLE">Billable Only ($)</option>
            <option value="NON_BILLABLE">Non-billable Only</option>
          </select>

          {/* Tag filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">All Tags</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                #{tag}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Filter Summary Banner */}
      <div className="entries-summary-banner">
        <div>
          <span>Showing <strong>{filteredEntries.length}</strong> entries</span>
        </div>
        <div className="summary-banner-right">
          <span>Total: <strong>{formatHM(totalFilteredSeconds)}</strong></span>
          <span className="divider-dot">·</span>
          <span>
            Billable Value: <strong>{settings.currency}{totalFilteredEarnings.toFixed(2)}</strong>
          </span>
        </div>
      </div>

      {/* Grouped Entries List */}
      <div className="grouped-entries-container">
        {groupedEntries.length === 0 ? (
          <div className="empty-state-card" style={{ padding: '60px 20px' }}>
            <p>No time entries match your selected filters.</p>
            <button
              className="btn-secondary btn-sm"
              onClick={() => {
                setSelectedProjectId('ALL')
                setSelectedBillable('ALL')
                setSelectedTag('ALL')
                setLocalSearch('')
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          groupedEntries.map(([dateStr, dayEntries]) => {
            const dayTotalSec = dayEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0)
            const dayBillableAmount = dayEntries.reduce((acc, curr) => {
              if (!curr.billable) return acc
              const proj = projectMap.get(curr.projectId)
              const rate = proj ? proj.hourlyRate : settings.defaultHourlyRate
              return acc + toDecimalHours(curr.durationSeconds) * rate
            }, 0)

            return (
              <div className="date-group-card" key={dateStr}>
                <div className="date-group-header">
                  <div className="date-group-title">
                    <h4>{formatDisplayDate(dateStr)}</h4>
                    <span className="entries-count-tag">{dayEntries.length} entries</span>
                  </div>
                  <div className="date-group-subtotal">
                    <span className="day-total-hours">{formatHM(dayTotalSec)}</span>
                    {dayBillableAmount > 0 && (
                      <span className="day-total-earnings">
                        {settings.currency}{dayBillableAmount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="date-group-rows">
                  {dayEntries.map((entry) => {
                    const proj = projectMap.get(entry.projectId)
                    return (
                      <div className="entry-row detailed-row" key={entry.id}>
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
                            {entry.note && (
                              <>
                                <span>·</span>
                                <span className="entry-note-preview">{entry.note}</span>
                              </>
                            )}
                          </small>

                          {entry.tags.length > 0 && (
                            <div className="entry-tags-row">
                              {entry.tags.map((tag) => (
                                <span className="tag-chip-small" key={tag}>
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="entry-time-col">
                          <time className="entry-duration">{formatHMS(entry.durationSeconds)}</time>
                          <small className="entry-time-range">
                            {formatTimeShort(entry.startTime)} – {formatTimeShort(entry.endTime)}
                          </small>
                        </div>

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
                            onClick={() => duplicateEntry(entry.id)}
                            title="Duplicate entry"
                            aria-label="Duplicate entry"
                          >
                            <Copy size={13} />
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
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
