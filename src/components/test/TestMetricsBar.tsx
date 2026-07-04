import type { TestStats } from '@/hooks/useDerivedTestStats'
import './TestMetricsBar.css'

interface TestMetricsBarProps {
  stats: TestStats
  currentQuestion: number | null
  questionCap: number
}

export function TestMetricsBar({ stats, currentQuestion, questionCap }: TestMetricsBarProps) {
  return (
    <div className="metrics-bar">
      <div className="metrics-bar__item">
        <div className="metrics-bar__value">{stats.totalAnswered}</div>
        <div className="metrics-bar__label">Answered</div>
      </div>
      <div className="metrics-bar__item metrics-bar__item--correct">
        <div className="metrics-bar__value">{stats.totalCorrect}</div>
        <div className="metrics-bar__label">Correct</div>
      </div>
      <div className="metrics-bar__item metrics-bar__item--incorrect">
        <div className="metrics-bar__value">{stats.totalIncorrect}</div>
        <div className="metrics-bar__label">Incorrect</div>
      </div>
      <div className="metrics-bar__item metrics-bar__item--full">
        <div className="metrics-bar__value">
          {currentQuestion !== null ? `Q${currentQuestion + 1}` : '—'} / {questionCap}
        </div>
        <div className="metrics-bar__label">Current Question</div>
      </div>
    </div>
  )
}
