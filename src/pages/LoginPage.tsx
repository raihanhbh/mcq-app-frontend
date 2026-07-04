import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { recordLoginFailed } from '@/api/endpoints/auth'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ErrorBanner } from '@/components/ui/ErrorBanner'
import './LoginPage.css'

export function LoginPage() {
  const { firebaseUser, me, loading, inactiveMessage, signIn } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string })?.from ?? '/'
  const sessionExpired = searchParams.get('session') === 'expired'

  if (!loading && firebaseUser && me) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn(email.trim(), password)
    } catch {
      setError('Invalid username or password')
      void recordLoginFailed(email.trim()).catch(() => {})
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PublicLayout>
      <div className="login-form">
        <div className="login-form__card">
          <h2 className="login-form__title">Sign in</h2>
          <form className="stack" onSubmit={(e) => void handleSubmit(e)}>
            {sessionExpired && (
              <ErrorBanner message="Your session has expired. Please sign in again." variant="warning" />
            )}
            {inactiveMessage && <ErrorBanner message={inactiveMessage} />}
            {error && <ErrorBanner message={error} />}
            <Input
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </PublicLayout>
  )
}
