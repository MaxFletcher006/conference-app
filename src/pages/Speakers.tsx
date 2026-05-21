import { SpeakerCard } from '@/components/ui/SpeakerCard'
import { speakers } from '@/data/speakers'
import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'

const professors = speakers.filter((s) => s.title === 'Professor')
const researchers = speakers.filter((s) => s.title !== 'Professor')

export default function Speakers() {
  const { lang } = useLang()
  const t = pub[lang]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 0' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <span style={{
            display: 'block', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--blue-text)', marginBottom: 10,
          }}>
            {t.speakersEyebrow}
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
            {t.speakersTitle}
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 620, marginBottom: 32 }}>
            {t.speakersDesc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {t.speakerStats.map((stat) => (
              <div key={stat.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 20px',
                background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius)',
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue-text)' }}>{stat.value}</span>
                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Professors */}
        <div style={{ marginBottom: 56 }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-3)', marginBottom: 20,
            paddingBottom: 12, borderBottom: '1px solid var(--border)',
          }}>
            {t.speakersProfTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {professors.map((speaker) => <SpeakerCard key={speaker.slug} speaker={speaker} />)}
          </div>
        </div>

        {/* Researchers */}
        <div style={{ marginBottom: 64 }}>
          <h3 style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-3)', marginBottom: 20,
            paddingBottom: 12, borderBottom: '1px solid var(--border)',
          }}>
            {t.speakersResTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {researchers.map((speaker) => <SpeakerCard key={speaker.slug} speaker={speaker} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
