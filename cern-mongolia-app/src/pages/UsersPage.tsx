import { useEffect, useState, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { getAllUsers, deleteUser, register, User, UserCreatePayload } from '../api/client'
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

export default function UsersPage() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const [showAddModal, setShowAddModal] = useState(false)
  const [staffForm, setStaffForm] = useState<UserCreatePayload>(emptyStaffForm())
  const [addingStaff, setAddingStaff] = useState(false)

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

  useEffect(() => {
    load()
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [showAddModal])

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
    }

    setAddingStaff(false)
  }

  const setField = (k: string, v: string) =>
    setStaffForm(f => ({ ...f, [k]: v }))

  const filtered =
    filter === 'all' ? users : users.filter(u => u.role === filter)

  const roleFilters = [
    { value: 'all', label: 'All' },
    { value: 'attendee', label: 'Attendees' },
    { value: 'staff', label: 'Staff' },
    { value: 'supervisor', label: 'Supervisors' },
    { value: 'admin', label: 'Admins' },
  ]

  const modal = showAddModal ? createPortal(
    <div
      className="fade-in"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 5, 10, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
      // Close on backdrop click
      onMouseDown={e => {
        if (e.target === e.currentTarget) {
          setShowAddModal(false)
          setStaffForm(emptyStaffForm())
        }
      }}
    >
      <div
        className="fade-up"
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'var(--bg-2)',
          border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: 24,
          boxSizing: 'border-box',
        }}
      >
        <form
          onSubmit={handleAddStaff}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
          }}
        >
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 6px 0', color: 'var(--text)' }}>
              Add Staff Member
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.4 }}>
              Create a new staff account. The user can log in immediately.
            </p>
          </div>

          {/* NAME ROW */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              width: '100%',
            }}
          >
            <Input
              label="First name"
              value={staffForm.firstname}
              onChange={e => setField('firstname', e.target.value)}
              required
            />
            <Input
              label="Last name"
              value={staffForm.lastname}
              onChange={e => setField('lastname', e.target.value)}
              required
            />
          </div>

          {/* EMAIL */}
          <Input
            label="Email"
            type="email"
            value={staffForm.email}
            onChange={e => setField('email', e.target.value)}
            required
          />

          {/* PHONE NUMBER */}
          <Input
            label="Phone Number"
            type="phone_number"
            value={staffForm.phone_number}
            onChange={e => setField('phone_number', e.target.value)}
            required
          />

          {/* PASSWORD */}
          <Input
            label="Password"
            type="password"
            value={staffForm.password}
            onChange={e => setField('password', e.target.value)}
            required
          />

          {/* ROLE */}
          <Select
            label="Role"
            value={staffForm.role}
            onChange={e => setField('role', e.target.value)}
            options={[
              { value: 'staff', label: 'Staff' },
              ...(me?.role === 'admin'
                ? [{ value: 'supervisor', label: 'Supervisor' }]
                : []),
            ]}
          />

          {/* FOOTER ACTIONS */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 12,
              marginTop: 8,
            }}
          >
            <Btn
              variant="ghost"
              type="button"
              onClick={() => {
                setShowAddModal(false)
                setStaffForm(emptyStaffForm())
              }}
            >
              Cancel
            </Btn>

            <Btn type="submit" loading={addingStaff}>
              Create account
            </Btn>
          </div>
        </form>
      </div>
    </div>,
    document.body  // ← renders OUTSIDE <Page>, bypasses any overflow/clip
  ) : null

  return (
    <Page>
      <SectionHeader
        title="Users"
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>
              {users.length} total
            </span>

            {canManage && (
              <Btn
                onClick={() => setShowAddModal(true)}
                style={{ fontSize: 13, padding: '7px 16px' }}
              >
                + Add staff
              </Btn>
            )}
          </div>
        }
      />

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {roleFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius)',
              border: '1px solid',
              borderColor: filter === f.value ? 'var(--border-3)' : 'transparent',
              background: filter === f.value ? 'var(--bg-3)' : 'transparent',
              color: filter === f.value ? 'var(--text)' : 'var(--text-3)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 24, fontSize: 13, color: 'var(--text-3)' }}>
            Loading...
          </div>
        ) : (
          <Table
            headers={[
              '#',
              'Name',
              'Email',
              'Phone Number',
              'Role',
              'Action'
            ]}
            rows={filtered.map(u => [
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>
                {u.id}
              </span>,
              <span style={{ fontWeight: 600 }}>
                {u.firstname} {u.lastname}
              </span>,
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>
                {u.email}
              </span>,
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>
                {u.phone_number}
              </span>,
              <Badge label={u.role} />,
              ...(me?.role === 'admin'
                ? [
                    u.role !== 'admin' ? (
                      <Btn
                        variant="danger"
                        onClick={() => handleDelete(u.id, u.role)}
                        style={{ padding: '4px 12px', fontSize: 12 }}
                      >
                        Delete
                      </Btn>
                    ) : (
                      <span style={{ color: 'var(--text-3)' }}>—</span>
                    ),
                  ]
                : []),
            ])}
          />
        )}
      </Card>

      {modal}
    </Page>
  )
}