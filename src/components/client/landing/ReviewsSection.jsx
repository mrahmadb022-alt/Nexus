import { useState } from 'react'
import { Star } from 'lucide-react'
import { useLanguage } from '../../../context/LanguageContext'
import { useData } from '../../../context/DataContext'
import { agoLabel } from '../../../utils/date'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

const PAGE_SIZE = 6

export default function ReviewsSection() {
  const { t } = useLanguage()
  const { reviews, addReview } = useData()
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [text, setText] = useState('')
  const [justSubmitted, setJustSubmitted] = useState(false)
  const [submitting, guardSubmit] = useSubmitGuard()

  const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—'

  const handleSubmit = guardSubmit(() => {
    if (!text.trim()) return
    addReview(rating, text.trim())
    setText('')
    setRating(5)
    setShowForm(false)
    setJustSubmitted(true)
    setTimeout(() => setJustSubmitted(false), 3000)
  })

  return (
    <section id="reviews" className="px-margin-mobile scroll-mt-20">
      <h2 className="font-sans text-display-lg-mobile text-on-background mb-6 text-center">{t('Service Reviews')}</h2>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex flex-col items-center justify-center bg-surface-container-lowest rounded-3xl p-8 shadow-card-client border border-outline-variant/30">
          <div className="font-sans text-display-lg lg:text-[48px] lg:leading-[56px] font-bold text-primary mb-2">{avgRating}</div>
          <div className="flex gap-1 text-amber-500 mb-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={20} fill={i <= Math.round(avgRating) ? 'currentColor' : 'none'} />
            ))}
          </div>
          <div className="font-sans text-body-sm text-on-surface-variant mb-4">
            {t('Based on {n} reviews').replace('{n}', reviews.length)}
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-2.5">
              {t('Write a Review')}
            </button>
          )}
          {justSubmitted && <p className="font-sans text-body-sm text-on-success-container mt-3">{t('reviews.thankYou')}</p>}
        </div>

        {showForm && (
          <div className="mb-8 card-client p-6 flex flex-col gap-4">
            <div>
              <p className="font-mono text-label-caps text-on-surface-variant mb-2">{t('Your Rating')}</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(i)}
                    className="text-amber-500"
                    aria-label={`${i} star`}
                  >
                    <Star size={28} fill={i <= (hoverRating || rating) ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t('Share your experience...')}
              className="input-field resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="btn-secondary px-4 py-2">
                {t('Cancel')}
              </button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary px-4 py-2 disabled:opacity-60 disabled:pointer-events-none">
                {t('Submit Review')}
              </button>
            </div>
          </div>
        )}

        {reviews.length === 0 && <p className="text-center font-sans text-body-sm text-on-surface-variant">{t('reviews.empty')}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, visible).map((review) => (
            <article key={review.id} className="card-client rounded-3xl p-6 hover:shadow-card-client-lg transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-container text-on-primary-container flex items-center justify-center font-sans text-headline-md font-bold shrink-0">
                  {review.initials}
                </div>
                <div className="flex-1">
                  <h3 className="font-sans text-headline-md text-on-surface">{review.name}</h3>
                  <div className="flex gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={14} fill={i <= review.rating ? 'currentColor' : 'none'} />
                    ))}
                  </div>
                </div>
                <div className="font-mono text-label-caps text-on-surface-variant whitespace-nowrap">{agoLabel(review.date, t)}</div>
              </div>
              <p className="font-sans text-body-lg text-on-surface-variant">
                &ldquo;{review.textKey ? t(review.textKey) : review.text}&rdquo;
              </p>
            </article>
          ))}
        </div>

        {visible < reviews.length && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="px-6 py-3 rounded-xl border border-outline-variant text-primary font-sans text-headline-md hover:bg-surface-container-low transition-colors"
            >
              {t('Load More Reviews')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
