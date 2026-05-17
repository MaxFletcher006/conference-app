import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth, isDashboardRole } from '../context/AuthContext'
import { Spinner } from '../components/UI'

export default function DashboardLayout() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

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
          marginLeft: 240,
          flex: 1,
          minHeight: '100vh',
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
        }}
      >
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="mobile-bottom-nav">
        <NavLink to="/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">📊</span>
          Overview
        </NavLink>
        <NavLink to="/dashboard/events" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">📅</span>
          Events
        </NavLink>
        <NavLink to="/dashboard/users" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">👥</span>
          Users
        </NavLink>
        <NavLink to="/dashboard/questions" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">💬</span>
          Questions
        </NavLink>
        <NavLink to="/scan" className={({ isActive }) => isActive ? 'active' : ''}>
          <span className="nav-icon">📷</span>
          Scan
        </NavLink>
        <button onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Sign out
        </button>
      </nav>
    </div>
  )
}