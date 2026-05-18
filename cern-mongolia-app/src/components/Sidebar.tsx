import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from './UI'

const navItems = {
  admin: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/dashboard/users', label: 'Users' },
    { to: '/dashboard/events', label: 'Events' },
    { to: '/dashboard/questions', label: 'Questions' },
    { to: '/scan', label: 'Scan Ticket' },  
    { to: '/validate', label: 'Ticket Validations' },  
  ],
  supervisor: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/dashboard/users', label: 'Users' },
    { to: '/dashboard/events', label: 'Events' },
    { to: '/dashboard/questions', label: 'Questions' },
    { to: '/scan', label: 'Scan Ticket' },  
    { to: '/validate', label: 'Ticket Validations' },  
  ],
  staff: [
    { to: '/dashboard', label: 'Overview' },
    { to: '/dashboard/questions', label: 'Questions' },
    { to: '/scan', label: 'Scan Ticket' },  
    { to: '/validate', label: 'Ticket Validations' },   
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
      width: 400,
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
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: '#ffffff', marginBottom: 2 , fontWeight: '200', textAlign: 'center'}}>
          CERN LHCb - MONGOLIA 2026
        </div>
      </div>

      {/* User info */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 20, fontWeight: 500, color: '#ffffff', marginBottom: 2, textAlign: 'center' }}>
          {user.firstname} {user.lastname}
        </div>
        <div style={{
          fontSize: 18, color: '#ffffff',
          fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
          letterSpacing: '0.06em',
          textAlign: 'center'
        }}>
          {user.role}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px', width: '100%' }}>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'block',
              padding: '8px 10px',
              borderRadius: 'var(--radius)',
              color: isActive ? '#ffffff' : 'var(--text-3)',
              background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              fontSize: 20,
              fontWeight: isActive ? 600 : 400,
              marginBottom: 2,
              transition: 'all 0.15s',
              textDecoration: 'none',
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
            width: '100%',          
            textAlign: 'center',       
            padding: '8px 10px',
            borderRadius: 'var(--radius)',
            background: 'none',
            border: 'none',
            color: '#ffffff',
            fontSize: 20,
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
