import { useEffect, useState, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import {
  getAllBanners, createBanner, updateBanner, deleteBanner,
  getAllEvents,
  Banner, BannerPayload, Event, apiErr,
} from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, SectionHeader, Card, Btn, toast, Spinner } from '../components/UI'

const emptyForm = (): BannerPayload => ({ event_id: undefined, description: '', is_active: false })

const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(5,5,10,0.8)', backdropFilter: 'blur(4px)',
  zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '20px', boxSizing: 'border-box',
}

export default function BannersPage() {
  const { user } = useAuth()
  const [banners, setBanners] = useState<Banner[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)
  const [form, setForm] = useState<BannerPayload>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<number | null>(null)

  const canEdit = user?.role === 'admin' || user?.role === 'supervisor'

  const load = async () => {
    try {
      const [b, e] = await Promise.all([getAllBanners(), getAllEvents()])
      setBanners(b)
      setEvents(e)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const open = showModal || !!deleteTarget
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showModal, deleteTarget])

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (b: Banner) => {
    setEditing(b)
    setForm({ event_id: b.event_id, description: b.description, is_active: b.is_active })
    setShowModal(true)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        const updated = await updateBanner(editing.id, form)
        setBanners(prev => prev.map(x => x.id === updated.id ? updated : x))
        toast('Banner updated')
      } else {
        const created = await createBanner(form)
        setBanners(prev => [created, ...prev])
        toast('Banner created')
      }
      setShowModal(false)
    } catch (err: any) {
      toast(apiErr(err, 'Failed to save banner'), 'err')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteBanner(deleteTarget.id)
      setBanners(prev => prev.filter(x => x.id !== deleteTarget.id))
      toast('Banner deleted')
      setDeleteTarget(null)
    } catch {
      toast('Delete failed', 'err')
    }
    setDeleting(false)
  }

  const handleToggleActive = async (b: Banner) => {
    setToggling(b.id)
    try {
      const updated = await updateBanner(b.id, { event_id: b.event_id, description: b.description, is_active: !b.is_active })
      setBanners(prev => prev.map(x => x.id === updated.id ? updated : x))
      toast(updated.is_active ? 'Banner activated' : 'Banner deactivated')
    } catch {
      toast('Toggle failed', 'err')
    }
    setToggling(null)
  }

  // ── Banner form modal ───────────────────────────────────────────────────────
  const modal = showModal ? createPortal(
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false) }}>
      <div style={{
        width: '100%', maxWidth: 520, background: 'var(--bg-2)',
        border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)',
        padding: 24, boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: '#ffffff' }}>
            {editing ? 'Edit Banner' : 'New Banner'}
          </h3>
          <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#ffffff', fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Event selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>LINKED EVENT (OPTIONAL)</label>
            <select
              value={form.event_id ?? ''}
              onChange={e => setForm(f => ({ ...f, event_id: e.target.value ? parseInt(e.target.value) : undefined }))}
              style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: '#ffffff', fontSize: 15, outline: 'none', fontFamily: 'var(--font-sans)' }}
            >
              <option value="">— No linked event —</option>
              {events.filter(ev => ev.is_active).map(ev => (
                <option key={ev.id} value={ev.id}>{ev.event_name} ({ev.start_date})</option>
              ))}
            </select>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Linking an event shows its dates and price on the banner</div>
          </div>

          {/* Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>BANNER DESCRIPTION</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Write the banner text that visitors will see on the home page..."
              style={{
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '10px 14px',
                color: '#ffffff', fontSize: 15, resize: 'vertical',
                fontFamily: 'var(--font-sans)', outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-3)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {/* Active toggle */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            background: form.is_active ? 'rgba(74,222,128,0.07)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${form.is_active ? 'rgba(74,222,128,0.25)' : 'var(--border)'}`,
            borderRadius: 8, padding: '10px 14px', transition: 'all 0.2s',
          }}>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--green)' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                {form.is_active ? '🟢 Active (visible on home page)' : '⚫ Inactive (hidden)'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                Active banners appear in the Events section of the home page
              </div>
            </div>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>{editing ? 'Update' : 'Create'}</Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  // ── Delete confirm modal ────────────────────────────────────────────────────
  const deleteModal = deleteTarget ? createPortal(
    <div style={overlayStyle} onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg-2)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: '#ffffff' }}>Delete Banner</h3>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
          Are you sure you want to delete this banner? It will no longer appear on the home page.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Btn variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Btn>
          <Btn variant="danger" loading={deleting} onClick={handleDelete}>Delete</Btn>
        </div>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <Page>
      <SectionHeader
        title="Banners"
        action={canEdit && <Btn onClick={openCreate}>+ New Banner</Btn>}
      />

      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner size={28} />
          </div>
        ) : banners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)', fontSize: 15, fontFamily: 'var(--font-mono)' }}>
            — No banners yet —<br />
            <span style={{ fontSize: 13, display: 'block', marginTop: 8 }}>Create a banner to promote an event on the home page</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {banners.map((b, i) => (
              <div
                key={b.id}
                style={{
                  padding: '18px 20px',
                  borderBottom: i < banners.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    {b.event_name && (
                      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--blue)', letterSpacing: '0.06em' }}>
                        {b.event_name}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11, fontFamily: 'var(--font-mono)', padding: '2px 8px',
                      borderRadius: 4, letterSpacing: '0.06em',
                      background: b.is_active ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${b.is_active ? 'rgba(74,222,128,0.3)' : 'var(--border)'}`,
                      color: b.is_active ? 'var(--green)' : 'var(--text-3)',
                    }}>
                      {b.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 6 }}>
                    {b.description}
                  </div>
                  {(b.start_date || b.ticket_price != null) && (
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                      {b.start_date && <span>📅 {b.start_date}{b.end_date && b.end_date !== b.start_date ? ` — ${b.end_date}` : ''}</span>}
                      {b.ticket_price != null && <span>🎫 ₮{b.ticket_price.toLocaleString()}</span>}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
                    🕒 {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    <Btn
                      variant="outline"
                      onClick={() => handleToggleActive(b)}
                      style={{ padding: '6px 12px', fontSize: 12, opacity: toggling === b.id ? 0.6 : 1 }}
                    >
                      {b.is_active ? 'Deactivate' : 'Activate'}
                    </Btn>
                    <Btn variant="outline" onClick={() => openEdit(b)} style={{ padding: '6px 12px', fontSize: 12 }}>
                      Edit
                    </Btn>
                    <Btn variant="danger" onClick={() => setDeleteTarget(b)} style={{ padding: '6px 12px', fontSize: 12 }}>
                      Delete
                    </Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {modal}
      {deleteModal}
    </Page>
  )
}
