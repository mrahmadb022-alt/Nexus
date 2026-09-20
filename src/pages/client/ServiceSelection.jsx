import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, Scissors } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName, serviceDesc } from '../../context/DataContext'
import { minutesToDuration } from '../../utils/date'
import StepIndicator from '../../components/client/StepIndicator'

export default function ServiceSelection() {
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()
  const { draft, setDraftService, services, businessSettings } = useData()

  const selectedService = services.find((s) => s.id === draft.serviceId)

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto sticky top-0 z-30">
        <button
          onClick={() => navigate('/')}
          aria-label={t('Back')}
          className="text-primary hover:bg-surface-container transition-colors p-2 rounded-full active:scale-95"
        >
          <ArrowLeft size={22} className={isRtl ? 'rtl-mirror' : ''} />
        </button>
        <div
          className="font-sans text-display-lg-mobile font-bold text-primary flex-1 min-w-0 truncate text-center"
          title={businessSettings.name || t('Nexus Booking')}
        >
          {businessSettings.name || t('Nexus Booking')}
        </div>
        <div className="w-10 shrink-0" />
      </header>

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile pt-6 pb-40 md:pb-24 flex flex-col gap-10 md:gap-12">
        <StepIndicator step={1} />

        <section className="flex flex-col gap-6">
          <h1 className="font-sans md:font-sans text-display-lg-mobile md:text-display-lg text-primary">
            {t('Select a Service')}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((svc) => {
              const active = draft.serviceId === svc.id
              return (
                <button
                  key={svc.id}
                  onClick={() => setDraftService(svc.id)}
                  className={`relative group text-start bg-surface-container-lowest rounded-2xl p-6 shadow-card-client transition-all hover:-translate-y-1 border-2 ${
                    active ? 'border-primary' : 'border-transparent hover:border-outline-variant'
                  }`}
                >
                  {active && (
                    <div className="absolute top-4 end-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-on-primary">
                      <Check size={14} />
                    </div>
                  )}
                  <div className="w-16 h-16 rounded-2xl bg-surface-container mb-4 overflow-hidden flex items-center justify-center">
                    {svc.image ? (
                      <img src={svc.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Scissors size={24} className="text-on-surface-variant" />
                    )}
                  </div>
                  <h3 className="font-sans text-headline-md text-on-background mb-2">{serviceName(svc, t)}</h3>
                  <p className="font-sans text-body-sm text-on-surface-variant mb-4 line-clamp-2">{serviceDesc(svc, t)}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface-variant">
                    <span className={`font-sans text-headline-md ${active ? 'text-primary' : 'text-on-background'}`}>
                      ₪{svc.price}
                    </span>
                    <div className="flex items-center text-on-surface-variant font-mono text-data-tabular gap-1">
                      <Clock size={16} />
                      {minutesToDuration(svc.duration, t)}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </main>

      {selectedService && (
        <div className="fixed bottom-20 md:bottom-0 start-0 w-full bg-surface-container-lowest border-t border-outline-variant/30 p-4 pb-safe z-30 md:relative md:bg-transparent md:border-none md:pb-8">
          <div className="max-w-container-max mx-auto flex justify-between items-center gap-4">
            <div className="hidden md:block text-on-surface-variant">
              <span className="font-bold text-on-background">{t('Total')}:</span> ₪{selectedService.price}{' '}
              <span className="mx-2">•</span> {minutesToDuration(selectedService.duration, t)}
            </div>
            <button
              onClick={() => navigate('/professional')}
              className="w-full md:w-auto flex-1 md:flex-none bg-primary text-on-primary h-14 px-8 rounded-full font-sans text-body-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-card-client-lg"
            >
              {t('Continue to Professional')}
              <ArrowRight size={20} className={isRtl ? 'rtl-mirror' : ''} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
