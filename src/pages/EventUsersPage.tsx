import { useEffect, useState } from 'react'
import { getEventUsers, EventUserAdmin, apiErr } from '../api/client'
import { Page, SectionHeader, Card, Table, toast } from '../components/UI'

export default function EventUsersPage() {
  const [users, setUsers] = useState<EventUserAdmin[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getEventUsers()
      .then(setUsers)
      .catch(err => toast(apiErr(err, 'Failed to load event users'), 'err'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      u.firstname.toLowerCase().includes(q) ||
      u.lastname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.event_name ?? '').toLowerCase().includes(q)
    )
  })

  const eventOptions = Array.from(
    new Map(users.filter(u => u.event_id).map(u => [u.event_id, u.event_name ?? `Event ${u.event_id}`])).entries()
  )

  return (
    <Page>
      <SectionHeader
        title="Event Users"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
              {users.length} registered
            </span>
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

      {eventOptions.length > 1 && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['all', `All (${users.length})`], ...eventOptions.map(([id, name]) => [
            String(id), `${name} (${users.filter(u => u.event_id === id).length})`
          ])].map(([val, label]) => (
            <span key={val} style={{
              fontSize: 13, fontFamily: 'var(--font-mono)', padding: '3px 10px',
              borderRadius: 6, cursor: 'pointer',
              background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)',
            }}>
              {label}
            </span>
          ))}
        </div>
      )}

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, color: 'var(--text-3)' }}>No event users found.</div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={['Name', 'Email', 'Phone', 'Event', 'Ticket']}
              rows={filtered.map(u => [
                <span style={{ fontWeight: 600, fontSize: 15, color: '#ffffff' }}>
                  {u.firstname} {u.lastname}
                </span>,
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                  {u.email}
                </span>,
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-2)' }}>
                  {u.phone_number}
                </span>,
                <span style={{ fontSize: 13, color: u.event_name ? 'var(--blue-text)' : 'var(--text-3)' }}>
                  {u.event_name ?? '—'}
                </span>,
                <span style={{
                  display: 'inline-block', fontSize: 12, fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 6,
                  background: u.has_ticket ? 'rgba(52,211,153,0.1)' : 'rgba(220,38,38,0.1)',
                  border: `1px solid ${u.has_ticket ? 'rgba(52,211,153,0.25)' : 'rgba(220,38,38,0.25)'}`,
                  color: u.has_ticket ? 'var(--green)' : '#ef4444',
                }}>
                  {u.has_ticket ? '✓ Issued' : '✗ No ticket'}
                </span>,
              ])}
            />
          </div>
        )}
      </Card>
    </Page>
  )
}
