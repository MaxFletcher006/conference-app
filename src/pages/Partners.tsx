import { Link } from 'react-router-dom'
import { partners } from '@/data/organizations'
import { ExternalLink } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'

export default function Partners() {
  const { lang } = useLang()
  const t = pub[lang]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 0' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <span style={{
            display: 'block', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--blue-text)', marginBottom: 10,
          }}>
            {t.partnersEyebrow}
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
            {t.partnersPageTitle}
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 600, margin: '0 auto' }}>
            {t.partnersPageDesc}
          </p>
        </div>

        {/* Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>
          {t.partnersGroups.map((group) => {
            const items = partners.filter((p) => p.role === group.role)
            if (items.length === 0) return null
            return (
              <div key={group.role}>
                <h2 style={{
                  fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 32,
                  paddingBottom: 14, borderBottom: '1px solid var(--border)',
                }}>
                  {group.title}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
                  {items.map((item) => (
                    <div key={item.name} style={{
                      padding: '28px 24px',
                      background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                      borderRadius: 'var(--radius-lg)', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(74,144,248,0.4)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-2)')}
                    >
                      <div style={{
                        height: item.name === 'Ulaanbaatar Hotel' ? 96 : 72,
                        width: '100%', marginBottom: 24,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#ffffff', borderRadius: 8, padding: '10px 14px',
                        overflow: 'hidden',
                      }}>
                        <img
                          src={item.logo}
                          alt={item.name}
                          style={{
                            height: '100%', maxWidth: '100%',
                            objectFit: 'contain', objectPosition: 'center',
                          }}
                        />
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginBottom: 12, transition: 'color 0.2s' }}>{item.name}</h3>
                      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, marginBottom: 20 }}>
                        {lang === 'mn' ? item.desc_mn : item.desc_en}
                      </p>
                      {item.url !== '#' && (
                        <a
                          href={item.url} target="_blank" rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            fontSize: 13, fontWeight: 700,
                            color: 'rgba(255,255,255,0.55)',
                            border: '1px solid var(--border-2)',
                            padding: '5px 12px', borderRadius: 8, transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--blue-text)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(74,144,248,0.4)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)' }}
                        >
                          {t.partnersVisitSite}
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 96, padding: '56px 48px', textAlign: 'center',
          background: 'var(--bg-2)', borderRadius: 32,
          border: '1px solid var(--border-2)', position: 'relative', overflow: 'hidden',
        }}>
          <div className="grid-bg" />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto' }}>
            <h3 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>{t.partnersCTATitle}</h3>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.55)', marginBottom: 36, lineHeight: 1.75 }}>
              {t.partnersCTADesc}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
              <Link to="/contact" style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'var(--blue)', color: '#ffffff',
                fontWeight: 700, fontSize: 15, height: 52, padding: '0 36px',
                borderRadius: 12, transition: 'opacity 0.2s',
              }}>
                {t.partnersBecomeBtn}
              </Link>
              <Link to="/contact" style={{
                display: 'inline-flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.07)', color: '#ffffff',
                fontWeight: 600, fontSize: 15, height: 52, padding: '0 36px',
                borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)',
                transition: 'background 0.2s',
              }}>
                {t.partnersContactBtn}
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
