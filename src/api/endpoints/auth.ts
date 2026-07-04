import { apiGet, apiPost } from '@/api/client'
import type { MeResponse } from '@/types/api'

export function getMe(): Promise<MeResponse> {
  return apiGet<MeResponse>('/api/v1/me')
}

export function recordLoginFailed(email: string): Promise<{ recorded: boolean; alertSent: boolean }> {
  return apiPost('/api/v1/auth/login-failed', { email }, false)
}
