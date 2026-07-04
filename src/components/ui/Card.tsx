import type { HTMLAttributes, ReactNode } from 'react'
import './Card.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string
  meta?: string
  clickable?: boolean
  children?: ReactNode
}

export function Card({
  title,
  meta,
  clickable = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`card ${clickable ? 'card--clickable' : ''} ${className}`}
      {...props}
    >
      {title && <h3 className="card__title">{title}</h3>}
      {meta && <p className="card__meta">{meta}</p>}
      {children}
    </div>
  )
}
