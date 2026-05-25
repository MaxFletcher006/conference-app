import { useEffect, useState, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getAllUsers, deleteUser, register, updateUser, User, UserCreatePayload } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Page, SectionHeader, Card, Table, Badge, Btn, Input, Select, Modal, toast } from '../components/UI'

const emptyStaffForm = (): UserCreatePayload => ({
  firstname: '',
  lastname: '',
  email: '',
  phone_number: '',
  password: '',
  role: 'staff',
})

const emptyEditForm = (u: User): Partial<UserCreatePayload> => ({
  firstname: u.firstname,
  lastname: u.lastname,
  email: u.email,
  phone_number: u.phone_number,
  role: u.role,
  password: '',
})

export default function UsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [staffForm, setStaffForm] = useState<UserCreatePayload>(emptyStaffForm())
  const [addingStaff, setAddingStaff] = useState(false)

  const [showEditModal, setShowEditModal] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState<Partial<UserCreatePayload>>({})
  const [editingUser, setEditingUser] = useState(false)

  const isAdmin = me?.role === 'admin'
  const canManage = me?.role === 'admin' || me?.role === 'supervisor'

  const load = async () => {
    try {
      const data = await getAllUsers()
      setUsers(data)
    } catch {
      toast('Failed to load users', 'err')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    const open = showAddModal || showEditModal
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [showAddModal, showEditModal])

  const handleDelete = async (id: number, role: string) => {
    if (role === 'admin') return toast('Cannot delete admin', 'err')
    if (!confirm('Delete this user?')) return
    try {
      await deleteUser(id)
      toast('User deleted')
      setUsers(u => u.filter(x => x.id !== id))
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Delete failed', 'err')
    }
  }

  const openEditModal = (u: User) => {
    setEditTarget(u)
    setEditForm(emptyEditForm(u))
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditTarget(null)
    setEditForm({})
  }

  const handleEditUser = async (e: FormEvent) => {
    e.preventDefault()
    if (!editTarget) return
    setEditingUser(true)
    const targetId = editTarget.id
    const isAdminTarget = editTarget.role === 'admin'
    try {
      const payload: Partial<UserCreatePayload> = { ...editForm }
      if (!payload.password) delete payload.password
      // Never send role when editing an admin — the select is hidden and
      // sending role:'admin' can trip server-side role-change guards.
      if (isAdminTarget) delete payload.role

      const updated = await updateUser(targetId, payload)
      setUsers(u => u.map(x => x.id === updated.id ? updated : x))
      closeEditModal()
      toast(`User ${updated.firstname} updated`)
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Update failed', 'err')
    } finally {
      setEditingUser(false)
    }
  }

  const handleAddStaff = async (e: FormEvent) => {
    e.preventDefault()
    setAddingStaff(true)
    try {
      const created = await register(staffForm)
      setUsers(u => [...u, created])
      toast(`Staff member ${created.firstname} added`)
      setShowAddModal(false)
      setStaffForm(emptyStaffForm())
    } catch (err: any) {
      toast(err?.response?.data?.detail || 'Failed to create staff', 'err')
    } finally {
      setAddingStaff(false)
    }
  }

  const setField = (k: string, v: string) =>
    setStaffForm(f => ({ ...f, [k]: v }))

  const setEditField = (k: string, v: string) =>
    setEditForm(f => ({ ...f, [k]: v }))

  const filtered =
    filter === 'all' ? users : users.filter(u => u.role === filter)

  const roleFilters = [
    { value: 'all', label: 'All' },
    { value: 'attendee', label: 'Attendees' },
    { value: 'staff', label: 'Staff' },
    { value: 'supervisor', label: 'Supervisors' },
    { value: 'admin', label: 'Admins' },
  ]

  const overlayStyle = {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(5, 5, 10, 0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    boxSizing: 'border-box' as const,
  }

  const innerStyle = {
    width: '100%',
    maxWidth: 460,
    background: 'var(--bg-2)',
    border: '1px solid var(--border-2)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    padding: 24,
    boxSizing: 'border-box' as const,
  }

  const formStyle = { display: 'flex', flexDirection: 'column' as const, gap: 16, width: '100%' }

  // ── Add Staff Modal ──────────────────────────────────────────────────────────
  const addModal = showAddModal ? createPortal(
    <div
      className="modal-overlay fade-in"
      style={overlayStyle}
      onMouseDown={e => {
        if (e.target === e.currentTarget) {
          setShowAddModal(false)
          setStaffForm(emptyStaffForm())
        }
      }}
    >
      <div className="modal-inner fade-up" style={innerStyle}>
        <form onSubmit={handleAddStaff} style={formStyle}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px 0', color: '#ffffff' }}>
              Add Staff Member
            </h3>
            <p style={{ fontSize: 16, color: '#ffffff', margin: 0, lineHeight: 1.4 }}>
              Create a new staff account. The user can log in immediately.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
            <Input label="First name" value={staffForm.firstname} onChange={e => setField('firstname', e.target.value)} required />
            <Input label="Last name" value={staffForm.lastname} onChange={e => setField('lastname', e.target.value)} required />
          </div>

          <Input label="Email" type="email" value={staffForm.email} onChange={e => setField('email', e.target.value)} required />
          <Input label="Phone Number" type="tel" value={staffForm.phone_number} onChange={e => setField('phone_number', e.target.value)} required />
          <Input label="Password" type="password" value={staffForm.password} onChange={e => setField('password', e.target.value)} required />

          <Select
            label="Role"
            value={staffForm.role}
            onChange={e => setField('role', e.target.value)}
            options={[
              { value: 'staff', label: 'Staff' },
              ...(isAdmin ? [{ value: 'supervisor', label: 'Supervisor' }] : []),
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Btn variant="ghost" type="button" onClick={() => { setShowAddModal(false); setStaffForm(emptyStaffForm()) }}>
              Cancel
            </Btn>
            <Btn type="submit" loading={addingStaff}>Create account</Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  // ── Edit User Modal (admin only) ─────────────────────────────────────────────
  const editModal = showEditModal && editTarget ? createPortal(
    <div
      className="modal-overlay fade-in"
      style={overlayStyle}
      onMouseDown={e => { if (e.target === e.currentTarget && !editingUser) closeEditModal() }}
    >
      <div className="modal-inner fade-up" style={innerStyle}>
        <form onSubmit={handleEditUser} style={formStyle}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px 0', color: '#ffffff' }}>
              Edit User
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-3)', margin: 0, lineHeight: 1.4 }}>
              Updating <strong style={{ color: '#ffffff' }}>{editTarget.firstname} {editTarget.lastname}</strong>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%' }}>
            <Input
              label="First name"
              value={editForm.firstname ?? ''}
              onChange={e => setEditField('firstname', e.target.value)}
              required
            />
            <Input
              label="Last name"
              value={editForm.lastname ?? ''}
              onChange={e => setEditField('lastname', e.target.value)}
              required
            />
          </div>

          <Input
            label="Email"
            type="email"
            value={editForm.email ?? ''}
            onChange={e => setEditField('email', e.target.value)}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={editForm.phone_number ?? ''}
            onChange={e => setEditField('phone_number', e.target.value)}
            required
          />

          {editTarget.role !== 'admin' && (
            <Select
              label="Role"
              value={editForm.role ?? editTarget.role}
              onChange={e => setEditField('role', e.target.value)}
              options={[
                { value: 'attendee', label: 'Attendee' },
                { value: 'staff', label: 'Staff' },
                { value: 'supervisor', label: 'Supervisor' },
              ]}
            />
          )}

          <Input
            label="New Password (leave blank to keep current)"
            type="password"
            value={editForm.password ?? ''}
            onChange={e => setEditField('password', e.target.value)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
            <Btn variant="ghost" type="button" onClick={closeEditModal} disabled={editingUser}>
              Cancel
            </Btn>
            <Btn type="submit" loading={editingUser}>Save changes</Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null

  const tableHeaders = isAdmin
    ? ['Name', 'Email', 'Phone Number', 'Role', 'Actions']
    : ['Name', 'Email', 'Phone Number', 'Role']

  return (
    <Page>
      <SectionHeader
        title="Users"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff' }}>
              {users.length} total
            </span>
            {canManage && (
              <Btn onClick={() => setShowAddModal(true)} style={{ fontSize: 16, padding: '7px 16px' }}>
                + Add staff
              </Btn>
            )}
          </div>
        }
      />

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {roleFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '8px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid',
              borderColor: filter === f.value ? 'var(--border-3)' : 'transparent',
              background: filter === f.value ? 'var(--bg-3)' : 'transparent',
              color: filter === f.value ? '#ffffff' : 'var(--text-3)',
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, fontSize: 16, color: 'var(--text-3)' }}>Loading...</div>
        ) : (
          <div className="table-wrapper">
            <Table
              headers={tableHeaders}
              rows={filtered.map(u => [
                <span style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>{u.firstname} {u.lastname}</span>,
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff' }}>{u.email}</span>,
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff' }}>{u.phone_number}</span>,
                <Badge label={u.role} />,
                ...(isAdmin
                  ? [
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Btn
                          variant="ghost"
                          onClick={() => openEditModal(u)}
                          style={{ padding: '6px 12px', fontSize: 14 }}
                        >
                          Edit
                        </Btn>
                        {u.role !== 'admin' ? (
                          <Btn
                            variant="danger"
                            onClick={() => handleDelete(u.id, u.role)}
                            style={{ padding: '6px 12px', fontSize: 14 }}
                          >
                            Delete
                          </Btn>
                        ) : (
                          <span style={{ color: 'var(--text-3)' }}>—</span>
                        )}
                      </div>,
                    ]
                  : []),
              ])}
            />
          </div>
        )}
      </Card>

      {addModal}
      {editModal}
    </Page>
  )
}