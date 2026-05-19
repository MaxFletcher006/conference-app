import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth, isDashboardRole } from './context/AuthContext'
import { ToastContainer, Spinner } from './components/UI'

// LHCB2026 public layout
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { LanguageProvider } from './context/LanguageContext'
import Home from './pages/Home'
import About from './pages/About'
import Speakers from './pages/Speakers'
import SpeakerDetail from './pages/SpeakerDetail'
import Contact from './pages/Contact'
import Partners from './pages/Partners'

// Auth pages (no LHCB layout)
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'

// Dashboard pages
import DashboardLayout from './pages/DashboardLayout'
import DashboardOverview from './pages/DashboardOverview'
import UsersPage from './pages/UsersPage'
import EventsPage from './pages/EventsPage'
import QuestionsPage from './pages/QuestionsPage'
import AttendeePage from './pages/AttendeePage'
import ValidatePage from './pages/ValidatePage'
import QRScanPage from './pages/QRScanPage'
import TicketValidationsPage from './pages/TicketValidationsPage'

// ── Auth guards ────────────────────────────────────────────────────────────────

function RootRedirect() {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!user) return null // render LHCB home
  return isDashboardRole(user.role)
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/home" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (user) return isDashboardRole(user.role)
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/home" replace />
  return <>{children}</>
}

function AttendeeRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <LoadingScreen />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (isDashboardRole(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )
}

// ── LHCB public layout wrapper ─────────────────────────────────────────────────
function PublicLayout() {
  return (
    <LanguageProvider>
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                  element={<><RootRedirect /><Home /></>} />
          <Route path="/about"             element={<About />} />
          <Route path="/speakers"          element={<Speakers />} />
          <Route path="/speakers/:slug"    element={<SpeakerDetail />} />
          <Route path="/contact"           element={<Contact />} />
          <Route path="/partners"          element={<Partners />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </LanguageProvider>
  )
}

// ── Root app ──────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* Auth pages — no LHCB navbar */}
      <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Attendee home */}
      <Route path="/home" element={<AttendeeRoute><AttendeePage /></AttendeeRoute>} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="users"     element={<UsersPage />} />
        <Route path="events"    element={<EventsPage />} />
        <Route path="questions" element={<QuestionsPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/scan"                    element={<QRScanPage />} />
        <Route path="/validate"                element={<TicketValidationsPage />} />
        <Route path="/validate/:ticket_uuid"   element={<ValidatePage />} />
      </Route>

      {/* LHCB public pages — everything else */}
      <Route path="/*" element={<PublicLayout />} />
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
