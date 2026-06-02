import { useLang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'

export function BookDownload() {
  const { lang } = useLang()
  const t = pub[lang]

  return (
    <div style={{
      marginTop: 28,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 14,
      padding: '24px 20px',
      background: 'rgba(74,144,248,0.06)',
      border: '1px solid rgba(74,144,248,0.25)',
      borderRadius: 16,
    }}>
      <p style={{
        fontSize: 20, fontWeight: 700, letterSpacing: '0.12em',
        color: 'var(--blue-text)',
        margin: 0, fontFamily: 'var(--font-mono)',
        textAlign: 'center',
      }}>
        {t.colorBookLabel}
      </p>
      <a
        href={`/documents/LHCb_color_book_${lang}.pdf`}
        download={`LHCb_color_book_${lang}.pdf`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, justifyContent: 'center',
          height: 52, padding: '0 32px',
          fontSize: 16, fontWeight: 700,
          background: 'var(--blue-text)', color: '#ffffff',
          border: '2px solid rgba(74,144,248,0.6)',
          borderRadius: 12, cursor: 'pointer',
          transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
          textDecoration: 'none',
          boxShadow: '0 4px 16px rgba(74,144,248,0.25)',
          letterSpacing: '0.02em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#2563eb'
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(74,144,248,0.45)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--blue-text)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(74,144,248,0.25)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <span style={{ fontSize: 20 }}>📥</span>
        {t.downloadColorBook}
      </a>
    </div>
  )
}

export default BookDownload
