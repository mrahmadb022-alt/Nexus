import { Info } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

// Marks simulated features (messages, receipts) that only become real once a backend exists.
export default function DemoBadge() {
  const { t } = useLanguage()
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pending-container text-on-pending-container font-sans text-[12px] font-semibold">
      <Info size={14} className="shrink-0" />
      {t('demo.badge')}
    </span>
  )
}
