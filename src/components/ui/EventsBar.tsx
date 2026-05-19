import { Link } from 'react-router-dom'

export function EventsBar() {
  return (
    <div style={{ background: 'var(--bg-3)', borderBottom: '1px solid var(--border)' }}>
      <div
        className="max-w-[1240px] mx-auto px-6 md:px-12"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', gap: 12, flexWrap: 'wrap' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0 16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff', fontWeight: 700, fontSize: 15 }}>
            <span>🇲🇳</span>
            Mongolia - CERN LHCb 2026
          </span>
          <span style={{ width: 1, height: 14, background: 'var(--border-2)', display: 'inline-block' }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              <span style={{ color: 'var(--blue)' }}>📅</span>
              June 8–12, 2026
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              <span style={{ color: 'var(--blue)' }}>📍</span>
              National University of Mongolia, Ulaanbaatar
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              <span style={{ color: 'var(--blue)' }}>🔬</span>
              Particle Physics · LHCb Collaboration
            </span>
          </div>
        </div>

        <Link
          to="/register"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'var(--blue)', color: '#ffffff',
            fontSize: 13, fontWeight: 700,
            padding: '6px 14px', borderRadius: 8, flexShrink: 0,
            transition: 'opacity 0.2s',
          }}
        >
          Register Now
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </div>
  )
}
