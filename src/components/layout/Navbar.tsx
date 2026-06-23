import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useLang, type Lang } from '@/context/LanguageContext'
import { pub } from '@/data/publicTranslations'

const navHrefs = [
  { key: 'home', href: '/' },
  { key: 'about', href: '/about' },
  { key: 'partners', href: '/partners' },
  //{ key: 'speakers', href: '/speakers' },
  { key: 'contact', href: '/contact' },
] as const

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const { lang, setLang } = useLang()
  const t = pub[lang].nav

  return (
    <header className="sticky top-0 z-50 w-full">
      <nav
        className="w-full backdrop-blur-md"
        style={{
          background: 'rgba(8,8,16,0.95)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-4 md:px-12 h-16 flex items-center gap-3">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 flex-shrink-0">
                <img
                  src="/logos/SDAlogo.svg"
                  alt="Science Development Accelerator"
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="hidden xs:flex flex-col leading-none">
                <span className="font-bold text-sm tracking-tight text-white uppercase">
                  Science Development
                </span>
                <span className="font-bold text-sm tracking-tight text-white uppercase">
                  Accelerator
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex flex-1 items-center justify-center gap-10 min-w-0">
            {navHrefs.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                style={{ fontSize: 15 }}
                className={`font-medium whitespace-nowrap transition-colors ${
                  (item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href))
                    ? 'text-grey'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {t[item.key]}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center justify-end gap-3 ml-auto flex-shrink-0">
            {/* Language toggle */}
            <div
              style={{
                display: 'flex',
                borderRadius: 8,
                border: '1px solid var(--border-2)',
                overflow: 'hidden',
              }}
            >
              {(['en', 'mn'] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: '5px 12px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    background:
                      lang === l ? 'var(--blue)' : 'transparent',
                    color:
                      lang === l
                        ? '#ffffff'
                        : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.15s',
                  }}
                >
                  {l === 'en' ? 'EN' : 'МН'}
                </button>
              ))}
            </div>

            <Link
              to="/register"
              className="hidden md:inline-flex items-center bg-[#080a5e] hover:bg-indigo-dark text-white font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
              style={{ fontSize: 15, color: '#fff' }}
            >
              {t.register}
            </Link>

            <button
              className="md:hidden p-2 rounded-md text-white/70 hover:text-white transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)' }}
              aria-label="Toggle menu"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden backdrop-blur-md"
            style={{
              borderTop: '1px solid var(--border)',
              background: 'rgba(8,8,16,0.98)',
            }}
          >
            <div className="max-w-[1240px] mx-auto px-6 py-4 flex flex-col gap-1">
              {navHrefs.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="font-medium text-white/70 hover:text-white py-2.5 transition-colors"
                  style={{
                    fontSize: 15,
                    borderBottom: '1px solid var(--border)',
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {t[item.key]}
                </Link>
              ))}

              <Link
                to="/register"
                className="mt-3 text-center bg-indigo hover:bg-indigo-dark text-white font-semibold px-4 py-3 rounded-xl transition-colors"
                style={{ fontSize: 15 }}
                onClick={() => setMobileOpen(false)}
              >
                {t.register}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}