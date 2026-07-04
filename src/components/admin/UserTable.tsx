import { formatDate } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import type { AdminUser } from '@/types/api'
import './UserTable.css'

interface UserTableProps {
  users: AdminUser[]
  onToggleStatus: (uid: string, currentStatus: string) => void
  loadingUid?: string | null
}

export function UserTable({ users, onToggleStatus, loadingUid }: UserTableProps) {
  if (users.length === 0) {
    return <p style={{ color: 'var(--color-text-muted)' }}>No users found.</p>
  }

  return (
    <div className="user-list">
      {users.map((user) => (
        <div key={user.uid} className="user-list__item">
          <div className="user-list__header">
            <div>
              <div className="user-list__name">{user.displayName || '—'}</div>
              <div className="user-list__email">{user.email}</div>
            </div>
            <span className={`user-list__badge user-list__badge--${user.status === 'active' ? 'active' : 'inactive'}`}>
              {user.status}
            </span>
          </div>
          <div className="user-list__meta">
            {user.role} · Joined {formatDate(user.createdAt)}
            {user.lastLoginAt && ` · Last login ${formatDate(user.lastLoginAt)}`}
          </div>
          {user.status !== 'pending_invite' && (
            <div className="user-list__actions">
              <Button
                size="sm"
                variant={user.status === 'active' ? 'danger' : 'primary'}
                disabled={loadingUid === user.uid}
                onClick={() => onToggleStatus(user.uid, user.status)}
              >
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
