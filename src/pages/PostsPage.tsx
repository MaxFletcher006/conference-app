import { useEffect, useState, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getAllPosts, createPost, deletePost, Post, PostPayload, apiErr } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, SectionHeader, Card, Btn, toast, Spinner } from '../components/UI'

const emptyForm = (): PostPayload => ({ header: '', body: '', staff_only: false })

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(5,5,10,0.75)',
  backdropFilter: 'blur(4px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  boxSizing: 'border-box',
}

const innerStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: 480,
  background: 'var(--bg-2)',
  border: '1px solid var(--border-2)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-lg)',
  padding: 24,
  boxSizing: 'border-box',
}

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  width: '100%',
}

export default function PostsPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<PostPayload>(emptyForm())
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)
  const [deleting, setDeleting] = useState(false)

  const canEdit = user?.role === 'admin' || user?.role === 'supervisor'

  const load = async () => {
    try { setPosts(await getAllPosts()) } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const open = showModal || !!deleteTarget
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showModal, deleteTarget])

  const openCreate = () => { setForm(emptyForm()); setShowModal(true) }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const created = await createPost(form)
      setPosts(prev => [created, ...prev])
      toast(form.staff_only ? 'Announcement published and emailed to admin/supervisor/staff' : 'Announcement published and emailed to all attendees')
      setShowModal(false)
    } catch (err: any) {
      toast(apiErr(err, 'Failed to publish post'), 'err')
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePost(deleteTarget.id)
      setPosts(prev => prev.filter(p => p.id !== deleteTarget.id))
      toast('Post deleted')
      setDeleteTarget(null)
    } catch (err: any) {
      toast(apiErr(err, 'Failed to delete post'), 'err')
    }
    setDeleting(false)
  }

  const formatTime = (t: string) => {
    try { return new Date(t).toLocaleString() } catch { return t }
  }

  // ── Create modal ──────────────────────────────────────────────────────────────
  const createModal = showModal ? createPortal(
    <div
      className="fade-in"
      style={overlayStyle}
      onMouseDown={e => { if (e.target === e.currentTarget) setShowModal(false) }}
    >
      <div className="fade-up" style={innerStyle}>
        <form onSubmit={handleSubmit} style={formStyle}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 4px', color: '#ffffff' }}>
            New Announcement
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              HEADER
            </label>
            <input
              required
              value={form.header}
              onChange={e => setForm(f => ({ ...f, header: e.target.value }))}
              placeholder="Announcement title..."
              style={{
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '10px 14px',
                color: '#ffffff', fontSize: 15, outline: 'none',
                transition: 'border-color 0.2s', fontFamily: 'var(--font-sans)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--border-3)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 13, color: 'var(--text-2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
              BODY
            </label>
            <textarea
              required
              rows={5}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write the full announcement text here..."
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

          {/* Staff-only toggle */}
          <label style={{
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
            background: form.staff_only ? 'rgba(82,96,217,0.08)' : 'rgba(124,58,237,0.07)',
            border: `1px solid ${form.staff_only ? 'rgba(82,96,217,0.3)' : 'rgba(124,58,237,0.2)'}`,
            borderRadius: 8, padding: '10px 14px', transition: 'all 0.2s',
          }}>
            <input
              type="checkbox"
              checked={form.staff_only}
              onChange={e => setForm(f => ({ ...f, staff_only: e.target.checked }))}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--blue)' }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
                {form.staff_only ? '👥 Admin / Supervisor / Staff' : '🌐 All Attendees'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                {form.staff_only
                  ? 'Email will be sent to all admins, supervisors, and staff.'
                  : 'Email will be sent to all users with the attendee role.'}
              </div>
            </div>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Btn variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn type="submit" loading={saving}>Publish</Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  // ── Delete confirm modal ──────────────────────────────────────────────────────
  const deleteModal = deleteTarget ? createPortal(
    <div
      className="fade-in"
      style={overlayStyle}
      onMouseDown={e => { if (e.target === e.currentTarget) setDeleteTarget(null) }}
    >
      <div className="fade-up" style={innerStyle}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 12px', color: '#ffffff' }}>
          Delete Post
        </h3>
        <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 20px' }}>
          Are you sure you want to delete{' '}
          <span style={{ color: '#ffffff', fontWeight: 600 }}>"{deleteTarget.header}"</span>?
          This cannot be undone.
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
        title="Announcements"
        action={canEdit ? <Btn onClick={openCreate}>+ New Post</Btn> : undefined}
      />

      <Card>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
            <Spinner size={28} />
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 0',
            color: 'var(--text-3)', fontSize: 15,
            fontFamily: 'var(--font-mono)',
          }}>
            — No announcements yet —
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {posts.map((p, i) => (
              <div
                key={p.id}
                style={{
                  padding: '18px 20px',
                  borderBottom: i < posts.length - 1 ? '1px solid var(--border)' : 'none',
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#ffffff' }}>{p.header}</span>
                    {p.staff_only && (
                      <span style={{
                        fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                        padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(82,96,217,0.12)', border: '1px solid rgba(82,96,217,0.3)',
                        color: 'var(--blue)', whiteSpace: 'nowrap',
                      }}>
                        STAFF ONLY
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 8,
                  }}>
                    {p.body}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                    🕒 {formatTime(p.time)}
                  </div>
                </div>
                {canEdit && (
                  <Btn
                    variant="danger"
                    onClick={() => setDeleteTarget(p)}
                    style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12 }}
                  >
                    Delete
                  </Btn>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {createModal}
      {deleteModal}
    </Page>
  )
}
