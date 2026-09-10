import React, { useState } from 'react'
import { X, Clock, Calendar, Tag, FileText, Check } from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import { getTodayDateStr } from '../../utils/time'

const ManualEntryModalContent: React.FC = () => {
  const {
    setIsManualModalOpen,
    editingEntry,
    setEditingEntry,
    projects,
    addManualEntry,
    updateEntry,
  } = useTimeTracker()

  const initialHours = editingEntry ? Math.floor(editingEntry.durationSeconds / 3600) : 1
  const initialMins = editingEntry ? Math.floor((editingEntry.durationSeconds % 3600) / 60) : 0

  const [description, setDescription] = useState(editingEntry?.description || '')
  const [projectId, setProjectId] = useState(editingEntry?.projectId || projects[0]?.id || '')
  const [date, setDate] = useState(editingEntry?.date || getTodayDateStr())
  const [hours, setHours] = useState(initialHours)
  const [minutes, setMinutes] = useState(initialMins)
  const [billable, setBillable] = useState(editingEntry?.billable ?? true)
  const [tagsInput, setTagsInput] = useState(editingEntry?.tags.join(', ') || '')
  const [note, setNote] = useState(editingEntry?.note || '')

  const handleClose = () => {
    setIsManualModalOpen(false)
    setEditingEntry(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totalSeconds = hours * 3600 + minutes * 60
    if (totalSeconds <= 0) {
      alert('Please enter a duration greater than 0.')
      return
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean)

    const startTime = `${date}T09:00:00.000Z`
    const endTime = `${date}T${String(9 + hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`

    if (editingEntry) {
      updateEntry(editingEntry.id, {
        description: description.trim() || 'Untitled task',
        projectId,
        date,
        durationSeconds: totalSeconds,
        billable,
        tags,
        note,
      })
    } else {
      addManualEntry({
        description: description.trim() || 'Untitled task',
        projectId: projectId || (projects[0]?.id ?? ''),
        startTime,
        endTime,
        durationSeconds: totalSeconds,
        billable,
        tags,
        note,
        date,
      })
    }

    handleClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{editingEntry ? 'Edit Time Entry' : 'Add Manual Time Entry'}</h3>
            <p>Log hours worked without running the active stopwatch.</p>
          </div>
          <button className="icon-close" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="entry-desc">What did you work on?</label>
            <input
              id="entry-desc"
              type="text"
              placeholder="e.g. Design review, client onboarding, backend API"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="entry-project">Project</label>
              <select
                id="entry-project"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.client})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="entry-date">
                <Calendar size={13} /> Date
              </label>
              <input
                id="entry-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Clock size={13} /> Duration
              </label>
              <div className="time-inputs-group">
                <div className="time-sub-input">
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span>hours</span>
                </div>
                <div className="time-sub-input">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <span>mins</span>
                </div>
              </div>
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="entry-billable" className="checkbox-label">
                <input
                  id="entry-billable"
                  type="checkbox"
                  checked={billable}
                  onChange={(e) => setBillable(e.target.checked)}
                />
                <span className="checkbox-custom">
                  {billable && <Check size={12} />}
                </span>
                <span>Billable entry ($)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="entry-tags">
              <Tag size={13} /> Tags (comma separated)
            </label>
            <input
              id="entry-tags"
              type="text"
              placeholder="e.g. ux, frontend, client-meeting"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="entry-note">
              <FileText size={13} /> Notes / Summary
            </label>
            <textarea
              id="entry-note"
              rows={3}
              placeholder="Add key deliverables, meeting notes or outcomes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingEntry ? 'Save Changes' : 'Log Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const ManualEntryModal: React.FC = () => {
  const { isManualModalOpen, editingEntry } = useTimeTracker()
  if (!isManualModalOpen) return null
  return <ManualEntryModalContent key={editingEntry?.id || 'new'} />
}
