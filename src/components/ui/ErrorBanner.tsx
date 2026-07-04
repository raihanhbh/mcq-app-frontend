import type { ReactNode } from 'react'
import './ErrorBanner.css'

type Variant = 'error' | 'warning' | 'success'

interface ErrorBannerProps {
  message: ReactNode
  variant?: Variant
}

export function ErrorBanner({ message, variant = 'error' }: ErrorBannerProps) {
  if (!message) return null
  return (
    <div className={`error-banner ${variant !== 'error' ? `error-banner--${variant}` : ''}`} role="alert">
      {message}
    </div>
  )
}
