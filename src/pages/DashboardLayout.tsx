import { useState } from 'react'
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import CreateTicketModal from '../components/CreateTicketModal'
import { useAuth, isDashboardRole } from '../context/AuthContext'
import { Spinner } from '../components/UI'

// Primary tabs shown in the bottom bar
const PRIMARY_NAV: Record<string, { to: string; label: string; icon: string; end?: boolean }[]> = {
  admin: [
    { to: '/dashboard',        label: 'Overview', icon: '📊', end: true },
    { to: '/dashboard/events', label: 'Events',   icon: '📅' },
    { to: '/dashboard/posts',  label: 'Posts',    icon: '📢' },
    { to: '/scan',             label: 'Scan',     icon: '📷' },
  ],
  supervisor: [
    { to: '/dashboard',        label: 'Overview', icon: '📊', end: true },
    { to: '/dashboard/events', label: 'Events',   icon: '📅' },
    { to: '/dashboard/posts',  label: 'Posts',    icon: '📢' },
    { to: '/scan',             label: 'Scan',     icon: '📷' },
  ],
  staff: [
    { to: '/dashboard',           label: 'Overview',  icon: '📊', end: true },
    { to: '/dashboard/questions', label: 'Questions', icon: '💬' },
    { to: '/scan',                label: 'Scan',      icon: '📷' },
  ],
}

// Extra items shown inside the "More" drawer (admin/supervisor only)
const MORE_NAV: Record<string, { to: string; label: string; icon: string }[]> = {
  admin: [
    { to: '/dashboard/users',        label: 'Users',        icon: '👥' },
    { to: '/dashboard/tickets',      label: 'Tickets',      icon: '🎫' },
    { to: '/dashboard/questions',    label: 'Questions',    icon: '💬' },
    { to: '/dashboard/validations',  label: 'Validations',  icon: '✅' },
    { to: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
  ],
  supervisor: [
    { to: '/dashboard/users',        label: 'Users',        icon: '👥' },
    { to: '/dashboard/tickets',      label: 'Tickets',      icon: '🎫' },
    { to: '/dashboard/questions',    label: 'Questions',    icon: '💬' },
    { to: '/dashboard/validations',  label: 'Validations',  icon: '✅' },
    { to: '/dashboard/transactions', label: 'Transactions', icon: '💳' },
  ],
}

export default function DashboardLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const [createTicketOpen, setCreateTicketOpen] = useState(false)

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (!isDashboardRole(user.role)) return <Navigate to="/home" replace />

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const role = user.role as keyof typeof PRIMARY_NAV
  const primaryItems = PRIMARY_NAV[role] ?? PRIMARY_NAV.staff
  const moreItems = MORE_NAV[role] ?? []
  const hasMore = moreItems.length > 0
  const canCreateTicket = ['admin', 'supervisor', 'staff'].includes(user.role)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {/* Background */}
      <div className="grid-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{ flexDirection: 'column' }}>
        <Sidebar />
      </div>

      <main
        className="dashboard-main"
        style={{
          flex: 1, minHeight: '100vh',
          background: 'transparent',
          position: 'relative', zIndex: 1,
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </main>

      {/* Create Ticket modal (mobile) */}
      {createTicketOpen && <CreateTicketModal onClose={() => setCreateTicketOpen(false)} />}

      {/* "More" drawer backdrop */}
      {moreOpen && (
        <div
          onClick={() => setMoreOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 98,
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* "More" drawer — slides up above the bottom nav (mobile only) */}
      {(hasMore || canCreateTicket) && (
        <div
          className="more-drawer"
          style={{
            transform: moreOpen ? 'translateY(0)' : 'translateY(105%)',
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center' }}>
            {moreItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className={({ isActive }) => `more-drawer-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}

            {canCreateTicket && (
              <button
                className="more-drawer-link"
                onClick={() => { setMoreOpen(false); setCreateTicketOpen(true) }}
                style={{ color: 'var(--blue)' }}
              >
                <span className="nav-icon">🎟️</span>
                Create Ticket
              </button>
            )}

            <button
              className="more-drawer-link"
              onClick={() => { setMoreOpen(false); handleLogout() }}
            >
              <span className="nav-icon">🚪</span>
              Sign out
            </button>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        {primaryItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        {/* Staff: no More drawer → show Create Ticket + Sign out directly */}
        {!hasMore && canCreateTicket ? (
          <>
            <button onClick={() => setCreateTicketOpen(true)} style={{ color: 'var(--blue)' }}>
              <span className="nav-icon">🎟️</span>
              Ticket
            </button>
            <button onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              Sign out
            </button>
          </>
        ) : !hasMore ? (
          <button onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            Sign out
          </button>
        ) : (
          <button
            onClick={() => setMoreOpen(v => !v)}
            style={{ color: moreOpen ? 'var(--blue)' : undefined }}
          >
            <span className="nav-icon">{moreOpen ? '✕' : '•••'}</span>
            More
          </button>
        )}
      </nav>
    </div>
  )
}
