import { useState } from 'react'
import { useAuth } from './AuthContext'
import api from './api'

function Section({ title, icon, children }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`section ${open ? 'open' : ''}`}>
      <button className="section-header" onClick={() => setOpen(o => !o)}>
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
        <span className="section-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  )
}

function ResultBox({ result }) {
  if (!result) return null
  const isError = result.error
  return (
    <div className={`result-box ${isError ? 'result-error' : 'result-success'}`}>
      <div className="result-label">{isError ? '✗ Error' : '✓ Response'}</div>
      <pre>{JSON.stringify(result.data, null, 2)}</pre>
    </div>
  )
}

function useForm(initial) {
  const [values, setValues] = useState(initial)
  const set = (k) => (e) => setValues(v => ({ ...v, [k]: e.target.value }))
  return [values, set, setValues]
}

async function call(fn, setResult) {
  try {
    const res = await fn()
    setResult({ data: res.data })
  } catch (err) {
    setResult({ error: true, data: err.response?.data || { detail: err.message } })
  }
}

// ── USERS ──────────────────────────────────────────────────────────────────

function GetAllUsers() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/all-users</div>
      <button className="btn-run" onClick={() => call(() => api.get('/all-users'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function GetUser() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/user/{'{id}'}</div>
      <div className="inline-fields">
        <input placeholder="User ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run" onClick={() => call(() => api.get(`/user/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

function RegisterUser() {
  const [v, s] = useForm({ title: '', firstname: '', lastname: '', email: '', password: '', role: 'attendee' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span>/register</div>
      <div className="fields-grid">
        <input placeholder="Title (Mr/Dr...)" value={v.title} onChange={s('title')} />
        <input placeholder="First name" value={v.firstname} onChange={s('firstname')} />
        <input placeholder="Last name" value={v.lastname} onChange={s('lastname')} />
        <input placeholder="Email" type="email" value={v.email} onChange={s('email')} />
        <input placeholder="Password" type="password" value={v.password} onChange={s('password')} />
        <select value={v.role} onChange={s('role')}>
          <option value="attendee">attendee</option>
          <option value="staff">staff</option>
          <option value="supervisor">supervisor</option>
        </select>
      </div>
      <button className="btn-run" onClick={() => call(() => api.post('/register', v), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function UpdateUser() {
  const [id, setId] = useState('')
  const [v, s] = useForm({ title: '', firstname: '', lastname: '', email: '', password: '', role: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge put">PUT</span>/user/{'{id}'}</div>
      <input placeholder="User ID" value={id} onChange={e => setId(e.target.value)} style={{ marginBottom: '8px', width: '100%' }} />
      <div className="fields-grid">
        <input placeholder="Title" value={v.title} onChange={s('title')} />
        <input placeholder="First name" value={v.firstname} onChange={s('firstname')} />
        <input placeholder="Last name" value={v.lastname} onChange={s('lastname')} />
        <input placeholder="Email" type="email" value={v.email} onChange={s('email')} />
        <input placeholder="Password" type="password" value={v.password} onChange={s('password')} />
        <input placeholder="Role" value={v.role} onChange={s('role')} />
      </div>
      <button className="btn-run" onClick={() => call(() => api.put(`/user/${id}`, v), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function DeleteUser() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge delete">DELETE</span>/user/{'{id}'}</div>
      <div className="inline-fields">
        <input placeholder="User ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run btn-danger" onClick={() => call(() => api.delete(`/user/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

// ── EVENTS ─────────────────────────────────────────────────────────────────

function GetAllEvents() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/all-events</div>
      <button className="btn-run" onClick={() => call(() => api.get('/all-events'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function GetEvent() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/event/{'{id}'}</div>
      <div className="inline-fields">
        <input placeholder="Event ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run" onClick={() => call(() => api.get(`/event/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

function AddEvent() {
  const [v, s] = useForm({ date: '', start_time: '', end_time: '', topic: '', speaker: '', location: '', building: '', room: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span>/add-event</div>
      <div className="fields-grid">
        <input placeholder="Date (YYYY-MM-DD)" value={v.date} onChange={s('date')} />
        <input placeholder="Start time" value={v.start_time} onChange={s('start_time')} />
        <input placeholder="End time" value={v.end_time} onChange={s('end_time')} />
        <input placeholder="Topic" value={v.topic} onChange={s('topic')} />
        <input placeholder="Speaker (User ID)" type="number" value={v.speaker} onChange={s('speaker')} />
        <input placeholder="Location" value={v.location} onChange={s('location')} />
        <input placeholder="Building" value={v.building} onChange={s('building')} />
        <input placeholder="Room" value={v.room} onChange={s('room')} />
      </div>
      <button className="btn-run" onClick={() => call(() => api.post('/add-event', { ...v, speaker: Number(v.speaker) }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function UpdateEvent() {
  const [id, setId] = useState('')
  const [v, s] = useForm({ date: '', start_time: '', end_time: '', topic: '', speaker: '', location: '', building: '', room: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge put">PUT</span>/event/{'{id}'}</div>
      <input placeholder="Event ID" value={id} onChange={e => setId(e.target.value)} style={{ marginBottom: '8px', width: '100%' }} />
      <div className="fields-grid">
        <input placeholder="Date (YYYY-MM-DD)" value={v.date} onChange={s('date')} />
        <input placeholder="Start time" value={v.start_time} onChange={s('start_time')} />
        <input placeholder="End time" value={v.end_time} onChange={s('end_time')} />
        <input placeholder="Topic" value={v.topic} onChange={s('topic')} />
        <input placeholder="Speaker (User ID)" type="number" value={v.speaker} onChange={s('speaker')} />
        <input placeholder="Location" value={v.location} onChange={s('location')} />
        <input placeholder="Building" value={v.building} onChange={s('building')} />
        <input placeholder="Room" value={v.room} onChange={s('room')} />
      </div>
      <button className="btn-run" onClick={() => call(() => api.put(`/event/${id}`, { ...v, speaker: Number(v.speaker) }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function DeleteEvent() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge delete">DELETE</span>/event/{'{id}'}</div>
      <div className="inline-fields">
        <input placeholder="Event ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run btn-danger" onClick={() => call(() => api.delete(`/event/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

// ── TICKETS ────────────────────────────────────────────────────────────────

function PurchaseTicket() {
  const [v, s] = useForm({ user_id: '', day: '', email: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span>/purchase_ticket</div>
      <div className="fields-grid">
        <input placeholder="User ID" type="number" value={v.user_id} onChange={s('user_id')} />
        <input placeholder="Day length" type="number" value={v.day} onChange={s('day')} />
        <input placeholder="Send ticket to email" type="email" value={v.email} onChange={s('email')} />
      </div>
      <button className="btn-run" onClick={() => call(() => api.post('/purchase_ticket', { ...v, user_id: Number(v.user_id), day: Number(v.day) }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function ValidateTicket() {
  const [uuid, setUuid] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/validate/{'{uuid}'}</div>
      <div className="inline-fields">
        <input placeholder="Ticket UUID" value={uuid} onChange={e => setUuid(e.target.value)} />
        <button className="btn-run" onClick={() => call(() => api.get(`/validate/${uuid}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

// ── POSTS ──────────────────────────────────────────────────────────────────

function GetAllPosts() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/all-posts</div>
      <button className="btn-run" onClick={() => call(() => api.get('/all-posts'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function CreatePost() {
  const [v, s] = useForm({ user_id: '', time: '', header: '', body: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span>/create-post</div>
      <div className="fields-grid">
        <input placeholder="User ID" type="number" value={v.user_id} onChange={s('user_id')} />
        <input placeholder="Time" value={v.time} onChange={s('time')} />
        <input placeholder="Header" value={v.header} onChange={s('header')} style={{ gridColumn: 'span 2' }} />
        <textarea placeholder="Body" value={v.body} onChange={s('body')} style={{ gridColumn: 'span 2', resize: 'vertical', minHeight: '80px' }} />
      </div>
      <button className="btn-run" onClick={() => call(() => api.post('/create-post', { ...v, user_id: Number(v.user_id) }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function UpdatePost() {
  const [id, setId] = useState('')
  const [v, s] = useForm({ user_id: '', time: '', header: '', body: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge put">PUT</span>/update-post/{'{id}'}</div>
      <input placeholder="Post ID" value={id} onChange={e => setId(e.target.value)} style={{ marginBottom: '8px', width: '100%' }} />
      <div className="fields-grid">
        <input placeholder="User ID" type="number" value={v.user_id} onChange={s('user_id')} />
        <input placeholder="Time" value={v.time} onChange={s('time')} />
        <input placeholder="Header" value={v.header} onChange={s('header')} style={{ gridColumn: 'span 2' }} />
        <textarea placeholder="Body" value={v.body} onChange={s('body')} style={{ gridColumn: 'span 2', resize: 'vertical', minHeight: '80px' }} />
      </div>
      <button className="btn-run" onClick={() => call(() => api.put(`/update-post/${id}`, { ...v, user_id: Number(v.user_id) }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function CancelPost() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge delete">DELETE</span>/cancel-post/{'{id}'}</div>
      <div className="inline-fields">
        <input placeholder="Post ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run btn-danger" onClick={() => call(() => api.delete(`/cancel-post/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

// ── QUESTIONS ──────────────────────────────────────────────────────────────

function GetAllQuestions() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/all-questions</div>
      <button className="btn-run" onClick={() => call(() => api.get('/all-questions'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function GetSpeakerQuestions() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/question/{'{speaker_id}'}</div>
      <div className="inline-fields">
        <input placeholder="Speaker ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run" onClick={() => call(() => api.get(`/question/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

function AddQuestion() {
  const [v, s] = useForm({ user_id: '', speaker_id: '', question: '', time: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span>/add-question</div>
      <div className="fields-grid">
        <input placeholder="User ID" type="number" value={v.user_id} onChange={s('user_id')} />
        <input placeholder="Speaker ID" type="number" value={v.speaker_id} onChange={s('speaker_id')} />
        <input placeholder="Time" value={v.time} onChange={s('time')} />
        <input placeholder="Question" value={v.question} onChange={s('question')} style={{ gridColumn: 'span 2' }} />
      </div>
      <button className="btn-run" onClick={() => call(() => api.post('/add-question', { ...v, user_id: Number(v.user_id), speaker_id: Number(v.speaker_id) }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

// ── MAIL LIST ──────────────────────────────────────────────────────────────

function GetMailList() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span>/test-all-emails</div>
      <button className="btn-run" onClick={() => call(() => api.get('/test-all-emails'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-brand">
          <span className="dash-logo">⚛</span>
          <div>
            <h1>CERN Mongolia 2026</h1>
            <span className="dash-sub">Admin Dashboard</span>
          </div>
        </div>
        <div className="dash-user">
          <div className="user-chip">
            <span className="user-name">{user.title}. {user.firstname} {user.lastname}</span>
            <span className={`role-badge role-${user.role}`}>{user.role}</span>
          </div>
          <button className="btn-logout" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className="dash-main">
        <Section title="Users" icon="👤">
          <GetAllUsers />
          <GetUser />
          <RegisterUser />
          <UpdateUser />
          <DeleteUser />
        </Section>

        <Section title="Events" icon="📅">
          <GetAllEvents />
          <GetEvent />
          <AddEvent />
          <UpdateEvent />
          <DeleteEvent />
        </Section>

        <Section title="Tickets" icon="🎫">
          <PurchaseTicket />
          <ValidateTicket />
        </Section>

        <Section title="Posts" icon="📢">
          <GetAllPosts />
          <CreatePost />
          <UpdatePost />
          <CancelPost />
        </Section>

        <Section title="Questions" icon="❓">
          <GetAllQuestions />
          <GetSpeakerQuestions />
          <AddQuestion />
        </Section>

        <Section title="Mail List" icon="✉️">
          <GetMailList />
        </Section>
      </main>
    </div>
  )
}
