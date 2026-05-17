import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/client'
import { Input, Btn, toast } from '../components/UI'
import ColliderBackground from '../components/ColliderBackground'
import LeftPanel from '../components/LeftPanel'

export default function Register() {
  const navigate    = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [form, setForm] = useState({
    firstname: '', lastname: '', email: '', password: '', phone_number: '', role: 'attendee',
  })
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register({ ...form, role: 'attendee' })
      toast('Account created — please sign in')
      navigate('/login')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#060911', position: 'relative', overflow: 'hidden',
    }}>
      <ColliderBackground />

      <div style={{
        position: 'absolute', left: '60%', top: 0, bottom: 0, width: 1, zIndex: 5,
        background: 'linear-gradient(180deg,transparent 0%,rgba(56,189,248,.22) 30%,rgba(56,189,248,.32) 50%,rgba(56,189,248,.22) 70%,transparent 100%)',
      }} />

      <LeftPanel />

      {/* Right — form */}
      <div style={{
        width: '40%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 52px', position: 'relative', zIndex: 10,
      }}>
        <div style={{
          width: '100%', maxWidth: 420,
          background: 'rgba(6,10,22,.78)',
          border: '1px solid rgba(56,189,248,.16)',
          borderRadius: 16, padding: '40px 36px 36px',
          backdropFilter: 'blur(18px)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#ffffff', letterSpacing: '.12em', marginBottom: 8 }}>
            PARTICIPANT ACCESS
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>Create account</h1>
          <p style={{ fontSize: 16, color: '#ffffff', marginBottom: 28 }}>
            Join the high energy physics conference
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Input label="First name" value={form.firstname}
                onChange={e => set('firstname', e.target.value)} required />
              <Input label="Last name" value={form.lastname}
                onChange={e => set('lastname', e.target.value)} required />
            </div>
            <Input label="Email" type="email" value={form.email}
              onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            <Input label="Phone Number" type="phone_number" value={form.phone_number}
              onChange={e => set('email', e.target.value)} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password}
              onChange={e => set('password', e.target.value)} placeholder="••••••••" required />

            {error && (
              <div style={{ fontSize: 16, color: 'var(--red)', fontFamily: 'var(--font-mono)' }}>
                ✗ {error}
              </div>
            )}

            <Btn type="submit" loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>
              Create account →
            </Btn>
          </form>

          <div style={{
            marginTop: 16, padding: '10px 14px',
            background: 'rgba(56,189,248,.05)',
            border: '1px solid rgba(56,189,248,.12)',
            borderRadius: 8,
          }}>
            <p style={{ fontSize: 16, color: '#ffffff', margin: 0 }}>
              New accounts are registered as <strong style={{ color: '#ffffff' }}>attendees</strong>.
              Staff accounts are created by administrators.
            </p>
          </div>

          <p style={{ marginTop: 20, fontSize: 16, color: '#ffffff', textAlign: 'center' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: '#ffffff', textDecoration: 'underline' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}