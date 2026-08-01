import { ArrowRight, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useData, SERVICES, MOCK_CLIENT_ID } from '../../../context/DataContext'
import { formatDateLong, formatTime, isBusinessOpenNow } from '../../../utils/date'

export default function HeroSection() {
  const { t, lang, isRtl } = useLanguage()
  const navigate = useNavigate()
  const { businessSettings, perDayHours, appointments, clientProfile } = useData()

  const isOpen = isBusinessOpenNow(perDayHours)
  const todayIso = new Date().toISOString().slice(0, 10)
  const nextAppointment = appointments
    .filter((a) => a.clientId === MOCK_CLIENT_ID && a.status !== 'cancelled' && a.status !== 'completed' && a.date >= todayIso)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
  const nextService = nextAppointment ? SERVICES.find((s) => s.id === nextAppointment.serviceId) : null

  return (
    <section className="relative w-full min-h-[420px] rounded-3xl overflow-hidden shadow-card-client-lg flex flex-col">
      <img src={businessSettings.heroBackground} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface via-inverse-surface/50 to-inverse-surface/10" />

      <div className="relative z-10 flex flex-col flex-1 p-6 sm:p-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-surface/90 backdrop-blur-sm shadow-md flex items-center justify-center overflow-hidden p-2 shrink-0">
            {businessSettings.logoUrl ? (
              <img src={businessSettings.logoUrl} alt={businessSettings.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <Sparkles className="text-primary" size={28} />
            )}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="font-sans text-display-lg-mobile sm:text-display-lg text-on-tertiary drop-shadow-md truncate">
              {t('Welcome back, {name}').replace('{name}', clientProfile.name || 'You')}
            </h1>
            <p className="font-sans text-body-sm text-on-tertiary/80 drop-shadow-md mt-0.5">{businessSettings.name}</p>
          </div>
          <span
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-label-caps backdrop-blur-sm ${
              isOpen ? 'bg-success-container/90 text-on-success-container' : 'bg-surface-container-highest/90 text-on-surface-variant'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-600' : 'bg-outline'}`} />
            {isOpen ? t('Open') : t('Closed')}
          </span>
        </div>

        {nextAppointment && nextService && (
          <button
            onClick={() => navigate('/profile#appointments')}
            className="bg-surface/15 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-between gap-3 text-start hover:bg-surface/20 transition-colors"
          >
            <div className="min-w-0">
              <p className="font-mono text-label-caps text-on-tertiary/70 uppercase">{t('Next Appointment')}</p>
              <p className="font-sans text-[16px] text-on-tertiary truncate">
                {t(nextService.nameKey)} • {formatDateLong(nextAppointment.date, lang)} {formatTime(nextAppointment.time, lang)}
              </p>
            </div>
            <ArrowRight size={20} className={`text-on-tertiary shrink-0 ${isRtl ? 'rtl-mirror' : ''}`} />
          </button>
        )}
      </div>
    </section>
  )
}
