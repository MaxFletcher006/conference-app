import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuth } from '../context/AuthContext'
import { isDashboardRole } from '../context/AuthContext'
import { Spinner } from '../components/UI'

export default function QRScanPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user || !isDashboardRole(user.role)) {
      navigate('/login')
      return
    }

    const scanner = new Html5Qrcode('qr-reader')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        // QR contains full URL: https://yoursite.com/validate/some-uuid
        const uuid = decodedText.split('/validate/')[1]
        if (uuid) {
          scanner.stop().then(() => navigate(`/validate/${uuid}`))
        }
      },
      () => {}
    )
      .then(() => setStarted(true))
      .catch(() => setError('Camera access denied. Please allow camera permission and try again.'))

    return () => {
      scanner.stop().catch(() => {})
    }
  }, [authLoading, user])

  if (authLoading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner />
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      <div className="grid-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff',
        letterSpacing: '0.14em', marginBottom: 36, textAlign: 'center',
        position: 'relative', zIndex: 1,
      }}>
        CERN LHCb - MONGOLIA 2026 · SCAN TICKET
      </div>

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {error ? (
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--red-dim)',
            borderRadius: 16, padding: 36, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
            <div style={{ color: 'var(--red)', fontSize: 16, marginBottom: 24 }}>{error}</div>
            <button onClick={() => navigate('/dashboard')} style={btnStyle}>
              Back to dashboard
            </button>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {/* scanner mounts here */}
            <div id="qr-reader" style={{ width: '100%' }} />

            {!started && (
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 12, padding: 32,
              }}>
                <Spinner size={28} />
                <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 15 }}>
                  Starting camera…
                </span>
              </div>
            )}

            {started && (
              <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text-3)', fontSize: 15, textAlign: 'center', margin: 0 }}>
                  Point camera at attendee's QR code
                </p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigate('/dashboard')}
          style={{ ...btnStyle, marginTop: 16, width: '100%' }}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}

const btnStyle: React.CSSProperties = {
  background: 'var(--bg-3)',
  border: '1px solid var(--border-2)',
  borderRadius: 8,
  padding: '12px 18px',
  color: '#ffffff',
  fontSize: 16,
  cursor: 'pointer',
  transition: 'all 0.2s',
  width: '100%',
}