import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'mn'

interface LangCtx { lang: Lang; setLang: (l: Lang) => void }
const LanguageContext = createContext<LangCtx>({ lang: 'mn', setLang: () => {} })

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('mn')
  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>
}

export const useLang = () => useContext(LanguageContext)
