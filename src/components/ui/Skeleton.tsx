import './Skeleton.css'

type SkeletonVariant = 'text' | 'title' | 'card'

interface SkeletonProps {
  variant?: SkeletonVariant
  count?: number
}

export function Skeleton({ variant = 'text', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton skeleton--${variant}`} />
      ))}
    </>
  )
}
