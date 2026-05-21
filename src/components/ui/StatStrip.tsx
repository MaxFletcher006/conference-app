const stats = [
  { label: 'Date',       value: '6/8–12, 2026' },
  { label: 'Location',   value: 'Ulaanbaatar' },
  { label: 'Scientists', value: '16' },
  { label: 'Attendees',  value: '300+' },
]

export function StatStrip() {
  return (
    <div style={{ background: 'var(--bg-3)', borderTop: '1px solid var(--border)', backdropFilter: 'blur(12px)' }}>
      <div className="grid grid-cols-2 md:grid-cols-4 max-w-[1240px] mx-auto">
        {stats.map((s, i) => (
          <div
            key={i}
            className="border-r border-[var(--border)] last:border-r-0"
            style={{
              padding: '14px 16px',
              borderRight: '1px solid var(--border)',
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--blue)', marginBottom: 2 }}>{s.label}</p>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
