import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listQuestions } from '@/api/endpoints/tests'
import type { QuestionListItem } from '@/types/api'

export interface TestStats {
  totalAnswered: number
  totalCorrect: number
  totalIncorrect: number
}

export function deriveTestStats(items: QuestionListItem[]): TestStats {
  return {
    totalAnswered: items.filter((q) => q.answered).length,
    totalCorrect: items.filter((q) => q.isCorrect === true).length,
    totalIncorrect: items.filter((q) => q.isCorrect === false).length,
  }
}

export function useDerivedTestStats(testId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['tests', testId, 'questions'],
    queryFn: () => listQuestions(testId),
  })

  const stats = useMemo(
    () => (data ? deriveTestStats(data.items) : { totalAnswered: 0, totalCorrect: 0, totalIncorrect: 0 }),
    [data],
  )

  return { stats, questions: data?.items ?? [], isLoading }
}
