import React, { useState } from 'react'
import {
  Download,
  Moon,
  RotateCcw,
  Sun,
  Upload,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import { exportBackupJSON } from '../../utils/storage'

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    toggleTheme,
    resetAllDemoData,
    importJsonBackup,
    entries,
    projects,
    showToast,
  } = useTimeTracker()

  const [userName, setUserName] = useState(settings.userName)
  const [userEmail, setUserEmail] = useState(settings.userEmail)
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName)
  const [currency, setCurrency] = useState(settings.currency)
  const [defaultHourlyRate, setDefaultHourlyRate] = useState(settings.defaultHourlyRate)
  const [dailyGoalHours, setDailyGoalHours] = useState(settings.dailyGoalHours)
  const [weeklyGoalHours, setWeeklyGoalHours] = useState(settings.weeklyGoalHours)
  const [pomodoroWorkMin, setPomodoroWorkMin] = useState(settings.pomodoroWorkMin)
  const [pomodoroShortBreakMin, setPomodoroShortBreakMin] = useState(settings.pomodoroShortBreakMin)
  const [pomodoroLongBreakMin, setPomodoroLongBreakMin] = useState(settings.pomodoroLongBreakMin)

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings({
      userName: userName.trim() || 'Jaswanth',
      userEmail: userEmail.trim() || 'jaswanth@studio.co',
      workspaceName: workspaceName.trim() || 'Personal workspace',
      currency,
      defaultHourlyRate: Number(defaultHourlyRate) || 0,
      dailyGoalHours: Number(dailyGoalHours) || 6,
      weeklyGoalHours: Number(weeklyGoalHours) || 32,
      pomodoroWorkMin: Number(pomodoroWorkMin) || 25,
      pomodoroShortBreakMin: Number(pomodoroShortBreakMin) || 5,
      pomodoroLongBreakMin: Number(pomodoroLongBreakMin) || 15,
    })
  }

  const handleExportBackup = () => {
    const jsonStr = exportBackupJSON(entries, projects, settings)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `time_tracker_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showToast('Backup downloaded', 'Your full workspace data has been saved.', 'success')
  }

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        importJsonBackup(content)
      }
    }
    reader.readAsText(file)
  }

  const handleResetDemo = () => {
    if (
      confirm(
        'Reset workspace to demo data? This will restore initial sample projects and entries for the current week.'
      )
    ) {
      resetAllDemoData()
    }
  }

  return (
    <div className="page-content settings-page">
      {/* Heading */}
      <section className="page-heading">
        <div>
          <p className="eyebrow">Preferences & Account</p>
          <h1>Settings <span>✦</span></h1>
          <p className="subheading">
            Customize your workspace identity, target hours, currencies, and backups.
          </p>
        </div>
      </section>

      <div className="settings-container">
        {/* Profile & Workspace Section */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Profile & Workspace</h3>
            <p>Your primary display information and workspace identifier.</p>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="set-name">Full Name</label>
                <input
                  id="set-name"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="set-email">Email Address</label>
                <input
                  id="set-email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="set-workspace">Workspace Name</label>
                <input
                  id="set-workspace"
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="set-curr">Currency Symbol</label>
                <select
                  id="set-curr"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="$">$ (USD / CAD / AUD)</option>
                  <option value="€">€ (EUR)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="₹">₹ (INR)</option>
                  <option value="¥">¥ (JPY / CNY)</option>
                  <option value="CHF">CHF (Swiss Franc)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="set-rate">Default Billable Rate ({currency}/h)</label>
                <input
                  id="set-rate"
                  type="number"
                  min="0"
                  value={defaultHourlyRate}
                  onChange={(e) => setDefaultHourlyRate(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <label htmlFor="set-daily">Daily Focus Goal (Hours)</label>
                <input
                  id="set-daily"
                  type="number"
                  min="1"
                  max="24"
                  value={dailyGoalHours}
                  onChange={(e) => setDailyGoalHours(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="set-weekly">Weekly Focus Goal (Hours)</label>
                <input
                  id="set-weekly"
                  type="number"
                  min="1"
                  max="100"
                  value={weeklyGoalHours}
                  onChange={(e) => setWeeklyGoalHours(Number(e.target.value))}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                  Save Preferences
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Pomodoro Timer Configuration */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Pomodoro Focus Settings</h3>
            <p>Configure durations for deep work intervals and recharge breaks.</p>
          </div>

          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>Focus Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="90"
                  value={pomodoroWorkMin}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setPomodoroWorkMin(val)
                    updateSettings({ pomodoroWorkMin: val })
                  }}
                />
              </div>

              <div className="form-group">
                <label>Short Break (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={pomodoroShortBreakMin}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setPomodoroShortBreakMin(val)
                    updateSettings({ pomodoroShortBreakMin: val })
                  }}
                />
              </div>

              <div className="form-group">
                <label>Long Break (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={pomodoroLongBreakMin}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setPomodoroLongBreakMin(val)
                    updateSettings({ pomodoroLongBreakMin: val })
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Theme & Audio */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h3>Appearance & Sounds</h3>
            <p>Control visual theme and Web Audio API feedback chimes.</p>
          </div>

          <div className="toggle-setting-row">
            <div className="toggle-info">
              <strong>Theme Mode</strong>
              <small>
                Currently using {settings.theme === 'light' ? 'Light mode (Cream SaaS)' : 'Dark mode (Deep Charcoal)'}
              </small>
            </div>
            <button
              type="button"
              className="btn-secondary theme-switch-btn"
              onClick={toggleTheme}
            >
              {settings.theme === 'light' ? (
                <>
                  <Moon size={15} /> Switch to Dark Mode
                </>
              ) : (
                <>
                  <Sun size={15} /> Switch to Light Mode
                </>
              )}
            </button>
          </div>

          <div className="toggle-setting-row" style={{ marginTop: '16px' }}>
            <div className="toggle-info">
              <strong>Sound Chimes</strong>
              <small>Play subtle synthesized sounds on timer start, pause, and Pomodoro finish</small>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            >
              {settings.soundEnabled ? (
                <>
                  <Volume2 size={15} /> Sound: Enabled
                </>
              ) : (
                <>
                  <VolumeX size={15} /> Sound: Muted
                </>
              )}
            </button>
          </div>
        </div>

        {/* Data & Backup Management */}
        <div className="settings-card danger-card-zone">
          <div className="settings-card-header">
            <h3>Data Backup & Restore</h3>
            <p>Export your entries and projects as JSON, import previous archives, or reset demo data.</p>
          </div>

          <div className="backup-actions-grid">
            <div className="backup-action-item">
              <div>
                <strong>Export Workspace Backup</strong>
                <small>Download all projects, entries, and settings as a portable JSON file.</small>
              </div>
              <button className="btn-secondary btn-sm" onClick={handleExportBackup}>
                <Download size={14} /> Download JSON
              </button>
            </div>

            <div className="backup-action-item">
              <div>
                <strong>Restore from JSON</strong>
                <small>Upload a previous JSON backup to restore all data.</small>
              </div>
              <label className="btn-secondary btn-sm file-upload-label">
                <Upload size={14} /> Upload Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="backup-action-item danger">
              <div>
                <strong>Reset to Demo Data</strong>
                <small>Restore initial sample projects and week entries to explore all features.</small>
              </div>
              <button className="btn-danger btn-sm" onClick={handleResetDemo}>
                <RotateCcw size={14} /> Reset Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
