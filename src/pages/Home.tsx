import { Link } from 'react-router-dom'
import { CountdownTimer } from '@/components/ui/CountdownTimer'
import { partners } from '@/data/organizations'
import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'
import { HomeAgendaSection } from '@/components/HomeAgendaSection'

export default function Home() {
  const { lang } = useLang()
  const t = pub[lang]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Conference Banner ── */}
      <section style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <img
          src="/banners/conf_banner_template.png"
          alt="Mongolia - CERN LHCb 2026 Conference"
          style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 750, objectPosition: 'center bottom' }}
        />
        {/* Left-to-right dark gradient for text readability */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to right, rgba(8,8,16,0.82) 0%, rgba(8,8,16,0.5) 55%, transparent 100%)',
        }} />
        {/* Bottom fade into page */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'linear-gradient(to bottom, transparent 55%, var(--bg) 100%)',
        }} />

        {/* Text + button overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
          <div className="max-w-[1240px] mx-auto px-6 md:px-12" style={{ width: '100%' }}>
          <div style={{ maxWidth: 580 }}>
            <span style={{
              display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase', color: '#a5b0ff', marginBottom: 18,
            }}>
              {t.bannerEyebrow}
            </span>
            <h1 style={{
              fontSize: 'clamp(1.9rem, 4.8vw, 3.6rem)', fontWeight: 800,
              color: '#ffffff', lineHeight: 1.1, marginBottom: 18, letterSpacing: '-0.02em',
              whiteSpace: 'pre-line',
            }}>
              {t.eventTitle}
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginBottom: 36, lineHeight: 1.6 }}>
              {t.eventDetails[1].text}&nbsp;·&nbsp;{t.eventDetails[0].text}
            </p>
            <Link to="/register">
              <button
                style={{
                  height: 52, padding: '0 36px', fontSize: 15, fontWeight: 700,
                  background: '#5260d9', color: '#ffffff', border: 'none',
                  borderRadius: 12, cursor: 'pointer', transition: 'opacity 0.2s',
                }}
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
      <section style={{
        position: 'relative', height: '85vh', minHeight: 600,
        display: 'flex', alignItems: 'center', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.75 }}>
          <img src="/speakers/cernTrip2.webp" alt="CERN LHCb" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 95%' }} />
        </div>
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: 'linear-gradient(to top, var(--bg) 0%, rgba(8,8,16,0.75) 50%, transparent 100%)',
        }} />
        <div className="nebula nebula-1" />
        <div className="nebula nebula-2" />

        <div className="max-w-[1240px] mx-auto px-6 md:px-12" style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ maxWidth: 700 }}>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 4.2rem)', fontWeight: 800,
              letterSpacing: '-0.025em', color: '#ffffff', lineHeight: 1.1, marginBottom: 24,
              whiteSpace: 'pre-line',
            }}>
              {t.heroTitle}
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.65)', marginBottom: 40, lineHeight: 1.75, maxWidth: 600 }}>
              {t.heroDesc}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <a href="#event">
                <button
                  style={{ height: 56, padding: '0 32px', fontSize: 16, fontWeight: 700, background: 'var(--blue)', color: '#ffffff', border: 'none', borderRadius: 12, cursor: 'pointer', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {t.exploreBtn}
                </button>
              </a>
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

      {/* ── Event Details ── */}
      <section id="event" style={{ padding: '96px 0', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48, alignItems: 'stretch' }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: '#ffffff', marginBottom: 18 }}>{t.eventTitle}</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, marginBottom: 32 }}>{t.eventDesc}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {t.eventDetails.map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: 'var(--blue-dim)', border: '1px solid rgba(74,144,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#ffffff' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--bg-3)', borderRadius: 24, padding: '48px 40px', border: '1px solid var(--border-2)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, right: 0, padding: 28, opacity: 0.05, pointerEvents: 'none', userSelect: 'none' }}>
              <span style={{ fontSize: 120, fontWeight: 800, color: '#ffffff' }}>26</span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue-text)', marginBottom: 12 }}>
              {t.regSoon}
            </p>
            <h3 style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', marginBottom: 28 }}>{t.countdown}</h3>
            <CountdownTimer />
            <Link to="/register" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: 56, marginTop: 16, background: 'var(--blue)', color: '#ffffff', fontWeight: 700, fontSize: 16, borderRadius: 12, transition: 'opacity 0.2s' }}>
              {t.registerBtn}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Agenda ── */}
      <HomeAgendaSection />

      {/* ── Partners ── */}
      <section style={{ padding: '64px 0', background: 'var(--bg)' }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-12">
          <p style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 48 }}>
            {t.partnersLabel}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 24 }}>
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.url !== '#' ? p.url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                style={{ height: 56, width: 130, opacity: 0.6, transition: 'opacity 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', borderRadius: 8, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
              >
                <img src={p.logo} alt={p.name} style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </a>
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
