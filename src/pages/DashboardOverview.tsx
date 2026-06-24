import { useEffect, useState } from 'react'
import { getAllUsers, getAllEvents, getAllQuestions, User, Event, Question, getTotalTickets, getTicketSummary, getValidations, getEventTickets, EventTicketAdmin } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, StatCard, SectionHeader, Badge, Card, Table } from '../components/UI'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function eventVariant(e: Event, todayStr: string): 'today' | 'upcoming' | 'past' {
  if (e.start_date <= todayStr && e.end_date >= todayStr) return 'today'
  if (e.start_date > todayStr) return 'upcoming'
  return 'past'
}

// ─── EventRow Component ────────────────────────────────────────────────────────

function EventRow({ event: e, variant }: { event: Event; variant: 'today' | 'upcoming' | 'past' }) {
  const accentColor =
    variant === 'today' ? 'var(--yellow)' :
    variant === 'upcoming' ? 'var(--blue)' :
    'var(--text-3)'
  const isPast = variant === 'past'

  return (
    <div style={{
      background: 'var(--bg-2)',
      border: `1px solid ${isPast ? 'var(--border)' : 'var(--border-2)'}`,
      borderRadius: 'var(--radius-lg)',
      padding: '18px 22px',
      opacity: isPast ? 0.55 : 1,
      transition: 'all 0.2s',
    }}>
      <div className="event-row-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: isPast ? 'var(--text-2)' : '#ffffff' }}>
              {e.event_name}
            </span>
            <span style={{
              fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px',
              borderRadius: 4, letterSpacing: '0.06em',
              background: e.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${e.is_active ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
              color: e.is_active ? 'var(--green)' : 'var(--text-3)',
            }}>
              {e.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
            {variant === 'today' && (
              <span style={{ background: 'var(--yellow-dim)', color: 'var(--yellow)', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                TODAY
              </span>
            )}
          </div>

          {e.description && (
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8, lineHeight: 1.5 }}>
              {e.description}
            </div>
          )}

          <div style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', gap: 14, flexWrap: 'wrap', fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: accentColor }}>📅 {e.start_date} — {e.end_date}</span>
            <span>🎫 ₮{e.ticket_price.toLocaleString()}</span>
            {e.include_weekends && <span>📆 Weekends included</span>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DashboardOverview ─────────────────────────────────────────────────────────

export default function DashboardOverview() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [totalTickets, setTotalTickets] = useState<number>(0)
  const [ticketedUserIds, setTicketedUserIds] = useState<Set<number>>(new Set())
  const [validations, setValidations] = useState<any[]>([])
  const [eventTickets, setEventTickets] = useState<EventTicketAdmin[]>([])

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (user?.role === 'admin' || user?.role === 'supervisor') {
          const [u, e, q, t, ts, et] = await Promise.all([
            getAllUsers(), getAllEvents(), getAllQuestions(),
            getTotalTickets(), getTicketSummary(), getEventTickets()
          ])
          setUsers(u)
          setEvents(e)
          setQuestions(q)
          setTotalTickets(t)
          setTicketedUserIds(new Set(ts.user_ids))
          setEventTickets(et)
          getValidations().then(setValidations).catch(() => {})
        } else if (user?.role === 'staff') {
          const [e, q] = await Promise.all([getAllEvents(), getAllQuestions()])
          setEvents(e)
          setQuestions(q)
          getValidations().then(setValidations).catch(() => {})
        }
      } catch { }
      setLoading(false)
    }
    fetchAll()
  }, [user])

  const roleCount = (role: string) => users.filter(u => u.role === role).length
  const todayStr = new Date().toISOString().split('T')[0]

  const sortedEvents = [...events].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const todayEvents    = sortedEvents.filter(e => e.start_date <= todayStr && e.end_date >= todayStr)
  const upcomingEvents = sortedEvents.filter(e => e.start_date > todayStr)
  const pastEvents     = sortedEvents.filter(e => e.end_date < todayStr)

  return (
    <Page>
      {/* Greeting */}
      <div className="dashboard-greeting" style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--blue)', marginBottom: 8, letterSpacing: '0.12em', opacity: 0.8 }}>
          CONFERENCE DASHBOARD
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, color: '#ffffff' }}>
          Good {getTimeOfDay()},{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--blue), var(--purple))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user?.firstname}
          </span>
        </h1>
        <p style={{ color: '#ffffff', fontSize: 16 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>Loading...</div>
      ) : (
        <>
          {/* User stats */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <>
              <SectionHeader title="Users" />
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
                <StatCard label="Total users" value={users.length} />
                <StatCard label="Attendees" value={roleCount('attendee')} />
                <StatCard label="Staff" value={roleCount('staff')} accent="var(--blue)" />
                <StatCard label="Supervisors" value={roleCount('supervisor')} accent="var(--green)" />
                <StatCard label="Event Tickets" value={eventTickets.length} accent="var(--green)" />
              </div>
            </>
          )}

          {/* Event stats */}
          <SectionHeader title="Events" />
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
            <StatCard label="Total events" value={events.length} />
            <StatCard label="Ongoing" value={todayEvents.length} accent="var(--yellow)" />
            <StatCard label="Upcoming" value={upcomingEvents.length} accent="var(--blue)" />
            <StatCard label="Questions" value={questions.length} accent="var(--purple)" />
          </div>

          {/* Ongoing Events */}
          {todayEvents.length > 0 && (
            <>
              <SectionHeader title="Ongoing events" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                {todayEvents.map(e => <EventRow key={e.id} event={e} variant="today" />)}
              </div>
            </>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <>
              <SectionHeader title="Upcoming events" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                {upcomingEvents.map(e => <EventRow key={e.id} event={e} variant="upcoming" />)}
              </div>
            </>
          )}

          {/* Past Events */}
          {pastEvents.length > 0 && (
            <>
              <SectionHeader title="Past events" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                {pastEvents.map(e => <EventRow key={e.id} event={e} variant="past" />)}
              </div>
            </>
          )}

          {/* Event Tickets */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && eventTickets.length > 0 && (
            <>
              <SectionHeader title="Event Tickets" />
              <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 36 }}>
                <div className="table-wrapper" style={{ maxHeight: 420, overflowY: 'auto' }}>
                  <Table
                    headers={['Attendee', 'Email', 'Event', 'Days', 'Used', 'Status']}
                    rows={eventTickets.map(t => [
                      <span style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>{t.firstname} {t.lastname}</span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 14 }}>{t.email}</span>,
                      <span style={{ color: 'var(--text-2)', fontSize: 15 }}>{t.event_name ?? '—'}</span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 15 }}>{t.day_length}</span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 15 }}>{t.used_times}</span>,
                      <span style={{
                        display: 'inline-block', fontSize: 12, fontFamily: 'var(--font-mono)',
                        letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 6,
                        background: t.used_times >= t.day_length ? 'rgba(220,38,38,0.1)' : 'rgba(52,211,153,0.1)',
                        border: `1px solid ${t.used_times >= t.day_length ? 'rgba(220,38,38,0.25)' : 'rgba(52,211,153,0.25)'}`,
                        color: t.used_times >= t.day_length ? '#ef4444' : 'var(--green)',
                      }}>
                        {t.used_times >= t.day_length ? 'Expired' : 'Active'}
                      </span>,
                    ])}
                  />
                </div>
              </Card>
            </>
          )}

          {/* Recent users */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && users.length > 0 && (
            <>
              <SectionHeader title="Recent users" />
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper" style={{ maxHeight: 420, overflowY: 'auto' }}>
                  <Table
                    headers={['Name', 'Email', 'Phone Number', 'Role', 'Ticket']}
                    rows={users.map(u => [
                      <span style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>{u.firstname} {u.lastname}</span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{u.email}</span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{u.phone_number}</span>,
                      <Badge label={u.role} />,
                      u.role === 'attendee' ? (
                        <span style={{
                          display: 'inline-block', fontSize: 12, fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 6,
                          background: ticketedUserIds.has(u.id) ? 'rgba(52,211,153,0.1)' : 'rgba(220,38,38,0.1)',
                          border: `1px solid ${ticketedUserIds.has(u.id) ? 'rgba(52,211,153,0.25)' : 'rgba(220,38,38,0.25)'}`,
                          color: ticketedUserIds.has(u.id) ? 'var(--green)' : '#ef4444',
                        }}>
                          {ticketedUserIds.has(u.id) ? '✓ Purchased' : '✗ No ticket'}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.06em' }}>—</span>
                      ),
                    ])}
                  />
                </div>
              </Card>
            </>
          )}
        </>
      )}
    </Page>
  )
}
