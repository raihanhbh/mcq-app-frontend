import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/Button'
import './AppShell.css'

const learnerLinks = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/tests/new', label: 'New Test', icon: '✏️' },
  { to: '/tests/recent', label: 'Recent', icon: '📋' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

const adminLinks = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/activities', label: 'Activities' },
  { to: '/admin/tests/edit', label: 'Edit Test' },
  { to: '/admin/settings', label: 'Settings' },
  { to: '/admin/alerts', label: 'Alerts' },
  { to: '/admin/ai-providers', label: 'AI Providers' },
]

export function AppShell() {
  const { me, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const hideNav = location.pathname.startsWith('/test/') && !location.pathname.includes('/history')

  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__header-inner">
          <span className="app-shell__logo">MCQ App</span>
          <div className="row">
            {isAdmin && (
              <Button variant="ghost" size="sm" onClick={() => setMenuOpen(true)}>
                Admin ▾
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className={`app-shell__main page ${hideNav ? 'page--no-nav' : ''}`}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      {!hideNav && (
        <nav className="app-shell__nav" aria-label="Main navigation">
          <div className="app-shell__nav-inner">
            {learnerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`app-shell__nav-link ${isActive(link.to) ? 'app-shell__nav-link--active' : ''}`}
              >
                <span className="app-shell__nav-icon" aria-hidden>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {menuOpen && (
        <>
          <div className="app-shell__menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="app-shell__menu-panel" role="dialog" aria-label="Admin menu">
            <div className="row-between" style={{ marginBottom: 'var(--space-4)' }}>
              <strong>Admin</strong>
              <Button variant="ghost" size="sm" onClick={() => setMenuOpen(false)}>Close</Button>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
              Signed in as {me?.displayName || me?.email}
            </p>
            <div className="app-shell__menu-section">
              <div className="app-shell__menu-section-title">Administration</div>
              {adminLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`app-shell__menu-link ${isActive(link.to) ? 'app-shell__menu-link--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
