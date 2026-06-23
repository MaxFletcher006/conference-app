import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'
import { getPublicAllEvents, Event } from '@/api/client'

export default function Home() {
  const { lang } = useLang()
  const t = pub[lang]

  const [events, setEvents] = useState<Event[]>([])
  useEffect(() => {
    getPublicAllEvents().then(setEvents).catch(() => {})
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Conference Banner ── */}
      <section className="min-h-[300px] sm:min-h-[420px] md:min-h-[560px] lg:min-h-[680px]" style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <img
          src="/banners/summer_school_banner.png"
          alt="ОНОЛЫН ФИЗИКИЙН ЗУНЫ СУРГУУЛЬ 2026"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center bottom' }}
        />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'rgba(8,8,16,0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to right, rgba(8,8,16,0.75) 0%, rgba(8,8,16,0.4) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(to bottom, transparent 50%, var(--bg) 100%)' }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-12 w-full">
            <div style={{ maxWidth: 580 }}>
              <h1 style={{ fontSize: 'clamp(1.45rem, 4.8vw, 3.6rem)', fontWeight: 'bold', color: '#ffffff', lineHeight: 1.15, marginBottom: 'clamp(8px, 2vw, 18px)', letterSpacing: '-0.02em', whiteSpace: 'pre-line' }}>
                ОНОЛЫН ФИЗИКИЙН ЗУНЫ СУРГУУЛЬ 2026
              </h1>
              <p className="hidden sm:block" style={{ fontSize: 20, color: 'rgba(255,255,255,0.65)', marginBottom: 'clamp(16px, 3vw, 36px)', lineHeight: 1.6 }}>
                Шинжлэх Ухааны Академийн Физик Технологийн Хүрээлэн Европын Цөмийн Судалгааны Байгууллага (CERN)-ийн LHCb Хамтын ажиллагаанд хамтрагч гишүүнээр элссэнтэй холбоотойгоор Онолын физикийн зуны сургууль 2026 оны 6 сарын 29-нөөс 2026 оны 7 сарын 2-ны өдрүүдэд зохион байгуулагдах гэж байна. 
              </p>
              <Link to="/register" className="block sm:inline-block">
                <button
                  className="w-full sm:w-auto"
                  style={{ height: 'clamp(42px, 6vw, 52px)', padding: '0 clamp(20px, 4vw, 36px)', fontSize: 15, fontWeight: 700, background: '#5260d9', color: '#ffffff', border: 'none', borderRadius: 12, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {t.registerBtn}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', minHeight: 'max(85vh, 600px)', padding: 'clamp(72px, 10vh, 140px) 0', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.75 }}>
          <img src="/speakers/cernTrip2.webp" alt="CERN LHCb" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 95%' }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'linear-gradient(to top, var(--bg) 0%, rgba(8,8,16,0.75) 50%, transparent 100%)' }} />
        <div className="nebula nebula-1" />
        <div className="nebula nebula-2" />

        <div className="max-w-[1240px] mx-auto px-6 md:px-12" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: 700 }}>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff', lineHeight: 1.1, marginBottom: 24, whiteSpace: 'pre-line' }}>
              {t.heroTitle}
            </h1>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', marginBottom: 40, lineHeight: 1.75, maxWidth: 600 }}>
              {t.heroDesc}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <Link to="/about">
                <button
                  style={{ height: 56, padding: '0 32px', fontSize: 16, fontWeight: 600, background: 'rgba(255,255,255,0.07)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                >
                  {t.aboutBtn}
                </button>
              </Link>
            </div>
            <p style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 48 }}>{t.heroCaption}</p>
          </div>
        </div>
      </section>

      {/* ── Events ── */}
      <section id="events" style={{ padding: '80px 0', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-12">
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 700, color: '#ffffff', marginBottom: 40, lineHeight: 1.25, textAlign: 'center' }}>
            {lang === 'mn' ? 'Арга хэмжээнүүд' : 'Events & Conferences'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {events.map(ev => (
              <div
                key={ev.id}
                style={{ background: 'var(--bg-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--radius-xl)', padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', overflow: 'hidden', opacity: ev.is_active ? 1 : 0.55 }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: ev.is_active ? 'linear-gradient(90deg, #5260d9, #7c3aed)' : 'rgba(255,255,255,0.08)', borderRadius: '4px 4px 0 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: ev.is_active ? 'var(--blue-text)' : 'var(--text-3)' }}>
                    {ev.event_name}
                  </span>
                  {!ev.is_active && (
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-3)', letterSpacing: '0.06em' }}>
                      {lang === 'mn' ? 'ДУУССАН' : 'ENDED'}
                    </span>
                  )}
                </div>
                {ev.description && (
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, margin: 0, flex: 1 }}>
                    {ev.description}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                  <span>📅 {ev.start_date}{ev.end_date !== ev.start_date ? ` — ${ev.end_date}` : ''}</span>
                  <span>🎫 ₮{ev.ticket_price.toLocaleString()}</span>
                </div>
                {ev.is_active && (
                  <Link
                    to="/register"
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 44, padding: '0 24px', background: 'var(--blue)', color: '#ffffff', fontWeight: 700, fontSize: 14, borderRadius: 10, textDecoration: 'none', transition: 'opacity 0.2s', width: 'fit-content' }}
                    onMouseEnter={(e: any) => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={(e: any) => (e.currentTarget.style.opacity = '1')}
                  >
                    {lang === 'mn' ? 'Бүртгүүлэх' : 'Register Now'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ padding: '96px 0', background: 'var(--bg)' }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 64, alignItems: 'center' }}>
          <div>
            <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue-text)', marginBottom: 10 }}>
              {t.missionEyebrow}
            </span>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.25rem)', fontWeight: 700, color: '#ffffff', marginBottom: 16, lineHeight: 1.25 }}>
              {t.missionTitle}
            </h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 28 }}>
              {t.missionLead}
            </p>
            <Link to="/about" style={{ color: 'var(--blue-text)', fontWeight: 700, fontSize: 15 }}>
              {t.missionLink}
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            {t.cards.map((card) => (
              <div key={card.title} style={{ padding: '24px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-2)', border: '1px solid var(--border-2)', transition: 'border-color 0.2s' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{card.icon}</span>
                <h4 style={{ fontWeight: 700, color: '#ffffff', marginBottom: 8, fontSize: 16 }}>{card.title}</h4>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '120px 0', textAlign: 'center', background: 'var(--bg-2)', position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
        <div className="grid-bg" />
        <div className="nebula" style={{ width: 500, height: 500, top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(74,144,248,0.06) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, color: '#ffffff', marginBottom: 20, lineHeight: 1.2 }}>
            {t.ctaTitle}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 18, marginBottom: 48, lineHeight: 1.75 }}>
            {t.ctaDesc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 20 }}>
            <Link to="/contact">
              <button style={{ height: 56, padding: '0 40px', fontSize: 16, fontWeight: 700, background: 'var(--blue)', color: '#ffffff', border: 'none', borderRadius: 12, cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {t.sponsorBtn}
              </button>
            </Link>
            <Link to="/contact">
              <button style={{ height: 56, padding: '0 40px', fontSize: 16, fontWeight: 600, background: 'rgba(255,255,255,0.07)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
              >
                {t.contactBtn}
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
