import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { DIFFICULTY_OPTIONS, AI_VENDORS } from '@/lib/constants'
import type { AiProvider, AiVendor, Difficulty, ProviderStatus } from '@/types/api'
import './ProviderForm.css'

export interface ProviderFormData {
  name: string
  vendor: AiVendor
  modelId: string
  secretManagerRef: string
  difficultyLevels: Difficulty[]
  maxTokensPerCall: number
  monthlySpendCapUsd: number
  fallbackPriority: number
  status: ProviderStatus
}

const emptyForm: ProviderFormData = {
  name: '',
  vendor: 'anthropic',
  modelId: '',
  secretManagerRef: '',
  difficultyLevels: [],
  maxTokensPerCall: 4096,
  monthlySpendCapUsd: 200,
  fallbackPriority: 1,
  status: 'active',
}

interface ProviderFormProps {
  initial?: Partial<ProviderFormData>
  onSubmit: (data: ProviderFormData) => void
  onCancel?: () => void
  submitting?: boolean
  submitLabel?: string
}

export function ProviderForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
  submitLabel = 'Save Provider',
}: ProviderFormProps) {
  const [form, setForm] = useState<ProviderFormData>({ ...emptyForm, ...initial })

  function toggleDifficulty(level: Difficulty) {
    setForm((f) => ({
      ...f,
      difficultyLevels: f.difficultyLevels.includes(level)
        ? f.difficultyLevels.filter((d) => d !== level)
        : [...f.difficultyLevels, level],
    }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit(form)
    if (!initial) {
      setForm({ ...emptyForm, secretManagerRef: '' })
    }
  }

  return (
    <form className="provider-form" onSubmit={handleSubmit}>
      <Input
        label="Name"
        value={form.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        required
      />
      <Select
        label="Vendor"
        value={form.vendor}
        onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value as AiVendor }))}
        options={AI_VENDORS.map((v) => ({ value: v.value, label: v.label }))}
      />
      <Input
        label="Model ID"
        value={form.modelId}
        onChange={(e) => setForm((f) => ({ ...f, modelId: e.target.value }))}
        required
      />
      <Input
        label="Secret Manager Reference"
        value={form.secretManagerRef}
        onChange={(e) => setForm((f) => ({ ...f, secretManagerRef: e.target.value }))}
        hint="GCP Secret Manager path (e.g. projects/.../secrets/.../versions/latest)"
        required={!initial}
      />
      <div className="field">
        <span className="field__label">Difficulty Levels</span>
        <div className="difficulty-checkboxes">
          {DIFFICULTY_OPTIONS.map((d) => (
            <label key={d.value}>
              <input
                type="checkbox"
                checked={form.difficultyLevels.includes(d.value)}
                onChange={() => toggleDifficulty(d.value)}
              />
              <span>{d.label}</span>
            </label>
          ))}
        </div>
      </div>
      <Input
        label="Max Tokens Per Call"
        type="number"
        value={form.maxTokensPerCall}
        onChange={(e) => setForm((f) => ({ ...f, maxTokensPerCall: Number(e.target.value) }))}
      />
      <Input
        label="Monthly Budget Cap (USD)"
        type="number"
        step="0.01"
        value={form.monthlySpendCapUsd}
        onChange={(e) => setForm((f) => ({ ...f, monthlySpendCapUsd: Number(e.target.value) }))}
      />
      <Input
        label="Fallback Priority"
        type="number"
        value={form.fallbackPriority}
        onChange={(e) => setForm((f) => ({ ...f, fallbackPriority: Number(e.target.value) }))}
      />
      <Select
        label="Status"
        value={form.status}
        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProviderStatus }))}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
      <div className="row">
        <Button type="submit" disabled={submitting || form.difficultyLevels.length === 0}>
          {submitting ? 'Saving…' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}

export function ProviderCard({
  provider,
  onRotate,
  rotating,
}: {
  provider: AiProvider
  onRotate: (providerId: string) => void
  rotating: boolean
}) {
  return (
    <div className="provider-list">
      <div className="provider-card__header">
        <div>
          <strong>{provider.name}</strong>
          <div className="provider-card__meta">
            {provider.vendor} · {provider.modelId} · Priority {provider.fallbackPriority}
          </div>
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '9999px',
            background: provider.status === 'active' ? 'var(--color-success-bg)' : 'var(--color-bg)',
            color: provider.status === 'active' ? 'var(--color-success)' : 'var(--color-text-muted)',
          }}
        >
          {provider.status}
        </span>
      </div>
      <div className="provider-card__meta">
        Levels: {provider.difficultyLevels.join(', ')}<br />
        Usage: {provider.usage.callsThisMonth} calls · ~{provider.usage.estimatedTokensThisMonth.toLocaleString()} tokens · ${provider.usage.estimatedCostUsdThisMonth.toFixed(2)}
      </div>
      <div className="provider-card__ref">{provider.secretManagerRef}</div>
      <Button size="sm" variant="secondary" onClick={() => onRotate(provider.id)} disabled={rotating}>
        Rotate Key
      </Button>
    </div>
  )
}
