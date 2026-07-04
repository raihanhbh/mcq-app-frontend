import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminSettings, updateAdminSettings } from '@/api/endpoints/admin'
import { getErrorMessage } from '@/api/errors'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Card } from '@/components/ui/Card'
import type { AdminSettings } from '@/types/api'

export function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: getAdminSettings,
  })

  const [form, setForm] = useState<Partial<AdminSettings>>({})

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: () => updateAdminSettings(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] })
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  function setNum(key: keyof AdminSettings, value: string) {
    setForm((f) => ({ ...f, [key]: Number(value) }))
  }

  if (isLoading) return <Skeleton variant="card" count={4} />
  if (error) return <ErrorBanner message={getErrorMessage(error)} />

  return (
    <div className="stack">
      <PageHeader title="Settings" subtitle="Global application configuration" />

      <form className="stack" onSubmit={handleSubmit}>
        {mutation.error && <ErrorBanner message={getErrorMessage(mutation.error)} />}
        {mutation.isSuccess && (
          <ErrorBanner message="Settings saved successfully." variant="success" />
        )}

        <Card title="Test Limits">
          <div className="stack">
            <Input
              label="Max Questions Per Topic (default)"
              type="number"
              value={form.maxQuestionsPerTopicDefault ?? ''}
              onChange={(e) => setNum('maxQuestionsPerTopicDefault', e.target.value)}
            />
            <Input
              label="Pool Low Water Mark"
              type="number"
              value={form.poolLowWaterMark ?? ''}
              onChange={(e) => setNum('poolLowWaterMark', e.target.value)}
            />
            <Input
              label="Generation Batch Size"
              type="number"
              value={form.generationBatchSize ?? ''}
              onChange={(e) => setNum('generationBatchSize', e.target.value)}
            />
          </div>
        </Card>

        <Card title="Security & Sessions">
          <div className="stack">
            <Input
              label="Max Login Attempts"
              type="number"
              value={form.maxLoginAttempts ?? ''}
              onChange={(e) => setNum('maxLoginAttempts', e.target.value)}
            />
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={form.sessionTimeoutMinutes ?? ''}
              onChange={(e) => setNum('sessionTimeoutMinutes', e.target.value)}
            />
            <Input
              label="Max Concurrent Sessions Per Learner"
              type="number"
              value={form.maxConcurrentSessionsPerLearner ?? ''}
              onChange={(e) => setNum('maxConcurrentSessionsPerLearner', e.target.value)}
            />
            <Input
              label="Min Password Length"
              type="number"
              value={form.minPasswordComplexity?.minLength ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  minPasswordComplexity: {
                    ...f.minPasswordComplexity!,
                    minLength: Number(e.target.value),
                  },
                }))
              }
            />
          </div>
        </Card>

        <Card title="Data & Budget">
          <div className="stack">
            <Input
              label="Data Retention (days)"
              type="number"
              value={form.dataRetentionDays ?? ''}
              onChange={(e) => setNum('dataRetentionDays', e.target.value)}
            />
            <Input
              label="Daily LLM Token Budget"
              type="number"
              value={form.dailyLlmTokenBudget ?? ''}
              onChange={(e) => setNum('dailyLlmTokenBudget', e.target.value)}
            />
            <Input
              label="Monthly LLM Token Budget"
              type="number"
              value={form.monthlyLlmTokenBudget ?? ''}
              onChange={(e) => setNum('monthlyLlmTokenBudget', e.target.value)}
            />
          </div>
        </Card>

        <Button type="submit" fullWidth disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save Settings'}
        </Button>
      </form>

      {mutation.isPending && <Spinner size="sm" />}
    </div>
  )
}
