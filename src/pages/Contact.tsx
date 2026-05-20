import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Mail, Globe, MapPin, Send } from 'lucide-react'

const infoCards = [
  {
    icon: <Mail size={20} />,
    title: 'Email Us',
    lines: ['erkhembayar@sciencedev.edu.mn', 'bgbaacka@gmail.com'],
  },
  {
    icon: <Globe size={20} />,
    title: 'Phone',
    lines: ['+976 9811 5512, 9960 2999', 'Mon–Fri, 9am–6pm (ULAT)'],
  },
  {
    icon: <MapPin size={20} />,
    title: 'Office',
    lines: ['Naran Khotkhon 21v-2, Peace Avenue, 1st Khoroo, Khan-Uul District, Ulaanbaatar', 'Postal Code: 17030'],
  },
]

export default function Contact() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '96px 0' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <span style={{
            display: 'block', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'var(--blue)', marginBottom: 10,
          }}>
            Get in Touch
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 700, color: '#ffffff', marginBottom: 14 }}>
            Contact Organizing Committee
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 540 }}>
            Have questions about registration, sponsorship, or the scientific program? Our team is here to help.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 36, alignItems: 'start' }}>

          {/* Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {infoCards.map((card) => (
              <div key={card.title} style={{
                padding: '20px 22px', borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-2)', border: '1px solid var(--border-2)',
                display: 'flex', gap: 16, alignItems: 'flex-start',
              }}>
                <div style={{
                  width: 42, height: 42, flexShrink: 0,
                  borderRadius: 10, background: 'var(--blue-dim)',
                  border: '1px solid rgba(129,140,248,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--blue)',
                }}>
                  {card.icon}
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, color: '#ffffff', fontSize: 15, marginBottom: 4 }}>{card.title}</h4>
                  {card.lines.map((line, i) => (
                    <p key={i} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.6 }}>{line}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div style={{
            background: 'var(--bg-2)', borderRadius: 24,
            padding: '40px 48px', border: '1px solid var(--border-2)',
          }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 28 }}>Send a Message</h3>
            <form style={{ display: 'flex', flexDirection: 'column', gap: 20 }} onSubmit={(e) => e.preventDefault()}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8 }}>Full Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8 }}>Email Address</label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8 }}>Subject</label>
                <Input placeholder="Inquiry about Sponsorship" />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', marginBottom: 8 }}>Message</label>
                <Textarea placeholder="How can we help you?" style={{ minHeight: 160 }} />
              </div>
              <button type="submit" style={{
                width: '100%', height: 56,
                background: 'var(--blue)', color: '#ffffff',
                fontWeight: 700, fontSize: 16, border: 'none',
                borderRadius: 12, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                transition: 'opacity 0.2s',
              }}>
                <Send size={18} />
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  )
}
