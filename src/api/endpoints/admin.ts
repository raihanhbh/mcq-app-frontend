import { apiGet, apiPost, apiPut, apiPatch } from '@/api/client'
import type {
  ActivitiesSummary,
  ActivitySessionLog,
  AdminAlerts,
  AdminSettings,
  AdminUser,
  AiProvider,
  AiVendor,
  Difficulty,
  PaginatedResponse,
  ProviderStatus,
  UserActivity,
  UserRole,
} from '@/types/api'

export function listAdminUsers(params?: {
  status?: string
  role?: string
  limit?: number
  cursor?: string
}): Promise<PaginatedResponse<AdminUser>> {
  const search = new URLSearchParams()
  if (params?.status) search.set('status', params.status)
  if (params?.role) search.set('role', params.role)
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.cursor) search.set('cursor', params.cursor)
  const qs = search.toString()
  return apiGet<PaginatedResponse<AdminUser>>(`/api/v1/admin/users${qs ? `?${qs}` : ''}`)
}

export function createAdminUser(data: {
  email: string
  displayName: string
  role: UserRole
}): Promise<AdminUser> {
  return apiPost<AdminUser>('/api/v1/admin/users', data)
}

export function updateUserStatus(uid: string, status: 'active' | 'inactive'): Promise<AdminUser> {
  return apiPatch<AdminUser>(`/api/v1/admin/users/${uid}/status`, { status })
}

export function getUserActivity(
  uid: string,
  params?: { from?: string; to?: string; limit?: number },
): Promise<UserActivity> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.limit) search.set('limit', String(params.limit))
  const qs = search.toString()
  return apiGet<UserActivity>(`/api/v1/admin/users/${uid}/activity${qs ? `?${qs}` : ''}`)
}

export function getActivitiesSummary(params?: {
  from?: string
  to?: string
}): Promise<ActivitiesSummary> {
  const search = new URLSearchParams()
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  const qs = search.toString()
  return apiGet<ActivitiesSummary>(`/api/v1/admin/activities/summary${qs ? `?${qs}` : ''}`)
}

export function listActivitySessions(params?: {
  uid?: string
  from?: string
  to?: string
  limit?: number
  cursor?: string
}): Promise<PaginatedResponse<ActivitySessionLog>> {
  const search = new URLSearchParams()
  if (params?.uid) search.set('uid', params.uid)
  if (params?.from) search.set('from', params.from)
  if (params?.to) search.set('to', params.to)
  if (params?.limit) search.set('limit', String(params.limit))
  if (params?.cursor) search.set('cursor', params.cursor)
  const qs = search.toString()
  return apiGet<PaginatedResponse<ActivitySessionLog>>(
    `/api/v1/admin/activities/sessions${qs ? `?${qs}` : ''}`,
  )
}

export function getAdminSettings(): Promise<AdminSettings> {
  return apiGet<AdminSettings>('/api/v1/admin/settings')
}

export function updateAdminSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
  return apiPut<AdminSettings>('/api/v1/admin/settings', data)
}

export function getAdminAlerts(): Promise<AdminAlerts> {
  return apiGet<AdminAlerts>('/api/v1/admin/alerts')
}

export function updateAdminAlerts(data: AdminAlerts): Promise<AdminAlerts> {
  return apiPut<AdminAlerts>('/api/v1/admin/alerts', data)
}

export function listAiProviders(): Promise<{ items: AiProvider[] }> {
  return apiGet<{ items: AiProvider[] }>('/api/v1/admin/ai-providers')
}

export function createAiProvider(data: {
  name: string
  vendor: AiVendor
  modelId: string
  secretManagerRef: string
  difficultyLevels: Difficulty[]
  maxTokensPerCall: number
  monthlySpendCapUsd: number
  fallbackPriority: number
  status: ProviderStatus
}): Promise<AiProvider> {
  return apiPost<AiProvider>('/api/v1/admin/ai-providers', data)
}

export function updateAiProvider(
  providerId: string,
  data: Partial<{
    name: string
    vendor: AiVendor
    modelId: string
    secretManagerRef: string
    difficultyLevels: Difficulty[]
    maxTokensPerCall: number
    monthlySpendCapUsd: number
    fallbackPriority: number
    status: ProviderStatus
  }>,
): Promise<AiProvider> {
  return apiPut<AiProvider>(`/api/v1/admin/ai-providers/${providerId}`, data)
}

export function rotateProviderKey(
  providerId: string,
  secretManagerRef: string,
): Promise<AiProvider> {
  return apiPost<AiProvider>(`/api/v1/admin/ai-providers/${providerId}/rotate-key`, {
    secretManagerRef,
  })
}
