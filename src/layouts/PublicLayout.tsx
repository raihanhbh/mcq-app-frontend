import type { ReactNode } from 'react'
import './PublicLayout.css'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="public-layout">
      <div className="public-layout__inner">
        <div className="public-layout__brand">
          <h1>MCQ App</h1>
          <p>AI-powered knowledge tests</p>
        </div>
        {children}
      </div>
    </div>
  )
}
