import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getAdminAlerts, updateAdminAlerts } from '@/api/endpoints/admin'
import { getErrorMessage } from '@/api/errors'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import type { AdminAlerts } from '@/types/api'

export function AdminAlertsPage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: getAdminAlerts,
  })

  const [form, setForm] = useState<AdminAlerts>({
    alertEmail: '',
    alertThresholdPercent: 80,
    maxLoginAttempts: 5,
  })

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: () => updateAdminAlerts(form),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] })
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  if (isLoading) return <Skeleton variant="card" count={2} />
  if (error) return <ErrorBanner message={getErrorMessage(error)} />

  return (
    <div className="stack">
      <PageHeader title="Alerts" subtitle="Configure login attempt alerts" />

      <form className="stack" onSubmit={handleSubmit}>
        {mutation.error && <ErrorBanner message={getErrorMessage(mutation.error)} />}
        {mutation.isSuccess && (
          <ErrorBanner message="Alert settings saved." variant="success" />
        )}

        <Input
          label="Admin Alert Email"
          type="email"
          value={form.alertEmail}
          onChange={(e) => setForm((f) => ({ ...f, alertEmail: e.target.value }))}
          required
        />
        <Input
          label="Alert Threshold (%)"
          type="number"
          min={1}
          max={100}
          value={form.alertThresholdPercent}
          onChange={(e) =>
            setForm((f) => ({ ...f, alertThresholdPercent: Number(e.target.value) }))
          }
          hint="Send alert when login attempts reach this percentage of max"
        />
        <Input
          label="Max Login Attempts"
          type="number"
          value={form.maxLoginAttempts}
          onChange={(e) =>
            setForm((f) => ({ ...f, maxLoginAttempts: Number(e.target.value) }))
          }
        />

        <Button type="submit" fullWidth disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : 'Save Alerts'}
        </Button>
      </form>

      {mutation.isPending && <Spinner size="sm" />}
    </div>
  )
}
