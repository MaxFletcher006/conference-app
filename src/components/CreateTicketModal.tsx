import { useState } from 'react'
import { staffCreateTicket, apiErr, StaffTicketPayload } from '../api/client'
import { toast } from './UI'

const EMPTY: StaffTicketPayload = { firstname: '', lastname: '', phone_number: '', email: '' }

export default function CreateTicketModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<StaffTicketPayload>(EMPTY)
  const [loading, setLoading] = useState(false)

  const set = (key: keyof StaffTicketPayload) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await staffCreateTicket(form)
      if (result.invoice_url) {
        window.open(result.invoice_url, '_blank', 'noopener,noreferrer')
        toast(`Payment link opened — ticket will be emailed to ${result.email} after payment`)
        onClose()
      } else {
        toast(result.error ?? 'Failed to create invoice', 'err')
      }
    } catch (err) {
      toast(apiErr(err, 'Failed to create ticket'), 'err')
    } finally {
      setLoading(false)
    }
  }

  const fields: { key: keyof StaffTicketPayload; label: string; placeholder: string; type?: string }[] = [
    { key: 'firstname',    label: 'First Name',   placeholder: 'John' },
    { key: 'lastname',     label: 'Last Name',    placeholder: 'Doe' },
    { key: 'phone_number', label: 'Phone Number', placeholder: '+976 9999 9999' },
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
          maxWidth: 440,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            color: 'var(--blue)', letterSpacing: '0.14em',
            marginBottom: 6, textTransform: 'uppercase',
          }}>
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
          {fields.map(f => (
            <div key={f.key}>
              <label style={{
                display: 'block', fontSize: 11, color: 'var(--text-3)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.1em',
                marginBottom: 5, textTransform: 'uppercase',
              }}>
                {f.label}
              </label>
              <input
                required
                type={f.type ?? 'text'}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={set(f.key)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '9px 13px',
                  background: 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: '#fff', fontSize: 14,
                  fontFamily: 'var(--font-mono)',
                  outline: 'none',
                }}
              />
            </div>
          ))}

          {/* Price display — same as AttendeePage */}
          <div style={{
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius)', padding: '12px 16px',
            fontFamily: 'var(--font-mono)', fontSize: 15,
            color: 'var(--blue)', letterSpacing: '0.05em',
          }}>
            Total: ₮10,000
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 0',
                background: 'none', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', color: 'var(--text-3)',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 2, padding: '10px 0',
                background: 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                border: '1px solid rgba(56,189,248,0.3)',
                borderRadius: 'var(--radius)', color: '#fff',
                fontSize: 14, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Open Payment Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
