import { useEffect, useState } from 'react'
import { getEventTickets, EventTicketAdmin, apiErr } from '../api/client'
import { Page, SectionHeader, Card, Table, Badge, toast } from '../components/UI'

export default function EventTicketsPage() {
  const [tickets, setTickets] = useState<EventTicketAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [eventFilter, setEventFilter] = useState('all')

  useEffect(() => {
    getEventTickets()
      .then(setTickets)
      .catch(err => toast(apiErr(err, 'Failed to load event tickets'), 'err'))
      .finally(() => setLoading(false))
  }, [])

  const eventOptions = Array.from(
    new Map(
      tickets.filter(t => t.event_id != null)
        .map(t => [t.event_id, t.event_name ?? `Event ${t.event_id}`])
    ).entries()
  )

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase()
    const matchSearch =
      t.firstname.toLowerCase().includes(q) ||
      t.lastname.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      (t.event_name ?? '').toLowerCase().includes(q)
    const matchEvent =
      eventFilter === 'all' ||
      String(t.event_id) === eventFilter
    return matchSearch && matchEvent
  })

  return (
    <Page>
      <SectionHeader
        title="Event Tickets"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
              style={{
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '7px 12px',
                color: '#ffffff', fontSize: 14, outline: 'none',
                fontFamily: 'var(--font-sans)',
              }}
            >
              <option value="all">All events ({tickets.length})</option>
              {eventOptions.map(([id, name]) => (
                <option key={id} value={String(id)}>
                  {name} ({tickets.filter(t => t.event_id === id).length})
                </option>
              ))}
            </select>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              style={{
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '7px 12px',
                color: '#ffffff', fontSize: 14, outline: 'none',
                fontFamily: 'var(--font-sans)', width: 200,
              }}
            />
          </div>
        }
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text-3)' }}>No event tickets found.</div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={['Attendee', 'Email', 'Event', 'Days', 'Used', 'Status']}
              rows={filtered.map(t => {
                const exhausted = t.used_times >= t.day_length
                return [
                  <span style={{ fontWeight: 600, fontSize: 15, color: '#ffffff' }}>
                    {t.firstname} {t.lastname}
                  </span>,
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                    {t.email}
                  </span>,
                  <span style={{ fontSize: 13, color: t.event_name ? 'var(--blue-text)' : 'var(--text-3)' }}>
                    {t.event_name ?? '—'}
                  </span>,
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ffffff' }}>
                    {t.day_length}
                  </span>,
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ffffff' }}>
                    {t.used_times}
                  </span>,
                  <Badge label={exhausted ? 'exhausted' : 'active'} />,
                ]
              })}
            />
          </div>
        )}
      </Card>
    </Page>
  )
}
