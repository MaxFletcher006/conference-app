import { ReactNode, useState } from 'react'

// ─── BUTTON ───────────────────────────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  loading?: boolean
  children: ReactNode
}

export function Btn({ variant = 'primary', loading, children, disabled, style, ...rest }: BtnProps) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--text)', color: 'var(--bg)',
      border: '1px solid var(--text)',
    },
    ghost: {
      background: 'transparent', color: 'var(--text-2)',
      border: '1px solid transparent',
    },
    danger: {
      background: 'transparent', color: 'var(--red)',
      border: '1px solid var(--red-dim)',
    },
    outline: {
      background: 'transparent', color: 'var(--text)',
      border: '1px solid var(--border-2)',
    },
  }
  return (
    <button
      disabled={disabled || loading}
      style={{
        padding: '8px 16px',
        borderRadius: 'var(--radius)',
        fontSize: '13px',
        fontWeight: 500,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        transition: 'opacity 0.15s, background 0.15s',
        display: 'inline-flex', alignItems: 'center', gap: 6,
        ...styles[variant],
        ...style,
      }}
      {...rest}
    >
      {loading ? <Spinner size={12} /> : null}
      {children}
    </button>
  )
}

// ─── INPUT ────────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</label>}
      <input
        style={{
          background: 'var(--bg-3)',
          border: `1px solid ${error ? 'var(--red)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          color: 'var(--text)',
          fontSize: 13,
          outline: 'none',
          width: '100%',
          transition: 'border-color 0.15s',
          ...style,
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--border-2)')}
        onBlur={e => (e.target.style.borderColor = error ? 'var(--red)' : 'var(--border)')}
        {...rest}
      />
      {error && <span style={{ fontSize: 11, color: 'var(--red)' }}>{error}</span>}
    </div>
  )
}

// ─── SELECT ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, style, ...rest }: SelectProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {label && <label style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{label}</label>}
      <select
        style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '8px 12px',
          color: 'var(--text)',
          fontSize: 13,
          outline: 'none',
          width: '100%',
          ...style,
        }}
        {...rest}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.7s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeOpacity="0.2" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// ─── CARD ─────────────────────────────────────────────────────────────────────
export function Card({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <Card style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
      <span style={{ fontSize: 28, fontWeight: 600, color: accent || 'var(--text)', lineHeight: 1.2 }}>
        {value}
      </span>
    </Card>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
const badgeColors: Record<string, { bg: string; color: string }> = {
  admin:      { bg: '#1e1e3f', color: '#818cf8' },
  supervisor: { bg: '#1c2e1c', color: '#4ade80' },
  staff:      { bg: '#1e2a3a', color: '#60a5fa' },
  attendee:   { bg: '#1f1f1f', color: '#a1a1aa' },
  valid:      { bg: '#166534', color: '#4ade80' },
  expired:    { bg: '#7f1d1d', color: '#f87171' },
  active:     { bg: '#14532d', color: '#4ade80' },
  exhausted:  { bg: '#7f1d1d', color: '#f87171' },
}

export function Badge({ label }: { label: string }) {
  const c = badgeColors[label] || { bg: 'var(--bg-3)', color: 'var(--text-2)' }
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)',
      letterSpacing: '0.04em',
    }}>{label}</span>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.15s ease', padding: 16,
    }}>
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)', padding: 28, width: '100%', maxWidth: 500,
        animation: 'fadeUp 0.2s ease',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
interface Toast { id: number; msg: string; type: 'ok' | 'err' }
let _setToasts: ((fn: (t: Toast[]) => Toast[]) => void) | null = null
let _id = 0

export function toast(msg: string, type: 'ok' | 'err' = 'ok') {
  if (_setToasts) {
    const id = ++_id
    _setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => _setToasts!(t => t.filter(x => x.id !== id)), 3500)
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])
  _setToasts = setToasts
  return (
    <div style={{
      position: 'fixed',
      top: 'max(16px, env(safe-area-inset-top))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      pointerEvents: 'none',
      width: 'max-content',
      maxWidth: 'calc(100vw - 32px)',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          pointerEvents: 'auto',
          background: 'var(--bg-3)',
          border: `1px solid ${t.type === 'ok' ? 'var(--green-dim)' : 'var(--red-dim)'}`,
          color: t.type === 'ok' ? 'var(--green)' : 'var(--red)',
          padding: '10px 16px',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          animation: 'fadeUp 0.2s ease',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        }}>
          {t.type === 'ok' ? '✓ ' : '✗ '}{String(t.msg)}
        </div>
      ))}
    </div>
  )
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
export function Divider() {
  return <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0' }} />
}

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
export function Page({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="fade-up page-content" style={{
      maxWidth: 1100, margin: '0 auto', padding: '32px 24px', ...style,
    }}>
      {children}
    </div>
  )
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
      <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {title}
      </h2>
      {action}
    </div>
  )
}

// ─── TABLE ────────────────────────────────────────────────────────────────────
export function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '8px 12px',
                color: 'var(--text-3)', fontWeight: 500, fontSize: 11,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                borderBottom: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 12px', color: 'var(--text)' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}