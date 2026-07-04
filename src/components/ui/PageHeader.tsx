import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import './PageHeader.css'

interface PageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  action?: ReactNode
}

export function PageHeader({ title, subtitle, backTo, backLabel = 'Back', action }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="page-header">
      {backTo && (
        <button type="button" className="page-header__back" onClick={() => navigate(backTo)}>
          ← {backLabel}
        </button>
      )}
      <div className="row-between">
        <div>
          <h1 className="page-header__title">{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}
