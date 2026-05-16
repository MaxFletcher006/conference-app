import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import Dashboard from './Dashboard'
import StaffValidate from './StaffValidate'

function AppInner() {
  const { user } = useAuth()
  const path = window.location.pathname

  // /validate/:uuid is fully standalone — StaffValidate handles its own auth
  if (path.startsWith('/validate/')) {
    const uuid = path.replace('/validate/', '')
    return <StaffValidate ticketUuid={uuid} />
  }

  // Everything else: admin dashboard
  return user ? <Dashboard /> : <Login />
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}