import { useEffect, useState, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getAllEvents, createEvent, updateEvent, deleteEvent, getAllUsers, Event, EventPayload, User } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, SectionHeader, Card, Table, Btn, Input, Select, Modal, toast } from '../components/UI'

const emptyForm = (): EventPayload => ({
  date: '', start_time: '', end_time: '',
  topic: '', agenda: '', speaker: '',
  location: '', building: '', room: '',
})

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [speakers, setSpeakers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState<EventPayload>(emptyForm())
  const [saving, setSaving] = useState(false)

  // DELETE CONFIRM STATE
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  const canEdit = user?.role === 'admin' || user?.role === 'supervisor'

  const load = async () => {
    try {
      const [e, u] = await Promise.all([getAllEvents(), canEdit ? getAllUsers() : Promise.resolve([])])
      setEvents(e)
      setSpeakers(u.filter(x => x.role === 'staff' || x.role === 'supervisor' || x.role === 'admin'))
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (showModal || deleteTarget) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showModal, deleteTarget])

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (e: Event) => {
    setEditing(e)
    setForm({
      date: e.date, start_time: e.start_time, end_time: e.end_time,
      topic: e.topic, agenda: e.agenda, speaker: e.speaker,
      location: e.location, building: e.building, room: e.room,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateEvent(editing.id, form)
        setEvents(ev => ev.map(x => x.id === updated.id ? updated : x))
        toast('Event updated')
      } else {
        const created = await createEvent(form)
        setEvents(ev => [...ev, created])
        toast('Event created')
      }
      setShowModal(false)
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Failed to save event', 'err')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEvent(deleteTarget.id)
      setEvents(ev => ev.filter(x => x.id !== deleteTarget.id))
      toast('Event deleted')
      setDeleteTarget(null)
    } catch {
      toast('Delete failed', 'err')
    }
    setDeleting(false)
  }

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const todayStr = new Date().toISOString().split('T')[0]

  // EVENT FORM MODAL
  const modal = showModal ? createPortal(
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(5, 5, 10, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', boxSizing: 'border-box',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false) }}
    >
      <div
        className="modal-inner fade-up"
        style={{
          width: '100%', maxWidth: 540,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 24, boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#ffffff' }}>
            {editing ? 'Edit event' : 'New event'}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            style={{
              background: 'none', border: 'none', color: '#ffffff',
              fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: '0 4px',
            }}
          >×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Topic" value={form.topic} onChange={e => set('topic', e.target.value)} required />
          <Input label="Agenda" value={form.agenda} onChange={e => set('agenda', e.target.value)} />

          <div className="event-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Input label="Date" type="date" value={form.date} onChange={e => set('date', e.target.value)} required />
            <Input label="Start" type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)} required />
            <Input label="End" type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)} required />
          </div>

          <div className="event-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Input label="Location" value={form.location} onChange={e => set('location', e.target.value)} required />
            <Input label="Building" value={form.building} onChange={e => set('building', e.target.value)} required />
            <Input label="Room" value={form.room} onChange={e => set('room', e.target.value)} required />
          </div>

          <Input label="Speaker" value={form.speaker} onChange={e => set('speaker', e.target.value)} required />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
            <Btn variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  // DELETE CONFIRM MODAL
  const deleteModal = deleteTarget ? createPortal(
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(5, 5, 10, 0.80)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px', boxSizing: 'border-box',
      }}
      onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
    >
      <div
        className="fade-up"
        style={{
          width: '100%', maxWidth: 440,
          background: 'var(--bg-2)',
          border: '1px solid rgba(220,38,38,0.25)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 28, boxSizing: 'border-box',
        }}
      >
        {/* Icon */}
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, marginBottom: 16,
        }}>🗑️</div>

        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#ffffff' }}>
          Delete Event
        </h3>

        <p style={{ margin: '0 0 6px', fontSize: 15, color: '#94a3b8', lineHeight: 1.6 }}>
          You are about to permanently delete:
        </p>

        {/* Event summary */}
        <div style={{
          background: 'rgba(220,38,38,0.05)',
          border: '1px solid rgba(220,38,38,0.15)',
          borderRadius: 10,
          padding: '14px 16px',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
            {deleteTarget.topic}
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'var(--font-mono)', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span>📅 {deleteTarget.date}</span>
            <span>🕒 {deleteTarget.start_time} – {deleteTarget.end_time}</span>
            <span>🎤 {deleteTarget.speaker}</span>
            <span>📍 {deleteTarget.location} · {deleteTarget.building}, Room {deleteTarget.room}</span>
          </div>
        </div>

        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
          This action cannot be undone. A cancellation email will be
          sent to all registered attendees.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Btn>
          <Btn variant="danger" loading={deleting} onClick={handleDelete}>
            Delete Event
          </Btn>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <Page>
      <SectionHeader
        title="Events"
        action={
          canEdit && (
            <Btn onClick={openCreate} style={{ fontSize: 16, padding: '7px 16px' }}>
              + New event
            </Btn>
          )
        }
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, color: 'var(--text-3)', fontSize: 16 }}>Loading...</div>
        ) : events.length === 0 ? (
          <div style={{ padding: 32, color: 'var(--text-3)', fontSize: 16, textAlign: 'center' }}>
            No events yet
          </div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={['Date', 'Topic', 'Time', 'Location', 'Room', ...(canEdit ? [''] : [])]}
              rows={sortedEvents.map(e => {
                const isPast = e.date < todayStr
                const isToday = e.date === todayStr
                return [
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 16,
                    color: isToday ? 'var(--yellow)' : isPast ? 'var(--text-3)' : '#ffffff',
                  }}>
                    {e.date}{isToday ? ' · today' : ''}
                  </span>,
                  <span style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>{e.topic}</span>,
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff', whiteSpace: 'nowrap' }}>
                    {e.start_time}–{e.end_time}
                  </span>,
                  <span style={{ color: '#ffffff', fontSize: 16 }}>{e.location}</span>,
                  <span style={{ color: '#ffffff', fontSize: 16 }}>{e.building}/{e.room}</span>,
                  ...(canEdit ? [
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Btn variant="outline" onClick={() => openEdit(e)} style={{ padding: '6px 12px', fontSize: 16 }}>
                        Edit
                      </Btn>
                      <Btn variant="danger" onClick={() => setDeleteTarget(e)} style={{ padding: '6px 12px', fontSize: 16 }}>
                        Delete
                      </Btn>
                    </div>
                  ] : [])
                ]
              })}
            />
          </div>
        )}
      </Card>

      {modal}
      {deleteModal}
    </Page>
  )
}