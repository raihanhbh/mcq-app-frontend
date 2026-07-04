import './Spinner.css'

interface SpinnerProps {
  size?: 'default' | 'sm'
  centered?: boolean
}

export function Spinner({ size = 'default', centered = false }: SpinnerProps) {
  const el = <div className={`spinner ${size === 'sm' ? 'spinner--sm' : ''}`} role="status" aria-label="Loading" />
  if (centered) return <div className="spinner-center">{el}</div>
  return el
}
