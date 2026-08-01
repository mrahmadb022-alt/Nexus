import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../translations'

const LanguageContext = createContext(null)

const RTL_LANGS = ['he', 'ar']

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('nexus_lang') || 'en')

  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'

  useEffect(() => {
    localStorage.setItem('nexus_lang', lang)
    document.documentElement.dir = dir
    document.documentElement.lang = lang
  }, [lang, dir])

  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRtl: dir === 'rtl' }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext)
