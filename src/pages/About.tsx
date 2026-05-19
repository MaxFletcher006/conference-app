import { partners } from '@/data/organizations'

const keyOrgs = partners.filter((p) => p.role === 'Organizer' || p.role === 'Venue Partner')

const boardMembers = [
  { name: 'Dolguun U.',       role: 'Board Chairman',     photo: '/speakers/dolguun.png',      initials: 'DU' },
  { name: 'Erkhembayar M.',   role: 'Executive Director', photo: '/speakers/erkhembayar.png',  initials: 'EM' },
  { name: 'Baasansuren B.',   role: 'Board Member',       photo: '/speakers/baasansuren1.png', initials: 'BB' },
  { name: 'Enkhbat Ts.',      role: 'Board Member',       photo: '/speakers/enkhbat.png',      initials: 'ET' },
  { name: 'Dorjpalam A.',     role: 'Board Member',       photo: '/speakers/dorjpalam.png',    initials: 'DA' },
]

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Header */}
      <section style={{ background: 'var(--bg-2)', padding: '96px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-12">
          <span style={{
            display: 'block', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 10,
          }}>
            Who We Are
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#ffffff', marginBottom: 16, maxWidth: 700 }}>
            Dedicated to Scientific Excellence in Mongolia
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 680 }}>
            The Mongolia - CERN LHCb 2026 conference is organized by a coalition of non-governmental and academic institutions committed to advancing high-energy physics research.
          </p>
        </div>
      </section>

      {/* Organizations */}
      <section style={{ padding: '96px 0', background: 'var(--bg)' }}>
        <div className="max-w-[1240px] mx-auto px-6 md:px-12">
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 48 }}>Organizing Institutions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {keyOrgs.map((org) => (
              <div key={org.name} style={{
                padding: '32px 28px', borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s',
              }}>
                <div style={{
                  height: 64, width: '100%', marginBottom: 24,
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 14px',
                }}>
                  <img
                    src={org.logo}
                    alt={org.name}
                    style={{ height: '100%', maxWidth: '100%', objectFit: 'contain', objectPosition: 'left' }}
                  />
                </div>
                <span style={{
                  display: 'inline-block', fontFamily: 'var(--font-mono)',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--blue)', marginBottom: 8,
                }}>
                  {org.role}
                </span>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', marginBottom: 12 }}>{org.name}</h3>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, flex: 1, marginBottom: 16 }}>{org.desc_en}</p>
                {org.url !== '#' && (
                  <a
                    href={org.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: 'var(--blue)', fontWeight: 700, fontSize: 14 }}
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board */}
      <section style={{ padding: '96px 0', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div className="grid-bg" />
        <div className="nebula nebula-1" />
        <div className="max-w-[1240px] mx-auto px-6 md:px-12" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64, maxWidth: 560, margin: '0 auto 64px' }}>
            <span style={{
              display: 'block', fontFamily: 'var(--font-mono)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 10,
            }}>
              Science Development Accelerator NGO
            </span>
            <h2 style={{ fontSize: 34, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>Board of Directors</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
              The board and executive team driving Science Development Accelerator NGO's mission to advance science in Mongolia.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 32 }}>
            {boardMembers.map((member) => (
              <div key={member.name} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 144, height: 144, margin: '0 auto 20px',
                  borderRadius: 24, background: 'var(--bg-3)',
                  border: '1px solid var(--border-2)', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 36, fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>{member.initials}</span>
                  )}
                </div>
                <p style={{ fontWeight: 700, fontSize: 15, color: '#ffffff' }}>{member.name}</p>
                <p style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--blue)',
                  marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700,
                }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
