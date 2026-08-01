import { useState } from 'react'
import { Languages } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

const OPTIONS = [
  { code: 'en', label: 'English' },
  { code: 'he', label: 'עברית' },
  { code: 'ar', label: 'العربية' },
]

export default function LanguageSwitcher({ variant = 'light' }) {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)

  const buttonClass =
    variant === 'dark'
      ? 'text-on-tertiary hover:bg-white/10'
      : 'text-on-surface-variant hover:bg-surface-container'

  return (
    <div className="relative">
      <button
        aria-label="Change language"
        onClick={() => setOpen((o) => !o)}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${buttonClass}`}
      >
        <Languages size={20} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute end-0 top-12 z-50 bg-surface-container-lowest border border-outline-variant rounded-md shadow-card-client-lg py-1 min-w-[140px]">
            {OPTIONS.map((opt) => (
              <button
                key={opt.code}
                onClick={() => {
                  setLang(opt.code)
                  setOpen(false)
                }}
                className={`w-full text-start px-4 py-2 text-body-sm hover:bg-surface-container transition-colors ${
                  lang === opt.code ? 'text-primary font-semibold' : 'text-on-surface-variant'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
