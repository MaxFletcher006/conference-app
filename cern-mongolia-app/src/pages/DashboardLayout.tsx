import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { useAuth, isDashboardRole } from '../context/AuthContext'
import { Spinner } from '../components/UI'

export default function DashboardLayout() {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />
  if (!isDashboardRole(user.role)) return <Navigate to="/home" replace />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', position: 'relative' }}>
      {/* Background */}
      <div className="grid-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      <Sidebar />
      <main style={{
        marginLeft: 240,
        flex: 1,
        minHeight: '100vh',
        background: 'transparent',
        position: 'relative',
        zIndex: 1,
        overflowY: 'auto',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
