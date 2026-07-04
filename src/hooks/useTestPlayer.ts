import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getCurrentQuestionOrNull,
  getTest,
  nextQuestion,
  previousQuestion,
  submitAnswer,
} from '@/api/endpoints/tests'
import { ApiError } from '@/api/errors'
import type { CurrentQuestionResponse, SubmitAnswerResponse } from '@/types/api'

export function useTestPlayer(testId: string) {
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [localFeedback, setLocalFeedback] = useState<SubmitAnswerResponse | null>(null)

  const testQuery = useQuery({
    queryKey: ['tests', testId],
    queryFn: () => getTest(testId),
  })

  const currentQuery = useQuery({
    queryKey: ['tests', testId, 'current'],
    queryFn: async () => {
      const current = await getCurrentQuestionOrNull(testId)
      if (current) return current
      return nextQuestion(testId)
    },
    retry: false,
  })

  const current = currentQuery.data

  useEffect(() => {
    if (!current) return
    if (current.answer) {
      setSelectedIds(current.answer.selectedOptionIds)
      setLocalFeedback(null)
    } else {
      setSelectedIds([])
      setLocalFeedback(null)
    }
  }, [current?.sequenceIndex, current?.question?.id, current?.answer])

  const invalidateAll = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['tests', testId] })
    void queryClient.invalidateQueries({ queryKey: ['tests', testId, 'current'] })
    void queryClient.invalidateQueries({ queryKey: ['tests', testId, 'questions'] })
  }, [queryClient, testId])

  const answerMutation = useMutation({
    mutationFn: (ids: string[]) => {
      if (!current?.question) throw new Error('No question')
      return submitAnswer(testId, current.question.id, ids)
    },
    onSuccess: (result) => {
      setLocalFeedback(result)
      invalidateAll()
    },
    onError: (err) => {
      if (err instanceof ApiError && err.code === 'CONFLICT') {
        invalidateAll()
      }
    },
  })

  const nextMutation = useMutation({
    mutationFn: () => nextQuestion(testId),
    onSuccess: (data) => {
      queryClient.setQueryData(['tests', testId, 'current'], data)
      invalidateAll()
    },
  })

  const prevMutation = useMutation({
    mutationFn: () => previousQuestion(testId),
    onSuccess: (data) => {
      queryClient.setQueryData(['tests', testId, 'current'], data)
      invalidateAll()
    },
  })

  const isAnswered = Boolean(current?.answer)
  const isCorrect = current?.answer?.isCorrect ?? localFeedback?.isCorrect ?? false
  const showFeedback = isAnswered || localFeedback !== null

  const canGoBack = (current?.sequenceIndex ?? 0) > 0
  const isComplete = current?.isComplete ?? false

  return {
    test: testQuery.data,
    current: current as CurrentQuestionResponse | undefined,
    isLoading: testQuery.isLoading || currentQuery.isLoading,
    error: testQuery.error ?? currentQuery.error,
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
    refetch: () => {
      void testQuery.refetch()
      void currentQuery.refetch()
    },
  }
}
