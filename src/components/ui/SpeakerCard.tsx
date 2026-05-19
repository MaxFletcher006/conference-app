import { Link } from 'react-router-dom'
import type { Speaker } from '@/data/speakers'

export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <Link
      to={`/speakers/${speaker.slug}`}
      style={{
        display: 'flex', gap: 20, padding: 20,
        background: 'var(--bg-2)', border: '1px solid var(--border-2)',
        borderRadius: 'var(--radius-lg)', textDecoration: 'none',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(129,140,248,0.4)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        width: 96, height: 96, flexShrink: 0,
        borderRadius: 'var(--radius)',
        background: 'var(--bg-3)', border: '1px solid var(--border-2)',
        overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {speaker.photo ? (
          <img src={speaker.photo} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue)' }}>{speaker.initials}</span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>{speaker.name}</p>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{speaker.flag}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 700, marginBottom: 4 }}>{speaker.title}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{speaker.institution}</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{speaker.specialty}</p>
      </div>
    </Link>
  )
}
