import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '@/auth/firebase'
import { getMe } from '@/api/endpoints/auth'
import { setUnauthorizedHandler } from '@/api/client'
import { ApiError } from '@/api/errors'
import type { MeResponse } from '@/types/api'

interface AuthContextValue {
  firebaseUser: User | null
  me: MeResponse | null
  loading: boolean
  loginError: string | null
  inactiveMessage: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  clearLoginError: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [me, setMe] = useState<MeResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [inactiveMessage, setInactiveMessage] = useState<string | null>(null)

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    setMe(null)
    setFirebaseUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut()
      window.location.href = '/login?session=expired'
    })
  }, [signOut])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (!user) {
        setMe(null)
        setLoading(false)
        return
      }

      try {
        const profile = await getMe()
        if (profile.status === 'inactive') {
          setInactiveMessage('Your account has been deactivated. Please contact an administrator.')
          await firebaseSignOut(auth)
          setMe(null)
        } else {
          setMe(profile)
          setInactiveMessage(null)
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) {
          setInactiveMessage('Your account is not active. Please contact an administrator.')
          await firebaseSignOut(auth)
          setMe(null)
        } else {
          setMe(null)
        }
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoginError(null)
    await signInWithEmailAndPassword(auth, email, password)
    const profile = await getMe()
    if (profile.status === 'inactive') {
      await firebaseSignOut(auth)
      setInactiveMessage('Your account has been deactivated. Please contact an administrator.')
      throw new Error('inactive')
    }
    setMe(profile)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      me,
      loading,
      loginError,
      inactiveMessage,
      signIn,
      signOut,
      clearLoginError: () => setLoginError(null),
      isAdmin: me?.role === 'admin',
    }),
    [firebaseUser, me, loading, loginError, inactiveMessage, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
