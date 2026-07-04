import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import type { TestStats } from '@/hooks/useDerivedTestStats'
import './TestCompletePanel.css'

interface TestCompletePanelProps {
  testId: string
  topic: string
  stats: TestStats
}

export function TestCompletePanel({ testId, topic, stats }: TestCompletePanelProps) {
  return (
    <div className="complete-panel">
      <div className="complete-panel__icon">🎉</div>
      <h2 className="complete-panel__title">Test Complete!</h2>
      <p className="complete-panel__subtitle">
        You&apos;ve finished all questions for &ldquo;{topic}&rdquo;.
      </p>
      <div className="stack-sm" style={{ marginBottom: 'var(--space-6)' }}>
        <p><strong>{stats.totalAnswered}</strong> answered · <strong>{stats.totalCorrect}</strong> correct · <strong>{stats.totalIncorrect}</strong> incorrect</p>
      </div>
      <div className="complete-panel__actions">
        <Link to={`/test/${testId}/history`}>
          <Button fullWidth variant="primary">View History</Button>
        </Link>
        <Link to="/tests/recent">
          <Button fullWidth variant="secondary">Back to Recent Tests</Button>
        </Link>
      </div>
    </div>
  )
}
