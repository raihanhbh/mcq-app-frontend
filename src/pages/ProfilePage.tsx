import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, updateProfile } from '@/api/endpoints/profile'
import { getErrorMessage } from '@/api/errors'
import { formatDateTime } from '@/lib/constants'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Card } from '@/components/ui/Card'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  })

  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (data?.displayName) {
      setDisplayName(data.displayName)
    }
  }, [data?.displayName])

  const mutation = useMutation({
    mutationFn: () => updateProfile({ displayName: displayName.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="stack">
        <Skeleton variant="title" />
        <Skeleton variant="card" count={2} />
      </div>
    )
  }

  if (error) {
    return <ErrorBanner message={getErrorMessage(error)} />
  }

  return (
    <div className="stack">
      <PageHeader title="Profile" subtitle="Manage your account details" />

      <Card>
        <div className="stack-sm" style={{ marginBottom: 'var(--space-4)' }}>
          <div><strong>Email:</strong> {data?.email}</div>
          <div><strong>Role:</strong> {data?.role}</div>
          <div><strong>Status:</strong> {data?.status}</div>
          <div><strong>Member since:</strong> {data?.createdAt ? formatDateTime(data.createdAt) : '—'}</div>
          <div><strong>Last login:</strong> {data?.lastLoginAt ? formatDateTime(data.lastLoginAt) : '—'}</div>
        </div>
      </Card>

      <form className="stack" onSubmit={handleSubmit}>
        {mutation.error && <ErrorBanner message={getErrorMessage(mutation.error)} />}
        {mutation.isSuccess && (
          <ErrorBanner message="Profile updated successfully." variant="success" />
        )}
        <Input
          label="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
        <Button type="submit" disabled={mutation.isPending || !displayName.trim()}>
          {mutation.isPending ? 'Saving…' : 'Save Changes'}
        </Button>
      </form>

      {mutation.isPending && <Spinner size="sm" />}
    </div>
  )
}
