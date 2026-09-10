import React from 'react'
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useTimeTracker()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type || 'info'}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={16} />}
            {toast.type === 'warning' && <AlertTriangle size={16} />}
            {(!toast.type || toast.type === 'info') && <Info size={16} />}
          </div>
          <div className="toast-content">
            <strong className="toast-title">{toast.title}</strong>
            {toast.description && <p className="toast-desc">{toast.description}</p>}
          </div>
          <button
            className="toast-close"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
