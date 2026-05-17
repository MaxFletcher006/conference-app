import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsQR from 'jsqr'
import { useAuth, isDashboardRole } from '../context/AuthContext'
import { Spinner } from '../components/UI'

export default function QRScanPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animRef = useRef<number>(0)
  const scannedRef = useRef(false)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)

  const stopEverything = () => {
    cancelAnimationFrame(animRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  useEffect(() => {
    if (authLoading) return
    if (!user || !isDashboardRole(user.role)) {
      navigate('/login')
      return
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
      .then(stream => {
        streamRef.current = stream
        if (!videoRef.current) return
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStarted(true)
        tick()
      })
      .catch(() => setError('Camera access denied. Please allow camera permission.'))

    return () => stopEverything()
  }, [authLoading, user])

  const tick = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || scannedRef.current) return

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)

      if (code?.data) {
        scannedRef.current = true
        const uuid = code.data.split('/validate/')[1]
        if (uuid) {
          stopEverything()
          navigate(`/validate/${uuid}`)
          return
        } else {
          scannedRef.current = false
          setError('Invalid QR code. Not a valid ticket.')
          return
        }
      }
    }

    animRef.current = requestAnimationFrame(tick)
  }

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

            {/* video is always mounted so ref works, just hidden until started */}
            <video
              ref={videoRef}
              playsInline
              muted
              style={{
                width: '100%', display: started ? 'block' : 'none',
                borderRadius: 16,
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

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
          onClick={() => { stopEverything(); navigate('/dashboard') }}
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