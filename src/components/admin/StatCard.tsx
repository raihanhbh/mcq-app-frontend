import type { ReactNode } from 'react'
import './StatCard.css'

interface StatCardProps {
  label: string
  value: string | number
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
    </div>
  )
}

export function StatGrid({ children, cols }: { children: ReactNode; cols?: 2 | 3 }) {
  return (
    <div className={`stat-grid ${cols === 3 ? 'stat-grid--3' : ''}`}>
      {children}
    </div>
  )
}
