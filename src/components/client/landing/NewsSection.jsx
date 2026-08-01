import { useLanguage } from '../../../context/LanguageContext'
import { useData } from '../../../context/DataContext'

export default function NewsSection() {
  const { t } = useLanguage()
  const { announcements } = useData()

  if (announcements.length === 0) return null

  return (
    <section className="px-margin-mobile">
      <h2 className="font-sans text-display-lg-mobile text-on-background mb-6 text-center">{t('News & Updates')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {announcements.map((ann) => (
          <article key={ann.id} className="card-client p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${ann.dot}`} />
              <h3 className="font-sans text-[16px] text-on-background">{ann.titleKey ? t(ann.titleKey) : ann.title}</h3>
            </div>
            <p className="font-sans text-body-sm text-on-surface-variant line-clamp-3">
              {ann.bodyKey ? t(ann.bodyKey) : ann.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
