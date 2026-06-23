import { useEffect, useState, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  getAllEvents, createEvent, updateEvent, deleteEvent,
  getEventAgendas, createAgenda, updateAgenda, deleteAgenda,
  Event, EventPayload, Agenda, AgendaPayload, AgendaUpdatePayload, apiErr,
} from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, SectionHeader, Card, Btn, Input, toast, Spinner } from '../components/UI'

const emptyEventForm = (): EventPayload => ({
  event_name: '',
  description: '',
  start_date: '',
  end_date: '',
  is_active: false,
  ticket_price: 0,
  include_weekends: false,
})

const emptyAgendaForm = (event_id: number): AgendaPayload => ({
  event_id,
  agenda: '',
  speaker: '',
  location: '',
  building: '',
  room: '',
  start_time: '',
  end_time: '',
})

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(5,5,10,0.8)', backdropFilter: 'blur(4px)',
  zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px', boxSizing: 'border-box',
}

export default function EventsPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [form, setForm] = useState<EventPayload>(emptyEventForm())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Agenda state
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null)
  const [agendas, setAgendas] = useState<Record<number, Agenda[]>>({})
  const [loadingAgendas, setLoadingAgendas] = useState(false)
  const [showAgendaModal, setShowAgendaModal] = useState(false)
  const [editingAgenda, setEditingAgenda] = useState<Agenda | null>(null)
  const [agendaForm, setAgendaForm] = useState<AgendaPayload>(emptyAgendaForm(0))
  const [savingAgenda, setSavingAgenda] = useState(false)
  const [deleteAgendaTarget, setDeleteAgendaTarget] = useState<Agenda | null>(null)
  const [deletingAgenda, setDeletingAgenda] = useState(false)

  const canEdit = user?.role === 'admin' || user?.role === 'supervisor'

  const load = async () => {
    try {
      const e = await getAllEvents()
      setEvents(e)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const open = showModal || !!deleteTarget || showAgendaModal || !!deleteAgendaTarget
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showModal, deleteTarget, showAgendaModal, deleteAgendaTarget])

  const set = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }))

  const openCreate = () => { setEditing(null); setForm(emptyEventForm()); setShowModal(true) }
  const openEdit = (e: Event) => {
    setEditing(e)
    setForm({
      event_name: e.event_name,
      description: e.description ?? '',
      start_date: e.start_date,
      end_date: e.end_date,
      is_active: e.is_active,
      ticket_price: e.ticket_price,
      include_weekends: e.include_weekends,
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
      toast(apiErr(err, 'Failed to save event'), 'err')
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

  const toggleExpand = async (eventId: number) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null)
      return
    }
    setExpandedEventId(eventId)
    if (!agendas[eventId]) {
      setLoadingAgendas(true)
      try {
        const list = await getEventAgendas(eventId)
        setAgendas(prev => ({ ...prev, [eventId]: list }))
      } catch { }
      setLoadingAgendas(false)
    }
  }

  const openCreateAgenda = (eventId: number) => {
    setEditingAgenda(null)
    setAgendaForm(emptyAgendaForm(eventId))
    setShowAgendaModal(true)
  }

  const openEditAgenda = (a: Agenda) => {
    setEditingAgenda(a)
    setAgendaForm({
      event_id: a.event_id,
      agenda: a.agenda ?? '',
      speaker: a.speaker ?? '',
      location: a.location ?? '',
      building: a.building ?? '',
      room: a.room ?? '',
      start_time: a.start_time ?? '',
      end_time: a.end_time ?? '',
    })
    setShowAgendaModal(true)
  }

  const handleAgendaSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSavingAgenda(true)
    try {
      if (editingAgenda) {
        const updated = await updateAgenda(editingAgenda.agenda_id, agendaForm as AgendaUpdatePayload)
        setAgendas(prev => ({
          ...prev,
          [agendaForm.event_id]: (prev[agendaForm.event_id] || []).map(x =>
            x.agenda_id === updated.agenda_id ? updated : x
          ),
        }))
        toast('Session updated')
      } else {
        const created = await createAgenda(agendaForm)
        setAgendas(prev => ({
          ...prev,
          [agendaForm.event_id]: [...(prev[agendaForm.event_id] || []), created],
        }))
        toast('Session created')
      }
      setShowAgendaModal(false)
    } catch (err: any) {
      toast(apiErr(err, 'Failed to save session'), 'err')
    }
    setSavingAgenda(false)
  }

  const handleDeleteAgenda = async () => {
    if (!deleteAgendaTarget) return
    setDeletingAgenda(true)
    try {
      await deleteAgenda(deleteAgendaTarget.agenda_id)
      const eid = deleteAgendaTarget.event_id!
      setAgendas(prev => ({ ...prev, [eid]: (prev[eid] || []).filter(x => x.agenda_id !== deleteAgendaTarget.agenda_id) }))
      toast('Session deleted')
      setDeleteAgendaTarget(null)
    } catch {
      toast('Delete failed', 'err')
    }
    setDeletingAgenda(false)
  }

  const sortedEvents = [...events].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const todayStr = new Date().toISOString().split('T')[0]

  // ── Event form modal ────────────────────────────────────────────────────────
  const eventModal = showModal ? createPortal(
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
      <div style={{
        width: '100%', maxWidth: 560, background: 'var(--bg-2)',
        border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)', padding: 24, boxSizing: 'border-box',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#ffffff' }}>
            {editing ? 'Edit Event' : 'New Event'}
          </h3>
          <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Event Name" value={form.event_name} onChange={e => set('event_name', e.target.value)} required />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>DESCRIPTION</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Brief description of the event..."
              style={{
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '10px 14px',
                color: '#ffffff', fontSize: 15, resize: 'vertical',
                fontFamily: 'var(--font-sans)', outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Start Date" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
            <Input label="End Date" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
          </div>

          <Input label="Ticket Price (₮)" type="number" value={String(form.ticket_price)} onChange={e => set('ticket_price', parseFloat(e.target.value) || 0)} required />

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: form.is_active ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.is_active ? 'rgba(74,222,128,0.25)' : 'var(--border)'}`, borderRadius: 'var(--radius)', transition: 'all 0.2s' }}>
            <input type="checkbox" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--green)' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Active (visible to attendees)</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>When active, this event is shown on the attendee portal</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 14px', background: form.include_weekends ? 'rgba(82,96,217,0.07)' : 'rgba(255,255,255,0.03)', border: `1px solid ${form.include_weekends ? 'rgba(82,96,217,0.25)' : 'var(--border)'}`, borderRadius: 'var(--radius)', transition: 'all 0.2s' }}>
            <input type="checkbox" checked={form.include_weekends} onChange={e => set('include_weekends', e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--blue)' }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff' }}>Include weekends in ticket duration</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>By default only weekdays (Mon–Fri) count toward the ticket duration</div>
            </div>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <Btn variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  // ── Delete event modal ──────────────────────────────────────────────────────
  const deleteEventModal = deleteTarget ? createPortal(
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'var(--bg-2)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-lg)', padding: 28 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#ffffff' }}>Delete Event</h3>
        <p style={{ margin: '0 0 6px', fontSize: 15, color: '#94a3b8', lineHeight: 1.6 }}>You are about to permanently delete:</p>
        <div style={{ background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 10, padding: '14px 16px', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>{deleteTarget.event_name}</div>
          <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
            📅 {deleteTarget.start_date} — {deleteTarget.end_date}
          </div>
        </div>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>This action cannot be undone. All agendas linked to this event will also be deleted.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
          <Btn variant="danger" loading={deleting} onClick={handleDelete}>Delete Event</Btn>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  // ── Agenda form modal ───────────────────────────────────────────────────────
  const agendaModal = showAgendaModal ? createPortal(
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) setShowAgendaModal(false) }}>
      <div style={{
        width: '100%', maxWidth: 520, background: 'var(--bg-2)',
        border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)',
        padding: 24, boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#ffffff' }}>
            {editingAgenda ? 'Edit Session' : 'New Session'}
          </h3>
          <button onClick={() => setShowAgendaModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleAgendaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input label="Session Title / Topic" value={agendaForm.agenda} onChange={e => setAgendaForm(f => ({ ...f, agenda: e.target.value }))} required />
          <Input label="Speaker" value={agendaForm.speaker ?? ''} onChange={e => setAgendaForm(f => ({ ...f, speaker: e.target.value }))} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Input label="Start Time" type="time" value={agendaForm.start_time} onChange={e => setAgendaForm(f => ({ ...f, start_time: e.target.value }))} required />
            <Input label="End Time" type="time" value={agendaForm.end_time} onChange={e => setAgendaForm(f => ({ ...f, end_time: e.target.value }))} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Input label="Location" value={agendaForm.location} onChange={e => setAgendaForm(f => ({ ...f, location: e.target.value }))} required />
            <Input label="Building" value={agendaForm.building} onChange={e => setAgendaForm(f => ({ ...f, building: e.target.value }))} required />
            <Input label="Room" value={agendaForm.room} onChange={e => setAgendaForm(f => ({ ...f, room: e.target.value }))} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <Btn variant="ghost" type="button" onClick={() => setShowAgendaModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={savingAgenda}>{editingAgenda ? 'Update' : 'Add Session'}</Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  // ── Delete agenda modal ─────────────────────────────────────────────────────
  const deleteAgendaModal = deleteAgendaTarget ? createPortal(
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) setDeleteAgendaTarget(null) }}>
      <div style={{ width: '100%', maxWidth: 400, background: 'var(--bg-2)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#ffffff' }}>Delete Session</h3>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
          Delete <strong style={{ color: '#ffffff' }}>{deleteAgendaTarget.agenda}</strong>? This cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="ghost" onClick={() => setDeleteAgendaTarget(null)}>Cancel</Btn>
          <Btn variant="danger" loading={deletingAgenda} onClick={handleDeleteAgenda}>Delete</Btn>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <Page>
      <SectionHeader
        title="Events"
        action={canEdit && <Btn onClick={openCreate} style={{ fontSize: 16, padding: '7px 16px' }}>+ New Event</Btn>}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={28} /></div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
          No events yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {sortedEvents.map(ev => {
            const isPast = ev.end_date < todayStr
            const isToday = ev.start_date <= todayStr && ev.end_date >= todayStr
            const isExpanded = expandedEventId === ev.id
            const accent = ev.is_active ? (isToday ? 'var(--yellow)' : isPast ? 'var(--text-3)' : 'var(--green)') : 'var(--text-3)'

            return (
              <Card key={ev.id} style={{ padding: 0, overflow: 'hidden', opacity: isPast ? 0.7 : 1 }}>
                {/* Event header */}
                <div style={{ padding: '18px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>{ev.event_name}</span>
                        <span style={{
                          fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px',
                          borderRadius: 4, letterSpacing: '0.06em',
                          background: ev.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${ev.is_active ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                          color: ev.is_active ? 'var(--green)' : 'var(--text-3)',
                        }}>
                          {ev.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      {ev.description && (
                        <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{ev.description}</div>
                      )}
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: accent }}>📅 {ev.start_date} — {ev.end_date}</span>
                        <span>🎫 ₮{ev.ticket_price.toLocaleString()}</span>
                        {ev.include_weekends && <span>📆 Weekends included</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
                      <Btn
                        variant="outline"
                        onClick={() => toggleExpand(ev.id)}
                        style={{ padding: '6px 12px', fontSize: 13 }}
                      >
                        {isExpanded ? '▲ Sessions' : '▼ Sessions'}
                      </Btn>
                      {canEdit && (
                        <>
                          <Btn variant="outline" onClick={() => openEdit(ev)} style={{ padding: '6px 12px', fontSize: 13 }}>Edit</Btn>
                          <Btn variant="danger" onClick={() => setDeleteTarget(ev)} style={{ padding: '6px 12px', fontSize: 13 }}>Delete</Btn>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Agendas section */}
                {isExpanded && (
                  <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', padding: '16px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Sessions / Agenda
                      </span>
                      {canEdit && (
                        <Btn onClick={() => openCreateAgenda(ev.id)} style={{ padding: '4px 10px', fontSize: 12 }}>
                          + Add Session
                        </Btn>
                      )}
                    </div>

                    {loadingAgendas && expandedEventId === ev.id ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spinner size={20} /></div>
                    ) : !agendas[ev.id] || agendas[ev.id].length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-3)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                        — No sessions yet —
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {agendas[ev.id].map(a => (
                          <div key={a.agenda_id} style={{
                            background: 'var(--bg-3)', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', padding: '12px 16px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                          }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>{a.agenda}</div>
                              {a.speaker && <div style={{ fontSize: 13, color: 'var(--blue)', marginBottom: 4 }}>🎤 {a.speaker}</div>}
                              <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                {a.start_time && a.end_time && <span>🕒 {a.start_time}–{a.end_time}</span>}
                                {a.location && <span>📍 {a.location}</span>}
                                {a.building && <span>🏛 {a.building}{a.room ? `, Room ${a.room}` : ''}</span>}
                              </div>
                            </div>
                            {canEdit && (
                              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                <Btn variant="outline" onClick={() => openEditAgenda(a)} style={{ padding: '4px 8px', fontSize: 11 }}>Edit</Btn>
                                <Btn variant="danger" onClick={() => setDeleteAgendaTarget(a)} style={{ padding: '4px 8px', fontSize: 11 }}>✕</Btn>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {eventModal}
      {deleteEventModal}
      {agendaModal}
      {deleteAgendaModal}
    </Page>
  )
}
