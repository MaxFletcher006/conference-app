import { useState, useEffect } from 'react'
import { staffCreateTicket, getAllEvents, apiErr, StaffTicketPayload, Event } from '../api/client'
import { toast } from './UI'

const EMPTY = (event_id?: number): StaffTicketPayload => ({
  firstname: '', lastname: '', phone_number: '', email: '', event_id: event_id ?? 0,
})

export default function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [form, setForm] = useState<StaffTicketPayload>(EMPTY())
  const [loading, setLoading] = useState(false)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [invoiceEmail, setInvoiceEmail] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState(0)

  useEffect(() => {
    getAllEvents().then(e => {
      const active = e.filter(ev => ev.is_active)
      setEvents(active)
    }).catch(() => {})
  }, [])

  const handleEventChange = (eventId: string) => {
    const ev = events.find(e => String(e.id) === eventId) ?? null
    setSelectedEvent(ev)
    setForm(f => ({ ...f, event_id: ev ? ev.id : 0 }))
  }

  const set = (key: keyof Omit<StaffTicketPayload, 'event_id'>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedEvent) { toast('Please select an event', 'err'); return }
    setLoading(true)
    try {
      const result = await staffCreateTicket(form)
      if (result.invoice_url) {
        setInvoiceUrl(result.invoice_url)
        setInvoiceEmail(result.email ?? form.email)
        setInvoiceAmount(result.amount ?? selectedEvent.ticket_price)
      } else {
        toast(result.error ?? 'Failed to create invoice', 'err')
      }
    } catch (err) {
      toast(apiErr(err, 'Failed to create ticket'), 'err')
    } finally {
      setLoading(false)
    }
  }

  const fields: { key: keyof Omit<StaffTicketPayload, 'event_id'>; label: string; placeholder: string; type?: string }[] = [
    { key: 'firstname',    label: 'First Name',   placeholder: 'John' },
    { key: 'lastname',     label: 'Last Name',    placeholder: 'Doe' },
    { key: 'phone_number', label: 'Phone Number', placeholder: '9911 8811' },
    { key: 'email',        label: 'Email',        placeholder: 'attendee@email.com', type: 'email' },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 28px',
          width: '100%',
          maxWidth: 460,
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        {invoiceUrl ? (
          /* ── Payment ready state ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--green)', letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }}>
                Payment Link Ready
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                Open Payment Page
              </h2>
              <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Ticket will be emailed to{' '}
                <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{invoiceEmail}</span>
                {' '}after payment is completed.
              </p>
            </div>

            <a
              href={invoiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              style={{
                display: 'block', textAlign: 'center',
                padding: '14px 0',
                background: 'linear-gradient(135deg,#15803d,#16a34a)',
                border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 'var(--radius)', color: '#fff',
                fontSize: 15, fontWeight: 700,
                textDecoration: 'none',
                letterSpacing: '0.02em',
              }}
            >
              Tap to Pay ₮{invoiceAmount.toLocaleString()}
            </a>

            <button
              onClick={onClose}
              style={{ padding: '10px 0', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-3)', fontSize: 14, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--blue)', letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }}>
                Create Ticket
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                Issue Conference Pass
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-3)', lineHeight: 1.5 }}>
                Enter the attendee's details. A payment link will open — the ticket is emailed after payment.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Event selector */}
              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
                  Event
                </label>
                <select
                  required
                  value={selectedEvent ? String(selectedEvent.id) : ''}
                  onChange={e => handleEventChange(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 13px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: selectedEvent ? '#fff' : 'var(--text-3)', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }}
                >
                  <option value="">Select an event...</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.event_name} ({ev.start_date})</option>
                  ))}
                </select>
              </div>

              {fields.map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
                    {f.label}
                  </label>
                  <input
                    required
                    type={f.type ?? 'text'}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={set(f.key)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 13px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: '#fff', fontSize: 14, fontFamily: 'var(--font-mono)', outline: 'none' }}
                  />
                </div>
              ))}

              {selectedEvent && (
                <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--blue)', letterSpacing: '0.05em' }}>
                  Total: ₮{selectedEvent.ticket_price.toLocaleString()}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ flex: 1, padding: '10px 0', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text-3)', fontSize: 14, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedEvent}
                  style={{ flex: 2, padding: '10px 0', background: 'linear-gradient(135deg,#1d4ed8,#2563eb)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 'var(--radius)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: (loading || !selectedEvent) ? 'not-allowed' : 'pointer', opacity: (loading || !selectedEvent) ? 0.6 : 1 }}
                >
                  {loading ? 'Creating...' : 'Get Payment Link'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
