import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { createTest } from '@/api/endpoints/tests'
import { getErrorMessage } from '@/api/errors'
import { PageHeader } from '@/components/ui/PageHeader'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { DIFFICULTY_OPTIONS, DEFAULT_DIFFICULTY } from '@/lib/constants'
import type { Difficulty } from '@/types/api'

export function NewTestPage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>(DEFAULT_DIFFICULTY)

  const mutation = useMutation({
    mutationFn: () => createTest({ topic: topic.trim(), difficulty }),
    onSuccess: (test) => navigate(`/test/${test.id}`),
  })

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate()
  }

  return (
    <div className="stack">
      <PageHeader title="New Knowledge Test" subtitle="Choose a topic and difficulty level" />

      <form className="stack" onSubmit={handleSubmit}>
        {mutation.error && <ErrorBanner message={getErrorMessage(mutation.error)} />}
        <Input
          label="Topic"
          placeholder="e.g. Python Generators"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />
        <Select
          label="Maturity Level"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          options={DIFFICULTY_OPTIONS.map((d) => ({ value: d.value, label: d.label }))}
        />
        <Button type="submit" fullWidth disabled={!topic.trim() || mutation.isPending}>
          {mutation.isPending ? 'Creating…' : 'Start Test'}
        </Button>
      </form>
    </div>
  )
}
