import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTest, listQuestions } from '@/api/endpoints/tests'
import { getErrorMessage } from '@/api/errors'
import { difficultyLabel } from '@/lib/constants'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Button } from '@/components/ui/Button'
import { QuestionHistoryList } from '@/components/test/QuestionHistoryList'

export function TestHistoryPage() {
  const { testId = '' } = useParams()

  const testQuery = useQuery({
    queryKey: ['tests', testId],
    queryFn: () => getTest(testId),
  })

  const questionsQuery = useQuery({
    queryKey: ['tests', testId, 'questions'],
    queryFn: () => listQuestions(testId),
  })

  const isLoading = testQuery.isLoading || questionsQuery.isLoading
  const error = testQuery.error ?? questionsQuery.error

  if (isLoading) return <Spinner centered />

  if (error) {
    return (
      <div className="stack">
        <ErrorBanner message={getErrorMessage(error)} />
        <Button variant="secondary" onClick={() => { void testQuery.refetch(); void questionsQuery.refetch() }}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <PageHeader
        title="Question History"
        subtitle={testQuery.data ? `${testQuery.data.topic} · ${difficultyLabel(testQuery.data.difficulty)}` : undefined}
        backTo={`/test/${testId}`}
        backLabel="Back to test"
      />

      <QuestionHistoryList
        testId={testId}
        questions={questionsQuery.data?.items ?? []}
      />
    </div>
  )
}
