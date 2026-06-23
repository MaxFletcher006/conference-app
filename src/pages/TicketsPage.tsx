import { useEffect, useState, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  getAllTickets,
  getAllUsers,
  adminIssueTicket,
  adminDeleteTicket,
  TicketAdmin,
  User,
  apiErr,
} from '../api/client'
import { Page, SectionHeader, Card, Table, Badge, Btn, Select, toast } from '../components/UI'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketAdmin[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [eventFilter, setEventFilter] = useState<string>('all')

  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [issuing, setIssuing] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [t, u] = await Promise.all([getAllTickets(), getAllUsers()])
      setTickets(t)
      // only attendees can receive tickets
      setUsers(u.filter(u => u.role === 'attendee'))
    } catch {
      toast('Failed to load tickets', 'err')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    document.body.style.overflow = showIssueModal ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showIssueModal])

  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`Delete ticket for ${name}?`)) return
    setActionLoading(userId)
    try {
      await adminDeleteTicket(userId)
      setTickets(t => t.filter(x => x.user_id !== userId))
      toast(`Ticket for ${name} deleted`)
    } catch (err: any) {
      toast(apiErr(err, 'Delete failed'), 'err')
    } finally {
      setActionLoading(null)
    }
  }

  const handleResend = async (userId: number, name: string) => {
    if (!confirm(`Resend ticket email to ${name}?`)) return
    setActionLoading(userId)
    try {
      await adminIssueTicket(userId)
      toast(`Ticket email queued for ${name}`)
    } catch (err: any) {
      toast(apiErr(err, 'Send failed'), 'err')
    } finally {
      setActionLoading(null)
    }
  }

  const handleIssue = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return
    setIssuing(true)
    const uid = parseInt(selectedUserId)
    const user = users.find(u => u.id === uid)
    try {
      await adminIssueTicket(uid)
      toast(`Ticket queued for ${user?.firstname} ${user?.lastname}`)
      setShowIssueModal(false)
      setSelectedUserId('')
      await load()
    } catch (err: any) {
      toast(apiErr(err, 'Issue failed'), 'err')
    } finally {
      setIssuing(false)
    }
  }

  const ticketedUserIds = new Set(tickets.map(t => t.user_id))
  const usersWithoutTicket = users.filter(u => !ticketedUserIds.has(u.id))

  const eventOptions = Array.from(
    new Map(
      tickets
        .filter(t => t.event_id != null)
        .map(t => [t.event_id, t.event_name ?? `Event ${t.event_id}`])
    ).entries()
  )

  const filteredTickets = eventFilter === 'all'
    ? tickets
    : eventFilter === 'none'
      ? tickets.filter(t => t.event_id == null)
      : tickets.filter(t => String(t.event_id) === eventFilter)

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(5, 5, 10, 0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    boxSizing: 'border-box',
  }

  const innerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 440,
    background: 'var(--bg-2)',
    border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    padding: 24,
    boxSizing: 'border-box',
  }

  const issueModal = showIssueModal ? createPortal(
    <div
      className="modal-overlay fade-in"
      style={overlayStyle}
      onMouseDown={e => { if (e.target === e.currentTarget && !issuing) setShowIssueModal(false) }}
    >
      <div className="modal-inner fade-up" style={innerStyle}>
        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px', color: '#ffffff' }}>
              Issue New Ticket
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>
              A QR code ticket will be generated and emailed to the selected attendee.
            </p>
          </div>

          {usersWithoutTicket.length === 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>
              All attendees already have tickets.
            </p>
          ) : (
            <Select
              label="Attendee"
              value={selectedUserId}
              onChange={e => setSelectedUserId(e.target.value)}
              options={[
                { value: '', label: 'Select attendee…' },
                ...usersWithoutTicket.map(u => ({
                  value: String(u.id),
                  label: `${u.firstname} ${u.lastname} — ${u.email}`,
                })),
              ]}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Btn variant="ghost" type="button" onClick={() => setShowIssueModal(false)} disabled={issuing}>
              Cancel
            </Btn>
            <Btn
              type="submit"
              loading={issuing}
              disabled={!selectedUserId || usersWithoutTicket.length === 0}
            >
              Issue &amp; Send
            </Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <Page>
      <SectionHeader
        title="Tickets"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <select
              value={eventFilter}
              onChange={e => setEventFilter(e.target.value)}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '7px 12px', color: '#ffffff', fontSize: 14, outline: 'none', fontFamily: 'var(--font-sans)' }}
            >
              <option value="all">All events ({tickets.length})</option>
              {eventOptions.map(([id, name]) => (
                <option key={id} value={String(id)}>
                  {name} ({tickets.filter(t => t.event_id === id).length})
                </option>
              ))}
              {tickets.some(t => t.event_id == null) && (
                <option value="none">No event ({tickets.filter(t => t.event_id == null).length})</option>
              )}
            </select>
            <Btn onClick={() => setShowIssueModal(true)} style={{ fontSize: 16, padding: '7px 16px' }}>
              + Issue ticket
            </Btn>
          </div>
        }
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, fontSize: 16, color: 'var(--text-3)' }}>Loading...</div>
        ) : tickets.length === 0 ? (
          <div style={{ padding: 24, fontSize: 16, color: 'var(--text-3)' }}>No tickets issued yet.</div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={['Attendee', 'Email', 'Event', 'Days', 'Used', 'Status', 'Actions']}
              rows={filteredTickets.map(t => {
                const isLoading = actionLoading === t.user_id
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
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Btn
                      variant="ghost"
                      onClick={() => handleResend(t.user_id, `${t.firstname} ${t.lastname}`)}
                      disabled={isLoading}
                      style={{ padding: '6px 12px', fontSize: 13 }}
                    >
                      Resend
                    </Btn>
                    <Btn
                      variant="danger"
                      onClick={() => handleDelete(t.user_id, `${t.firstname} ${t.lastname}`)}
                      disabled={isLoading}
                      style={{ padding: '6px 12px', fontSize: 13 }}
                    >
                      Delete
                    </Btn>
                  </div>,
                ]
              })}
            />
          </div>
        )}
      </Card>

      {issueModal}
    </Page>
  )
}
