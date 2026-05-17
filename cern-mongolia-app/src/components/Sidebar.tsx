import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from './UI'

const navItems = {
  admin: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/dashboard/users', label: 'Users' },
    { to: '/dashboard/events', label: 'Events' },
    { to: '/dashboard/questions', label: 'Questions' },
  ],
  supervisor: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/dashboard/users', label: 'Users' },
    { to: '/dashboard/events', label: 'Events' },
    { to: '/dashboard/questions', label: 'Questions' },
  ],
  staff: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/dashboard/questions', label: 'Questions' },
  ],
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null

  const items = navItems[user.role as keyof typeof navItems] || []

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch {
      toast('Logout failed', 'err')
    }
  }

  return (
    <aside style={{
      width: 200,
      minHeight: '100vh',
      background: 'var(--bg-2)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>
          CERN MONGOLIA
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>2026</div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', marginBottom: 2 }}>
          {user.firstname} {user.lastname}
        </div>
        <div style={{
          fontSize: 10, color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}>
          {user.role}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'block',
              padding: '8px 10px',
              borderRadius: 'var(--radius)',
              color: isActive ? 'var(--text)' : 'var(--text-3)',
              background: isActive ? 'var(--bg-3)' : 'transparent',
              fontSize: 13,
              fontWeight: isActive ? 500 : 400,
              marginBottom: 2,
              transition: 'all 0.15s',
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', textAlign: 'left',
            padding: '8px 10px', borderRadius: 'var(--radius)',
            background: 'none', border: 'none',
            color: 'var(--text-3)', fontSize: 13, cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
