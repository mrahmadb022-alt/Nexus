import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import HeroSection from '../../components/client/landing/HeroSection'
import AboutSection from '../../components/client/landing/AboutSection'
import PortfolioMarquee from '../../components/client/landing/PortfolioMarquee'
import NewsSection from '../../components/client/landing/NewsSection'
import OffersSection from '../../components/client/landing/OffersSection'
import ReviewsSection from '../../components/client/landing/ReviewsSection'

export default function Landing() {
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const { gallery } = useData()

  useEffect(() => {
    if (location.hash === '#reviews') {
      document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto bg-surface z-10 relative">
        <h1 className="font-sans text-display-lg-mobile text-primary tracking-tight">{t('Nexus Booking')}</h1>
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

      <main className="flex-grow flex flex-col w-full max-w-container-max mx-auto px-margin-mobile gap-16 py-6 pb-32">
        <HeroSection />
        <AboutSection />
        {gallery.length > 0 && (
          <section className="flex flex-col gap-6">
            <h2 className="font-sans text-display-lg-mobile text-on-background text-center">{t('Our Work')}</h2>
            <PortfolioMarquee photos={gallery} />
          </section>
        )}
        <NewsSection />
        <OffersSection />
        <ReviewsSection />
      </main>

      <div className="fixed bottom-0 start-0 w-full p-4 pb-safe bg-surface/80 backdrop-blur-md border-t border-surface-container-highest z-50">
        <div className="max-w-container-max mx-auto flex justify-center">
          <button
            onClick={() => navigate('/services')}
            className="w-full md:w-auto md:min-w-[300px] h-14 bg-primary text-on-primary rounded-xl font-sans text-headline-md flex items-center justify-center gap-2 shadow-card-client-lg hover:bg-primary-container transition-all active:scale-95"
          >
            {t('Book Now')}
            <ArrowRight size={20} className={isRtl ? 'rtl-mirror' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
