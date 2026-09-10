import React from 'react'

interface StatCardProps {
  label: string
  value: string
  subtext?: React.ReactNode
  icon: React.ReactNode
  iconColorClass?: string
  trend?: {
    positive: boolean
    text: string
  }
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  iconColorClass = 'sun',
  trend,
}) => {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconColorClass}`}>{icon}</div>
      <div className="stat-info">
        <p>{label}</p>
        <strong>{value}</strong>
        {subtext && <small>{subtext}</small>}
        {trend && (
          <small>
            <span className={trend.positive ? 'positive' : 'negative'}>{trend.text}</span> vs last week
          </small>
        )}
      </div>
    </div>
  )
}
