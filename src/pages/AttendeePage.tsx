import { useEffect, useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAllEvents, addQuestion, getQuestionsByUser,
  createInvoice, checkUserTicket, getAllPosts,
  getEventAgendas,
  Event, Question, Post, Agenda, apiErr,
} from '../api/client'

import { useAuth } from '../context/AuthContext'
import { Btn, Select, Modal, toast, Spinner } from '../components/UI'

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
    noEvents:        '— No active events at this time —',
    today:           'TODAY',
    // event selection modal
    chooseEventTitle:'Choose an Event',
    chooseEventDesc: 'Select the event you want to attend and purchase a ticket for.',
    viewSessions:    'View Sessions',
    hideSessions:    'Hide Sessions',
    noSessions:      '— No sessions listed yet —',
    buyFor:          'Buy Ticket',
    // ticket confirm modal
    ticketTitle:     'Purchase Ticket',
    ticketSentTo:    'A QR-code ticket will be sent to',
    cancel:          'Cancel',
    purchase:        'Proceed to Payment',
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
    invoiceToast:    'Payment link opened — complete the payment to receive your ticket by email.',
    // public lecture
    publicLecture:   'Public Lecture',
    programme:       'Programme',
    speakers:        'Speakers & Panelists',
    moderator:       'Moderator',
    // ticket support
    spamNotice:      'Please check your spam folder as the ticket may have ended up there.',
    ticketSupport:   'If you have any problems purchasing tickets, please contact',
    // ticket status
    ticketPurchased: '✓ Ticket Purchased',
    noTicketToast:   'Purchase a ticket first to submit questions.',
    // announcements
    announcements:   'Announcements',
    noAnnouncements: '— No announcements yet —',
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
    noEvents:        '— Идэвхтэй арга хэмжээ байхгүй байна —',
    today:           'ӨНӨӨДӨР',
    // event selection modal
    chooseEventTitle:'Арга хэмжээ сонгох',
    chooseEventDesc: 'Оролцохыг хүсч буй арга хэмжээгээ сонгоод тасалбараа худалдан аваарай.',
    viewSessions:    'Хөтөлбөр харах',
    hideSessions:    'Хөтөлбөр нуух',
    noSessions:      '— Хөтөлбөр бүртгэгдээгүй байна —',
    buyFor:          'Тасалбар авах',
    // ticket confirm modal
    ticketTitle:     'Тасалбар Авах',
    ticketSentTo:    'QR-кодтой тасалбар дараах хаяг руу илгээгдэнэ:',
    cancel:          'Цуцлах',
    purchase:        'Төлбөр хийх',
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
    invoiceToast:    'Төлбөрийн линк нээгдлээ — төлбөрөө хийснээр тасалбар и-мэйл рүү таны илгээгдэнэ.',
    // public lecture
    publicLecture:   'Олон Нийтийн Лекц',
    programme:       'Хөтөлбөр',
    speakers:        'Илтгэгчид ба Хэлэлцүүлэгчид',
    moderator:       'Модератор',
    // ticket support
    spamNotice:      'Тасалбар спам фолдерт орсон байх боломжтой тул спам фолдероо шалгаарай.',
    ticketSupport:   'Хэрэв танд тасалбар авахтай асуудал гарвал дараах хаягаар холбогдоно уу:',
    // ticket status
    ticketPurchased: '✓ Тасалбар авсан',
    noTicketToast:   'Асуулт тавихын тулд эхлээд тасалбар авна уу.',
    // announcements
    announcements:   'Мэдэгдэлүүд',
    noAnnouncements: '— Мэдэгдэл байхгүй байна —',
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
  const [posts, setPosts] = useState<Post[]>([])

  // Ticket state
  const [ticketEventIds, setTicketEventIds] = useState<number[]>([])
  const [hasAnyTicket, setHasAnyTicket] = useState(false)

  // Event selection modal (choose which event to buy ticket for)
  const [eventSelectModal, setEventSelectModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [expandedAgendaEventId, setExpandedAgendaEventId] = useState<number | null>(null)
  const [agendaMap, setAgendaMap] = useState<Record<number, Agenda[]>>({})
  const [loadingAgendas, setLoadingAgendas] = useState(false)

  // Ticket confirm modal
  const [ticketModal, setTicketModal] = useState(false)
  const [purchasingTicket, setPurchasingTicket] = useState(false)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)

  // Question state
  const [questionModal, setQuestionModal] = useState(false)
  const [eventId, setEventId] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [submittingQ, setSubmittingQ] = useState(false)

  const [myQuestionsModal, setMyQuestionsModal] = useState(false)
  const [myQuestions, setMyQuestions] = useState<Question[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)

  const [showWelcome, setShowWelcome] = useState(true)

  useEffect(() => {
    getAllEvents()
      .then(all => setEvents(all.filter(e => e.is_active)))
      .catch(() => {})
      .finally(() => setLoading(false))
    checkUserTicket()
      .then(({ has_ticket, ticket_event_ids }) => {
        setHasAnyTicket(has_ticket)
        setTicketEventIds(ticket_event_ids)
      })
      .catch(() => {})
    getAllPosts()
      .then(setPosts)
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

  const handleOpenBuyTicket = () => {
    setSelectedEvent(null)
    setInvoiceUrl(null)
    setEventSelectModal(true)
  }

  const handleSelectEventForTicket = (ev: Event) => {
    if (ticketEventIds.includes(ev.id)) {
      toast(lang === 'mn'
        ? 'Та энэ арга хэмжээний тасалбарыг аль хэдийн авсан байна.'
        : 'You already have a ticket for this event. Check your email.', 'err')
      return
    }
    setSelectedEvent(ev)
    setEventSelectModal(false)
    setTicketModal(true)
  }

  const handlePurchaseTicket = async (e: FormEvent) => {
    e.preventDefault()
    if (!user || !selectedEvent) return
    setPurchasingTicket(true)
    try {
      const result = await createInvoice({
        user_id: user.id,
        username: `${user.firstname} ${user.lastname}`,
        amount: Math.round(selectedEvent.ticket_price),
        event_id: selectedEvent.id,
      })
      if (result.invoice_url) {
        setInvoiceUrl(result.invoice_url)
      } else {
        toast(result.error || 'Failed to create invoice', 'err')
      }
    } catch (err: any) {
      toast(apiErr(err, 'Invoice creation failed'), 'err')
    }
    setPurchasingTicket(false)
  }

  const handleOpenQuestionModal = () => {
    if (!hasAnyTicket) { toast(t.noTicketToast, 'err'); return }
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
  const getEventName = (evId: number) => events.find(e => e.id === evId)?.event_name ?? `Event #${evId}`

  const toggleAgendaView = async (eventId: number) => {
    if (expandedAgendaEventId === eventId) {
      setExpandedAgendaEventId(null)
      return
    }
    setExpandedAgendaEventId(eventId)
    if (!agendaMap[eventId]) {
      setLoadingAgendas(true)
      try {
        const list = await getEventAgendas(eventId)
        setAgendaMap(prev => ({ ...prev, [eventId]: list }))
      } catch {}
      setLoadingAgendas(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" />
      <div className="nebula nebula-1" />
      <div className="nebula nebula-2" />

      {/* ── Welcome overlay ── */}
      {showWelcome && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(6,9,17,0.80)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px 28px',
            maxWidth: 520, width: '100%',
            maxHeight: '90vh', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: 20,
            boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                fontFamily: 'var(--font-mono)', fontSize: 12,
                color: 'var(--blue)', letterSpacing: '0.15em',
                border: '1px solid rgba(82,96,217,0.35)',
                background: 'rgba(82,96,217,0.08)',
                borderRadius: 4, padding: '5px 14px',
              }}>
                MONGOLIA — CERN LHCb 2026
              </span>
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#ffffff', lineHeight: 1.4, textAlign: 'center' }}>
                Тавтай морил 👋
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.22)', borderLeft: '3px solid var(--yellow)', borderRadius: '0 8px 8px 0', padding: '12px 14px', fontSize: 14, color: '#fef3c7', lineHeight: 1.7 }}>
                2026 оны 06 сарын 09-ны 16:00 цагийн Олон нийтийн лекц нь 10,000 ₮-ийн төлбөртэй тул лекцэнд оролцохын тулд эхлээд тасалбараа худалдан авах ёстойг анхаараарай.
              </div>
              <div style={{ background: 'rgba(82,96,217,0.07)', border: '1px solid rgba(82,96,217,0.2)', borderLeft: '3px solid var(--blue)', borderRadius: '0 8px 8px 0', padding: '12px 14px', fontSize: 14, color: '#e0e7ff', lineHeight: 1.7 }}>
                Тасалбар худалдан авахыг хүсвэл "Тасалбар Авах / Purchase Ticket" товчин дээр дарж, арга хэмжээгээ сонгоод төлбөрийн цонхонд төлбөрөө хийснээр тасалбар таны и-мэйл хаяг руу илгээгдэнэ.
              </div>
              <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.18)', borderLeft: '3px solid var(--green)', borderRadius: '0 8px 8px 0', padding: '12px 14px', fontSize: 14, color: '#d1fae5', lineHeight: 1.7 }}>
                Тасалбар таны и-мэйлийн спам фолдер луу орсон байж болзошгүй тул тасалбар ирээгүй байвал эхлээд спам фолдероо шалгаарай.
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-3)', lineHeight: 1.7, textAlign: 'center' }}>
                Тасалбар болон вэбтэй холбоотой асуулт гарвал:{' '}
                <a href="mailto:cernmongolia2026@gmail.com" style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                  cernmongolia2026@gmail.com
                </a>
              </div>
            </div>

            <button
              onClick={() => setShowWelcome(false)}
              style={{
                width: '100%', padding: '12px',
                background: 'var(--blue)', border: 'none',
                borderRadius: 'var(--radius)', cursor: 'pointer',
                color: '#ffffff', fontSize: 15, fontWeight: 700,
                fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                transition: 'opacity 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
            >
              Үргэлжлүүлэх
            </button>
          </div>
        </div>
      )}

      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(20px)',
        padding: '0 24px', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', borderRadius: 8, border: '1px solid var(--border-2)', overflow: 'hidden' }}>
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

        <span style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          fontSize: 14, color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
          pointerEvents: 'none',
        }}>
          {user?.firstname} {user?.lastname}
        </span>

        <button
          onClick={handleLogout}
          style={{
            background: 'transparent', border: '1px solid var(--border-2)',
            borderRadius: 'var(--radius)', padding: '6px 14px',
            color: '#ffffff', fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
          }}
        >
          {t.signOut}
        </button>
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
          <ActionCard icon="🎫" title={t.buyTicket} desc={t.buyDesc} color="var(--blue)" dimColor="var(--blue-dim)" onClick={handleOpenBuyTicket} />
          <ActionCard icon="💬" title={t.askQ} desc={t.askDesc} color="var(--purple)" dimColor="var(--purple-dim)" onClick={handleOpenQuestionModal} />
          <ActionCard icon="📋" title={t.myQ} desc={t.myQDesc} color="var(--green)" dimColor="var(--green-dim)" onClick={handleOpenMyQuestions} />
        </div>

        {/* Ticket support notice */}
        <div style={{
          marginBottom: 40,
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.18)',
          borderRadius: 10, padding: '10px 16px',
          fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6,
        }}>
          <span style={{ fontSize: 16 }}>✉️</span>
          <span>{t.ticketSupport}</span>
          <a href="mailto:cernmongolia2026@gmail.com" style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)', textDecoration: 'none' }}>
            cernmongolia2026@gmail.com
          </a>
        </div>

        {/* Announcements */}
        {posts.length > 0 && (
          <section style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 3, borderRadius: 2, background: 'var(--purple)', flexShrink: 0 }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--purple)', letterSpacing: '0.15em', textTransform: 'uppercase', alignSelf: 'center' }}>
                {t.announcements}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {posts.map(p => (
                <div key={p.id} style={{ background: 'var(--bg-2)', border: '1px solid rgba(124,58,237,0.22)', borderLeft: '3px solid var(--purple)', borderRadius: 'var(--radius-lg)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', lineHeight: 1.4 }}>{p.header}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{p.body}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                    🕒 {new Date(p.time).toLocaleDateString(lang === 'mn' ? 'mn-MN' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Active Events */}
        <section style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 3, borderRadius: 2, background: 'var(--blue)', flexShrink: 0 }} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--blue)', letterSpacing: '0.15em', textTransform: 'uppercase', alignSelf: 'center' }}>
              EVENTS
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={32} /></div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-3)', fontSize: 16, fontFamily: 'var(--font-mono)' }}>
              {t.noEvents}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {events.map(ev => {
                const hasTicket = ticketEventIds.includes(ev.id)
                const isPast = ev.end_date < todayStr
                const isOngoing = ev.start_date <= todayStr && ev.end_date >= todayStr
                const isExpanded = expandedAgendaEventId === ev.id
                const accent = isOngoing ? 'var(--yellow)' : isPast ? 'var(--text-3)' : 'var(--blue)'

                return (
                  <div key={ev.id} style={{
                    background: 'var(--bg-2)',
                    border: `1px solid ${hasTicket ? 'var(--green)33' : isPast ? 'var(--border)' : 'var(--border-2)'}`,
                    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                    opacity: isPast ? 0.6 : 1, transition: 'all 0.2s',
                  }}>
                    <div style={{ padding: '20px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>{ev.event_name}</div>
                          {ev.description && (
                            <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 10 }}>{ev.description}</div>
                          )}
                          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                            <span style={{ color: accent }}>📅 {ev.start_date}{ev.end_date !== ev.start_date ? ` — ${ev.end_date}` : ''}</span>
                            <span>🎫 ₮{ev.ticket_price.toLocaleString()}</span>
                            {isOngoing && <span style={{ color: 'var(--yellow)', background: 'var(--yellow-dim)', borderRadius: 4, padding: '1px 7px' }}>ONGOING</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                          <button
                            onClick={() => toggleAgendaView(ev.id)}
                            style={{
                              padding: '7px 12px', fontSize: 13, background: 'transparent',
                              border: '1px solid var(--border-2)', borderRadius: 'var(--radius)',
                              color: 'var(--text-2)', cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            {isExpanded ? t.hideSessions : t.viewSessions}
                          </button>
                          {!hasTicket && !isPast && (
                            <button
                              onClick={() => handleSelectEventForTicket(ev)}
                              style={{
                                padding: '7px 14px', fontSize: 13, fontWeight: 700,
                                background: 'var(--blue)', border: 'none',
                                borderRadius: 'var(--radius)', color: '#ffffff', cursor: 'pointer',
                                transition: 'opacity 0.15s',
                              }}
                              onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                              onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                            >
                              {t.buyFor}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Ticket badge */}
                    {hasTicket && (
                      <div style={{
                        background: 'var(--green-dim)', borderTop: '1px solid var(--green)33',
                        padding: '8px 22px', display: 'flex', alignItems: 'center', gap: 8,
                        fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
                        color: 'var(--green)', letterSpacing: '0.06em',
                      }}>
                        {t.ticketPurchased}
                      </div>
                    )}

                    {/* Agendas */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', padding: '16px 22px' }}>
                        {(loadingAgendas && expandedAgendaEventId === ev.id && !agendaMap[ev.id]) ? (
                          <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spinner size={20} /></div>
                        ) : !agendaMap[ev.id] || agendaMap[ev.id].length === 0 ? (
                          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>
                            {t.noSessions}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {agendaMap[ev.id].map(a => (
                              <div key={a.agenda_id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>{a.agenda}</div>
                                {a.speaker && <div style={{ fontSize: 13, color: 'var(--blue)', marginBottom: 4 }}>🎤 {a.speaker}</div>}
                                <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                  {a.start_time && a.end_time && <span>🕒 {a.start_time}–{a.end_time}</span>}
                                  {a.location && <span>📍 {a.location}</span>}
                                  {a.building && <span>🏛 {a.building}{a.room ? `, Room ${a.room}` : ''}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

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

          <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.22)', borderRadius: 10, padding: '10px 14px', fontSize: 14, color: '#dbeafe', lineHeight: 1.6, flexWrap: 'wrap', marginBottom: '30px' }}>
            <span style={{ fontSize: 16 }}>🌐</span>
            <span>
              {lang === 'mn'
                ? 'Бүх илтгэл, хэлэлцүүлэг Англи хэл дээр явагдана гэдгийг анхаарна уу.'
                : 'Please noted all lectures and panel discussions will be conducted in English.'}
            </span>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{t.programme}</div>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {PROGRAMME.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 20px', borderBottom: i < PROGRAMME.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--blue)', whiteSpace: 'nowrap', minWidth: 110, paddingTop: 1 }}>{row.time}</div>
                  <div style={{ fontSize: 14, color: '#ffffff', lineHeight: 1.6 }}>{row.item}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>{t.speakers}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
              {SPEAKERS.map((s, i) => (
                <div key={i} style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '12px 16px' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {s.name}
                    {s.moderator && (
                      <span style={{ fontSize: 11, color: 'var(--yellow)', fontFamily: 'var(--font-mono)', background: 'var(--yellow-dim)', borderRadius: 4, padding: '1px 6px', letterSpacing: '0.06em' }}>{t.moderator}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>{s.affiliation}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── Event selection modal ── */}
      {eventSelectModal && (
        <Modal title={t.chooseEventTitle} onClose={() => setEventSelectModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{t.chooseEventDesc}</p>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}><Spinner size={24} /></div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: 14, fontFamily: 'var(--font-mono)' }}>{t.noEvents}</div>
            ) : (
              events.map(ev => {
                const hasTicket = ticketEventIds.includes(ev.id)
                const isPast = ev.end_date < todayStr
                return (
                  <div key={ev.id} style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>{ev.event_name}</div>
                      {ev.description && <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{ev.description}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                          📅 {ev.start_date}{ev.end_date !== ev.start_date ? ` — ${ev.end_date}` : ''} &nbsp;·&nbsp; 🎫 ₮{ev.ticket_price.toLocaleString()}
                        </div>
                        {hasTicket ? (
                          <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--font-mono)', background: 'var(--green-dim)', borderRadius: 4, padding: '3px 8px' }}>✓ Purchased</span>
                        ) : isPast ? (
                          <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>Past event</span>
                        ) : (
                          <button
                            onClick={() => handleSelectEventForTicket(ev)}
                            style={{ padding: '6px 14px', fontSize: 13, fontWeight: 700, background: 'var(--blue)', border: 'none', borderRadius: 'var(--radius)', color: '#ffffff', cursor: 'pointer' }}
                          >
                            {t.buyFor}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <Btn variant="ghost" onClick={() => setEventSelectModal(false)}>{t.cancel}</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Ticket confirm modal ── */}
      {ticketModal && selectedEvent && (
        <Modal title={t.ticketTitle} onClose={() => { setTicketModal(false); setInvoiceUrl(null) }}>
          {invoiceUrl ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 15, color: '#ffffff', lineHeight: 1.6, margin: 0 }}>
                {t.ticketSentTo}{' '}
                <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{user?.email}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.22)', borderRadius: 8, padding: '9px 13px', fontSize: 14, color: '#fef08a', lineHeight: 1.5 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>📂</span>
                <span>{t.spamNotice}</span>
              </div>
              <a
                href={invoiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { setTicketModal(false); setInvoiceUrl(null); toast(t.invoiceToast) }}
                style={{ display: 'block', textAlign: 'center', padding: '14px 0', background: 'linear-gradient(135deg,#15803d,#16a34a)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 'var(--radius)', color: '#fff', fontSize: 15, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.02em' }}
              >
                {t.purchase} — ₮{selectedEvent.ticket_price.toLocaleString()}
              </a>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Btn variant="ghost" onClick={() => { setTicketModal(false); setInvoiceUrl(null) }}>{t.cancel}</Btn>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePurchaseTicket} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', marginBottom: 4 }}>{selectedEvent.event_name}</div>
                {selectedEvent.description && <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5, marginBottom: 8 }}>{selectedEvent.description}</div>}
                <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  📅 {selectedEvent.start_date}{selectedEvent.end_date !== selectedEvent.start_date ? ` — ${selectedEvent.end_date}` : ''}
                </div>
              </div>
              <p style={{ fontSize: 15, color: '#ffffff', lineHeight: 1.6, margin: 0 }}>
                {t.ticketSentTo}{' '}
                <span style={{ color: 'var(--blue)', fontFamily: 'var(--font-mono)' }}>{user?.email}</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.22)', borderRadius: 8, padding: '9px 13px', fontSize: 14, color: '#fef08a', lineHeight: 1.5 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>📂</span>
                <span>{t.spamNotice}</span>
              </div>
              <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--blue)', letterSpacing: '0.05em' }}>
                ₮{selectedEvent.ticket_price.toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <Btn variant="ghost" type="button" onClick={() => setTicketModal(false)}>{t.cancel}</Btn>
                <Btn type="submit" loading={purchasingTicket}>{t.purchase}</Btn>
              </div>
            </form>
          )}
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
                ...events.map(ev => ({ value: String(ev.id), label: ev.event_name })),
              ]}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 15, color: '#ffffff', fontWeight: 600, letterSpacing: '0.04em' }}>{t.qLabel}</label>
              <textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                required rows={4}
                placeholder={t.qPlaceholder}
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 14px', color: '#ffffff', fontSize: 15, resize: 'vertical', fontFamily: 'var(--font-sans)', outline: 'none', transition: 'border-color 0.2s' }}
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
                      {getEventName(q.event_id)}
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
