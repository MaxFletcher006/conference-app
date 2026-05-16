import { useState, useEffect } from 'react'
import api from './api'

/**
 * Flow:
 *  1. QR code on ticket encodes:  https://yoursite.com/validate/{qr_code_data}
 *  2. Staff scans QR on mobile → browser opens this page
 *  3. If not logged in → show staff login form
 *  4. On login success → immediately call GET /validate/:uuid
 *  5. Show result: VALID / EXPIRED / ERROR
 *
 * This component is completely standalone — it has its own login state
 * and does NOT share auth with the admin dashboard.
 */
export default function StaffValidate({ ticketUuid }) {
  const [staffUser, setStaffUser]   = useState(null)
  const [checking, setChecking]     = useState(false)  // true while validating
  const [result, setResult]         = useState(null)   // validation result

  // Login form state
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [loginErr, setLoginErr]     = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // ── Validate the ticket ────────────────────────────────────────────────────
  async function validate() {
    setChecking(true)
    setResult(null)
    try {
      const res = await api.get(`/validate/${ticketUuid}`)
      setResult({ ok: true, ...res.data })
    } catch (err) {
      const status = err.response?.status
      const detail = err.response?.data?.detail || err.message || 'Something went wrong'
      setResult({ ok: false, status, detail })
    } finally {
      setChecking(false)
    }
  }

  // ── Staff login, then immediately validate ─────────────────────────────────
  async function handleLogin() {
    setLoginErr('')
    setLoginLoading(true)
    try {
      const params = new URLSearchParams({ email, password })
      const res = await api.post(`/login?${params}`)
      const u = res.data

      // Only staff / admin / supervisor can validate
      if (!['staff', 'admin', 'supervisor'].includes(u.role)) {
        await api.post('/logout')
        setLoginErr('Access denied — staff account required')
        return
      }

      setStaffUser(u)
      // Session cookie is now set; validate immediately
      await validate()
    } catch (err) {
      setLoginErr(err.response?.data?.detail || err.message || 'Login failed')
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Result display config ──────────────────────────────────────────────────
  function getResultStyle(result) {
    if (!result) return null
    if (result.ok && result.status === 'valid') {
      return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)', icon: '✓', label: 'VALID' }
    }
    if (result.ok && result.status === 'expired') {
      return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', icon: '✗', label: 'EXPIRED' }
    }
    if (!result.ok && result.status === 404) {
      return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)', icon: '✗', label: 'NOT FOUND' }
    }
    if (!result.ok && result.status === 403) {
      return { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', icon: '⊘', label: 'FORBIDDEN' }
    }
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)', icon: '!', label: 'ERROR' }
  }

  const rs = getResultStyle(result)

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.07) 0%, transparent 70%), var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ── Logo ── */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px', filter: 'drop-shadow(0 0 12px rgba(56,189,248,0.4))' }}>⚛</div>
        <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          CERN Mongolia 2026
        </h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
          Staff · Ticket Validation
        </p>
      </div>

      {/* ── Ticket UUID pill ── */}
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <span style={{ fontSize: '20px' }}>🎫</span>
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Ticket UUID
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--accent)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {ticketUuid}
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div style={{
        width: '100%', maxWidth: '400px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '28px 24px',
        boxShadow: '0 0 40px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>

        {/* ── NOT LOGGED IN: show staff login ── */}
        {!staffUser && (
          <>
            <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--muted)', textAlign: 'center' }}>
              Sign in with your staff account
            </p>

            <div className="field-group">
              <label>Email</label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="staff@cern.mn"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loginLoading && handleLogin()}
              />
            </div>

            {loginErr && <div className="error-banner">{loginErr}</div>}

            <button
              className="btn-primary"
              style={{ padding: '13px', fontSize: '14px', marginTop: '4px' }}
              disabled={loginLoading || !email || !password}
              onClick={handleLogin}
            >
              {loginLoading ? 'Signing in…' : 'Sign In & Validate'}
            </button>
          </>
        )}

        {/* ── LOGGED IN: show who's checking + result ── */}
        {staffUser && (
          <>
            {/* Staff identity chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 14px',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Checked by
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)', marginTop: '2px' }}>
                  {staffUser.title}. {staffUser.firstname} {staffUser.lastname}
                </div>
              </div>
              <span className={`role-badge role-${staffUser.role}`}>{staffUser.role}</span>
            </div>

            {/* Checking spinner */}
            {checking && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--muted)' }}>
                  Checking ticket…
                </div>
              </div>
            )}

            {/* Result card */}
            {!checking && rs && (
              <div style={{
                borderRadius: '12px',
                border: `1px solid ${rs.border}`,
                background: rs.bg,
                padding: '32px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                animation: 'fadeIn 0.25s ease',
              }}>
                {/* Big status icon */}
                <div style={{
                  width: '72px', height: '72px',
                  borderRadius: '50%',
                  border: `2px solid ${rs.color}`,
                  background: rs.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', color: rs.color, fontWeight: 700,
                }}>
                  {rs.icon}
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: rs.color, letterSpacing: '0.06em' }}>
                  {rs.label}
                </div>

                <div style={{ fontSize: '14px', color: 'var(--text)', opacity: 0.8 }}>
                  {result.ok ? result.detail : result.detail}
                </div>

                {/* Remaining entries badge */}
                {result.ok && result.remaining_entries != null && (
                  <div style={{
                    marginTop: '6px',
                    fontFamily: 'var(--font-mono)', fontSize: '13px',
                    color: 'var(--muted)',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '6px 20px',
                  }}>
                    Remaining entries:{' '}
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                      {result.remaining_entries}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Re-check button */}
            {!checking && result && (
              <button className="btn-run" style={{ textAlign: 'center' }} onClick={validate}>
                Re-check
              </button>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}