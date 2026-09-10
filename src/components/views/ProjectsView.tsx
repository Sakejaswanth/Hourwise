import React, { useState } from 'react'
import {
  Edit3,
  FolderKanban,
  Play,
  Plus,
  Target,
  Trash2,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import { formatHM, toDecimalHours } from '../../utils/time'
import type { Project } from '../../types'

export const ProjectsView: React.FC = () => {
  const {
    projects,
    entries,
    settings,
    deleteProject,
    setEditingProject,
    setIsProjectModalOpen,
    startTimer,
    updateTimerField,
  } = useTimeTracker()

  const [filterQuery, setFilterQuery] = useState('')

  // Calculate project metrics
  const projectMetrics = projects.map((proj) => {
    const projEntries = entries.filter((e) => e.projectId === proj.id)
    const totalSeconds = projEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0)
    const totalHours = toDecimalHours(totalSeconds)
    const billableSeconds = projEntries
      .filter((e) => e.billable)
      .reduce((acc, curr) => acc + curr.durationSeconds, 0)
    const billableHours = toDecimalHours(billableSeconds)
    const totalEarnings = billableHours * proj.hourlyRate

    const budget = proj.budgetHours || 0
    const budgetPercent = budget > 0 ? Math.round((totalHours / budget) * 100) : 0
    const isOverBudget = budget > 0 && totalHours > budget

    return {
      ...proj,
      entriesCount: projEntries.length,
      totalSeconds,
      totalHours,
      billableHours,
      totalEarnings,
      budget,
      budgetPercent,
      isOverBudget,
    }
  })

  const filteredProjects = projectMetrics.filter(
    (p) =>
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const handleStartProjectTimer = (proj: Project) => {
    updateTimerField('projectId', proj.id)
    updateTimerField('description', `Work on ${proj.name}`)
    updateTimerField('billable', proj.hourlyRate > 0)
    startTimer()
  }

  return (
    <div className="page-content">
      {/* Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">Client Work & Retainers</p>
          <h1>Projects & Budgets <span>✦</span></h1>
          <p className="subheading">
            Track billable rates, budget ceilings, and total time spent across your client roster.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="new-entry"
            onClick={() => {
              setEditingProject(null)
              setIsProjectModalOpen(true)
            }}
          >
            <Plus size={16} />
            <span>Create Project</span>
          </button>
        </div>
      </section>

      {/* Filter and stats row */}
      <section className="projects-top-bar">
        <div className="filter-input-wrapper" style={{ maxWidth: '340px' }}>
          <FolderKanban size={14} className="filter-icon" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />
        </div>

        <div className="projects-summary-stats">
          <span className="summary-pill">
            <strong>{projects.length}</strong> Active Projects
          </span>
          <span className="summary-pill">
            <strong>
              {settings.currency}
              {projectMetrics
                .reduce((acc, curr) => acc + curr.totalEarnings, 0)
                .toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>{' '}
            Total Revenue
          </span>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="projects-grid">
        {filteredProjects.length === 0 ? (
          <div className="empty-state-card" style={{ gridColumn: '1 / -1', padding: '60px 20px' }}>
            <p>No projects match "{filterQuery}".</p>
            <button
              className="btn-secondary btn-sm"
              onClick={() => {
                setEditingProject(null)
                setIsProjectModalOpen(true)
              }}
            >
              <Plus size={13} /> Create Project
            </button>
          </div>
        ) : (
          filteredProjects.map((p) => (
            <div className="project-card" key={p.id}>
              <div className="project-card-header">
                <div className="project-brand-row">
                  <span className={`project-color-bar ${p.color}`} />
                  <div>
                    <h3 className="project-title">{p.name}</h3>
                    <span className="project-client-name">{p.client}</span>
                  </div>
                </div>

                <div className="project-card-actions">
                  <button
                    className="icon-action-btn"
                    onClick={() => {
                      setEditingProject(p)
                      setIsProjectModalOpen(true)
                    }}
                    title="Edit project"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="icon-action-btn delete"
                    onClick={() => {
                      if (confirm(`Delete project "${p.name}"? Entries will remain in history.`)) {
                        deleteProject(p.id)
                      }
                    }}
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Stats row */}
              <div className="project-stats-row">
                <div className="proj-stat">
                  <small>Total Time</small>
                  <strong>{formatHM(p.totalSeconds)}</strong>
                </div>
                <div className="proj-stat">
                  <small>Rate</small>
                  <strong>
                    {settings.currency}
                    {p.hourlyRate}/h
                  </strong>
                </div>
                <div className="proj-stat">
                  <small>Total Earned</small>
                  <strong className="positive">
                    {settings.currency}
                    {p.totalEarnings.toFixed(2)}
                  </strong>
                </div>
              </div>

              {/* Budget Progress Bar if budget set */}
              {p.budget > 0 && (
                <div className="project-budget-section">
                  <div className="budget-label-row">
                    <span className="budget-target">
                      <Target size={12} /> Budget: {p.budget}h
                    </span>
                    <span className={`budget-percent ${p.isOverBudget ? 'over' : ''}`}>
                      {p.totalHours}h ({p.budgetPercent}%)
                    </span>
                  </div>
                  <div className="budget-progress-track">
                    <div
                      className={`budget-progress-fill ${p.isOverBudget ? 'danger' : p.color}`}
                      style={{ width: `${Math.min(100, p.budgetPercent)}%` }}
                    />
                  </div>
                  {p.isOverBudget && (
                    <span className="over-budget-warning">
                      ⚠ Exceeded budget by {(p.totalHours - p.budget).toFixed(1)}h
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="project-card-footer">
                <span className="project-entries-tag">
                  {p.entriesCount} {p.entriesCount === 1 ? 'entry' : 'entries'} logged
                </span>

                <button
                  className="project-start-timer-btn"
                  onClick={() => handleStartProjectTimer(p)}
                  title="Start tracking time on this project"
                >
                  <Play size={13} fill="currentColor" />
                  <span>Track</span>
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  )
}
