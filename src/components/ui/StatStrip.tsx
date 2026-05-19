const stats = [
  { label: 'Date',      value: '6/8–12, 2026' },
  { label: 'Location',  value: 'Ulaanbaatar' },
  { label: 'Scientists', value: '16' },
  { label: 'Attendees', value: '300+' },
]

export function StatStrip() {
  return (
    <div style={{ background: 'var(--bg-3)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: '16px 20px', borderRight: '1px solid var(--border)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue)', marginBottom: 2 }}>{s.label}</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#ffffff' }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
