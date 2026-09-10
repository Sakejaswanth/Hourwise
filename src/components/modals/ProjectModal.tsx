import React, { useState } from 'react'
import { X, DollarSign, Target, Check } from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import type { ProjectColor } from '../../types'

const COLOR_OPTIONS: { label: string; value: ProjectColor; hex: string }[] = [
  { label: 'Coral', value: 'coral', hex: '#f47f68' },
  { label: 'Mint', value: 'mint', hex: '#86c3b1' },
  { label: 'Lavender', value: 'lavender', hex: '#9787cf' },
  { label: 'Amber', value: 'amber', hex: '#de9f4e' },
  { label: 'Sky', value: 'sky', hex: '#58a6df' },
  { label: 'Rose', value: 'rose', hex: '#e26d85' },
  { label: 'Emerald', value: 'emerald', hex: '#5aa48b' },
  { label: 'Indigo', value: 'indigo', hex: '#6366f1' },
]

const ProjectModalContent: React.FC = () => {
  const {
    setIsProjectModalOpen,
    editingProject,
    setEditingProject,
    addProject,
    updateProject,
    settings,
  } = useTimeTracker()

  const [name, setName] = useState(editingProject?.name || '')
  const [client, setClient] = useState(editingProject?.client || '')
  const [color, setColor] = useState<ProjectColor>(editingProject?.color || 'coral')
  const [hourlyRate, setHourlyRate] = useState(editingProject?.hourlyRate ?? settings.defaultHourlyRate)
  const [budgetHours, setBudgetHours] = useState(editingProject?.budgetHours ?? 40)

  const handleClose = () => {
    setIsProjectModalOpen(false)
    setEditingProject(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    if (editingProject) {
      updateProject(editingProject.id, {
        name: name.trim(),
        client: client.trim() || 'Internal',
        color,
        hourlyRate: Number(hourlyRate) || 0,
        budgetHours: Number(budgetHours) || undefined,
      })
    } else {
      addProject({
        name: name.trim(),
        client: client.trim() || 'Internal',
        color,
        hourlyRate: Number(hourlyRate) || 0,
        budgetHours: Number(budgetHours) || undefined,
      })
    }

    handleClose()
  }

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3>{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
            <p>Set up rates, clients, and budget limits for accurate tracking.</p>
          </div>
          <button className="icon-close" onClick={handleClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="proj-name">Project Name</label>
            <input
              id="proj-name"
              type="text"
              placeholder="e.g. Website Redesign, Brand Guidelines"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="proj-client">Client / Organization</label>
            <input
              id="proj-client"
              type="text"
              placeholder="e.g. Acme Corp, Internal, Freelance"
              value={client}
              onChange={(e) => setClient(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Color Theme</label>
            <div className="color-picker-palette">
              {COLOR_OPTIONS.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  className={`color-swatch-btn ${color === c.value ? 'selected' : ''}`}
                  style={{ backgroundColor: c.hex }}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                >
                  {color === c.value && <Check size={14} color="#fff" />}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="proj-rate">
                <DollarSign size={13} /> Hourly Rate ({settings.currency}/hr)
              </label>
              <input
                id="proj-rate"
                type="number"
                min="0"
                step="1"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label htmlFor="proj-budget">
                <Target size={13} /> Target Budget (Hours)
              </label>
              <input
                id="proj-budget"
                type="number"
                min="0"
                step="1"
                value={budgetHours}
                onChange={(e) => setBudgetHours(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const ProjectModal: React.FC = () => {
  const { isProjectModalOpen, editingProject } = useTimeTracker()
  if (!isProjectModalOpen) return null
  return <ProjectModalContent key={editingProject?.id || 'new'} />
}
