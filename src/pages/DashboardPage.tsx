import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card } from '@/components/ui/Card'

export function DashboardPage() {
  const { me, isAdmin } = useAuth()

  return (
    <div className="stack">
      <PageHeader
        title={`Hello, ${me?.displayName || 'Learner'}`}
        subtitle="What would you like to do today?"
      />

      <div className="stack">
        <Link to="/tests/new" style={{ textDecoration: 'none' }}>
          <Card clickable title="New Knowledge Test" meta="Start a test on any topic">
            <span style={{ fontSize: '1.5rem' }}>✏️</span>
          </Card>
        </Link>

        <Link to="/tests/recent" style={{ textDecoration: 'none' }}>
          <Card clickable title="Recent Tests" meta="Continue or review past tests">
            <span style={{ fontSize: '1.5rem' }}>📋</span>
          </Card>
        </Link>

        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <Card clickable title="Profile" meta="View and update your profile">
            <span style={{ fontSize: '1.5rem' }}>👤</span>
          </Card>
        </Link>

        {isAdmin && (
          <>
            <h2 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)', marginTop: 'var(--space-4)' }}>
              Admin
            </h2>
            <Link to="/admin/users" style={{ textDecoration: 'none' }}>
              <Card clickable title="Manage Users" meta="Invite, activate, and deactivate users" />
            </Link>
            <Link to="/admin/activities" style={{ textDecoration: 'none' }}>
              <Card clickable title="Activities" meta="View learner engagement metrics" />
            </Link>
            <Link to="/admin/settings" style={{ textDecoration: 'none' }}>
              <Card clickable title="Settings" meta="Configure global app settings" />
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
