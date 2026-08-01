import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import LanguageSwitcher from '../../components/LanguageSwitcher'

const SLIDES = [
  {
    titleKey: 'Signature Styling',
    bodyKey: 'Precision service tailored to your lifestyle.',
    image: 'https://picsum.photos/seed/nexus-hero-1/900/1200',
  },
  {
    titleKey: 'Premium Care',
    bodyKey: 'Experience the finest in professional treatments.',
    image: 'https://picsum.photos/seed/nexus-hero-2/900/1200',
  },
  {
    titleKey: 'Expert Team',
    bodyKey: 'Dedicated professionals committed to your best results.',
    image: 'https://picsum.photos/seed/nexus-hero-3/900/1200',
  },
]

export default function Landing() {
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timerRef.current)
  }, [])

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto bg-surface z-10 relative">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tight">{t('Nexus Booking')}</h1>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <button
            onClick={() => navigate('/manager')}
            aria-label={t('Manager Login')}
            className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors text-on-surface-variant"
            title={t('Manager Login')}
          >
            <ShieldCheck size={20} />
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col w-full max-w-container-max mx-auto relative overflow-hidden">
        <section className="relative w-full h-[56vh] min-h-[360px] mt-4 px-margin-mobile">
          <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-card-client-lg">
            {SLIDES.map((slide, i) => (
              <div
                key={slide.titleKey}
                className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
              >
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/70 to-transparent" />
                <div className="absolute bottom-8 start-8 end-8 text-on-tertiary">
                  <h2 className="font-headline-md text-headline-md mb-2">{t(slide.titleKey)}</h2>
                  <p className="font-body-sm text-body-sm opacity-90">{t(slide.bodyKey)}</p>
                </div>
              </div>
            ))}
            <div className="absolute bottom-4 start-0 end-0 flex justify-center gap-2">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.titleKey}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-on-tertiary' : 'w-1.5 bg-on-tertiary/50'}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="px-margin-mobile mt-12 mb-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-low mb-6">
              <Sparkles className="text-primary" size={28} />
            </div>
            <h3 className="font-display-lg-mobile text-display-lg-mobile text-on-background mb-4">{t('Elevate Your Experience')}</h3>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{t('landing.intro')}</p>
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 w-full p-4 pb-safe bg-surface/80 backdrop-blur-md border-t border-surface-container-highest z-40 md:static md:border-0 md:bg-transparent md:backdrop-blur-none md:pb-12">
        <div className="max-w-container-max mx-auto flex justify-center">
          <button
            onClick={() => navigate('/services')}
            className="w-full md:w-auto md:min-w-[300px] h-14 bg-primary text-on-primary rounded-xl font-headline-md text-headline-md flex items-center justify-center gap-2 shadow-card-client-lg hover:bg-primary-container transition-all active:scale-95"
          >
            {t('Book Now')}
            <ArrowRight size={20} className={isRtl ? 'rtl-mirror' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
