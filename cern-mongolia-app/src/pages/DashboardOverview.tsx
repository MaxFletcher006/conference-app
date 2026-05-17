import { useEffect, useState } from 'react'
import { getAllUsers, getAllEvents, getAllQuestions, User, Event, Question } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, StatCard, SectionHeader, Badge, Card, Table } from '../components/UI'

export default function DashboardOverview() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (user?.role === 'admin' || user?.role === 'supervisor') {
          const [u, e, q] = await Promise.all([getAllUsers(), getAllEvents(), getAllQuestions()])
          setUsers(u); setEvents(e); setQuestions(q)
        } else if (user?.role === 'staff') {
          const [e, q] = await Promise.all([getAllEvents(), getAllQuestions()])
          setEvents(e); setQuestions(q)
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
                    headers={['Name', 'Email', 'Phone Number', 'Role']}
                    rows={users.slice(0, 8).map(u => [
                      <span style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>{u.firstname} {u.lastname}</span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{u.email}</span>,
                      <span style={{ color: '#ffffff', fontFamily: 'var(--font-mono)', fontSize: 16 }}>{u.phone_number}</span>,
                      <Badge label={u.role} />,
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

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}