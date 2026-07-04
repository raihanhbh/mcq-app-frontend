import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { AdminRoute } from '@/routes/AdminRoute'
import { AppShell } from '@/layouts/AppShell'
import { Spinner } from '@/components/ui/Spinner'

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const NewTestPage = lazy(() => import('@/pages/NewTestPage').then((m) => ({ default: m.NewTestPage })))
const TestPlayerPage = lazy(() => import('@/pages/TestPlayerPage').then((m) => ({ default: m.TestPlayerPage })))
const TestHistoryPage = lazy(() => import('@/pages/TestHistoryPage').then((m) => ({ default: m.TestHistoryPage })))
const QuestionReviewPage = lazy(() => import('@/pages/QuestionReviewPage').then((m) => ({ default: m.QuestionReviewPage })))
const RecentTestsPage = lazy(() => import('@/pages/RecentTestsPage').then((m) => ({ default: m.RecentTestsPage })))
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })))
const AdminActivitiesPage = lazy(() => import('@/pages/admin/AdminActivitiesPage').then((m) => ({ default: m.AdminActivitiesPage })))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then((m) => ({ default: m.AdminSettingsPage })))
const AdminAlertsPage = lazy(() => import('@/pages/admin/AdminAlertsPage').then((m) => ({ default: m.AdminAlertsPage })))
const AdminAiProvidersPage = lazy(() => import('@/pages/admin/AdminAiProvidersPage').then((m) => ({ default: m.AdminAiProvidersPage })))
const AdminEditTestPage = lazy(() => import('@/pages/admin/AdminEditTestPage').then((m) => ({ default: m.AdminEditTestPage })))

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<Spinner centered />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <Lazy>
        <LoginPage />
      </Lazy>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: '/',
            element: (
              <Lazy>
                <DashboardPage />
              </Lazy>
            ),
          },
          {
            path: '/tests/new',
            element: (
              <Lazy>
                <NewTestPage />
              </Lazy>
            ),
          },
          {
            path: '/tests/recent',
            element: (
              <Lazy>
                <RecentTestsPage />
              </Lazy>
            ),
          },
          {
            path: '/test/:testId',
            element: (
              <Lazy>
                <TestPlayerPage />
              </Lazy>
            ),
          },
          {
            path: '/test/:testId/history',
            element: (
              <Lazy>
                <TestHistoryPage />
              </Lazy>
            ),
          },
          {
            path: '/test/:testId/review/:questionId',
            element: (
              <Lazy>
                <QuestionReviewPage />
              </Lazy>
            ),
          },
          {
            path: '/profile',
            element: (
              <Lazy>
                <ProfilePage />
              </Lazy>
            ),
          },
          {
            element: <AdminRoute />,
            children: [
              {
                path: '/admin/users',
                element: (
                  <Lazy>
                    <AdminUsersPage />
                  </Lazy>
                ),
              },
              {
                path: '/admin/activities',
                element: (
                  <Lazy>
                    <AdminActivitiesPage />
                  </Lazy>
                ),
              },
              {
                path: '/admin/settings',
                element: (
                  <Lazy>
                    <AdminSettingsPage />
                  </Lazy>
                ),
              },
              {
                path: '/admin/alerts',
                element: (
                  <Lazy>
                    <AdminAlertsPage />
                  </Lazy>
                ),
              },
              {
                path: '/admin/ai-providers',
                element: (
                  <Lazy>
                    <AdminAiProvidersPage />
                  </Lazy>
                ),
              },
              {
                path: '/admin/tests/edit',
                element: (
                  <Lazy>
                    <AdminEditTestPage />
                  </Lazy>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
