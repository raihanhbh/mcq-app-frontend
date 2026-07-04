import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Spinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { firebaseUser, me, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Spinner centered />
  }

  if (!firebaseUser || !me) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <Outlet />
}
