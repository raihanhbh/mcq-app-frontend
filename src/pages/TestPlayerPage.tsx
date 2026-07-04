import { Link } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getErrorMessage } from '@/api/errors'
import { getQuestionReview } from '@/api/endpoints/tests'
import { difficultyLabel } from '@/lib/constants'
import { useTestPlayer } from '@/hooks/useTestPlayer'
import { useDerivedTestStats } from '@/hooks/useDerivedTestStats'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Button } from '@/components/ui/Button'
import { OptionList } from '@/components/test/OptionList'
import { AnswerFeedback } from '@/components/test/AnswerFeedback'
import { TestMetricsBar } from '@/components/test/TestMetricsBar'
import { TestCompletePanel } from '@/components/test/TestCompletePanel'

export function TestPlayerPage() {
  const { testId = '' } = useParams()
  const {
    test,
    current,
    isLoading,
    error,
    selectedIds,
    setSelectedIds,
    localFeedback,
    showFeedback,
    isAnswered,
    isCorrect,
    isComplete,
    canGoBack,
    answerMutation,
    nextMutation,
    prevMutation,
    refetch,
  } = useTestPlayer(testId)

  const { stats } = useDerivedTestStats(testId)

  const questionId = current?.question?.id
  const needsReview = Boolean(current?.answer && !localFeedback && questionId)
  const reviewQuery = useQuery({
    queryKey: ['tests', testId, 'review', questionId],
    queryFn: () => getQuestionReview(testId, questionId!),
    enabled: needsReview,
  })

  if (isLoading) return <Spinner centered />

  if (error) {
    return (
      <div className="stack">
        <ErrorBanner message={getErrorMessage(error)} />
        <Button variant="secondary" onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }

  if (isComplete && !current?.question) {
    return (
      <TestCompletePanel
        testId={testId}
        topic={test?.topic ?? 'Test'}
        stats={stats}
      />
    )
  }

  const question = current?.question
  if (!question) return <Spinner centered />

  const feedback = localFeedback
  const displayFeedback = showFeedback && (feedback || isAnswered)

  return (
    <div className="stack">
      <PageHeader
        title={test?.topic ?? 'Knowledge Test'}
        subtitle={test ? difficultyLabel(test.difficulty) : undefined}
        action={
          <Link to={`/test/${testId}/history`} style={{ fontSize: '0.875rem' }}>
            History
          </Link>
        }
      />

      <TestMetricsBar
        stats={stats}
        currentQuestion={current?.sequenceIndex ?? null}
        questionCap={current?.questionCap ?? test?.questionCap ?? 50}
      />

      <div>
        <p style={{ fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.4 }}>
          {question.text}
        </p>

        <OptionList
          options={question.options}
          questionType={question.questionType}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
          disabled={isAnswered || answerMutation.isPending}
          correctIds={feedback?.correctOptionIds ?? reviewQuery.data?.correctOptionIds}
          showResults={Boolean(feedback) || (isAnswered && Boolean(reviewQuery.data))}
        />

        {displayFeedback && feedback && (
          <AnswerFeedback
            isCorrect={feedback.isCorrect}
            explanation={feedback.explanation}
            hint={feedback.hint}
          />
        )}

        {displayFeedback && !feedback && isAnswered && current?.answer && reviewQuery.data && (
          <AnswerFeedback
            isCorrect={current.answer.isCorrect}
            explanation={reviewQuery.data.explanation}
            hint={reviewQuery.data.hint}
          />
        )}

        <div className="row" style={{ marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            onClick={() => prevMutation.mutate()}
            disabled={!canGoBack || prevMutation.isPending}
          >
            Back
          </Button>

          {!isAnswered && !localFeedback && (
            <Button
              onClick={() => answerMutation.mutate(selectedIds)}
              disabled={selectedIds.length === 0 || answerMutation.isPending}
            >
              {answerMutation.isPending ? 'Submitting…' : 'Submit'}
            </Button>
          )}

          {(isCorrect || (localFeedback?.isCorrect)) && (
            <Button
              onClick={() => nextMutation.mutate()}
              disabled={nextMutation.isPending}
            >
              {nextMutation.isPending ? 'Loading…' : 'Next'}
            </Button>
          )}
        </div>

        {answerMutation.error && (
          <ErrorBanner message={getErrorMessage(answerMutation.error)} />
        )}
        {nextMutation.error && (
          <ErrorBanner message={getErrorMessage(nextMutation.error)} />
        )}
        {prevMutation.error && (
          <ErrorBanner message={getErrorMessage(prevMutation.error)} />
        )}
      </div>
    </div>
  )
}
