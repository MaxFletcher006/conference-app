import { useState, useEffect, useRef } from 'react'
import { useAuth } from './AuthContext'
import api from './api'

// ── STYLES ──────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0c10;
    --surface: #111318;
    --surface2: #181b22;
    --surface3: #1e222c;
    --border: #252932;
    --border2: #2e3440;
    --text: #e2e8f0;
    --muted: #64748b;
    --accent: #38bdf8;
    --accent2: #0ea5e9;
    --green: #22c55e;
    --red: #ef4444;
    --yellow: #f59e0b;
    --purple: #a78bfa;
    --font: 'IBM Plex Sans', sans-serif;
    --mono: 'IBM Plex Mono', monospace;
    --radius: 8px;
    --radius-lg: 12px;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font); }

  .dashboard { min-height: 100vh; display: flex; flex-direction: column; }

  /* HEADER */
  .dash-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 28px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    position: sticky; top: 0; z-index: 100;
  }
  .dash-brand { display: flex; align-items: center; gap: 12px; }
  .dash-logo { font-size: 22px; }
  .dash-brand h1 { font-size: 15px; font-weight: 600; letter-spacing: 0.02em; color: var(--text); }
  .dash-sub { font-size: 11px; color: var(--muted); font-family: var(--mono); letter-spacing: 0.05em; }
  .dash-user { display: flex; align-items: center; gap: 12px; }
  .user-chip {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 99px;
  }
  .user-name { font-size: 13px; font-weight: 500; }
  .role-badge {
    font-size: 10px; font-family: var(--mono); font-weight: 500;
    padding: 2px 7px; border-radius: 99px; letter-spacing: 0.05em; text-transform: uppercase;
  }
  .role-admin    { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }
  .role-staff    { background: rgba(56,189,248,0.12); color: #7dd3fc; border: 1px solid rgba(56,189,248,0.2); }
  .role-attendee { background: rgba(34,197,94,0.12); color: #86efac; border: 1px solid rgba(34,197,94,0.2); }
  .role-supervisor { background: rgba(167,139,250,0.12); color: #c4b5fd; border: 1px solid rgba(167,139,250,0.2); }

  /* MAIN */
  .dash-main { padding: 28px; max-width: 860px; margin: 0 auto; width: 100%; display: flex; flex-direction: column; gap: 12px; }

  .btn-logout {
    font-size: 12px; font-family: var(--mono); padding: 6px 14px;
    background: transparent; border: 1px solid var(--border2);
    color: var(--muted); border-radius: var(--radius); cursor: pointer;
    transition: all 0.15s;
  }
  .btn-logout:hover { border-color: var(--red); color: var(--red); }

  /* SECTION */
  .section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color 0.15s;
  }
  .section.open { border-color: var(--border2); }
  .section-header {
    width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 14px 18px; background: transparent; border: none; cursor: pointer;
    color: var(--text); text-align: left; transition: background 0.1s;
  }
  .section-header:hover { background: var(--surface2); }
  .section-icon { font-size: 15px; }
  .section-title { flex: 1; font-size: 13px; font-weight: 600; letter-spacing: 0.02em; }
  .section-count {
    font-size: 10px; font-family: var(--mono); padding: 2px 8px;
    background: var(--surface3); border: 1px solid var(--border2);
    color: var(--muted); border-radius: 99px;
  }
  .section-chevron { font-size: 10px; color: var(--muted); margin-left: 4px; transition: transform 0.2s; }
  .section.open .section-chevron { transform: rotate(180deg); }
  .section-body {
    border-top: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 1px;
    background: var(--border);
  }

  /* ENDPOINT */
  .endpoint {
    background: var(--surface);
    padding: 16px 18px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .endpoint-meta { display: flex; align-items: center; gap: 8px; }
  .endpoint-label { font-size: 12px; font-family: var(--mono); color: var(--muted); }

  .badge {
    font-size: 9px; font-family: var(--mono); font-weight: 600;
    padding: 3px 7px; border-radius: 4px; letter-spacing: 0.08em;
  }
  .get    { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.2); }
  .post   { background: rgba(56,189,248,0.15); color: #7dd3fc; border: 1px solid rgba(56,189,248,0.2); }
  .put    { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.2); }
  .delete { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }

  /* INPUTS */
  input, select, textarea {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--font);
    font-size: 13px;
    padding: 8px 11px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
  }
  input::placeholder, textarea::placeholder { color: var(--muted); }
  select option { background: var(--surface2); }

  .fields-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .full { grid-column: span 2; }

  .inline-fields { display: flex; gap: 8px; align-items: center; }
  .inline-fields input { flex: 1; }

  /* USER SELECT DROPDOWN */
  .user-select-wrapper { position: relative; }
  .user-select-trigger {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 11px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 0.15s;
    min-height: 38px;
  }
  .user-select-trigger:hover, .user-select-trigger.open { border-color: var(--accent); }
  .user-select-trigger.open { box-shadow: 0 0 0 3px rgba(56,189,248,0.1); }
  .user-avatar {
    width: 22px; height: 22px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent2), var(--purple));
    display: flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 700; color: white; flex-shrink: 0;
    font-family: var(--mono);
  }
  .user-select-name { flex: 1; font-size: 13px; color: var(--text); }
  .user-select-placeholder { flex: 1; font-size: 13px; color: var(--muted); }
  .user-select-arrow { font-size: 9px; color: var(--muted); }

  .user-dropdown {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 50;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow);
    overflow: hidden;
    max-height: 260px;
    display: flex; flex-direction: column;
  }
  .user-dropdown-search {
    padding: 8px;
    border-bottom: 1px solid var(--border);
  }
  .user-dropdown-search input {
    background: var(--surface3);
    border-color: var(--border2);
    font-size: 12px;
  }
  .user-dropdown-list { overflow-y: auto; flex: 1; }
  .user-dropdown-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; cursor: pointer;
    transition: background 0.1s;
    border-bottom: 1px solid var(--border);
  }
  .user-dropdown-item:last-child { border-bottom: none; }
  .user-dropdown-item:hover { background: var(--surface3); }
  .user-dropdown-item.selected { background: rgba(56,189,248,0.08); }
  .user-dropdown-info { flex: 1; min-width: 0; }
  .user-dropdown-name { font-size: 13px; font-weight: 500; }
  .user-dropdown-email { font-size: 11px; color: var(--muted); font-family: var(--mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .user-dropdown-id {
    font-size: 10px; font-family: var(--mono);
    color: var(--muted); background: var(--surface3);
    border: 1px solid var(--border); border-radius: 4px;
    padding: 1px 5px;
  }
  .user-dropdown-empty { padding: 20px; text-align: center; color: var(--muted); font-size: 12px; }
  .user-dropdown-loading { padding: 20px; text-align: center; color: var(--muted); font-size: 12px; font-family: var(--mono); }

  /* BUTTONS */
  .btn-run {
    font-size: 12px; font-family: var(--mono); font-weight: 500;
    padding: 8px 16px;
    background: rgba(56,189,248,0.12);
    border: 1px solid rgba(56,189,248,0.25);
    color: var(--accent); border-radius: var(--radius);
    cursor: pointer; transition: all 0.15s; align-self: flex-start;
  }
  .btn-run:hover { background: rgba(56,189,248,0.2); border-color: rgba(56,189,248,0.5); }
  .btn-run:active { transform: scale(0.97); }
  .btn-danger {
    background: rgba(239,68,68,0.1) !important;
    border-color: rgba(239,68,68,0.25) !important;
    color: #f87171 !important;
  }
  .btn-danger:hover { background: rgba(239,68,68,0.2) !important; border-color: rgba(239,68,68,0.5) !important; }

  /* RESULT BOX */
  .result-box {
    border-radius: var(--radius);
    border: 1px solid;
    overflow: hidden;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
  .result-success { border-color: rgba(34,197,94,0.2); background: rgba(34,197,94,0.05); }
  .result-error   { border-color: rgba(239,68,68,0.2); background: rgba(239,68,68,0.05); }
  .result-label {
    font-size: 10px; font-family: var(--mono); font-weight: 600;
    padding: 5px 10px; letter-spacing: 0.08em;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .result-success .result-label { color: #86efac; }
  .result-error   .result-label { color: #f87171; }
  .result-box pre {
    font-family: var(--mono); font-size: 11px;
    padding: 10px; overflow-x: auto; line-height: 1.6;
    color: var(--text); max-height: 220px; overflow-y: auto;
  }

  /* CONTEXT CHIP */
  .context-chip {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-family: var(--mono);
    color: var(--muted);
    padding: 3px 8px;
    background: var(--surface3);
    border: 1px solid var(--border2);
    border-radius: 99px;
  }
  .context-chip span { color: var(--accent); }

  .field-label { font-size: 11px; color: var(--muted); font-family: var(--mono); margin-bottom: 3px; }
  .field-group { display: flex; flex-direction: column; gap: 3px; }
`

// ── HELPERS ──────────────────────────────────────────────────────────────────

function StyleInjector() {
  useEffect(() => {
    const el = document.createElement('style')
    el.textContent = css
    document.head.appendChild(el)
    return () => document.head.removeChild(el)
  }, [])
  return null
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

function initials(u) {
  return ((u.firstname?.[0] || '') + (u.lastname?.[0] || '')).toUpperCase() || '#'
}

// ── USER SELECT DROPDOWN ──────────────────────────────────────────────────────

function UserSelect({ users, loading, value, onChange, placeholder = 'Select a user…' }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const selected = users.find(u => String(u.id) === String(value))

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      u.firstname?.toLowerCase().includes(q) ||
      u.lastname?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      String(u.id).includes(q)
    )
  })

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="user-select-wrapper" ref={ref}>
      <div
        className={`user-select-trigger ${open ? 'open' : ''}`}
        onClick={() => { setOpen(o => !o); setSearch('') }}
      >
        {selected ? (
          <>
            <div className="user-avatar">{initials(selected)}</div>
            <span className="user-select-name">
              {selected.title}. {selected.firstname} {selected.lastname}
              <span style={{ color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '11px', marginLeft: 6 }}>
                #{selected.id}
              </span>
            </span>
          </>
        ) : (
          <span className="user-select-placeholder">{placeholder}</span>
        )}
        <span className="user-select-arrow">▼</span>
      </div>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-search">
            <input
              autoFocus
              placeholder="Search by name, email, or ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="user-dropdown-list">
            {loading ? (
              <div className="user-dropdown-loading">loading users…</div>
            ) : filtered.length === 0 ? (
              <div className="user-dropdown-empty">No users found</div>
            ) : filtered.map(u => (
              <div
                key={u.id}
                className={`user-dropdown-item ${String(u.id) === String(value) ? 'selected' : ''}`}
                onClick={() => { onChange(u); setOpen(false) }}
              >
                <div className="user-avatar">{initials(u)}</div>
                <div className="user-dropdown-info">
                  <div className="user-dropdown-name">{u.title}. {u.firstname} {u.lastname}</div>
                  <div className="user-dropdown-email">{u.email}</div>
                </div>
                <span className="user-dropdown-id">#{u.id}</span>
                <span className={`role-badge role-${u.role}`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── SHARED USERS HOOK ─────────────────────────────────────────────────────────

function useUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const fetched = useRef(false)

  async function fetchUsers() {
    if (fetched.current) return
    setLoading(true)
    try {
      const res = await api.get('/all-users')
      setUsers(res.data)
      fetched.current = true
    } catch {}
    setLoading(false)
  }

  return { users, loading, fetchUsers, setUsers }
}

// ── SECTION ───────────────────────────────────────────────────────────────────

function Section({ title, icon, children, count }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`section ${open ? 'open' : ''}`}>
      <button className="section-header" onClick={() => setOpen(o => !o)}>
        <span className="section-icon">{icon}</span>
        <span className="section-title">{title}</span>
        {count != null && <span className="section-count">{count} endpoints</span>}
        <span className="section-chevron">▼</span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  )
}

// ── USERS ──────────────────────────────────────────────────────────────────────

function GetAllUsers() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta">
        <span className="badge get">GET</span>
        <span className="endpoint-label">/all-users</span>
      </div>
      <button className="btn-run" onClick={() => call(() => api.get('/all-users'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function GetUser({ users, loading }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta">
        <span className="badge get">GET</span>
        <span className="endpoint-label">/user/{'{id}'}</span>
      </div>
      <div className="field-group">
        <div className="field-label">user</div>
        <UserSelect users={users} loading={loading} value={selected?.id} onChange={setSelected} />
      </div>
      <button className="btn-run" disabled={!selected} onClick={() => call(() => api.get(`/user/${selected.id}`), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function RegisterUser() {
  const [v, s] = useForm({ title: 'Mr', firstname: '', lastname: '', email: '', password: '', role: 'attendee' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta">
        <span className="badge post">POST</span>
        <span className="endpoint-label">/register</span>
      </div>
      <div className="fields-grid">
        <div className="field-group">
          <div className="field-label">title</div>
          <select value={v.title} onChange={s('title')}>
            {['Mr','Ms','Mrs','Dr','Prof','Eng'].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field-group">
          <div className="field-label">role</div>
          <select value={v.role} onChange={s('role')}>
            {['attendee','staff','supervisor','admin'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div className="field-group">
          <div className="field-label">first name</div>
          <input placeholder="First name" value={v.firstname} onChange={s('firstname')} />
        </div>
        <div className="field-group">
          <div className="field-label">last name</div>
          <input placeholder="Last name" value={v.lastname} onChange={s('lastname')} />
        </div>
        <div className="field-group full">
          <div className="field-label">email</div>
          <input placeholder="Email" type="email" value={v.email} onChange={s('email')} />
        </div>
        <div className="field-group full">
          <div className="field-label">password</div>
          <input placeholder="Password" type="password" value={v.password} onChange={s('password')} />
        </div>
      </div>
      <button className="btn-run" onClick={() => call(() => api.post('/register', v), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function UpdateUser({ users, loading }) {
  const [selected, setSelected] = useState(null)
  const [v, s] = useForm({ title: '', firstname: '', lastname: '', email: '', password: '', role: '' })
  const [result, setResult] = useState(null)

  function handleSelect(u) {
    setSelected(u)
    // pre-fill fields with existing user data
    s('title')({ target: { value: u.title || '' } })
    s('firstname')({ target: { value: u.firstname || '' } })
    s('lastname')({ target: { value: u.lastname || '' } })
    s('email')({ target: { value: u.email || '' } })
    s('role')({ target: { value: u.role || '' } })
    s('password')({ target: { value: '' } })
  }

  return (
    <div className="endpoint">
      <div className="endpoint-meta">
        <span className="badge put">PUT</span>
        <span className="endpoint-label">/user/{'{id}'}</span>
      </div>
      <div className="field-group">
        <div className="field-label">user</div>
        <UserSelect users={users} loading={loading} value={selected?.id} onChange={handleSelect} />
      </div>
      {selected && (
        <div className="fields-grid">
          <div className="field-group">
            <div className="field-label">title</div>
            <select value={v.title} onChange={s('title')}>
              {['Mr','Ms','Mrs','Dr','Prof','Eng'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field-group">
            <div className="field-label">role</div>
            <select value={v.role} onChange={s('role')}>
              {['attendee','staff','supervisor','admin'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="field-group">
            <div className="field-label">first name</div>
            <input value={v.firstname} onChange={s('firstname')} />
          </div>
          <div className="field-group">
            <div className="field-label">last name</div>
            <input value={v.lastname} onChange={s('lastname')} />
          </div>
          <div className="field-group full">
            <div className="field-label">email</div>
            <input type="email" value={v.email} onChange={s('email')} />
          </div>
          <div className="field-group full">
            <div className="field-label">password (leave blank to keep)</div>
            <input placeholder="New password" type="password" value={v.password} onChange={s('password')} />
          </div>
        </div>
      )}
      <button className="btn-run" disabled={!selected} onClick={() => call(() => api.put(`/user/${selected.id}`, v), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function DeleteUser({ users, loading }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta">
        <span className="badge delete">DELETE</span>
        <span className="endpoint-label">/user/{'{id}'}</span>
      </div>
      <div className="field-group">
        <div className="field-label">user</div>
        <UserSelect users={users} loading={loading} value={selected?.id} onChange={setSelected} />
      </div>
      <button className="btn-run btn-danger" disabled={!selected} onClick={() => call(() => api.delete(`/user/${selected.id}`), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

// ── EVENTS ──────────────────────────────────────────────────────────────────

function GetAllEvents() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span><span className="endpoint-label">/all-events</span></div>
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
      <div className="endpoint-meta"><span className="badge get">GET</span><span className="endpoint-label">/event/{'{id}'}</span></div>
      <div className="inline-fields">
        <input placeholder="Event ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run" onClick={() => call(() => api.get(`/event/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

function EventFields({ v, s }) {
  return (
    <div className="fields-grid">
      <div className="field-group">
        <div className="field-label">date</div>
        <input placeholder="YYYY-MM-DD" value={v.date} onChange={s('date')} />
      </div>
      <div className="field-group">
        <div className="field-label">start time</div>
        <input placeholder="09:00" value={v.start_time} onChange={s('start_time')} />
      </div>
      <div className="field-group">
        <div className="field-label">end time</div>
        <input placeholder="17:00" value={v.end_time} onChange={s('end_time')} />
      </div>
      <div className="field-group full">
        <div className="field-label">topic</div>
        <input placeholder="Talk title" value={v.topic} onChange={s('topic')} />
      </div>
      <div className="field-group full">
        <div className="field-label">agenda</div>
        <input placeholder="Agenda" value={v.agenda} onChange={s('agenda')} />
      </div>
      <div className="field-group">
        <div className="field-label">location</div>
        <input placeholder="Location" value={v.location} onChange={s('location')} />
      </div>
      <div className="field-group">
        <div className="field-label">building</div>
        <input placeholder="Building" value={v.building} onChange={s('building')} />
      </div>
      <div className="field-group full">
        <div className="field-label">room</div>
        <input placeholder="Room" value={v.room} onChange={s('room')} />
      </div>
    </div>
  )
}

function AddEvent({ users, loading }) {
  const { user } = useAuth()
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [v, s] = useForm({ date: '', start_time: '', end_time: '', topic: '', agenda: '', location: '', building: '', room: '' })
  const [result, setResult] = useState(null)

  const speakerId = selectedSpeaker?.id ?? user.id
  const speakerLabel = selectedSpeaker
    ? `${selectedSpeaker.title}. ${selectedSpeaker.firstname} ${selectedSpeaker.lastname}`
    : `${user.title}. ${user.firstname} ${user.lastname} (you)`

  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span><span className="endpoint-label">/add-event</span></div>
      <div className="field-group">
        <div className="field-label">speaker (defaults to you)</div>
        <UserSelect users={users} loading={loading} value={speakerId} onChange={setSelectedSpeaker} placeholder={speakerLabel} />
      </div>
      <EventFields v={v} s={s} />
      <button className="btn-run" onClick={() => call(() => api.post('/add-event', { ...v, speaker: speakerId }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function UpdateEvent({ users, loading }) {
  const { user } = useAuth()
  const [id, setId] = useState('')
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [v, s] = useForm({ date: '', start_time: '', end_time: '', topic: '', agenda: '', location: '', building: '', room: '' })
  const [result, setResult] = useState(null)
  const speakerId = selectedSpeaker?.id ?? user.id
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge put">PUT</span><span className="endpoint-label">/event/{'{id}'}</span></div>
      <div className="field-group">
        <div className="field-label">event id</div>
        <input placeholder="Event ID" value={id} onChange={e => setId(e.target.value)} />
      </div>
      <div className="field-group">
        <div className="field-label">speaker</div>
        <UserSelect users={users} loading={loading} value={speakerId} onChange={setSelectedSpeaker} placeholder="Select speaker…" />
      </div>
      <EventFields v={v} s={s} />
      <button className="btn-run" disabled={!id} onClick={() => call(() => api.put(`/event/${id}`, { ...v, speaker: speakerId }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function DeleteEvent() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge delete">DELETE</span><span className="endpoint-label">/event/{'{id}'}</span></div>
      <div className="inline-fields">
        <input placeholder="Event ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run btn-danger" onClick={() => call(() => api.delete(`/event/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

// ── TICKETS ─────────────────────────────────────────────────────────────────

function PurchaseTicket({ users, loading }) {
  const [selected, setSelected] = useState(null)
  const [v, s] = useForm({ day: '', email: '' })
  const [result, setResult] = useState(null)

  function handleSelect(u) {
    setSelected(u)
    s('email')({ target: { value: u.email || '' } })
  }

  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span><span className="endpoint-label">/purchase_ticket</span></div>
      <div className="field-group">
        <div className="field-label">user</div>
        <UserSelect users={users} loading={loading} value={selected?.id} onChange={handleSelect} />
      </div>
      <div className="fields-grid">
        <div className="field-group">
          <div className="field-label">day length</div>
          <input placeholder="e.g. 3" type="number" value={v.day} onChange={s('day')} />
        </div>
        <div className="field-group">
          <div className="field-label">send ticket to email</div>
          <input placeholder="Email" type="email" value={v.email} onChange={s('email')} />
        </div>
      </div>
      <button className="btn-run" disabled={!selected} onClick={() => call(() => api.post('/purchase_ticket', { user_id: selected.id, day: Number(v.day), email: v.email }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

// ── POSTS ───────────────────────────────────────────────────────────────────

function GetAllPosts() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span><span className="endpoint-label">/all-posts</span></div>
      <button className="btn-run" onClick={() => call(() => api.get('/all-posts'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function CreatePost() {
  const { user } = useAuth()
  const [v, s] = useForm({ time: '', header: '', body: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span><span className="endpoint-label">/create-post</span></div>
      <div className="context-chip">user_id → <span>#{user.id} {user.firstname} {user.lastname}</span></div>
      <div className="fields-grid">
        <div className="field-group">
          <div className="field-label">time</div>
          <input placeholder="14:00" value={v.time} onChange={s('time')} />
        </div>
        <div className="field-group full">
          <div className="field-label">header</div>
          <input placeholder="Post title" value={v.header} onChange={s('header')} />
        </div>
        <div className="field-group full">
          <div className="field-label">body</div>
          <textarea placeholder="Post content…" value={v.body} onChange={s('body')} style={{ resize: 'vertical', minHeight: '80px' }} />
        </div>
      </div>
      <button className="btn-run" onClick={() => call(() => api.post('/create-post', { ...v, user_id: user.id }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function UpdatePost() {
  const { user } = useAuth()
  const [id, setId] = useState('')
  const [v, s] = useForm({ time: '', header: '', body: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge put">PUT</span><span className="endpoint-label">/update-post/{'{id}'}</span></div>
      <div className="context-chip">user_id → <span>#{user.id} {user.firstname} {user.lastname}</span></div>
      <div className="field-group">
        <div className="field-label">post id</div>
        <input placeholder="Post ID" value={id} onChange={e => setId(e.target.value)} />
      </div>
      <div className="fields-grid">
        <div className="field-group">
          <div className="field-label">time</div>
          <input placeholder="14:00" value={v.time} onChange={s('time')} />
        </div>
        <div className="field-group full">
          <div className="field-label">header</div>
          <input placeholder="Header" value={v.header} onChange={s('header')} />
        </div>
        <div className="field-group full">
          <div className="field-label">body</div>
          <textarea placeholder="Body" value={v.body} onChange={s('body')} style={{ resize: 'vertical', minHeight: '80px' }} />
        </div>
      </div>
      <button className="btn-run" disabled={!id} onClick={() => call(() => api.put(`/update-post/${id}`, { ...v, user_id: user.id }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function CancelPost() {
  const [id, setId] = useState('')
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge delete">DELETE</span><span className="endpoint-label">/cancel-post/{'{id}'}</span></div>
      <div className="inline-fields">
        <input placeholder="Post ID" value={id} onChange={e => setId(e.target.value)} />
        <button className="btn-run btn-danger" onClick={() => call(() => api.delete(`/cancel-post/${id}`), setResult)}>Run</button>
      </div>
      <ResultBox result={result} />
    </div>
  )
}

// ── QUESTIONS ────────────────────────────────────────────────────────────────

function GetAllQuestions() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span><span className="endpoint-label">/all-questions</span></div>
      <button className="btn-run" onClick={() => call(() => api.get('/all-questions'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function GetSpeakerQuestions({ users, loading }) {
  const [selected, setSelected] = useState(null)
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span><span className="endpoint-label">/question/{'{speaker_id}'}</span></div>
      <div className="field-group">
        <div className="field-label">speaker</div>
        <UserSelect users={users} loading={loading} value={selected?.id} onChange={setSelected} />
      </div>
      <button className="btn-run" disabled={!selected} onClick={() => call(() => api.get(`/question/${selected.id}`), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

function AddQuestion({ users, loading }) {
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedSpeaker, setSelectedSpeaker] = useState(null)
  const [v, s] = useForm({ question: '', time: '' })
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge post">POST</span><span className="endpoint-label">/add-question</span></div>
      <div className="fields-grid">
        <div className="field-group">
          <div className="field-label">from (user)</div>
          <UserSelect users={users} loading={loading} value={selectedUser?.id} onChange={setSelectedUser} placeholder="Select user…" />
        </div>
        <div className="field-group">
          <div className="field-label">to (speaker)</div>
          <UserSelect users={users} loading={loading} value={selectedSpeaker?.id} onChange={setSelectedSpeaker} placeholder="Select speaker…" />
        </div>
        <div className="field-group">
          <div className="field-label">time</div>
          <input placeholder="14:30" value={v.time} onChange={s('time')} />
        </div>
        <div className="field-group full">
          <div className="field-label">question</div>
          <input placeholder="Question text" value={v.question} onChange={s('question')} />
        </div>
      </div>
      <button className="btn-run" disabled={!selectedUser || !selectedSpeaker} onClick={() => call(() => api.post('/add-question', { ...v, user_id: selectedUser.id, speaker_id: selectedSpeaker.id }), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

// ── MAIL LIST ────────────────────────────────────────────────────────────────

function GetMailList() {
  const [result, setResult] = useState(null)
  return (
    <div className="endpoint">
      <div className="endpoint-meta"><span className="badge get">GET</span><span className="endpoint-label">/test-all-emails</span></div>
      <button className="btn-run" onClick={() => call(() => api.get('/test-all-emails'), setResult)}>Run</button>
      <ResultBox result={result} />
    </div>
  )
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { users, loading, fetchUsers } = useUsers()

  // Fetch users once on mount so dropdowns are ready
  useEffect(() => { fetchUsers() }, [])

  return (
    <>
      <StyleInjector />
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
          <Section title="Users" icon="👤" count={5}>
            <GetAllUsers />
            <GetUser users={users} loading={loading} />
            <RegisterUser />
            <UpdateUser users={users} loading={loading} />
            <DeleteUser users={users} loading={loading} />
          </Section>

          <Section title="Events" icon="📅" count={5}>
            <GetAllEvents />
            <GetEvent />
            <AddEvent users={users} loading={loading} />
            <UpdateEvent users={users} loading={loading} />
            <DeleteEvent />
          </Section>

          <Section title="Tickets" icon="🎫" count={1}>
            <PurchaseTicket users={users} loading={loading} />
          </Section>

          <Section title="Posts" icon="📢" count={4}>
            <GetAllPosts />
            <CreatePost />
            <UpdatePost />
            <CancelPost />
          </Section>

          <Section title="Questions" icon="❓" count={3}>
            <GetAllQuestions />
            <GetSpeakerQuestions users={users} loading={loading} />
            <AddQuestion users={users} loading={loading} />
          </Section>

          <Section title="Mail List" icon="✉️" count={1}>
            <GetMailList />
          </Section>
        </main>
      </div>
    </>
  )
}