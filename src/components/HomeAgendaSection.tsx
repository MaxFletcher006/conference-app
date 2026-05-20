import { useState } from 'react'
import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'
import { agendaDays } from '@/data/agenda'
import type { AgendaItemType } from '@/data/agenda'

const TYPE_STYLES: Record<AgendaItemType, { dot: string; badge: string; label: { en: string; mn: string } }> = {
  session: { dot: 'var(--blue)',   badge: 'rgba(129,140,248,0.12)', label: { en: 'Session',  mn: 'Хэлэлцүүлэг' } },
  break:   { dot: '#94a3b8',       badge: 'rgba(148,163,184,0.1)',  label: { en: 'Break',    mn: 'Завсарлага'   } },
  social:  { dot: '#f59e0b',       badge: 'rgba(245,158,11,0.12)',  label: { en: 'Social',   mn: 'Нийгмийн'    } },
  travel:  { dot: '#34d399',       badge: 'rgba(52,211,153,0.12)',  label: { en: 'Travel',   mn: 'Аялал'       } },
  info:    { dot: 'rgba(255,255,255,0.4)', badge: 'rgba(255,255,255,0.06)', label: { en: 'Info', mn: 'Мэдээлэл' } },
}

export function HomeAgendaSection() {
  const { lang } = useLang()
  const t = pub[lang]
  const [activeIdx, setActiveIdx] = useState(0)
  const day = agendaDays[activeIdx]

  return (
    <section id="agenda" style={{ padding: '96px 0', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1240px] mx-auto px-6 md:px-12">

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span style={{
            display: 'inline-block', fontFamily: 'var(--font-mono)',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--blue)', marginBottom: 12,
            padding: '4px 14px', background: 'var(--blue-dim)',
            borderRadius: 100, border: '1px solid rgba(129,140,248,0.25)',
          }}>
            {t.agendaEyebrow}
          </span>
          <h2 style={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, color: '#ffffff', marginBottom: 10, lineHeight: 1.2 }}>
            {t.agendaTitle}
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
            {t.agendaLead}
          </p>
        </div>

        {/* Day tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 40 }}>
          {agendaDays.map((d, i) => {
            const isActive = i === activeIdx
            return (
              <button
                key={d.date}
                onClick={() => setActiveIdx(i)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '10px 18px', borderRadius: 12, cursor: 'pointer',
                  border: isActive ? '1px solid rgba(129,140,248,0.5)' : '1px solid var(--border)',
                  background: isActive ? 'var(--blue-dim)' : 'var(--bg-2)',
                  transition: 'all 0.15s',
                  minWidth: 72,
                }}
              >
                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: isActive ? 'var(--blue)' : 'var(--text-3)', marginBottom: 2 }}>
                  {d.date}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#ffffff' : 'var(--text-2)' }}>
                  {lang === 'en' ? d.en : d.mn}
                </span>
              </button>
            )
          })}
        </div>

        {/* Day card */}
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>

          {/* Day header */}
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              background: 'var(--blue-dim)', border: '1px solid rgba(129,140,248,0.3)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--blue)', fontWeight: 700, letterSpacing: '0.05em' }}>2026</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>{day.date}</span>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                {lang === 'en' ? day.en : day.mn}
              </div>
              {(lang === 'en' ? day.noteEn : day.noteMn) && (
                <div style={{ fontSize: 13, color: 'var(--blue)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  {lang === 'en' ? day.noteEn : day.noteMn}
                </div>
              )}
            </div>
          </div>

          {/* Timeline items */}
          <div style={{ padding: '8px 0' }}>
            {day.items.map((item, i) => {
              const style = TYPE_STYLES[item.type]
              const isBreak = item.type === 'break' || item.type === 'info'
              const title = lang === 'en' ? item.en : item.mn
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: 20, padding: '16px 32px',
                    borderBottom: i < day.items.length - 1 ? '1px solid var(--border)' : 'none',
                    opacity: isBreak ? 0.7 : 1,
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Time */}
                  <div style={{ minWidth: 90, flexShrink: 0, paddingTop: 2 }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                      color: item.time ? 'var(--blue)' : 'transparent',
                    }}>
                      {item.time || '—'}
                    </span>
                  </div>

                  {/* Dot + line */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 6, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
                    {i < day.items.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 24, background: 'var(--border)', marginTop: 4 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: isBreak ? 400 : 700, color: isBreak ? 'var(--text-3)' : '#ffffff' }}>
                        {title}
                      </span>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.07em',
                        padding: '2px 8px', borderRadius: 6,
                        background: style.badge, color: style.dot,
                      }}>
                        {style.label[lang]}
                      </span>
                    </div>
                    {item.speakers && (
                      <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 3, lineHeight: 1.5 }}>
                        {item.speakers}
                      </div>
                    )}
                    {item.location && (
                      <div style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ opacity: 0.5 }}>📍</span> {item.location}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 24 }}>
          {(Object.entries(TYPE_STYLES) as [AgendaItemType, typeof TYPE_STYLES[AgendaItemType]][]).map(([type, s]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                {s.label[lang]}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
