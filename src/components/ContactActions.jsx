import { Phone, MessageCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useData } from '../context/DataContext'
import { telHref, whatsappHref } from '../lib/phone'

// Call (tel:) + WhatsApp (wa.me with prefilled text) as plain links, never wrapped in a button.
// Renders nothing when the Contact feature is off; with an unusable number, the full variant
// explains why instead of offering a link that would dial garbage.
export default function ContactActions({ phone, message, variant = 'full' }) {
  const { t } = useLanguage()
  const { isFeatureOn } = useData()
  if (!isFeatureOn('contact')) return null

  const tel = telHref(phone)
  const wa = whatsappHref(phone, message)

  if (!tel) {
    if (variant !== 'full' || !phone) return null
    return <p className="font-sans text-[12px] text-error">{t('contact.invalidPhone')}</p>
  }

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-3 border-t border-outline-variant/40">
        <span className="font-mono text-label-caps text-on-surface-variant">{t('contact.salon')}</span>
        <a href={tel} className="flex items-center gap-1.5 font-sans text-body-sm text-primary hover:underline">
          <Phone size={14} /> {t('contact.call')}
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-sans text-body-sm text-primary hover:underline"
        >
          <MessageCircle size={14} /> {t('contact.whatsapp')}
        </a>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        <a
          href={tel}
          aria-label={t('contact.call')}
          title={t('contact.call')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
        >
          <Phone size={16} />
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('contact.whatsapp')}
          title={t('contact.whatsapp')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-success hover:bg-surface-container transition-colors"
        >
          <MessageCircle size={16} />
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={tel}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline-variant text-primary font-sans text-body-sm font-semibold hover:bg-surface-container transition-colors"
      >
        <Phone size={16} /> {t('contact.call')}
      </a>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success-container text-on-success-container font-sans text-body-sm font-semibold hover:opacity-90 transition-colors"
      >
        <MessageCircle size={16} /> {t('contact.whatsapp')}
      </a>
    </div>
  )
}
