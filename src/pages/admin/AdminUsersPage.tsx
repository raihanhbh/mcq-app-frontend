import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdminUser, listAdminUsers, updateUserStatus } from '@/api/endpoints/admin'
import { getErrorMessage } from '@/api/errors'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Card } from '@/components/ui/Card'
import { UserTable } from '@/components/admin/UserTable'
import type { UserRole } from '@/types/api'

export function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<UserRole>('learner')
  const [loadingUid, setLoadingUid] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => listAdminUsers({ limit: 50 }),
  })

  const createMutation = useMutation({
    mutationFn: () => createAdminUser({ email: email.trim(), displayName: displayName.trim(), role }),
    onSuccess: () => {
      setShowForm(false)
      setEmail('')
      setDisplayName('')
      setRole('learner')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ uid, status }: { uid: string; status: 'active' | 'inactive' }) =>
      updateUserStatus(uid, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    },
    onSettled: () => setLoadingUid(null),
  })

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    createMutation.mutate()
  }

  function handleToggleStatus(uid: string, currentStatus: string) {
    setLoadingUid(uid)
    statusMutation.mutate({
      uid,
      status: currentStatus === 'active' ? 'inactive' : 'active',
    })
  }

  return (
    <div className="stack">
      <PageHeader
        title="Users"
        subtitle="Manage learner and admin accounts"
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add User'}
          </Button>
        }
      />

      {showForm && (
        <Card>
          <form className="stack" onSubmit={handleCreate}>
            {createMutation.error && <ErrorBanner message={getErrorMessage(createMutation.error)} />}
            {createMutation.isSuccess && (
              <ErrorBanner message="User invited successfully. They will receive an email to set up their account." variant="success" />
            )}
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'learner', label: 'Learner' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Inviting…' : 'Invite User'}
            </Button>
          </form>
        </Card>
      )}

      {isLoading && <Skeleton variant="card" count={3} />}
      {error && (
        <>
          <ErrorBanner message={getErrorMessage(error)} />
          <Button variant="secondary" onClick={() => void refetch()}>Retry</Button>
        </>
      )}

      {data && (
        <UserTable
          users={data.items}
          onToggleStatus={handleToggleStatus}
          loadingUid={loadingUid}
        />
      )}

      {statusMutation.error && <ErrorBanner message={getErrorMessage(statusMutation.error)} />}
      {isLoading && <Spinner centered />}
    </div>
  )
}
