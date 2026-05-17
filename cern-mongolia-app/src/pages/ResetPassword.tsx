import { useState, FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resetPassword } from '../api/client'
import { Input, Btn, toast } from '../components/UI'
import ColliderBackground from '../components/ColliderBackground'
import LeftPanel from '../components/LeftPanel'

export default function ResetPassword() {
  const { token }    = useParams<{ token: string }>()
  const navigate     = useNavigate()
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading]                 = useState(false)
  const [error, setError]                     = useState('')
  const [success, setSuccess]                 = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      setError('Password must be at least 8 characters with uppercase and lowercase letters.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token!, newPassword)
      setSuccess(true)
      toast('Password reset successful!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Something went wrong. Try again.')
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

      <div className="auth-divider" style={{
        position: 'absolute', left: '60%', top: 0, bottom: 0, width: 1, zIndex: 5,
        background: 'linear-gradient(180deg,transparent 0%,rgba(56,189,248,.22) 30%,rgba(56,189,248,.32) 50%,rgba(56,189,248,.22) 70%,transparent 100%)',
      }} />

      <div className="auth-left-panel" style={{ display: 'contents' }}>
        <LeftPanel subtitle="Reset your account password" />
      </div>

      {/* Right — form */}
      <div
        className="auth-right-panel"
        style={{
          width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 52px', position: 'relative', zIndex: 10,
        }}
      >
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(6,10,22,.78)',
          border: '1px solid rgba(56,189,248,.16)',
          borderRadius: 16, padding: '40px 36px 36px',
          backdropFilter: 'blur(18px)',
        }}>

          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 16,
            color: '#ffffff', letterSpacing: '.12em', marginBottom: 8,
          }}>
            PARTICIPANT ACCESS
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
            Reset password
          </h1>

          <p style={{ fontSize: 15, color: '#ffffff', marginBottom: 28 }}>
            Enter your new password below
          </p>

          {success ? (
            <>
              <div style={{
                fontSize: 15, color: '#34d399',
                fontFamily: 'var(--font-mono)', marginBottom: 20,
              }}>
                ✓ Password reset successful — redirecting to login...
              </div>
              <div style={{
                padding: '10px 14px',
                background: 'rgba(52,211,153,.05)',
                border: '1px solid rgba(52,211,153,.18)',
                borderRadius: 8,
              }}>
                <p style={{ fontSize: 15, color: '#ffffff', margin: 0 }}>
                  You will be redirected to the{' '}
                  <span style={{ color: '#38bdf8', textDecoration: 'underline', cursor: 'pointer' }}
                    onClick={() => navigate('/login')}>
                    sign in page
                  </span>{' '}
                  in a moment.
                </p>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />

                <p style={{ fontSize: 15, color: '#94a3b8', marginTop: '-6px' }}>
                  Password must contain at least 8 characters, one uppercase and one lowercase letter.
                </p>

                {error && (
                  <div style={{ fontSize: 15, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                    ✗ {error}
                  </div>
                )}

                <Btn
                  type="submit"
                  loading={loading}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 4, fontSize: 16 }}
                >
                  Reset password →
                </Btn>
              </form>

              <p style={{ marginTop: 22, fontSize: 15, color: '#ffffff', textAlign: 'center' }}>
                Remembered it?{' '}
                <span
                  onClick={() => navigate('/login')}
                  style={{ color: '#ffffff', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Sign in
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}