import { useEffect, useState } from 'react'
import { getAllUsers, getAllEvents, getAllQuestions, User, Event, Question, getTotalTickets, getTicketSummary, getValidations } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, StatCard, SectionHeader, Badge, Card, Table } from '../components/UI'

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
          const [u, e, q, t, ts, vals] = await Promise.all([
            getAllUsers(), getAllEvents(), getAllQuestions(),
            getTotalTickets(), getTicketSummary(), getValidations()
          ])
          setUsers(u)
          setEvents(e)
          setQuestions(q)
          setTotalTickets(t)
          setTicketedUserIds(new Set(ts.user_ids))
          setValidations(vals)
        } else if (user?.role === 'staff') {
          const [e, q, vals] = await Promise.all([getAllEvents(), getAllQuestions(), getValidations()])
          setEvents(e)
          setQuestions(q)
          setValidations(vals)
        }
      } catch { }
      setLoading(false)
    }
    fetchAll()
  }, [user])

  const roleCount = (role: string) => users.filter(u => u.role === role).length
  const todayStr = new Date().toISOString().split('T')[0]
  const todayEvents = events.filter(e => e.date === todayStr)
  const upcomingEvents = events.filter(e => e.date > todayStr)


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
              <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
                <StatCard label="Total users" value={users.length} />
                <StatCard label="Attendees" value={roleCount('attendee')} />
                <StatCard label="Staff" value={roleCount('staff')} accent="var(--blue)" />
                <StatCard label="Supervisors" value={roleCount('supervisor')} accent="var(--green)" />
                <StatCard label="Purchased tickets" value={totalTickets} accent="var(--green)" />
              </div>
            </>
          )}

          {/* Event stats */}
          <SectionHeader title="Events" />
          <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 36 }}>
            <StatCard label="Total events" value={events.length} />
            <StatCard label="Today" value={todayEvents.length} accent="var(--yellow)" />
            <StatCard label="Upcoming" value={upcomingEvents.length} accent="var(--blue)" />
            <StatCard label="Questions" value={questions.length} accent="var(--purple)" />
          </div>

          {/* Today's events */}
          {todayEvents.length > 0 && (
            <>
              <SectionHeader title="Today's schedule" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
                {todayEvents.map(e => (
                  <Card key={e.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    borderColor: 'var(--border-2)',
                    background: 'linear-gradient(135deg, var(--bg-2), var(--bg-3))',
                    flexWrap: 'wrap', gap: 10,
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 5, fontSize: 16, color: '#ffffff' }}>{e.topic}</div>
                      <div style={{ fontSize: 16, color: 'var(--text-3)' }}>
                        {e.location} · {e.building}, Room {e.room}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 16,
                      color: 'var(--yellow)', whiteSpace: 'nowrap',
                      fontWeight: 600,
                    }}>
                      {e.start_time} – {e.end_time}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* Recent users */}
            {(user?.role === 'admin' || user?.role === 'supervisor') && users.length > 0 && (
              <>
                <SectionHeader title="Recent users" />
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrapper">
                    <Table
                      headers={['Name', 'Email', 'Phone Number', 'Role', 'Ticket']}
                      rows={users.slice(0, 8).map(u => [
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

                        // Only show ticket status for attendees
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

            {/* Recent Scans — mobile only */}
          {/* <div className="mobile-only" style={{ marginTop: 32 }}>
            <SectionHeader title="Recent Scans" />
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              {validations.length === 0 ? (
                <div style={{ padding: 24, color: 'var(--text-3)', fontSize: 15, textAlign: 'center' }}>
                  No scans yet
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {validations.slice(0, 5).map((v, i) => {
                    const parts = v.validation_time?.split('-') || []
                    const parsed = parts.length >= 6
                      ? new Date(+parts[0], +parts[1] - 1, +parts[2], +parts[3], +parts[4], +parts[5])
                      : null
                    return (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px',
                        borderBottom: i < Math.min(validations.length, 5) - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: 'rgba(56,189,248,0.12)',
                            border: '1px solid rgba(56,189,248,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 12, fontWeight: 700, color: 'var(--blue)',
                            fontFamily: 'var(--font-mono)',
                          }}>
                            {v.validated_user?.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>
                            {v.validated_user}
                          </span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                          {parsed
                            ? parsed.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div> */}
        </>
      )}
    </Page>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}