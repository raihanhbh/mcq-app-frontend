import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  getActivitiesSummary,
  getUserActivity,
  listActivitySessions,
  listAdminUsers,
} from '@/api/endpoints/admin'
import { getErrorMessage } from '@/api/errors'
import { formatDate, formatDuration } from '@/lib/constants'
import { PageHeader } from '@/components/ui/PageHeader'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatCard, StatGrid } from '@/components/admin/StatCard'

export function AdminActivitiesPage() {
  const [selectedUid, setSelectedUid] = useState('')

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => listAdminUsers({ limit: 50 }),
  })

  const summaryQuery = useQuery({
    queryKey: ['admin', 'activities', 'summary'],
    queryFn: () => getActivitiesSummary(),
  })

  const userActivityQuery = useQuery({
    queryKey: ['admin', 'users', selectedUid, 'activity'],
    queryFn: () => getUserActivity(selectedUid),
    enabled: Boolean(selectedUid),
  })

  const sessionsQuery = useQuery({
    queryKey: ['admin', 'activities', 'sessions', selectedUid],
    queryFn: () => listActivitySessions({ uid: selectedUid, limit: 20 }),
    enabled: Boolean(selectedUid),
  })

  const isLoading = usersQuery.isLoading || summaryQuery.isLoading
  const error = usersQuery.error ?? summaryQuery.error

  return (
    <div className="stack">
      <PageHeader title="Activities" subtitle="Learner engagement metrics" />

      {isLoading && <Skeleton variant="card" count={4} />}
      {error && (
        <>
          <ErrorBanner message={getErrorMessage(error)} />
          <Button variant="secondary" onClick={() => { void summaryQuery.refetch() }}>Retry</Button>
        </>
      )}

      {summaryQuery.data && (
        <>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Platform Summary (last 30 days)
          </h3>
          <StatGrid cols={3}>
            <StatCard label="Total Sessions" value={summaryQuery.data.totalSessions} />
            <StatCard label="Questions Answered" value={summaryQuery.data.totalQuestionsAnswered} />
            <StatCard label="Active Users" value={summaryQuery.data.activeUsers} />
            <StatCard
              label="Avg Session"
              value={formatDuration(summaryQuery.data.avgSessionDurationSeconds)}
            />
          </StatGrid>

          {summaryQuery.data.topicsCreated.length > 0 && (
            <Card title="Topics Created (platform-wide)">
              <div className="stack-sm">
                {summaryQuery.data.topicsCreated.map((t) => (
                  <div key={t.topicSlug} className="row-between">
                    <span>{t.topicSlug}</span>
                    <strong>{t.count}</strong>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <Select
        label="Select User"
        value={selectedUid}
        onChange={(e) => setSelectedUid(e.target.value)}
        options={[
          { value: '', label: 'Choose a user…' },
          ...(usersQuery.data?.items.map((u) => ({
            value: u.uid,
            label: `${u.displayName || u.email} (${u.email})`,
          })) ?? []),
        ]}
      />

      {selectedUid && userActivityQuery.isLoading && <Spinner centered />}
      {userActivityQuery.error && (
        <ErrorBanner message={getErrorMessage(userActivityQuery.error)} />
      )}

      {userActivityQuery.data && (
        <>
          <StatGrid>
            <StatCard label="Total Sessions" value={userActivityQuery.data.totalSessions} />
            <StatCard label="Questions Answered" value={userActivityQuery.data.totalQuestionsAnswered} />
          </StatGrid>

          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Session Logs</h3>
          {sessionsQuery.data?.items.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)' }}>No sessions found.</p>
          )}
          {sessionsQuery.data?.items.map((session) => (
            <Card
              key={session.id}
              title={session.topic}
              meta={`${formatDate(session.sessionStart)} · ${formatDuration(session.durationSeconds)} · ${session.questionsAnswered} questions`}
            />
          ))}
        </>
      )}
    </div>
  )
}
