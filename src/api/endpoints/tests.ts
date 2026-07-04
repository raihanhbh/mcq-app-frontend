import { apiGet, apiPost, apiPatch, ApiError } from '@/api/client'
import type {
  CurrentQuestionResponse,
  PaginatedResponse,
  QuestionListItem,
  QuestionReview,
  SubmitAnswerResponse,
  TestSummary,
  Difficulty,
} from '@/types/api'

export function createTest(data: { topic: string; difficulty: Difficulty }): Promise<TestSummary> {
  return apiPost<TestSummary>('/api/v1/tests', data)
}

export function listTests(params?: {
  limit?: number
  cursor?: string
  status?: string
}): Promise<PaginatedResponse<TestSummary>> {
  const search = new URLSearchParams()
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.cursor) search.set('cursor', params.cursor)
  if (params?.status) search.set('status', params.status)
  const qs = search.toString()
  return apiGet<PaginatedResponse<TestSummary>>(`/api/v1/tests${qs ? `?${qs}` : ''}`)
}

export function getTest(testId: string): Promise<TestSummary> {
  return apiGet<TestSummary>(`/api/v1/tests/${testId}`)
}

export function getCurrentQuestion(testId: string): Promise<CurrentQuestionResponse> {
  return apiGet<CurrentQuestionResponse>(`/api/v1/tests/${testId}/current-question`)
}

export async function getCurrentQuestionOrNull(
  testId: string,
): Promise<CurrentQuestionResponse | null> {
  try {
    return await getCurrentQuestion(testId)
  } catch (err) {
    if (err instanceof ApiError && err.code === 'NO_QUESTION_SERVED') {
      return null
    }
    throw err
  }
}

export function nextQuestion(testId: string): Promise<CurrentQuestionResponse> {
  return apiPost<CurrentQuestionResponse>(`/api/v1/tests/${testId}/next`)
}

export function previousQuestion(testId: string): Promise<CurrentQuestionResponse> {
  return apiPost<CurrentQuestionResponse>(`/api/v1/tests/${testId}/previous`)
}

export function submitAnswer(
  testId: string,
  questionId: string,
  selectedOptionIds: string[],
): Promise<SubmitAnswerResponse> {
  return apiPost<SubmitAnswerResponse>(
    `/api/v1/tests/${testId}/questions/${questionId}/answers`,
    { selectedOptionIds },
  )
}

export function listQuestions(testId: string): Promise<{ items: QuestionListItem[] }> {
  return apiGet<{ items: QuestionListItem[] }>(`/api/v1/tests/${testId}/questions`)
}

export function getQuestionReview(testId: string, questionId: string): Promise<QuestionReview> {
  return apiGet<QuestionReview>(`/api/v1/tests/${testId}/questions/${questionId}/review`)
}

export function patchAdminTest(
  testId: string,
  data: { topic?: string; difficulty?: Difficulty },
): Promise<TestSummary> {
  return apiPatch<TestSummary>(`/api/v1/admin/tests/${testId}`, data)
}
