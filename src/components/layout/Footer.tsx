import { Link } from 'react-router-dom'
import { partners } from '@/data/organizations'
import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'

export function Footer() {
  const { lang } = useLang()
  const t = pub[lang]

  const links = [
    { href: '/about',    label: t.nav.about },
    { href: '/speakers', label: t.nav.speakers },
    { href: '/contact',  label: t.nav.contact },
  ]

  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)' }}>
      <div className="max-w-[1240px] mx-auto" style={{ padding: '64px 20px' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, marginBottom: 56 }}>

          {/* Brand */}
          <div className="footer-brand" style={{ gridColumn: 'span 2' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, textDecoration: 'none' }}>
              <div style={{ height: 48, width: 48, flexShrink: 0 }}>
                <img src="/logos/SDAlogo.svg" alt="Science Development Accelerator" style={{ height: '100%', width: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: '#ffffff', textTransform: 'uppercase' }}>Science Development</span>
                <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em', color: '#ffffff', textTransform: 'uppercase' }}>Accelerator</span>
              </div>
            </Link>
            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 340, marginBottom: 0, lineHeight: 1.75, fontSize: 15 }}>
              {t.footerDesc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffffff', marginBottom: 20 }}>{t.quickLinks}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((link) => (
                <Link key={link.href} to={link.href} style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--blue)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#ffffff', marginBottom: 20 }}>{t.contactLabel}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <a href="mailto:erkhembayar@sciencedev.edu.mn" style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textDecoration: 'none', wordBreak: 'break-all' }}>
                erkhembayar@sciencedev.edu.mn
              </a>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                Naran Khotkhon 21v-2, Peace Avenue, 1st Khoroo, Khan-Uul District, Ulaanbaatar
              </p>
              <p style={{ fontWeight: 700, color: '#ffffff', fontSize: 15 }}>+976 9811 5512, 9960 2999</p>
            </div>
          </div>
        </div>

        {/* Partners bar */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 48 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)', marginBottom: 40, textAlign: 'center' }}>
            {t.organizers}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: 20, marginBottom: 48 }}>
            {partners.map((p) => (
              <a
                key={p.name}
                href={p.url !== '#' ? p.url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  height: 56, width: 140, opacity: 0.55, transition: 'opacity 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 12px',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0.55')}
              >
                <img
                  src={p.logo}
                  alt={p.name}
                  style={{ height: '100%', width: '100%', objectFit: 'contain' }}
                />
              </a>
            ))}
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
