import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listTests } from '@/api/endpoints/tests'
import { getErrorMessage } from '@/api/errors'
import { difficultyLabel, formatDate } from '@/lib/constants'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Button } from '@/components/ui/Button'

export function RecentTestsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tests'],
    queryFn: () => listTests({ limit: 50 }),
  })

  return (
    <div className="stack">
      <PageHeader title="Recent Tests" subtitle="Your knowledge test history" />

      {isLoading && (
        <>
          <Skeleton variant="card" count={3} />
        </>
      )}

      {error && (
        <ErrorBanner message={getErrorMessage(error)} />
      )}

      {error && (
        <Button variant="secondary" onClick={() => void refetch()}>Retry</Button>
      )}

      {data && data.items.length === 0 && (
        <p style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>
          No tests yet.{' '}
          <Link to="/tests/new">Create your first test</Link>
        </p>
      )}

      {data?.items.map((test) => (
        <Link key={test.id} to={`/test/${test.id}`} style={{ textDecoration: 'none' }}>
          <Card
            clickable
            title={test.topic}
            meta={`${difficultyLabel(test.difficulty)} · ${formatDate(test.createdAt)} · ${test.status === 'completed' ? 'Completed' : 'In progress'}`}
          />
        </Link>
      ))}

      {isLoading && <Spinner centered />}
    </div>
  )
}
