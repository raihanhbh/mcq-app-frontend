export type UserRole = 'learner' | 'admin'
export type UserStatus = 'active' | 'inactive' | 'pending_invite'
export type Difficulty = 'basic' | 'moderate' | 'advanced' | 'challenge'
export type TestStatus = 'in_progress' | 'completed'
export type QuestionType = 'single' | 'multiple'
export type AiVendor = 'anthropic' | 'google' | 'openai'
export type ProviderStatus = 'active' | 'inactive'

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export interface MeResponse {
  uid: string
  email: string
  displayName: string
  role: UserRole
  status: UserStatus
}

export interface Profile extends MeResponse {
  createdAt: string
  lastLoginAt: string
}

export interface TestSummary {
  id: string
  topic: string
  topicSlug: string
  difficulty: Difficulty
  status: TestStatus
  questionCap: number
  servedCount: number
  currentSequenceIndex: number
  createdAt: string
  completedAt?: string | null
}

export interface PaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
}

export interface QuestionOption {
  id: string
  text: string
}

export interface Question {
  id: string
  text: string
  options: QuestionOption[]
  questionType: QuestionType
  tier: Difficulty
}

export interface QuestionAnswer {
  selectedOptionIds: string[]
  isCorrect: boolean
  answeredAt: string
}

export interface CurrentQuestionResponse {
  testId: string
  sequenceIndex: number
  totalServed: number
  questionCap: number
  isComplete: boolean
  question: Question | null
  answer: QuestionAnswer | null
}

export interface SubmitAnswerResponse {
  isCorrect: boolean
  correctOptionIds: string[]
  explanation: string
  hint: string
  answeredAt: string
}

export interface QuestionListItem {
  id: string
  sequenceIndex: number
  text: string
  answered: boolean
  isCorrect: boolean | null
}

export interface QuestionReview extends Question {
  sequenceIndex: number
  correctOptionIds: string[]
  explanation: string
  hint: string
  userAnswer: QuestionAnswer | null
}

export interface AdminUser extends MeResponse {
  createdAt: string
  lastLoginAt: string | null
}

export interface UserActivitySession {
  sessionId: string
  testId: string
  topic: string
  sessionStart: string
  sessionEnd: string
  questionsAnswered: number
  durationSeconds: number
}

export interface UserActivity {
  uid: string
  sessions: UserActivitySession[]
  totalQuestionsAnswered: number
  totalSessions: number
}

export interface PasswordComplexity {
  minLength: number
  requireUpper: boolean
  requireLower: boolean
  requireDigit: boolean
  requireSpecial: boolean
}

export interface AdminSettings {
  maxQuestionsPerTopicDefault: number
  maxQuestionsPerTopicOverrides: Record<string, number>
  poolLowWaterMark: number
  generationBatchSize: number
  maxLoginAttempts: number
  sessionTimeoutMinutes: number
  maxConcurrentSessionsPerLearner: number
  minPasswordComplexity: PasswordComplexity
  dataRetentionDays: number
  dailyLlmTokenBudget: number
  monthlyLlmTokenBudget: number
  updatedAt: string
  updatedBy: string
}

export interface AdminAlerts {
  alertEmail: string
  alertThresholdPercent: number
  maxLoginAttempts: number
}

export interface ProviderUsage {
  callsThisMonth: number
  estimatedTokensThisMonth: number
  estimatedCostUsdThisMonth: number
  periodStart: string
}

export interface AiProvider {
  id: string
  name: string
  vendor: AiVendor
  modelId: string
  secretManagerRef: string
  difficultyLevels: Difficulty[]
  maxTokensPerCall: number
  monthlySpendCapUsd: number
  status: ProviderStatus
  fallbackPriority: number
  usage: ProviderUsage
  createdAt: string
  updatedAt: string
}

export interface ActivitiesSummary {
  period: { from: string; to: string }
  totalSessions: number
  totalQuestionsAnswered: number
  avgSessionDurationSeconds: number
  topicsCreated: { topicSlug: string; count: number }[]
  activeUsers: number
}

export interface ActivitySessionLog {
  id: string
  uid: string
  sessionId: string
  testId: string
  topic: string
  topicSlug: string
  sessionStart: string
  sessionEnd: string
  questionsAnswered: number
  durationSeconds: number
}
