import { useState, useEffect } from 'react'
import { agendaDays } from '@/data/agenda'
import { speakers } from '@/data/speakers'
import { publicEventRegister, getPublicAllEvents, apiErr } from '@/api/client'
import { SpeakerCard } from '@/components/ui/SpeakerCard'
import { Spinner } from '@/components/UI'

// ── Lecture descriptions ──────────────────────────────────────────────────────

const LECTURERS = [
  {
    name: 'Ц.Энхбат (Ph.D)',
    body: [
      'Энэхүү лекцээр, эгэл бөөмийн Стандарт моделийн гол ойлголтуудыг заана. Тухайн онолоос гарах физик үр дүнг туршилтаар хэрхэн шалгадаг, хөндлөн огтлолыг хэрхэн тооцдог зэргийг хамрана. Үр дүнгээ туршилттай тулган шалгах зорилгоор ашигладаг, олон нийтэд нээллтэй, үнэгүй Madgraph 5 симуляцын тухай танилцуулж, LHC дээр Хигс, топ анти топ кварк үүсэх үзэгдлийг жишээ болгон симуляц хийх хичээл орно.',
      'Иймд өөрийн зөөврийн компютер дээр уг программыг сүүлийн 2 лекц дээр авч ирнэ үү.',
    ],
  },
  {
    name: 'Б.Баасансүрэн (Ph.D)',
    body: [
      'Энэхүү лекцээр CERN-ийн LHCb туршилтын үндсэн зорилго, бүтэц, судалгааны чиглэлүүдийг танилцуулна. LHCb нь b болон c кварк агуулсан бөөмсийн задралыг өндөр нарийвчлалтай хэмжих замаар Стандарт моделийн нарийн параметрүүдийг шалгах, CP зөрчил, ховор задрал, шинэ физикийн боломжит шинж тэмдгийг хайх зориулалттай туршилт юм.',
      'Лекцийн эхний хэсэгт LHCb детекторын үндсэн дэд системүүд, протон-протон мөргөлдөөнөөс үүссэн өгөгдлийг хэрхэн бүртгэж, trigger болон reconstruction алгоритмаар боловсруулдаг талаар тайлбарлана. Мөн LHCb дээр физик анализ хийх ерөнхий дараалал болох өгөгдөл сонголт, background дарах арга, invariant mass distribution, signal extraction, branching ratio болон CP asymmetry хэмжилтийн үндсэн ойлголтуудыг авч үзнэ.',
    ],
  },
  {
    name: 'Ц.Гантөмөр (Ph.D)',
    body: [
      'Энэ богино хичээлээр квант механик ба бөөмийн физикийн үндсэн санаануудыг хоёр ба гурван төлөвт энгийн дискрет тоглоомон загваруудаар тайлбарлана. Эхлээд дискрет төлөв, магадлалт хувьсал, Марковын гинжийн санааг товч танилцуулж, дараа нь кубит буюу хоёр төлөвт квант системээр комплекс амплитуд, интерференц, унитар хувьслыг ойлгуулна. Энэ математик хэлийг Штерн–Герлахын туршилт, аммиакийн молекул, каон ба нейтриногийн холилдол зэрэг түүхэн жишээнүүдтэй зэрэгцүүлэн ярьж, оюутнуудад квант онолын суурь ойлголт, бөөмийн нэрс, бөөмийн физикийн энгийн загварчлалын талаар ойлголт өгөхийг зорьно. Цаг гарвал бөөмийн тоо өөрчлөгдөх үзэгдлийг жижиг Фок-төст төлөвийн огторгуйгаар хэрхэн загварчилж болохыг авч үзнэ.',
    ],
  },
]

const TICKET_PRICE_DISPLAY = 70000

// ── Types ─────────────────────────────────────────────────────────────────────

interface Form {
  firstname: string
  lastname: string
  phone_number: string
  email: string
}

