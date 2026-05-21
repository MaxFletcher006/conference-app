import { useParams, Link } from 'react-router-dom'
import { speakers } from '@/data/speakers'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'

export default function SpeakerDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { lang } = useLang()
  const t = pub[lang]
  const speaker = speakers.find((s) => s.slug === slug)

  if (!speaker) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>{t.speakerNotFound}</p>
        <Link to="/speakers" style={{ color: 'var(--blue-text)', fontWeight: 600, fontSize: 15 }}>{t.speakerBackBtn}</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 0' }}>
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <Link to="/speakers" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.55)', fontSize: 15, fontWeight: 500, marginBottom: 40, transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--blue-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
        >
          <ArrowLeft size={16} />
          {t.speakerBackBtn}
        </Link>

        <div style={{
          background: 'var(--bg-2)', borderRadius: 24,
          border: '1px solid var(--border-2)', padding: '40px 48px',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* Top: photo + info */}
            <div style={{ display: 'flex', gap: 36, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{
                width: 160, height: 160, flexShrink: 0, borderRadius: 20,
                background: 'var(--bg-3)', border: '1px solid var(--border-2)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {speaker.photo ? (
                  <img src={speaker.photo} alt={speaker.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: speaker.photoZoom ? `scale(${speaker.photoZoom})` : undefined }} />
                ) : (
                  <span style={{ fontSize: 48, fontWeight: 700, color: 'var(--blue-text)' }}>{speaker.initials}</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                  <h1 style={{ fontSize: 26, fontWeight: 700, color: '#ffffff' }}>{speaker.name}</h1>
                  <span style={{ fontSize: 28 }}>{speaker.flag}</span>
                </div>
                <p style={{ color: 'var(--blue-text)', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>{speaker.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontSize: 15, marginBottom: 4 }}>{speaker.institution}</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>{speaker.country}</p>

                <div style={{ marginBottom: 20 }}>
                  <h3 style={{
                    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    color: 'var(--text-3)', marginBottom: 6,
                  }}>{t.speakerSpecialty}</h3>
                  <p style={{ color: '#ffffff', fontWeight: 500, fontSize: 15 }}>{speaker.specialty}</p>
                </div>

                {speaker.links && speaker.links.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {speaker.links.map((link) => (
                      <a
                        key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          fontSize: 13, fontWeight: 700, color: 'var(--blue-text)',
                          background: 'var(--blue-dim)', border: '1px solid rgba(74,144,248,0.25)',
                          padding: '5px 12px', borderRadius: 8, transition: 'opacity 0.2s',
                        }}
                      >
                        {link.type === 'web'    && t.speakerLinkWeb}
                        {link.type === 'orcid'  && t.speakerLinkOrcid}
                        {link.type === 'scholar' && t.speakerLinkScholar}
                        <ExternalLink size={12} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 32 }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>{t.speakerBioTitle}</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontSize: 16 }}>
                {lang === 'mn' ? speaker.bio_mn : speaker.bio_en}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
