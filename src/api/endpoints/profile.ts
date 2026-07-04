import { apiGet, apiPatch } from '@/api/client'
import type { Profile } from '@/types/api'

export function getProfile(): Promise<Profile> {
  return apiGet<Profile>('/api/v1/profile')
}

export function updateProfile(data: { displayName: string }): Promise<Profile> {
  return apiPatch<Profile>('/api/v1/profile', data)
}
