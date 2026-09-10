import React from 'react'
import { X, Command } from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useTimeTracker()

  if (!isShortcutsOpen) return null

  const shortcuts = [
    { key: 'Space', desc: 'Start / Pause active timer' },
    { key: 'S', desc: 'Stop and save current timer' },
    { key: 'N', desc: 'Add new manual time entry' },
    { key: 'P', desc: 'Switch Stopwatch / Pomodoro mode' },
    { key: 'D', desc: 'Toggle Dark / Light theme' },
    { key: '1 - 6', desc: 'Switch view (Overview, Entries, Projects, Reports, Calendar, Settings)' },
    { key: '?', desc: 'Open / Close this shortcuts cheat sheet' },
    { key: 'Esc', desc: 'Close any open modal or drawer' },
  ]

  return (
    <div className="modal-backdrop" onClick={() => setIsShortcutsOpen(false)}>
      <div className="modal-card modal-shortcuts" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-icon-title">
            <span className="shortcuts-badge">
              <Command size={16} />
            </span>
            <div>
              <h3>Keyboard Shortcuts</h3>
              <p>Work faster with fluid keyboard commands.</p>
            </div>
          </div>
          <button
            className="icon-close"
            onClick={() => setIsShortcutsOpen(false)}
            aria-label="Close shortcuts modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-list">
          {shortcuts.map((s, idx) => (
            <div className="shortcut-row" key={idx}>
              <span className="shortcut-desc">{s.desc}</span>
              <kbd className="shortcut-key">{s.key}</kbd>
            </div>
          ))}
        </div>

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => setIsShortcutsOpen(false)}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
