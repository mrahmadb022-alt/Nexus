import { useState } from 'react'
import { Star } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import LanguageSwitcher from '../../components/LanguageSwitcher'

const PAGE_SIZE = 6

export default function Reviews() {
  const { t } = useLanguage()
  const { reviews } = useData()
  const [visible, setVisible] = useState(PAGE_SIZE)

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto sticky top-0 z-30">
        <h1 className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary">{t('Service Reviews')}</h1>
        <LanguageSwitcher />
      </header>

      <main className="flex-grow px-margin-mobile md:px-margin-desktop py-6 md:py-8 max-w-container-max mx-auto w-full">
        <div className="mb-10 flex flex-col items-center justify-center bg-surface-container-lowest rounded-3xl p-8 shadow-card-client border border-outline-variant/30">
          <div className="font-display-lg text-display-lg lg:text-[48px] lg:leading-[56px] font-bold text-primary mb-2">
            {avgRating}
          </div>
          <div className="flex gap-1 text-amber-500 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={20} fill={i <= Math.round(avgRating) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            {t('Based on {n} reviews').replace('{n}', reviews.length)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, visible).map((review) => (
            <article
              key={review.id}
              className="bg-surface-container-lowest rounded-3xl p-6 shadow-card-client border border-outline-variant/20 hover:shadow-card-client-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md text-headline-md font-bold shrink-0">
                  {review.initials}
                </div>
                <div className="flex-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface">{review.name}</h3>
                  <div className="flex gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill={i <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <div className="font-mono text-label-caps text-on-surface-variant whitespace-nowrap">
                  {review.daysAgo < 7
                    ? t('ago.days').replace('{n}', review.daysAgo)
                    : t('ago.weeks').replace('{n}', Math.round(review.daysAgo / 7))}
                </div>
              </div>
              <p className="font-body-lg text-body-lg text-on-surface-variant">&ldquo;{t(review.textKey)}&rdquo;</p>
            </article>
          ))}
        </div>

        {visible < reviews.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="px-6 py-3 rounded-xl border border-outline-variant text-primary font-headline-md text-headline-md hover:bg-surface-container-low transition-colors"
            >
              {t('Load More Reviews')}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
