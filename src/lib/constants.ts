import type { Difficulty } from '@/types/api'

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'basic', label: 'Basic / Foundation' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'challenge', label: 'Challenge' },
]

export const DEFAULT_DIFFICULTY: Difficulty = 'challenge'

export const AI_VENDORS = [
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'google', label: 'Google' },
  { value: 'openai', label: 'OpenAI' },
] as const

export function difficultyLabel(value: Difficulty): string {
  return DIFFICULTY_OPTIONS.find((d) => d.value === value)?.label ?? value
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs}s`
  return `${mins}m ${secs}s`
}
