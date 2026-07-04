import { useEffect, useState, type FormEvent } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { getTest, patchAdminTest } from '@/api/endpoints/tests'
import { getErrorMessage } from '@/api/errors'
import { ApiError } from '@/api/errors'
import { DIFFICULTY_OPTIONS, difficultyLabel } from '@/lib/constants'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Card } from '@/components/ui/Card'
import type { Difficulty } from '@/types/api'

export function AdminEditTestPage() {
  const [searchParams] = useSearchParams()
  const initialTestId = searchParams.get('testId') ?? ''
  const [testId, setTestId] = useState(initialTestId)
  const [lookupId, setLookupId] = useState(initialTestId)
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('moderate')

  const testQuery = useQuery({
    queryKey: ['tests', lookupId],
    queryFn: () => getTest(lookupId),
    enabled: Boolean(lookupId),
  })

  useEffect(() => {
    if (testQuery.data) {
      setTopic(testQuery.data.topic)
      setDifficulty(testQuery.data.difficulty)
    }
  }, [testQuery.data])

  const mutation = useMutation({
    mutationFn: () => patchAdminTest(lookupId, { topic: topic.trim(), difficulty }),
    onSuccess: () => {
      void testQuery.refetch()
    },
  })

  function handleLookup(e: FormEvent) {
    e.preventDefault()
    setLookupId(testId.trim())
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  const test = testQuery.data

  return (
    <div className="stack">
      <PageHeader
        title="Edit Test"
        subtitle="Update topic and difficulty metadata (admin only)"
      />

      <form className="stack" onSubmit={handleLookup}>
        <Input
          label="Test ID"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          hint="Enter the test ID to look up"
          required
        />
        <Button type="submit" variant="secondary">Look Up Test</Button>
      </form>

      {testQuery.isLoading && <p>Loading test…</p>}
      {testQuery.error && (
        <ErrorBanner
          message={
            testQuery.error instanceof ApiError && testQuery.error.status === 404
              ? 'Test not found.'
              : getErrorMessage(testQuery.error)
          }
        />
      )}

      {test && (
        <Card title={test.topic} meta={`ID: ${test.id} · ${difficultyLabel(test.difficulty)} · ${test.status}`}>
          <form className="stack" onSubmit={handleSave} style={{ marginTop: 'var(--space-4)' }}>
            {mutation.error && <ErrorBanner message={getErrorMessage(mutation.error)} />}
            {mutation.isSuccess && (
              <ErrorBanner message="Test updated successfully." variant="success" />
            )}
            <Input
              label="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
            <Select
              label="Difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              options={DIFFICULTY_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        </Card>
      )}
    </div>
  )
}
