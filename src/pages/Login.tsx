import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth, isDashboardRole } from '../context/AuthContext'
import { Input, Btn, toast } from '../components/UI'
import { forgotPassword } from '../api/client'
import ColliderBackground from '../components/ColliderBackground'
import LeftPanel from '../components/LeftPanel'

function ForgotView({ onBack }: { onBack: () => void }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [sent, setSent]       = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff', letterSpacing: '.12em', marginBottom: 8 }}>
        PARTICIPANT ACCESS
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Reset password</h1>
      <p style={{ fontSize: 16, color: '#ffffff', marginBottom: 28 }}>
        We'll send a reset link to your email
      </p>

      {sent ? (
        <div style={{ fontSize: 16, color: '#34d399', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>
          ✓ Reset link sent — check your inbox.
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          {error && <div style={{ fontSize: 16, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>✗ {error}</div>}
          <Btn type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
            Send reset link
          </Btn>
        </form>
      )}

      <p style={{ marginTop: 20, fontSize: 16, color: '#ffffff', textAlign: 'center' }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', color: '#ffffff',
          textDecoration: 'underline', cursor: 'pointer', fontSize: 16,
        }}>
          ← Back to sign in
        </button>
      </p>
    </>
  )
}

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [view, setView]         = useState<'login' | 'forgot'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      toast(`Welcome back, ${user.firstname}`)
      navigate(isDashboardRole(user.role) ? '/dashboard' : '/home', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#060911', position: 'relative', overflow: 'hidden',
    }}>
      <ColliderBackground />

      {/* Divider — hidden on mobile via CSS class */}
      <div className="auth-divider" style={{
        position: 'absolute', left: '60%', top: 0, bottom: 0, width: 1, zIndex: 5,
        background: 'linear-gradient(180deg,transparent 0%,rgba(56,189,248,.22) 30%,rgba(56,189,248,.32) 50%,rgba(56,189,248,.22) 70%,transparent 100%)',
      }} />

      {/* Left panel — hidden on mobile */}
      <div className="auth-left-panel" style={{ display: 'contents' }}>
        <LeftPanel />
      </div>

      {/* Right — form */}
      <div
        className="auth-right-panel"
        style={{
          width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 52px', position: 'relative', zIndex: 10,
        }}
      >
        <Link to="/" style={{
          position: 'absolute', top: 20, right: 24,
          fontSize: 14, color: 'rgba(255,255,255,0.55)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
          display: 'flex', alignItems: 'center', gap: 5,
          transition: 'color 0.2s',
        }}
          onMouseOver={e => (e.currentTarget.style.color = '#ffffff')}
          onMouseOut={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
        >
          ← HOME
        </Link>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(6,10,22,.78)',
          border: '1px solid rgba(56,189,248,.16)',
          borderRadius: 16, padding: '40px 36px 36px',
          backdropFilter: 'blur(18px)',
        }}>
          {view === 'login' ? (
            <>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff', letterSpacing: '.12em', marginBottom: 8 }}>
                PARTICIPANT ACCESS
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Sign in</h1>
              <p style={{ fontSize: 16, color: '#ffffff', marginBottom: 28 }}>
                Access the conference platform
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                <Input label="Password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />

                <div style={{ textAlign: 'right', marginTop: -8 }}>
                  <button type="button" onClick={() => setView('forgot')} style={{
                    background: 'none', border: 'none', fontSize: 16,
                    color: '#ffffff', cursor: 'pointer', textDecoration: 'underline', padding: 0,
                  }}>
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <div style={{ fontSize: 16, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                    ✗ {error}
                  </div>
                )}
                <Btn type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: 16 }}>
                  Sign in →
                </Btn>
              </form>

              <p style={{ marginTop: 22, fontSize: 16, color: '#ffffff', textAlign: 'center' }}>
                No account?{' '}
                <Link to="/register" style={{ color: '#ffffff', textDecoration: 'underline' }}>Register</Link>
              </p>
            </>
          ) : (
            <ForgotView onBack={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  )
}