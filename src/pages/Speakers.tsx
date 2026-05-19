import { SpeakerCard } from '@/components/ui/SpeakerCard'
import { speakers } from '@/data/speakers'

const professors = speakers.filter((s) => s.title === 'Professor')
const researchers = speakers.filter((s) => s.title !== 'Professor')

const statItems = [
  { value: '16', label: 'Total Speakers' },
  { value: '9',  label: 'Countries' },
  { value: '8',  label: 'Professors' },
  { value: '7',  label: 'Researchers' },
]

export default function Speakers() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '80px 0' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <span style={{
            display: 'block', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 10,
          }}>
            Global Expertise
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
            Our Distinguished Speakers
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 620, marginBottom: 32 }}>
            Meet the leading scientists and researchers from CERN and partner institutions who will be sharing their insights during LHCb 2026.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {statItems.map((stat) => (
              <div key={stat.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 20px',
                background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                borderRadius: 'var(--radius)',
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{stat.value}</span>
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
            Professors
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
            Researchers
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {researchers.map((speaker) => <SpeakerCard key={speaker.slug} speaker={speaker} />)}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          padding: '48px 40px', textAlign: 'center',
          background: 'var(--bg-2)', border: '1px solid var(--border-2)',
          borderRadius: 24,
        }}>
          <h3 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>Want to Join as a Speaker?</h3>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 28px', lineHeight: 1.7 }}>
            The student poster session is still open for submissions. Show your research to the global HEP community.
          </p>
          <button style={{
            background: 'var(--blue)', color: '#ffffff',
            padding: '12px 36px', borderRadius: 12, border: 'none',
            fontWeight: 700, fontSize: 15, cursor: 'pointer', transition: 'opacity 0.2s',
          }}>
            Submit Poster Abstract
          </button>
        </div>

      </div>
    </div>
  )
}
