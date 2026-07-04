import { Link } from 'react-router-dom'
import type { QuestionListItem } from '@/types/api'
import './QuestionHistoryList.css'

interface QuestionHistoryListProps {
  testId: string
  questions: QuestionListItem[]
}

export function QuestionHistoryList({ testId, questions }: QuestionHistoryListProps) {
  const sorted = [...questions].sort((a, b) => a.sequenceIndex - b.sequenceIndex)

  return (
    <div className="history-list">
      {sorted.map((q) => {
        const badge =
          !q.answered ? 'Unanswered'
          : q.isCorrect ? 'Correct'
          : 'Incorrect'

        const badgeClass =
          !q.answered ? 'history-list__badge--unanswered'
          : q.isCorrect ? 'history-list__badge--correct'
          : 'history-list__badge--incorrect'

        return (
          <Link
            key={q.id}
            to={q.answered ? `/test/${testId}/review/${q.id}` : '#'}
            className="history-list__item"
            onClick={!q.answered ? (e) => e.preventDefault() : undefined}
            style={!q.answered ? { opacity: 0.6, cursor: 'default' } : undefined}
          >
            <span className="history-list__text">
              Q{q.sequenceIndex + 1}. {q.text}
            </span>
            <span className={`history-list__badge ${badgeClass}`}>{badge}</span>
          </Link>
        )
      })}
    </div>
  )
}
