import { useEffect, useState } from 'react'
import { getAllUsers, getAllEvents, getAllQuestions, User, Event, Question, getTotalTickets, getTicketSummary, getValidations } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, StatCard, SectionHeader, Badge, Card, Table } from '../components/UI'

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
      <div
        className="event-row-inner"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            fontSize: 16,
            marginBottom: 5,
            color: isPast ? 'var(--text-2)' : '#ffffff',
          }}>
            {e.topic}
          </div>

          {e.agenda && (
            <div style={{ fontSize: 16, color: '#ffffff', marginBottom: 8, lineHeight: 1.5 }}>
              {e.agenda}
            </div>
          )}

          {e.speaker && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginBottom: 8,
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '3px 10px',
            }}>
              <span style={{ fontSize: 13 }}>🎤</span>
              <span style={{ fontSize: 14, color: accentColor, fontFamily: 'var(--font-mono)' }}>
                {e.speaker}
              </span>
            </div>
          )}

          <div style={{ fontSize: 16, color: '#ffffff', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>📍 {e.location}</span>
            <span>🏛 {e.building}, Room {e.room}</span>
          </div>
        </div>

        <div
          className="event-row-time"
          style={{ marginLeft: 24, textAlign: 'right', flexShrink: 0 }}
        >
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 16,
            fontWeight: 600,
            color: accentColor,
            marginBottom: 4,
          }}>
            {e.start_time} – {e.end_time}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff' }}>
            {e.date}
          </div>
          {variant === 'today' && (
            <div style={{
              marginTop: 6,
              display: 'inline-block',
              background: 'var(--yellow-dim)',
              color: 'var(--yellow)',
              borderRadius: 4,
              padding: '2px 8px',
              fontSize: 12,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}>
              TODAY
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── EventGroup Component ──────────────────────────────────────────────────────

function EventGroup({
  label,
  date,
  events,
  todayStr,
}: {
  label: string
  date: string
  events: Event[]
  todayStr: string
}) {
  const isToday = date === todayStr
  const isPast = date < todayStr
  const variant: 'today' | 'upcoming' | 'past' =
    isToday ? 'today' : isPast ? 'past' : 'upcoming'
  const accentColor =
    isToday ? 'var(--yellow)' : isPast ? 'var(--text-3)' : 'var(--blue)'

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Weekday label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: accentColor,
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>
          {label}
        </span>
        {isToday && (
          <span style={{
            background: 'var(--yellow-dim)',
            color: 'var(--yellow)',
            borderRadius: 4,
            padding: '2px 8px',
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
          }}>
            TODAY
          </span>
        )}
        <div style={{
          flex: 1,
          height: 1,
          background: 'var(--border)',
          opacity: isPast ? 0.4 : 0.7,
        }} />
      </div>

      {/* Events under this date */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map(e => (
          <EventRow key={e.id} event={e} variant={variant} />
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

/**
 * Groups events by their exact date string (YYYY-MM-DD), sorted chronologically.
 * Two events on the same date → one group.
 * Same weekday name on different dates (e.g. two Mondays) → two separate groups.
 */
function groupEventsByDate(events: Event[]): { label: string; date: string; events: Event[] }[] {
  const map = new Map<string, Event[]>()

  const sorted = [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.start_time.localeCompare(b.start_time)
  })

  for (const e of sorted) {
    const existing = map.get(e.date)
    if (existing) {
      existing.push(e)
    } else {
      map.set(e.date, [e])
    }
  }

  return Array.from(map.entries()).map(([date, evts]) => {
    // Parse manually to avoid timezone shifts from new Date('YYYY-MM-DD')
    const [year, month, day] = date.split('-').map(Number)
    const d = new Date(year, month - 1, day)
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' })
    const monthDay = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
    return { label: `${weekday} · ${monthDay}`, date, events: evts }
  })
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

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (user?.role === 'admin' || user?.role === 'supervisor') {
          const [u, e, q, t, ts] = await Promise.all([
            getAllUsers(), getAllEvents(), getAllQuestions(),
            getTotalTickets(), getTicketSummary()
          ])
          setUsers(u)
          setEvents(e)
          setQuestions(q)
          setTotalTickets(t)
          setTicketedUserIds(new Set(ts.user_ids))
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

  const todayEvents    = events.filter(e => e.date === todayStr)
  const upcomingEvents = events.filter(e => e.date > todayStr)
  const pastEvents     = events.filter(e => e.date < todayStr)

  const groupedToday    = groupEventsByDate(todayEvents)
  const groupedUpcoming = groupEventsByDate(upcomingEvents)
  const groupedPast     = groupEventsByDate(pastEvents)

  return (
    <Page>
      {/* Greeting */}
      <div className="dashboard-greeting" style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 16,
          color: 'var(--blue)', marginBottom: 8,
          letterSpacing: '0.12em', opacity: 0.8,
        }}>
          CONFERENCE DASHBOARD
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4, color: '#ffffff' }}>
          Good {getTimeOfDay()},{' '}
          <span style={{
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {user?.firstname}
          </span>
        </h1>
        <p style={{ color: '#ffffff', fontSize: 16 }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
          Loading...
        </div>
      ) : (
        <>
          {/* User stats */}
          {(user?.role === 'admin' || user?.role === 'supervisor') && (
            <>
              <SectionHeader title="Users" />
              <div
                className="stat-grid"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}
              >
                <StatCard label="Total users" value={users.length} />
                <StatCard label="Attendees" value={roleCount('attendee')} />
                <StatCard label="Staff" value={roleCount('staff')} accent="var(--blue)" />
                <StatCard label="Supervisors" value={roleCount('supervisor')} accent="var(--green)" />
                <StatCard label="Total Tickets" value={totalTickets} accent="var(--green)" />
              </div>
            </>
          )}

          {/* Event stats */}
          <SectionHeader title="Events" />
          <div
            className="stat-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}
          >
            <StatCard label="Total events" value={events.length} />
            <StatCard label="Today" value={todayEvents.length} accent="var(--yellow)" />
            <StatCard label="Upcoming" value={upcomingEvents.length} accent="var(--blue)" />
            <StatCard label="Questions" value={questions.length} accent="var(--purple)" />
          </div>

          {/* Today's Events */}
          {groupedToday.length > 0 && (
            <>
              <SectionHeader title="Today's schedule" />
              <div style={{ marginBottom: 36 }}>
                {groupedToday.map(group => (
                  <EventGroup
                    key={group.date}
                    label={group.label}
                    date={group.date}
                    events={group.events}
                    todayStr={todayStr}
                  />
                ))}
              </div>
            </>
          )}

          {/* Upcoming Events */}
          {groupedUpcoming.length > 0 && (
            <>
              <SectionHeader title="Upcoming events" />
              <div style={{ marginBottom: 36 }}>
                {groupedUpcoming.map(group => (
                  <EventGroup
                    key={group.date}
                    label={group.label}
                    date={group.date}
                    events={group.events}
                    todayStr={todayStr}
                  />
                ))}
              </div>
            </>
          )}

          {/* Past Events */}
          {groupedPast.length > 0 && (
            <>
              <SectionHeader title="Past events" />
              <div style={{ marginBottom: 36 }}>
                {groupedPast.map(group => (
                  <EventGroup
                    key={group.date}
                    label={group.label}
                    date={group.date}
                    events={group.events}
                    todayStr={todayStr}
                  />
                ))}
              </div>
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
                      <span style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>
                        {u.firstname} {u.lastname}
                      </span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
                        {u.email}
                      </span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 16 }}>
                        {u.phone_number}
                      </span>,
                      <Badge label={u.role} />,
                      u.role === 'attendee' ? (
                        <span style={{
                          display: 'inline-block',
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.06em',
                          padding: '3px 10px',
                          borderRadius: 6,
                          background: ticketedUserIds.has(u.id)
                            ? 'rgba(52,211,153,0.1)' : 'rgba(220,38,38,0.1)',
                          border: `1px solid ${ticketedUserIds.has(u.id)
                            ? 'rgba(52,211,153,0.25)' : 'rgba(220,38,38,0.25)'}`,
                          color: ticketedUserIds.has(u.id) ? 'var(--green)' : '#ef4444',
                        }}>
                          {ticketedUserIds.has(u.id) ? '✓ Purchased' : '✗ No ticket'}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 12,
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-3)',
                          letterSpacing: '0.06em',
                        }}>—</span>
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