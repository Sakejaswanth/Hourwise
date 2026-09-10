import React, { useState, useMemo } from 'react'
import {
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Calendar,
} from 'lucide-react'
import { useTimeTracker } from '../../context/useTimeTracker'
import {
  formatDisplayDate,
  formatHM,
  getRelativeDateStr,
  getTodayDateStr,
  toDecimalHours,
} from '../../utils/time'
import { exportEntriesToCSV, triggerPrintReport } from '../../utils/export'
import { StatCard } from '../common/StatCard'

type DateRangeOption = 'THIS_WEEK' | 'LAST_WEEK' | 'THIS_MONTH' | 'ALL_TIME'

export const ReportsView: React.FC = () => {
  const { entries, projects, settings } = useTimeTracker()

  const [dateRange, setDateRange] = useState<DateRangeOption>('THIS_WEEK')
  const [activeProjectSlice, setActiveProjectSlice] = useState<string | null>(null)

  const projectMap = useMemo(() => new Map(projects.map((p) => [p.id, p])), [projects])

  // Determine date bounds
  const filteredEntries = useMemo(() => {
    const today = getTodayDateStr()
    const now = new Date()

    if (dateRange === 'THIS_WEEK') {
      // Monday to today
      const currentDay = now.getDay()
      const dist = currentDay === 0 ? -6 : 1 - currentDay
      const mondayStr = getRelativeDateStr(dist)
      return entries.filter((e) => e.date >= mondayStr && e.date <= today)
    }

    if (dateRange === 'LAST_WEEK') {
      const currentDay = now.getDay()
      const dist = currentDay === 0 ? -6 : 1 - currentDay
      const lastMondayStr = getRelativeDateStr(dist - 7)
      const lastSundayStr = getRelativeDateStr(dist - 1)
      return entries.filter((e) => e.date >= lastMondayStr && e.date <= lastSundayStr)
    }

    if (dateRange === 'THIS_MONTH') {
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const startOfMonth = `${year}-${month}-01`
      return entries.filter((e) => e.date >= startOfMonth && e.date <= today)
    }

    // ALL_TIME
    return entries
  }, [entries, dateRange])

  // High-level aggregates
  const totalSeconds = useMemo(
    () => filteredEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0),
    [filteredEntries]
  )
  const totalHours = toDecimalHours(totalSeconds)

  const billableEntries = useMemo(
    () => filteredEntries.filter((e) => e.billable),
    [filteredEntries]
  )
  const billableSeconds = useMemo(
    () => billableEntries.reduce((acc, curr) => acc + curr.durationSeconds, 0),
    [billableEntries]
  )
  const billableHours = toDecimalHours(billableSeconds)
  const nonBillableHours = Math.max(0, Number((totalHours - billableHours).toFixed(2)))

  const billablePercent = totalSeconds > 0 ? Math.round((billableSeconds / totalSeconds) * 100) : 0

  const totalEarnings = useMemo(() => {
    return billableEntries.reduce((acc, curr) => {
      const p = projectMap.get(curr.projectId)
      const rate = p ? p.hourlyRate : settings.defaultHourlyRate
      return acc + toDecimalHours(curr.durationSeconds) * rate
    }, 0)
  }, [billableEntries, projectMap, settings.defaultHourlyRate])

  // Unique active days in this range
  const uniqueDays = useMemo(() => {
    const s = new Set(filteredEntries.map((e) => e.date))
    return Math.max(1, s.size)
  }, [filteredEntries])

  const avgDailyHours = Number((totalHours / uniqueDays).toFixed(1))

  // Project Breakdown for Donut Chart
  const projectDonutData = useMemo(() => {
    const map = new Map<string, number>()
    filteredEntries.forEach((e) => {
      const prev = map.get(e.projectId) || 0
      map.set(e.projectId, prev + e.durationSeconds)
    })

    const colorHexMap: Record<string, string> = {
      coral: '#f47f68',
      mint: '#86c3b1',
      lavender: '#9787cf',
      amber: '#de9f4e',
      sky: '#58a6df',
      rose: '#e26d85',
      emerald: '#5aa48b',
      indigo: '#6366f1',
    }

    let cumulativeAngle = 0
    return Array.from(map.entries())
      .map(([projectId, seconds]) => {
        const proj = projectMap.get(projectId)
        const percent = totalSeconds > 0 ? seconds / totalSeconds : 0
        const angle = percent * 360
        const startAngle = cumulativeAngle
        cumulativeAngle += angle

        return {
          id: projectId,
          name: proj?.name || 'Unknown Project',
          client: proj?.client || '',
          colorHex: colorHexMap[proj?.color || 'coral'] || '#f47f68',
          colorName: proj?.color || 'coral',
          seconds,
          hours: toDecimalHours(seconds),
          percent: Math.round(percent * 100),
          startAngle,
          angle,
        }
      })
      .sort((a, b) => b.seconds - a.seconds)
  }, [filteredEntries, projectMap, totalSeconds])

  // Daily Stacked Bar Chart Data (last 7 active days or sorted days in set)
  const stackedBarData = useMemo(() => {
    const dayMap = new Map<string, { billableSec: number; nonBillableSec: number }>()

    filteredEntries.forEach((e) => {
      const prev = dayMap.get(e.date) || { billableSec: 0, nonBillableSec: 0 }
      if (e.billable) {
        prev.billableSec += e.durationSeconds
      } else {
        prev.nonBillableSec += e.durationSeconds
      }
      dayMap.set(e.date, prev)
    })

    const sortedDates = Array.from(dayMap.keys()).sort()

    return sortedDates.map((dateStr) => {
      const stats = dayMap.get(dateStr)!
      const bHours = toDecimalHours(stats.billableSec)
      const nbHours = toDecimalHours(stats.nonBillableSec)
      return {
        dateStr,
        displayDate: formatDisplayDate(dateStr),
        billableHours: bHours,
        nonBillableHours: nbHours,
        totalDayHours: Number((bHours + nbHours).toFixed(1)),
      }
    })
  }, [filteredEntries])

  const maxStackedHours = Math.max(8, ...stackedBarData.map((d) => d.totalDayHours))

  // Tags Breakdown
  const tagBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    filteredEntries.forEach((e) => {
      e.tags.forEach((tag) => {
        const prev = map.get(tag) || 0
        map.set(tag, prev + e.durationSeconds)
      })
    })

    return Array.from(map.entries())
      .map(([tag, sec]) => ({
        tag,
        seconds: sec,
        hours: toDecimalHours(sec),
        percent: totalSeconds > 0 ? Math.round((sec / totalSeconds) * 100) : 0,
      }))
      .sort((a, b) => b.seconds - a.seconds)
      .slice(0, 6)
  }, [filteredEntries, totalSeconds])

  return (
    <div className="page-content report-page">
      {/* Printable Invoice Header (shown when printing) */}
      <div className="printable-invoice-header">
        <div>
          <h2>Time Tracker Pro — Client Timesheet Report</h2>
          <p>Generated by {settings.userName} ({settings.userEmail})</p>
          <small>Period: {dateRange.replace('_', ' ')} · Exported on {new Date().toLocaleDateString()}</small>
        </div>
        <div className="print-totals">
          <strong>Total Billed: {settings.currency}{totalEarnings.toFixed(2)}</strong>
          <span>Total Hours: {totalHours}h ({billablePercent}% billable)</span>
        </div>
      </div>

      {/* Screen Heading */}
      <section className="page-heading no-print">
        <div>
          <p className="eyebrow">Analytics & Invoicing</p>
          <h1>Reports & Insights <span>✦</span></h1>
          <p className="subheading">
            Measure productivity, monitor project profitability, and prepare invoice-ready summaries.
          </p>
        </div>

        <div className="heading-actions">
          <button
            className="btn-secondary"
            onClick={triggerPrintReport}
            title="Print or Save as PDF"
          >
            <Printer size={15} />
            <span>Print Invoice</span>
          </button>

          <button
            className="new-entry"
            onClick={() => exportEntriesToCSV(filteredEntries, projects)}
            title="Download CSV"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* Date Range Selector Bar */}
      <section className="report-range-bar no-print">
        <div className="range-pills">
          <button
            className={`range-pill ${dateRange === 'THIS_WEEK' ? 'active' : ''}`}
            onClick={() => setDateRange('THIS_WEEK')}
          >
            This Week
          </button>
          <button
            className={`range-pill ${dateRange === 'LAST_WEEK' ? 'active' : ''}`}
            onClick={() => setDateRange('LAST_WEEK')}
          >
            Last Week
          </button>
          <button
            className={`range-pill ${dateRange === 'THIS_MONTH' ? 'active' : ''}`}
            onClick={() => setDateRange('THIS_MONTH')}
          >
            This Month
          </button>
          <button
            className={`range-pill ${dateRange === 'ALL_TIME' ? 'active' : ''}`}
            onClick={() => setDateRange('ALL_TIME')}
          >
            All Time
          </button>
        </div>

        <div className="range-indicator">
          <Calendar size={14} />
          <span>
            {filteredEntries.length} entries in selected range
          </span>
        </div>
      </section>

      {/* Top Aggregates KPI Grid */}
      <section className="stats-grid">
        <StatCard
          label="Total Time Tracked"
          value={formatHM(totalSeconds)}
          icon={<BarChart3 size={18} />}
          iconColorClass="violet"
          subtext={<span>{totalHours} decimal hours</span>}
        />

        <StatCard
          label="Billable Ratio"
          value={`${billablePercent}%`}
          icon={<DollarSign size={18} />}
          iconColorClass="emerald"
          subtext={
            <span className="positive">
              {billableHours}h billable / {nonBillableHours}h internal
            </span>
          }
        />

        <StatCard
          label="Total Revenue"
          value={`${settings.currency}${totalEarnings.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<TrendingUp size={18} />}
          iconColorClass="sun"
          subtext={<span className="positive">Across {billableEntries.length} billable items</span>}
        />

        <StatCard
          label="Daily Average"
          value={`${avgDailyHours}h`}
          icon={<PieIcon size={18} />}
          iconColorClass="yellow"
          subtext={<span>Over {uniqueDays} active working days</span>}
        />
      </section>

      {/* Charts Grid */}
      <section className="dashboard-grid report-charts-grid">
        {/* Left: Project Donut Distribution */}
        <div className="entries-panel">
          <div className="section-heading">
            <div>
              <h3>Hours by Project</h3>
              <p>Proportional allocation across client accounts.</p>
            </div>
          </div>

          <div className="donut-chart-wrapper">
            {/* SVG Donut */}
            <div className="donut-svg-container">
              <svg viewBox="0 0 160 160" className="donut-svg">
                {projectDonutData.map((slice) => {
                  const radius = 60
                  const strokeWidth = 24
                  const circumference = 2 * Math.PI * radius
                  const strokeDasharray = `${(slice.percent / 100) * circumference} ${circumference}`
                  const strokeDashoffset = -((slice.startAngle / 360) * circumference)
                  const isHovered = activeProjectSlice === slice.id

                  return (
                    <circle
                      key={slice.id}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={slice.colorHex}
                      strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="donut-segment"
                      onMouseEnter={() => setActiveProjectSlice(slice.id)}
                      onMouseLeave={() => setActiveProjectSlice(null)}
                    />
                  )
                })}
              </svg>
              <div className="donut-center-info">
                <strong>{totalHours}h</strong>
                <small>Total</small>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="donut-legend-list">
              {projectDonutData.map((slice) => (
                <div
                  key={slice.id}
                  className={`donut-legend-item ${activeProjectSlice === slice.id ? 'highlight' : ''}`}
                  onMouseEnter={() => setActiveProjectSlice(slice.id)}
                  onMouseLeave={() => setActiveProjectSlice(null)}
                >
                  <span
                    className="legend-dot-custom"
                    style={{ backgroundColor: slice.colorHex }}
                  />
                  <div className="legend-text">
                    <strong>{slice.name}</strong>
                    <small>{slice.client || 'Internal'}</small>
                  </div>
                  <div className="legend-values">
                    <span>{slice.hours}h</span>
                    <strong>{slice.percent}%</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Billable vs Non-Billable Stacked Bar Trend */}
        <div className="focus-panel">
          <div className="section-heading">
            <div>
              <h3>Daily Hours Breakdown</h3>
              <p>Billable vs non-billable balance.</p>
            </div>
            <div className="chart-legend-pills">
              <span className="pill-legend-item">
                <i className="pill-color-billable" /> Billable
              </span>
              <span className="pill-legend-item">
                <i className="pill-color-nonbillable" /> Internal
              </span>
            </div>
          </div>

          <div className="chart" style={{ marginTop: '14px' }}>
            <div className="svg-chart-container">
              <svg viewBox="0 0 340 140" className="stacked-bar-svg">
                <line x1="10" y1="35" x2="330" y2="35" stroke="var(--line)" strokeDasharray="3 3" />
                <line x1="10" y1="75" x2="330" y2="75" stroke="var(--line)" strokeDasharray="3 3" />
                <line x1="10" y1="115" x2="330" y2="115" stroke="var(--line)" />

                {stackedBarData.slice(-7).map((d, idx) => {
                  const colWidth = 26
                  const spacing = 46
                  const x = 20 + idx * spacing

                  const totalH = d.billableHours + d.nonBillableHours
                  const totalBarHeight = Math.min(95, Math.max(6, (totalH / maxStackedHours) * 95))
                  const billableHeight = totalH > 0 ? (d.billableHours / totalH) * totalBarHeight : 0
                  const nonBillableHeight = totalBarHeight - billableHeight

                  const yBillable = 115 - billableHeight
                  const yNonBillable = yBillable - nonBillableHeight

                  return (
                    <g key={d.dateStr} className="stacked-bar-group">
                      {/* Non billable segment (top) */}
                      {nonBillableHeight > 0 && (
                        <rect
                          x={x}
                          y={yNonBillable}
                          width={colWidth}
                          height={nonBillableHeight}
                          rx={3}
                          className="bar-non-billable"
                        />
                      )}

                      {/* Billable segment (bottom) */}
                      {billableHeight > 0 && (
                        <rect
                          x={x}
                          y={yBillable}
                          width={colWidth}
                          height={billableHeight}
                          rx={3}
                          className="bar-billable"
                        />
                      )}

                      <text
                        x={x + colWidth / 2}
                        y={130}
                        textAnchor="middle"
                        className="bar-date-label"
                      >
                        {d.dateStr.slice(5)}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </div>

          {/* Tags breakdown mini table */}
          <div className="tags-breakdown-section">
            <h4 className="subheading-small">Top tags in this period</h4>
            <div className="tag-bars-list">
              {tagBreakdown.map((t) => (
                <div className="tag-bar-row" key={t.tag}>
                  <div className="tag-bar-header">
                    <span className="tag-name">#{t.tag}</span>
                    <span className="tag-hours">{t.hours}h ({t.percent}%)</span>
                  </div>
                  <div className="tag-track">
                    <div className="tag-fill" style={{ width: `${t.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
