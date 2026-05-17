import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { validateTicket, TicketValidationResult } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { isDashboardRole } from '../context/AuthContext'
import { Spinner } from '../components/UI'

export default function ValidatePage() {
  const { ticket_uuid } = useParams<{ ticket_uuid: string }>()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [result, setResult] = useState<TicketValidationResult | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate(`/login?redirect=/validate/${ticket_uuid}`, { replace: true })
      return
    }
    if (!isDashboardRole(user.role)) {
      setError('Only staff can validate tickets.')
      setLoading(false)
      return
    }
    if (!ticket_uuid) {
      setError('No ticket UUID provided.')
      setLoading(false)
      return
    }
    validateTicket(ticket_uuid)
      .then(data => setResult(data))
      .catch(err => setError(err?.response?.data?.detail || 'Validation failed. Ticket may not exist.'))
      .finally(() => setLoading(false))
  }, [authLoading, user, ticket_uuid])

  const isValid = result?.status === 'valid'

  return (
    <div className="validate-container" style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div className="grid-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff',
        letterSpacing: '0.14em', marginBottom: 36, textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        CERN MONGOLIA 2026 · TICKET VALIDATION
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {(loading || authLoading) ? (
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 48,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
          }}>
            <Spinner size={32} />
            <span style={{ color: '#ffffff', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
              Validating ticket…
            </span>
          </div>
        ) : error ? (
          <div className="fade-up" style={{
            background: 'var(--bg-2)', border: '1px solid var(--red-dim)',
            borderRadius: 16, padding: 36, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✗</div>
            <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 16, marginBottom: 8, fontWeight: 600 }}>
              INVALID TICKET
            </div>
            <div style={{ color: '#ffffff', fontSize: 16, lineHeight: 1.6 }}>{error}</div>
            <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>
              Back to dashboard
            </button>
          </div>
        ) : result ? (
          <div className="fade-up" style={{
            background: 'var(--bg-2)',
            border: `1px solid ${isValid ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            borderRadius: 16, overflow: 'hidden',
            boxShadow: isValid ? 'var(--glow-green)' : '0 0 20px rgba(248,113,113,0.1)',
          }}>
            <div style={{
              background: isValid ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              padding: '26px 30px',
              display: 'flex', alignItems: 'center', gap: 16,
              borderBottom: `1px solid ${isValid ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}`,
            }}>
              <span style={{ fontSize: 36 }}>{isValid ? '✓' : '✗'}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontWeight: 700,
                  color: isValid ? 'var(--green)' : 'var(--red)',
                  fontSize: 17, letterSpacing: '0.06em',
                }}>
                  {isValid ? 'VALID TICKET' : 'EXPIRED TICKET'}
                </div>
                <div style={{ fontSize: 16, color: isValid ? '#86efac' : '#fca5a5', marginTop: 3 }}>
                  {result.detail}
                </div>
              </div>
            </div>

            <div style={{ padding: 26 }}>
              <Row label="Ticket UUID" value={ticket_uuid || '—'} mono />
              {isValid && result.remaining_entries !== undefined && (
                <Row
                  label="Remaining entries"
                  value={String(result.remaining_entries)}
                  accent={result.remaining_entries === 0 ? 'var(--red)' : 'var(--green)'}
                />
              )}
              <Row label="Validated at" value={new Date().toLocaleString()} />
              <Row label="Validated by" value={`${user?.firstname} ${user?.lastname}`} />
              <Row label="Staff role" value={user?.role || '—'} mono />
            </div>

            <div style={{ padding: '0 26px 26px' }}>
              <button onClick={() => navigate('/dashboard')} style={{ ...backBtnStyle, width: '100%' }}>
                Back to dashboard
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

const backBtnStyle: React.CSSProperties = {
  marginTop: 24,
  background: 'var(--bg-3)',
  border: '1px solid var(--border-2)',
  borderRadius: 8,
  padding: '12px 18px',
  color: '#ffffff',
  fontSize: 16,
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  transition: 'all 0.2s',
}

function Row({ label, value, mono, accent }: {
  label: string; value: string; mono?: boolean; accent?: string
}) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 0', borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap', gap: 4,
    }}>
      <span style={{ fontSize: 16, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {label}
      </span>
      <span style={{
        fontSize: 16, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
        color: accent || '#ffffff',
        maxWidth: '58%', textAlign: 'right', wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}