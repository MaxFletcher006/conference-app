import { useEffect, useState } from 'react'
import { getValidationsFull, ValidationFull } from '../api/client'
import { Page, SectionHeader, Card, Table, Spinner } from '../components/UI'

export default function ValidationsAdminPage() {
  const [validations, setValidations] = useState<ValidationFull[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getValidationsFull()
      .then(setValidations)
      .catch(() => setValidations([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = validations.filter(v =>
    v.staff_name.toLowerCase().includes(search.toLowerCase()) ||
    v.validated_user.toLowerCase().includes(search.toLowerCase()) ||
    v.ticket_uuid.toLowerCase().includes(search.toLowerCase())
  )

  const todayStr = new Date().toISOString().split('T')[0]
  const todayCount = validations.filter(v => v.validation_time?.startsWith(todayStr)).length

  const staffCounts = validations.reduce<Record<string, number>>((acc, v) => {
    acc[v.staff_name] = (acc[v.staff_name] ?? 0) + 1
    return acc
  }, {})
  const topStaff = Object.entries(staffCounts).sort((a, b) => b[1] - a[1])[0]

  return (
    <Page>
      <SectionHeader title="Ticket Validations" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 32 }}>
        <StatMini label="Total Scans" value={validations.length} color="var(--blue)" />
        <StatMini label="Today" value={todayCount} color="var(--yellow)" />
        {topStaff && <StatMini label={`Top: ${topStaff[0].split(' ')[0]}`} value={topStaff[1]} color="var(--green)" />}
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by staff, attendee or ticket UUID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 440,
            padding: '10px 16px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            color: '#ffffff', fontSize: 15, outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'var(--font-sans)',
            transition: 'border-color 0.2s',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--border-3)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '64px 32px', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 15 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🎟️</div>
            {search ? 'No results found' : 'No validations recorded yet'}
          </div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={['Staff', 'Attendee', 'Ticket UUID', 'Scanned At']}
              rows={filtered.map(v => {
                const isToday = v.validation_time?.startsWith(todayStr)
                return [
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(74,222,128,0.12)',
                      border: '1px solid rgba(74,222,128,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'var(--green)',
                      flexShrink: 0, fontFamily: 'var(--font-mono)',
                    }}>
                      {v.staff_name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 15, color: '#ffffff' }}>{v.staff_name}</span>
                  </div>,

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'rgba(56,189,248,0.12)',
                      border: '1px solid rgba(56,189,248,0.2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: 'var(--blue)',
                      flexShrink: 0, fontFamily: 'var(--font-mono)',
                    }}>
                      {v.validated_user?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 15, color: 'var(--text-2)' }}>{v.validated_user}</span>
                  </div>,

                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13,
                    color: 'var(--text-3)', background: 'var(--bg-3)',
                    border: '1px solid var(--border)', borderRadius: 6,
                    padding: '3px 8px', display: 'inline-block',
                    maxWidth: 180, overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {v.ticket_uuid}
                  </span>,

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: isToday ? 'var(--yellow)' : '#ffffff' }}>
                      {v.validation_time
                        ? new Date(v.validation_time.replace(/^(\d{4}-\d{2}-\d{2})-/, '$1T')).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </span>
                    {isToday && (
                      <span style={{
                        fontSize: 11, fontFamily: 'var(--font-mono)',
                        background: 'var(--yellow-dim)', color: 'var(--yellow)',
                        borderRadius: 4, padding: '2px 6px', letterSpacing: '0.06em',
                      }}>TODAY</span>
                    )}
                  </div>,
                ]
              })}
            />
          </div>
        )}
      </Card>

      {!loading && filtered.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textAlign: 'right' }}>
          {filtered.length} of {validations.length} records
        </div>
      )}
    </Page>
  )
}

function StatMini({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
      <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
    </div>
  )
}
