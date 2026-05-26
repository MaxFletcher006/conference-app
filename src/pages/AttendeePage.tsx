import { useEffect, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAllEvents, addQuestion, getQuestionsByUser,
  createInvoice, checkUserTicket,
  Event, Question, apiErr,
} from '../api/client'

import { useAuth } from '../context/AuthContext'
import { Btn, Input, Select, Modal, toast, Spinner } from '../components/UI'


const PRICE_PER_DAY = Number(import.meta.env.VITE_TICKET_PRICE) || 10000;

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    brand:           'MONGOLIA - CERN LHCb 2026',
    signOut:         'Sign out',
    portal:          '◈ ATTENDEE PORTAL',
    welcome:         'Welcome,',
    buyTicket:       'Purchase Ticket',
    buyDesc:         'Get your QR-code entry ticket delivered by email',
    askQ:            'Ask a Question',
    askDesc:         'Submit a question to a speaker at any event',
    myQ:             'My Questions',
    myQDesc:         'View all questions you have submitted so far',
    noEvents:        '— No events scheduled yet —',
    today:           'TODAY',
    // ticket modal
    ticketTitle:     'Purchase Ticket',
    ticketSentTo:    'A QR-code ticket will be sent to',
    daysLabel:       'Days of attendance',
    day: (n: number) => n === 1 ? '1 day' : `${n} days`,
    cancel:          'Cancel',
    purchase:        'Purchase',
    // question modal
    qModalTitle:     'Ask a Question',
    selectEvent:     'Select event',
    chooseEvent:     'Choose an event...',
    qLabel:          'YOUR QUESTION',
    qPlaceholder:    'Type your question here...',
    submit:          'Submit',
    // my questions modal
    myQTitle:        'My Questions',
    noQYet:          "You haven't submitted any questions yet.",
    close:           'Close',
    // invoice
    totalPrice:      (n: number) => `Total: ₮${(n * PRICE_PER_DAY).toLocaleString()}`,
    invoiceToast:    'Payment link opened — complete payment and check your email for your ticket.',
    // public lecture
    publicLecture:   'Public Lecture',
    programme:       'Programme',
    speakers:        'Speakers & Panelists',
    moderator:       'Moderator',
    // ticket status
    ticketPurchased: '✓ Ticket Purchased',
    noTicketToast:   'Purchase a ticket first to submit questions.',
    // date
    weekdays:        ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  },
  mn: {
    brand:           'МОНГОЛ - CERN LHCb 2026',
    signOut:         'Гарах',
    portal:          '◈ ОРОЛЦОГЧИЙН ПОРТАЛ',
    welcome:         'Тавтай морил,',
    buyTicket:       'Тасалбар Авах',
    buyDesc:         'QR-кодтой тасалбараа и-мэйлээр хүлээн аваарай',
    askQ:            'Асуулт Тавих',
    askDesc:         'Илтгэгчдэд тавих асуултаа илгээгээрэй',
    myQ:             'Миний Асуултууд',
    myQDesc:         'Өөрийн тавьсан бүх асуултуудыг харах',
    noEvents:        '— Арга хэмжээ бүртгэгдээгүй байна —',
    today:           'ӨНӨӨДӨР',
    // ticket modal
    ticketTitle:     'Тасалбар Авах',
    ticketSentTo:    'QR-кодтой тасалбар дараах хаяг руу илгээгдэнэ:',
    daysLabel:       'Оролцох өдрийн тоо',
    day: (n: number) => `${n} өдөр`,
    cancel:          'Цуцлах',
    purchase:        'Авах',
    // question modal
    qModalTitle:     'Асуулт Тавих',
    selectEvent:     'Арга хэмжээ сонгох',
    chooseEvent:     'Арга хэмжээ сонгоно уу...',
    qLabel:          'ТАНЫ АСУУЛТ',
    qPlaceholder:    'Асуултаа энд бичнэ үү...',
    submit:          'Илгээх',
    // my questions modal
    myQTitle:        'Миний Асуултууд',
    noQYet:          'Та одоогоор асуулт илгээгээгүй байна.',
    close:           'Хаах',
    // invoice
    totalPrice:      (n: number) => `Нийт: ₮${(n * PRICE_PER_DAY).toLocaleString()}`,
    invoiceToast:    'Төлбөрийн линк нээгдлээ — төлбөрөө хийгээд тасалбараа и-мэйлээс шалгана уу.',
    // public lecture
    publicLecture:   'Нийтийн Лекц',
    programme:       'Хөтөлбөр',
    speakers:        'Илтгэгчид ба Хэлэлцүүлэгчид',
    moderator:       'Дарга',
    // ticket status
    ticketPurchased: '✓ Тасалбар авсан',
    noTicketToast:   'Асуулт тавихын тулд эхлээд тасалбар авна уу.',
    // date
    weekdays:        ['Ням','Даваа','Мягмар','Лхагва','Пүрэв','Баасан','Бямба'],
  },
}

