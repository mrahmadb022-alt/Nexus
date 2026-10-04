import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

// Opt-in for marketing messages. The checkbox sits inside its <label> (one interactive element),
// and is never pre-checked: the caller passes the current value, which starts false.
export default function MarketingConsent({ checked, onChange, id = 'marketing-consent' }) {
  const { t } = useLanguage()
  const { isFeatureOn, businessSettings } = useData()
  if (!isFeatureOn('marketing')) return null
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-4 h-4 shrink-0 accent-[rgb(var(--color-primary))]"
      />
      <span className="font-sans text-body-sm text-on-surface-variant">
        {t('consent.label').replace('{business}', businessSettings.name)}
      </span>
    </label>
  )
}
