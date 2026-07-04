import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAiProvider,
  listAiProviders,
  rotateProviderKey,
} from '@/api/endpoints/admin'
import { getErrorMessage } from '@/api/errors'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Card } from '@/components/ui/Card'
import { ProviderForm, ProviderCard, type ProviderFormData } from '@/components/admin/ProviderForm'

export function AdminAiProvidersPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [rotatingId, setRotatingId] = useState<string | null>(null)
  const [rotateRef, setRotateRef] = useState('')
  const [rotateTarget, setRotateTarget] = useState<string | null>(null)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'ai-providers'],
    queryFn: listAiProviders,
  })

  const createMutation = useMutation({
    mutationFn: (form: ProviderFormData) => createAiProvider(form),
    onSuccess: () => {
      setShowForm(false)
      void queryClient.invalidateQueries({ queryKey: ['admin', 'ai-providers'] })
    },
    onSettled: () => {
      // secretManagerRef cleared by ProviderForm reset
    },
  })

  const rotateMutation = useMutation({
    mutationFn: ({ id, ref }: { id: string; ref: string }) => rotateProviderKey(id, ref),
    onSuccess: () => {
      setRotateTarget(null)
      setRotateRef('')
      void queryClient.invalidateQueries({ queryKey: ['admin', 'ai-providers'] })
    },
    onSettled: () => setRotatingId(null),
  })

  function handleRotate(providerId: string) {
    setRotateTarget(providerId)
  }

  function submitRotate() {
    if (!rotateTarget || !rotateRef.trim()) return
    setRotatingId(rotateTarget)
    rotateMutation.mutate({ id: rotateTarget, ref: rotateRef.trim() })
    setRotateRef('')
  }

  return (
    <div className="stack">
      <PageHeader
        title="AI Providers"
        subtitle="Manage LLM vendor credentials and routing"
        action={
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Provider'}
          </Button>
        }
      />

      {showForm && (
        <Card title="Add Provider">
          {createMutation.error && <ErrorBanner message={getErrorMessage(createMutation.error)} />}
          <ProviderForm
            onSubmit={(form) => createMutation.mutate(form)}
            onCancel={() => setShowForm(false)}
            submitting={createMutation.isPending}
            submitLabel="Create Provider"
          />
        </Card>
      )}

      {rotateTarget && (
        <Card title="Rotate Secret Manager Reference">
          <div className="stack">
            <Input
              label="New Secret Manager Reference"
              value={rotateRef}
              onChange={(e) => setRotateRef(e.target.value)}
              hint="New GCP Secret Manager path"
            />
            <div className="row">
              <Button onClick={submitRotate} disabled={!rotateRef.trim() || rotateMutation.isPending}>
                {rotateMutation.isPending ? 'Rotating…' : 'Confirm Rotate'}
              </Button>
              <Button variant="secondary" onClick={() => { setRotateTarget(null); setRotateRef('') }}>
                Cancel
              </Button>
            </div>
            {rotateMutation.error && <ErrorBanner message={getErrorMessage(rotateMutation.error)} />}
          </div>
        </Card>
      )}

      {isLoading && <Skeleton variant="card" count={2} />}
      {error && (
        <>
          <ErrorBanner message={getErrorMessage(error)} />
          <Button variant="secondary" onClick={() => void refetch()}>Retry</Button>
        </>
      )}

      {data?.items.map((provider) => (
        <Card key={provider.id}>
          <ProviderCard
            provider={provider}
            onRotate={handleRotate}
            rotating={rotatingId === provider.id}
          />
        </Card>
      ))}

      {data?.items.length === 0 && !isLoading && (
        <p style={{ color: 'var(--color-text-muted)' }}>No providers configured.</p>
      )}

      {isLoading && <Spinner centered />}
    </div>
  )
}
