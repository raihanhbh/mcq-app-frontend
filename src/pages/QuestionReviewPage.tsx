import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getQuestionReview } from '@/api/endpoints/tests'
import { getErrorMessage } from '@/api/errors'
import { PageHeader } from '@/components/ui/PageHeader'
import { Spinner } from '@/components/ui/Spinner'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import { Button } from '@/components/ui/Button'
import { OptionList } from '@/components/test/OptionList'
import { AnswerFeedback } from '@/components/test/AnswerFeedback'

export function QuestionReviewPage() {
  const { testId = '', questionId = '' } = useParams()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tests', testId, 'review', questionId],
    queryFn: () => getQuestionReview(testId, questionId),
  })

  if (isLoading) return <Spinner centered />

  if (error) {
    return (
      <div className="stack">
        <ErrorBanner message={getErrorMessage(error)} />
        <Button variant="secondary" onClick={() => void refetch()}>Retry</Button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="stack">
      <PageHeader
        title={`Question ${data.sequenceIndex + 1}`}
        subtitle="Review"
        backTo={`/test/${testId}/history`}
        backLabel="Back to history"
      />

      <p style={{ fontWeight: 600, fontSize: '1.0625rem', lineHeight: 1.4 }}>
        {data.text}
      </p>

      <OptionList
        options={data.options}
        questionType={data.questionType}
        selectedIds={data.userAnswer?.selectedOptionIds ?? []}
        onChange={() => {}}
        disabled
        correctIds={data.correctOptionIds}
        showResults
      />

      {data.userAnswer && (
        <AnswerFeedback
          isCorrect={data.userAnswer.isCorrect}
          explanation={data.explanation}
          hint={data.hint}
        />
      )}
    </div>
  )
}