type Lang = 'en' | 'mn'

const PROGRAMME = [
  { time: '16:00–16:05', item: 'Opening and welcome' },
  { time: '16:05–16:10', item: 'Introduction of speakers' },
  { time: '16:10–16:30', item: 'Lecture 1: Prof. Vincenzo Vagnoni - CERN, the Large Hadron Collider, and the Big Questions of the Universe' },
  { time: '16:30–16:50', item: "Lecture 2: Prof. Jianchun Wang - Future of High Energy Physics, CEPC" },
  { time: '16:50–17:10', item: 'Lecture 3: Dr. Patrick Robbe - The LHCb Experiment: Matter, Antimatter, and Hidden Clues of Nature' },
  { time: '17:10–17:15', item: 'Transition to panel discussion' },
  { time: '17:15–17:55', item: 'Panel Discussion: CERN, LHCb, and Opportunities for Mongolia' },
  { time: '17:55–18:00', item: 'Closing remarks and group photo' },
]

const SPEAKERS = [
  { name: 'Prof. Vincenzo Vagnoni', affiliation: 'INFN Bologna, Italy — Current Spokesperson of the LHCb Collaboration' },
  { name: 'Prof. Tim Gershon',      affiliation: 'University of Warwick, United Kingdom' },
  { name: 'Dr. Patrick Robbe',      affiliation: 'IJCLab / IN2P3, France' },
  { name: 'Prof. Barbara Sciascia', affiliation: 'INFN Frascati, Italy' },
  { name: 'Prof. Jianchun Wang',    affiliation: 'Institute of High Energy Physics, Chinese Academy of Sciences, China' },
  { name: 'Prof. Tomasz Skwarnicki',affiliation: 'Syracuse University, United States' },
  { name: 'Dr. Baasansuren Batsukh',affiliation: 'Institute of Physics and Technology, Mongolia', moderator: true },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function AttendeePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>('en')
  const t = T[lang]

  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const [ticketModal, setTicketModal] = useState(false)
  const [purchasingTicket, setPurchasingTicket] = useState(false)

  const [questionModal, setQuestionModal] = useState(false)
  const [eventId, setEventId] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [submittingQ, setSubmittingQ] = useState(false)

  const [myQuestionsModal, setMyQuestionsModal] = useState(false)
  const [myQuestions, setMyQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const [hasTicket, setHasTicket] = useState(false)

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false))
    checkUserTicket()
      .then(({ has_ticket }) => setHasTicket(has_ticket))
      .catch(() => {})
  }, [])

  const formatLocalDateTime = (date = new Date()) => {
    const pad = (n: number) => String(n).padStart(2, '0')
    return (
      date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      '-' + pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
    )
  }

  const handleLogout = async () => { await logout(); navigate('/login') }

  const handleOpenTicketModal = async () => {
    try {
      const { has_ticket } = await checkUserTicket()
      if (has_ticket) {
        toast(lang === 'mn'
          ? 'Та аль хэдийн тасалбар авсан байна. И-мэйлээ шалгана уу.'
          : 'You already have a ticket. Please check your email.', 'err')
        return
      }
    } catch {}
    setTicketModal(true)
  }

  const handlePurchaseTicket = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return
    setPurchasingTicket(true)
    try {
      const days = 1
      const result = await createInvoice({
        user_id: user.id,
        username: `${user.firstname} ${user.lastname}`,
        amount: days * PRICE_PER_DAY,
        days,
      })
      if (result.invoice_url) {
        window.open(result.invoice_url, '_blank', 'noopener,noreferrer')
        setTicketModal(false)
        setHasTicket(true)
        toast(t.invoiceToast)
      } else {
        toast(result.error || 'Failed to create invoice', 'err')
      }
    } catch (err: any) {
      toast(apiErr(err, 'Invoice creation failed'), 'err')
    }
    setPurchasingTicket(false)
  }

  const handleOpenQuestionModal = () => {
    if (!hasTicket) { toast(t.noTicketToast, 'err'); return }
    setQuestionModal(true)
  }

  const handleAddQuestion = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !eventId) return
    setSubmittingQ(true)
    try {
      await addQuestion({ user_id: user.id, event_id: parseInt(eventId), question: questionText, time: formatLocalDateTime() })
      toast('Question submitted')
      setQuestionModal(false)
      setQuestionText('')
      setEventId('')
      if (myQuestions.length > 0 || myQuestionsModal) fetchMyQuestions()
    } catch (err: any) {
      toast(apiErr(err, 'Submission failed'), 'err')
    }
    setSubmittingQ(false)
  }

  const fetchMyQuestions = async () => {
    if (!user) return
    setLoadingQuestions(true)
    try { setMyQuestions(await getQuestionsByUser(user.id)) }
    catch { setMyQuestions([]) }
    setLoadingQuestions(false)
  }

  const handleOpenMyQuestions = () => { setMyQuestionsModal(true); fetchMyQuestions() }
  const getEventTopic = (evId: number) => events.find(e => e.id === evId)?.topic ?? `Event #${evId}`
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      {/* ── Nav ── */}
      <nav className="attendee-nav" style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(20px)',
        padding: '0 32px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div className="attendee-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: 'var(--blue)', boxShadow: '0 0 12px var(--blue)',
            animation: 'dashPulse 2.5s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#ffffff', letterSpacing: '0.1em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {t.brand}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language toggle */}
          <div style={{
            display: 'flex', borderRadius: 8,
            border: '1px solid var(--border-2)', overflow: 'hidden',
          }}>
            {(['en', 'mn'] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: '5px 14px', border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  background: lang === l ? 'var(--blue)' : 'transparent',
                  color: lang === l ? '#ffffff' : 'var(--text-3)',
                  transition: 'all 0.15s',
                }}
              >
                {l === 'en' ? 'EN' : 'МН'}
              </button>
            ))}
          </div>
          <span className="attendee-nav-user" style={{ fontSize: 15, color: '#ffffff' }}>
            {user?.firstname} {user?.lastname}
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent', border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)', padding: '6px 14px',
              color: '#ffffff', fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {t.signOut}
          </button>
        </div>
      </nav>

      {/* ── Content ── */}
      <div className="attendee-page-content" style={{ maxWidth: 960, margin: '0 auto', padding: '40px 32px', position: 'relative', zIndex: 1 }}>

        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: 'var(--blue)', letterSpacing: '0.15em', marginBottom: 12 }}>
            {t.portal}
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', color: '#ffffff', marginBottom: 6 }}>
            {t.welcome} {user?.firstname}
          </h1>
        </div>

        {/* Action cards */}
        <div className="action-card-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 48 }}>
          <ActionCard icon="🎫" title={t.buyTicket} desc={t.buyDesc} color="var(--blue)"   dimColor="var(--blue-dim)"   onClick={handleOpenTicketModal} />
          <ActionCard icon="💬" title={t.askQ}      desc={t.askDesc}  color="var(--purple)" dimColor="var(--purple-dim)" onClick={handleOpenQuestionModal} />
          <ActionCard icon="📋" title={t.myQ}       desc={t.myQDesc}  color="var(--green)"  dimColor="var(--green-dim)"  onClick={handleOpenMyQuestions} />
        </div>

        {/* Events */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-3)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
            {t.noEvents}
          </div>
        ) : (
          groupByDate(events).map(({ date, items }) => {
            const isToday = date === todayStr
            const isPast  = date < todayStr
            const d = new Date(date + 'T00:00:00')
            const weekday  = t.weekdays[d.getDay()]
            const formatted = lang === 'mn'
              ? `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`
              : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            const accent = isToday ? 'var(--yellow)' : isPast ? 'var(--text-3)' : 'var(--blue)'

            return (
              <section key={date} style={{ marginBottom: 44 }}>
                <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 3, borderRadius: 2, background: accent, flexShrink: 0 }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: isToday ? 'var(--yellow)' : isPast ? 'var(--text-3)' : '#ffffff', letterSpacing: '-0.01em' }}>
                        {weekday}
                      </span>
                      {isToday && (
                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', background: 'var(--yellow-dim)', color: 'var(--yellow)', borderRadius: 4, padding: '2px 8px', letterSpacing: '0.08em' }}>
                          {t.today}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 15, color: '#ffffff', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{formatted}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map(e => <EventRow key={e.id} event={e} variant={isToday ? 'today' : isPast ? 'past' : 'upcoming'} events={events} hasTicket={hasTicket} ticketLabel={t.ticketPurchased} />)}
                </div>
              </section>
            )
          })
        )}

        {/* ── Public Lecture ── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, marginBottom: 24 }}>
            <div style={{ width: 3, borderRadius: 2, background: 'var(--blue)', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--blue)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 6 }}>
                {t.publicLecture}
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                Exploring the Universe with the LHCb Experiment
              </div>
              <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 14, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>
                <span>📅 Tuesday, 9 June 2026</span>
                <span>🕓 16:00–18:00</span>
                <span>📍 Ulaanbaatar Hotel, Ulaanbaatar, Mongolia</span>
              </div>
            </div>
          </div>

          {/* English warning */}
          <div
              style={{
                marginTop: 14,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(59,130,246,0.10)',
                border: '1px solid rgba(59,130,246,0.22)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 14,
                color: '#dbeafe',
                lineHeight: 1.6,
                flexWrap: 'wrap',
                marginBottom: '30px',
              }}
            >
              <span style={{ fontSize: 16 }}>🌐</span>

              <span>
                {lang === 'mn'
                  ? 'Бүх илтгэл, хэлэлцүүлэг Англи хэл дээр явагдана гэдгийг анхаарна уу.'
                  : 'Please noted all lectures and panel discussions will be conducted in English.'}
              </span>
            </div>

          {/* Programme table */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {t.programme}
            </div>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {PROGRAMME.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 16, padding: '12px 20px',
                  borderBottom: i < PROGRAMME.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--blue)', whiteSpace: 'nowrap', minWidth: 110, paddingTop: 1 }}>
                    {row.time}
                  </div>
                  <div style={{ fontSize: 14, color: '#ffffff', lineHeight: 1.6 }}>{row.item}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Speakers */}
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
              {t.speakers}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {SPEAKERS.map((s, i) => (
                <div key={i} style={{
                  background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                  borderRadius: 'var(--radius)', padding: '12px 16px',
                }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {s.name}
                    {s.moderator && (
                      <span style={{ fontSize: 11, color: 'var(--yellow)', fontFamily: 'var(--font-mono)', background: 'var(--yellow-dim)', borderRadius: 4, padding: '1px 6px', letterSpacing: '0.06em' }}>
                        {t.moderator}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>{s.affiliation}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Ticket modal ── */}
      {ticketModal && (
        <Modal title={t.ticketTitle} onClose={() => setTicketModal(false)}>
          <form onSubmit={handlePurchaseTicket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 16, color: '#ffffff', lineHeight: 1.6 }}>
              {t.ticketSentTo}{' '}
              <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{user?.email}</span>
            </p>
            <div style={{
              background: 'var(--bg-3)', border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)', padding: '12px 16px',
              fontFamily: 'var(--font-mono)', fontSize: 16,
              color: 'var(--blue)', letterSpacing: '0.05em',
            }}>
              {t.totalPrice(1)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <Btn variant="ghost" type="button" onClick={() => setTicketModal(false)}>{t.cancel}</Btn>
              <Btn type="submit" loading={purchasingTicket}>{t.purchase}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Question modal ── */}
      {questionModal && (
        <Modal title={t.qModalTitle} onClose={() => setQuestionModal(false)}>
          <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Select
              label={t.selectEvent}
              value={eventId}
              onChange={e => setEventId(e.target.value)}
              options={[
                { value: '', label: t.chooseEvent },
                ...events.map(ev => ({ value: String(ev.id), label: `${ev.date} · ${ev.topic}` })),
              ]}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 15, color: '#ffffff', fontWeight: 600, letterSpacing: '0.04em' }}>
                {t.qLabel}
              </label>
              <textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                required rows={4}
                placeholder={t.qPlaceholder}
                style={{
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '10px 14px',
                  color: '#ffffff', fontSize: 15, resize: 'vertical',
                  fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--border-3)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Btn variant="ghost" type="button" onClick={() => setQuestionModal(false)}>{t.cancel}</Btn>
              <Btn type="submit" loading={submittingQ} disabled={!eventId}>{t.submit}</Btn>
            </div>
          </form>
        </Modal>
      )}

      {/* ── My Questions modal ── */}
      {myQuestionsModal && (
        <Modal title={t.myQTitle} onClose={() => setMyQuestionsModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {loadingQuestions ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}><Spinner size={28} /></div>
            ) : myQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>💬</div>
                {t.noQYet}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '60vh', overflowY: 'auto', paddingRight: 4 }}>
                {myQuestions.map((q, i) => (
                  <div key={i} style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 15, fontFamily: 'var(--font-mono)', color: 'var(--blue)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      {getEventTopic(q.event_id)}
                    </div>
                    <p style={{ margin: 0, fontSize: 15, color: '#ffffff', lineHeight: 1.6 }}>{q.question}</p>
                    {q.time && (
                      <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                        🕒 {new Date(q.time.replace(/^(\d{4}-\d{2}-\d{2})-/, '$1T')).toLocaleString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="ghost" onClick={() => setMyQuestionsModal(false)}>{t.close}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function groupByDate(events: Event[]): { date: string; items: Event[] }[] {
  const map = new Map<string, Event[]>()
  for (const e of events) {
    if (!map.has(e.date)) map.set(e.date, [])
    map.get(e.date)!.push(e)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({ date, items }))
}

function ActionCard({ icon, title, desc, color, dimColor, onClick }: {
  icon: string; title: string; desc: string; color: string; dimColor: string; onClick: () => void
}) {
  return (
    <button
      className="action-card"
      onClick={onClick}
      style={{
        background: dimColor, border: `1px solid ${color}22`,
        borderRadius: 'var(--radius-lg)', padding: '22px 24px',
        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
      onMouseOver={e => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 24px ${color}22`; el.style.borderColor = `${color}44` }}
      onMouseOut={e => { const el = e.currentTarget; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = `${color}22` }}
    >
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div style={{ fontWeight: 600, fontSize: 16, color: '#ffffff' }}>{title}</div>
      <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{desc}</div>
    </button>
  )
}

function EventRow({ event: e, variant, hasTicket, ticketLabel }: { event: Event; variant: 'today' | 'upcoming' | 'past'; events: Event[]; hasTicket: boolean; ticketLabel: string }) {
  const accentColor = variant === 'today' ? 'var(--yellow)' : variant === 'upcoming' ? 'var(--blue)' : 'var(--text-3)'
  const isPast = variant === 'past'
  return (
    <div style={{
      background: 'var(--bg-2)', border: `1px solid ${hasTicket ? 'var(--green)33' : isPast ? 'var(--border)' : 'var(--border-2)'}`,
      borderRadius: 'var(--radius-lg)', overflow: 'hidden', opacity: isPast ? 0.55 : 1, transition: 'all 0.2s',
    }}>
      <div style={{ padding: '18px 22px' }}>
        <div className="event-row-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 5, color: isPast ? 'var(--text-2)' : '#ffffff' }}>{e.topic}</div>
            {e.agenda && <div style={{ fontSize: 15, color: '#ffffff', marginBottom: 8, lineHeight: 1.5 }}>{e.agenda}</div>}
            {e.speaker && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8, background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 10px' }}>
                <span style={{ fontSize: 13 }}>🎤</span>
                <span style={{ fontSize: 14, color: accentColor, fontFamily: 'var(--font-mono)' }}>{e.speaker}</span>
              </div>
            )}
            <div style={{ fontSize: 15, color: '#ffffff', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>📍 {e.location}</span>
              <span>🏛 {e.building}, Room {e.room}</span>
            </div>
          </div>
          <div className="event-row-time" style={{ marginLeft: 24, textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 600, color: accentColor, marginBottom: 4 }}>{e.start_time} – {e.end_time}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#ffffff' }}>{e.date}</div>
            {variant === 'today' && (
              <div style={{ marginTop: 6, display: 'inline-block', background: 'var(--yellow-dim)', color: 'var(--yellow)', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>
                TODAY
              </div>
            )}
          </div>
        </div>
      </div>
      {hasTicket && (
        <div style={{
          background: 'var(--green-dim)', borderTop: '1px solid var(--green)33',
          padding: '8px 22px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
          color: 'var(--green)', letterSpacing: '0.06em',
        }}>
          {ticketLabel}
        </div>
      )}
    </div>
  )
}
