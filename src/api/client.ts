import { auth, getApiBaseUrl } from '@/auth/firebase'
import { ApiError, parseApiError } from '@/api/errors'

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
  auth?: boolean
  skipAuthRetry?: boolean
}

let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

async function getToken(forceRefresh = false): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return user.getIdToken(forceRefresh)
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth: requireAuth = true, skipAuthRetry = false, ...init } = options

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string>),
  }

  if (requireAuth) {
    const token = await getToken(false)
    if (token) headers.Authorization = `Bearer ${token}`
  }

  const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`

  const response = await fetch(url, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && requireAuth && !skipAuthRetry) {
    const refreshed = await getToken(true)
    if (refreshed) {
      return apiFetch<T>(path, {
        ...options,
        skipAuthRetry: true,
        headers: { ...headers, Authorization: `Bearer ${refreshed}` },
      })
    }
    onUnauthorized?.()
    throw await parseApiError(response)
  }

  if (!response.ok) {
    throw await parseApiError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export async function apiGet<T>(path: string, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'GET', auth })
}

export async function apiPost<T>(path: string, body?: unknown, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body, auth })
}

export async function apiPatch<T>(path: string, body?: unknown, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'PATCH', body, auth })
}

export async function apiPut<T>(path: string, body?: unknown, auth = true): Promise<T> {
  return apiFetch<T>(path, { method: 'PUT', body, auth })
}

export { ApiError }