const EMPTY_FORM: Form = { firstname: '', lastname: '', phone_number: '', email: '' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function agendaAccentColor(type: string): string {
  switch (type) {
    case 'break':  return '#fbbf24'
    case 'social': return '#a78bfa'
    case 'travel': return '#4ade80'
    case 'info':   return '#6b7280'
    default:       return '#818cf8'
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SummerSchool() {
  const [activeDay, setActiveDay] = useState(0)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  const [invoiceEmail, setInvoiceEmail] = useState('')
  const [invoiceAmount, setInvoiceAmount] = useState(TICKET_PRICE_DISPLAY)
  const [eventId, setEventId] = useState<number | null>(null)
  const [eventLoading, setEventLoading] = useState(true)
  const [eventError, setEventError] = useState(false)

  useEffect(() => {
    getPublicAllEvents().then(events => {
      const ss = events.find(e =>
        e.start_date === '2026-06-29' ||
        e.event_name?.toLowerCase().includes('зуны') ||
        e.event_name?.toLowerCase().includes('summer')
      )
      if (ss) {
        setEventId(ss.id)
        if (ss.ticket_price) setInvoiceAmount(ss.ticket_price)
      } else {
        console.warn('Summer school event not found. Available events:', events.map(e => ({ id: e.id, name: e.event_name, start: e.start_date })))
        setEventError(true)
      }
    }).catch((e) => { console.error('Failed to load events:', e); setEventError(true) })
      .finally(() => setEventLoading(false))
  }, [])

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventId) {
      setError('Арга хэмжээний мэдээлэл олдсонгүй. Дахин оролдоно уу.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await publicEventRegister({ ...form, event_id: eventId })
      if (res.invoice_url) {
        setInvoiceUrl(res.invoice_url)
        setInvoiceEmail(res.email ?? form.email)
        setInvoiceAmount(res.amount ?? TICKET_PRICE_DISPLAY)
      } else {
        setError(res.error ?? 'Бүртгэл амжилтгүй болсон. Дахин оролдоно уу.')
      }
    } catch (err) {
      setError(apiErr(err, 'Бүртгэл амжилтгүй болсон'))
    } finally {
      setLoading(false)
    }
  }

  const dayData = agendaDays[activeDay]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: '#fff' }}>

      {/* ── Hero banner ── */}
      <section style={{ position: 'relative', height: 'clamp(220px, 35vw, 340px)', overflow: 'hidden' }}>
        <img
          src="/banners/summer_school_banner.png"
          alt="Онолын Физикийн Зуны Сургууль 2026"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,8,16,0.88) 0%, rgba(8,8,16,0.5) 65%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--bg) 100%)' }} />
        <div
          className="max-w-[1240px] mx-auto px-6 md:px-12 h-full flex items-center"
          style={{ position: 'relative', zIndex: 1 }}
        >
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, color: '#818cf8', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 'bold' }}>
              Science Development Accelerator - Institute of Physics and Technology
            </div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2.6rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 12, letterSpacing: '-0.02em' }}>
              Онолын Физикийн<br />Зуны Сургууль 2026
            </h1>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              <span>📅 2026.06.29 – 2026.07.02</span>
              <span>📍 Монгол Улсын Их Сургууль, I байр, 301 тоот</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main two-column layout ── */}
      <div className="max-w-[1240px] mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_390px] gap-10 items-start">

          {/* ════════════════════════════════════════
              LEFT PANEL — event info, agenda, speakers
          ════════════════════════════════════════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>

            {/* ── About ── */}
            <section>
              <h2 style={{ fontSize: 18, color: 'white', fontWeight: 'bold', textAlign: 'justify', lineHeight: 1.8, maxWidth: 680, marginBottom: 20 }}>
                Шинжлэх Ухааны Академийн Физик Технологийн Хүрээлэн нь CERN-ийн LHCb хамтын ажиллагаанд хамтрагч гишүүнээр элссэнтэй холбоотойгоор Онолын Физикийн Зуны Сургуулийг 2026 оны 06 сарын 29 -ны өдрөөс 2026  оны  07 сарын 02-ны өдрүүдэд Улаанбаатар хотод зохион байгуулах гэж байна.

                <br />
                <br />

                Зуны сургууль нь өглөө 10:00 цагаас орой 16:00 цагийн хооронд явагдах болно.
                Хэрэв танд тасалбар авахтай холбоотой асуудал гарвал cernmongolia2026@gmail.com хаягаар холбогдоорой.
              </h2>
            </section>

            {/* ── Speakers ── */}
            <section>
              <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)', fontWeight: 700, color: '#fff', marginBottom: 20, lineHeight: 1.3 }}>
                Зуны сургуулийн илтгэгчид
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {speakers.map(s => (
                  <SpeakerCard key={s.slug} speaker={s} noLink />
                ))}
              </div>
            </section>

            {/* ── Agenda ── */}
            <section>
              <h2 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.6rem)', fontWeight: 700, color: '#fff', marginBottom: 20, lineHeight: 1.3 }}>
                Зуны сургуулийн хөтөлбөр
              </h2>
              {/* Lecturer descriptions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {LECTURERS.map((lec, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border-2)',
                      borderLeft: '3px solid #818cf8',
                      borderRadius: 'var(--radius)',
                      padding: '16px 20px',
                    }}
                  >
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 'bold', color: '#fff', marginBottom: 10 }}>
                      {lec.name}
                    </div>
                    {lec.body.map((para, j) => (
                      <p key={j} style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, margin: j < lec.body.length - 1 ? '0 0 10px' : 0, textAlign: 'justify' }}>
                        {para}
                      </p>
                    ))}
                  </div>
                ))}
              </div>

              {/* <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-2)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius)', padding: 4, width: 'fit-content', flexWrap: 'wrap' }}>
                {agendaDays.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDay(i)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: 700,
                      background: activeDay === i ? 'var(--blue)' : 'transparent',
                      color: activeDay === i ? '#fff' : 'rgba(255,255,255,0.45)',
                      transition: 'all 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', opacity: 0.8 }}>
                      {day.date}
                    </span>
                    <span>{day.mn}</span>
                  </button>
                ))}
              </div> */}

              {/* Day note */}
              {/* {dayData?.noteMn && (
                <div style={{ padding: '10px 14px', background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)', borderRadius: 'var(--radius)', fontSize: 13, color: '#818cf8', marginBottom: 14 }}>
                  {dayData.noteMn}
                </div>
              )} */}

              {/* Agenda items */}
              {/* <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {dayData?.items.map((item, i) => {
                  const accent = agendaAccentColor(item.type)
                  const isBreak = item.type === 'break' || item.type === 'info'
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 14,
                        padding: '12px 16px',
                        background: isBreak ? 'rgba(255,255,255,0.02)' : 'var(--bg-2)',
                        border: `1px solid ${isBreak ? 'var(--border)' : 'var(--border-2)'}`,
                        borderLeft: `3px solid ${accent}`,
                        borderRadius: 'var(--radius)',
                        opacity: item.type === 'info' ? 0.6 : 1,
                      }}
                    >
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent, minWidth: 92, flexShrink: 0, paddingTop: 2, lineHeight: 1.4 }}>
                        {item.time}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: isBreak ? 400 : 600, color: isBreak ? 'rgba(255,255,255,0.45)' : '#fff', marginBottom: (item.speakers || item.location) ? 5 : 0 }}>
                          {item.mn || item.en}
                        </div>
                        {item.speakers && (
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                            {item.speakers}
                          </div>
                        )}
                        {item.location && (
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', marginTop: item.speakers ? 3 : 0 }}>
                            📍 {item.location}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div> */}
            </section>
          </div>

          {/* ════════════════════════════════════════
              RIGHT PANEL — ticket + registration form
          ════════════════════════════════════════ */}
          <div className="lg:sticky lg:top-[88px]">
            <div
              style={{
                background: 'var(--bg-2)',
                border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              }}
            >
              {/* ── Ticket header ── */}
              <div
                style={{
                  position: 'relative',
                  padding: '24px 24px 20px',
                  background: 'linear-gradient(135deg,#1a1a3a 0%,#0e0e22 100%)',
                  borderBottom: '1px solid var(--border-2)',
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#5260d9,#7c3aed)' }} />
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3, textAlign: 'center' }}>
                  Зуны сургуульд оролцох
                  Хэрэв танд тасалбар авахтай холбоотой асуудал гарвал cernmongolia2026@gmail.com хаягаар холбогдоорой.
                </h3>
                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center'}}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em'}}>
                    {invoiceAmount.toLocaleString()}₮
                  </span>
                </div>
              </div>

              {/* ── Registration form OR payment section ── */}
              <div style={{ padding: '20px 24px' }}>
                {!invoiceUrl ? (
                  /* ── Registration form ── */
                  eventLoading ? (
                    <div style={{ padding: '32px 0', display: 'flex', justifyContent: 'center' }}>
                      <Spinner size={28} />
                    </div>
                  ) : eventError ? (
                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>⚠️</div>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, margin: '0 0 14px' }}>
                        Серверт холбогдоход алдаа гарлаа.<br />Хуудсыг дахин ачааллана уу.
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        style={{ padding: '8px 20px', background: 'var(--blue)', border: 'none', borderRadius: 'var(--radius)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Дахин оролдох
                      </button>
                    </div>
                  ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                      Бүртгэлийн мэдээлэл
                    </div>

                    {/* First + last name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {([
                        { key: 'firstname' as const, label: 'Нэр', ph: 'Бат' },
                        { key: 'lastname'  as const, label: 'Овог', ph: 'Болд' },
                      ] as const).map(f => (
                        <div key={f.key}>
                          <label style={labelStyle}>{f.label}</label>
                          <input
                            required
                            type="text"
                            placeholder={f.ph}
                            value={form[f.key]}
                            onChange={set(f.key)}
                            style={inputStyle}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Phone */}
                    <div>
                      <label style={labelStyle}>Утасны дугаар</label>
                      <input
                        required
                        type="tel"
                        placeholder="9911 8811"
                        value={form.phone_number}
                        onChange={set('phone_number')}
                        style={inputStyle}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label style={labelStyle}>И-мэйл хаяг</label>
                      <input
                        required
                        type="email"
                        placeholder="example@email.com"
                        value={form.email}
                        onChange={set('email')}
                        style={inputStyle}
                      />
                    </div>

                    {/* Error */}
                    {error && (
                      <div style={{ padding: '10px 12px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius)', fontSize: 13, color: '#f87171' }}>
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !eventId}
                      style={{
                        marginTop: 4,
                        padding: '12px',
                        background: (loading || !eventId) ? 'var(--bg-3)' : 'linear-gradient(135deg,#1d4ed8,#2563eb)',
                        border: `1px solid ${(loading || !eventId) ? 'var(--border)' : 'rgba(56,189,248,0.3)'}`,
                        borderRadius: 'var(--radius)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: (loading || !eventId) ? 'not-allowed' : 'pointer',
                        width: '100%',
                        opacity: (loading || !eventId) ? 0.6 : 1,
                        transition: 'all 0.15s',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {loading ? 'Боловсруулж байна...' : 'Төлбөр төлөх'}
                    </button>

                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                      Төлбөр хийсний дараа тасалбар таны и-мэйл рүү илгээгдэнэ
                    </p>
                  </form>
                  )
                ) : (
                  /* ── Payment ready state ── */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#4ade80', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 }}>
                        Төлбөрийн линк бэлэн боллоо
                      </div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                        Төлбөр хийхэд бэлэн
                      </h4>
                      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: 0 }}>
                        Тасалбар{' '}
                        <span style={{ color: '#818cf8', fontFamily: 'var(--font-mono)' }}>{invoiceEmail}</span>
                        {' '}рүү төлбөр хийсний дараа автоматаар илгээгдэнэ.
                      </p>
                    </div>

                    <a
                      href={invoiceUrl!}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        padding: '13px',
                        background: 'linear-gradient(135deg,#15803d,#16a34a)',
                        border: '1px solid rgba(74,222,128,0.3)',
                        borderRadius: 'var(--radius)',
                        color: '#fff',
                        fontSize: 15,
                        fontWeight: 700,
                        textDecoration: 'none',
                        letterSpacing: '0.02em',
                      }}
                    >
                      Төлбөр хийх · ₮{invoiceAmount.toLocaleString()}
                    </a>

                    <button
                      onClick={() => { setInvoiceUrl(null); setError(null) }}
                      style={{ padding: '9px', background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer' }}
                    >
                      ← Буцах
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>


    </div>
  )
}

// ── Shared input styles ────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  color: 'rgba(255,255,255,0.4)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.08em',
  marginBottom: 5,
  textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 11px',
  background: 'var(--bg-3)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius)',
  color: '#fff',
  fontSize: 13,
  fontFamily: 'var(--font-mono)',
  outline: 'none',
}
