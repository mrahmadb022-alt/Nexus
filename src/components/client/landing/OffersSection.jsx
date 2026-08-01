import { Tag } from 'lucide-react'
import { useLanguage } from '../../../context/LanguageContext'
import { useData } from '../../../context/DataContext'

export default function OffersSection() {
  const { t } = useLanguage()
  const { offers } = useData()
  const active = offers.filter((o) => o.active)

  if (active.length === 0) return null

  return (
    <section className="px-margin-mobile">
      <h2 className="font-sans text-display-lg-mobile text-on-background mb-6 text-center flex items-center justify-center gap-2">
        <Tag className="text-primary" size={22} />
        {t('Promotional Offers')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {active.map((offer) => (
          <div key={offer.id} className="card-client p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary-container/20 text-primary-container flex items-center justify-center shrink-0">
              <span className="font-sans text-headline-md">{offer.discountLabel}</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-sans text-[16px] text-on-background truncate">{offer.titleKey ? t(offer.titleKey) : offer.title}</h3>
              <p className="font-mono text-[12px] text-on-surface-variant">
                {t('Code:')} {offer.code}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
