import React, { useState } from 'react'
import {
  Check,
  Coffee,
  DollarSign,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Tag as TagIcon,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import type { PomodoroPhase, TimerMode } from '../../types'
import { formatHMS } from '../../utils/time'

export const TrackerHero: React.FC = () => {
  const {
    activeTimer,
    currentElapsed,
    projects,
    toggleTimer,
    stopAndSaveTimer,
    discardTimer,
    setTimerMode,
    updateTimerField,
    setIsProjectModalOpen,
  } = useTimeTracker()

  const [tagInputOpen, setTagInputOpen] = useState(false)
  const [newTagText, setNewTagText] = useState('')

  const activeProject = projects.find((p) => p.id === activeTimer.projectId) || projects[0]

  // Timer mode and calculations
  const isPomodoro = activeTimer.mode === 'pomodoro'
  const pomodoroRemaining = Math.max(0, activeTimer.pomodoroTargetSeconds - currentElapsed)
  const displayTime = isPomodoro ? formatHMS(pomodoroRemaining) : formatHMS(currentElapsed)

  const pomodoroProgressPercent = isPomodoro
    ? Math.min(100, Math.round((currentElapsed / (activeTimer.pomodoroTargetSeconds || 1)) * 100))
    : 0

  const handleModeChange = (mode: TimerMode) => {
    setTimerMode(mode, 'work')
  }

  const handlePomodoroPhase = (phase: PomodoroPhase) => {
    setTimerMode('pomodoro', phase)
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagText.trim()) {
      e.preventDefault()
      const clean = newTagText.trim().replace(/^#/, '').toLowerCase()
      if (!activeTimer.tags.includes(clean)) {
        updateTimerField('tags', [...activeTimer.tags, clean])
      }
      setNewTagText('')
      setTagInputOpen(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    updateTimerField(
      'tags',
      activeTimer.tags.filter((t) => t !== tagToRemove)
    )
  }

  return (
    <div className={`tracker-hero-card ${activeTimer.isRunning ? 'is-running' : ''}`}>
      {/* Background ambient circular rings */}
      <div className="hero-concentric-bg" aria-hidden="true" />

      {/* Top bar with mode selector */}
      <div className="hero-top-modes">
        <div className="mode-toggle-group">
          <button
            className={`mode-btn ${!isPomodoro ? 'active' : ''}`}
            onClick={() => handleModeChange('stopwatch')}
          >
            <Sparkles size={13} />
            <span>Stopwatch</span>
          </button>
          <button
            className={`mode-btn ${isPomodoro ? 'active' : ''}`}
            onClick={() => handleModeChange('pomodoro')}
          >
            <Flame size={13} />
            <span>Pomodoro Focus</span>
          </button>
        </div>

        {isPomodoro && (
          <div className="pomodoro-phases-group">
            <button
              className={`phase-btn ${activeTimer.pomodoroPhase === 'work' ? 'active' : ''}`}
              onClick={() => handlePomodoroPhase('work')}
            >
              Focus (25m)
            </button>
            <button
              className={`phase-btn ${activeTimer.pomodoroPhase === 'shortBreak' ? 'active' : ''}`}
              onClick={() => handlePomodoroPhase('shortBreak')}
            >
              <Coffee size={12} /> Short Break (5m)
            </button>
            <button
              className={`phase-btn ${activeTimer.pomodoroPhase === 'longBreak' ? 'active' : ''}`}
              onClick={() => handlePomodoroPhase('longBreak')}
            >
              Long Break (15m)
            </button>
          </div>
        )}
      </div>

      {/* Main hero body */}
      <div className="hero-body">
        <div className="hero-content">
          <div className="hero-status-row">
            <span className="live-pulse-dot" />
            <span className="hero-status-text">
              {activeTimer.isRunning
                ? isPomodoro
                  ? `Focusing on ${activeTimer.pomodoroPhase === 'work' ? 'task' : 'recharge'}`
                  : 'Currently tracking time'
                : 'Ready to focus'}
            </span>
            {isPomodoro && (
              <span className="pomodoro-progress-badge">{pomodoroProgressPercent}% completed</span>
            )}
          </div>

          <h2 className="hero-timer-display">{displayTime}</h2>

          {/* Inline task description input */}
          <div className="hero-task-row">
            <input
              type="text"
              className="hero-task-input"
              placeholder="What are you working on? (Type task description)"
              value={activeTimer.description}
              onChange={(e) => updateTimerField('description', e.target.value)}
            />
          </div>

          {/* Project selector, tags, billable controls */}
          <div className="hero-meta-row">
            <div className="project-select-wrapper">
              <span className={`project-swatch-badge ${activeProject?.color || 'coral'}`} />
              <select
                className="hero-project-select"
                value={activeTimer.projectId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsProjectModalOpen(true)
                  } else {
                    updateTimerField('projectId', e.target.value)
                  }
                }}
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.name} ({proj.client})
                  </option>
                ))}
                <option value="__new__">+ Create new project...</option>
              </select>
            </div>

            <div className="meta-separator" />

            {/* Billable toggle */}
            <button
              className={`hero-pill-btn billable-toggle ${activeTimer.billable ? 'is-billable' : ''}`}
              onClick={() => updateTimerField('billable', !activeTimer.billable)}
              title={activeTimer.billable ? 'Billable time' : 'Non-billable time'}
            >
              <DollarSign size={13} />
              <span>{activeTimer.billable ? 'Billable' : 'Non-billable'}</span>
            </button>

            <div className="meta-separator" />

            {/* Tags list */}
            <div className="hero-tags-wrapper">
              {activeTimer.tags.map((tag) => (
                <span className="tag-chip" key={tag}>
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    aria-label={`Remove tag ${tag}`}
                  >
                    ×
                  </button>
                </span>
              ))}

              {tagInputOpen ? (
                <input
                  type="text"
                  className="tag-add-input"
                  placeholder="tag name + enter"
                  value={newTagText}
                  onChange={(e) => setNewTagText(e.target.value)}
                  onKeyDown={handleAddTag}
                  onBlur={() => setTagInputOpen(false)}
                  autoFocus
                />
              ) : (
                <button
                  className="tag-add-btn"
                  onClick={() => setTagInputOpen(true)}
                  title="Add tag"
                >
                  <TagIcon size={12} />
                  <span>+ Tag</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="hero-actions">
          <button
            className={`hero-main-play-btn ${activeTimer.isRunning ? 'running' : ''}`}
            onClick={toggleTimer}
            aria-label={activeTimer.isRunning ? 'Pause timer' : 'Start timer'}
          >
            {activeTimer.isRunning ? (
              <>
                <Pause size={20} fill="currentColor" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={20} fill="currentColor" />
                <span>Start</span>
              </>
            )}
          </button>

          {currentElapsed > 0 && (
            <button
              className="hero-save-btn"
              onClick={stopAndSaveTimer}
              title="Stop & log entry"
              aria-label="Save time entry"
            >
              <Check size={18} />
              <span>Log Entry</span>
            </button>
          )}

          {currentElapsed > 0 && (
            <button
              className="hero-reset-btn"
              onClick={discardTimer}
              title="Reset timer to 0"
              aria-label="Reset timer"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Pomodoro visual progress bar */}
      {isPomodoro && (
        <div className="hero-pomodoro-bar-track">
          <div
            className="hero-pomodoro-bar-fill"
            style={{ width: `${pomodoroProgressPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}
