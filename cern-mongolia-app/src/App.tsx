import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth, isDashboardRole } from './context/AuthContext'
import { ToastContainer, Spinner } from './components/UI'

import Login from './pages/Login'
import Register from './pages/Register'
import DashboardLayout from './pages/DashboardLayout'
import DashboardOverview from './pages/DashboardOverview'
import UsersPage from './pages/UsersPage'
import EventsPage from './pages/EventsPage'
import QuestionsPage from './pages/QuestionsPage'
import AttendeePage from './pages/AttendeePage'
import ValidatePage from './pages/ValidatePage'
import QRScanPage from './pages/QRScanPage'
import ResetPassword from './pages/ResetPassword'
import TicketValidationsPage from './pages/TicketValidationsPage'

// Guard: redirect based on auth state + role
function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center' }}><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  return isDashboardRole(user.role)
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/home" replace />
}

// Guard: only for attendees
function AttendeeRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center' }}><Spinner /></div>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (isDashboardRole(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

// Guard: public only (redirect if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center' }}><Spinner /></div>
  if (user) {
    return isDashboardRole(user.role)
      ? <Navigate to="/dashboard" replace />
      : <Navigate to="/home" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Attendee */}
      <Route path="/home" element={<AttendeeRoute><AttendeePage /></AttendeeRoute>} />

      {/* Validate — accessible to authenticated staff/admin/supervisor */}
      <Route path="/validate/:ticket_uuid" element={<ValidatePage />} />

      {/* Scan QR code*/}
      <Route path="/scan" element={<QRScanPage />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="questions" element={<QuestionsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/validate" element={<TicketValidationsPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}
