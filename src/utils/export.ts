import type { Project, TimeEntry } from '../types'
import { formatHMS, toDecimalHours } from './time'

export function exportEntriesToCSV(entries: TimeEntry[], projects: Project[]) {
  const projectMap = new Map(projects.map((p) => [p.id, p]))

  const headers = [
    'Date',
    'Project',
    'Client',
    'Description',
    'Notes',
    'Tags',
    'Start Time',
    'End Time',
    'Duration (HH:MM:SS)',
    'Duration (Decimal Hours)',
    'Billable',
    'Hourly Rate ($)',
    'Total Amount ($)',
  ]

  const rows = entries.map((entry) => {
    const proj = projectMap.get(entry.projectId)
    const projName = proj ? proj.name : 'Unknown Project'
    const client = proj ? proj.client : ''
    const rate = entry.billable && proj ? proj.hourlyRate : 0
    const decimalHours = toDecimalHours(entry.durationSeconds)
    const amount = (decimalHours * rate).toFixed(2)

    const values = [
      entry.date,
      projName,
      client,
      entry.description,
      entry.note || '',
      entry.tags.join('; '),
      entry.startTime,
      entry.endTime,
      formatHMS(entry.durationSeconds),
      decimalHours.toString(),
      entry.billable ? 'Yes' : 'No',
      rate.toString(),
      amount,
    ]

    return values
      .map((val) => {
        const str = String(val ?? '')
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(',')
  })

  const csvContent = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  const today = new Date().toISOString().split('T')[0]
  link.setAttribute('download', `Time_Tracker_Report_${today}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function triggerPrintReport() {
  window.print()
}
