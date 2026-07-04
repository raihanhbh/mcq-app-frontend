import './AnswerFeedback.css'

interface AnswerFeedbackProps {
  isCorrect: boolean
  explanation?: string
  hint?: string
}

export function AnswerFeedback({ isCorrect, explanation, hint }: AnswerFeedbackProps) {
  return (
    <div className={`feedback ${isCorrect ? 'feedback--correct' : 'feedback--incorrect'}`}>
      <div className="feedback__title">{isCorrect ? 'Correct!' : 'Not quite'}</div>
      <div className="feedback__body">
        {isCorrect ? explanation : hint}
      </div>
    </div>
  )
}
