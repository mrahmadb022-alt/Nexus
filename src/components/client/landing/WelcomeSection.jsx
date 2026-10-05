import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../../context/LanguageContext'
import { useData, serviceName, MOCK_CLIENT_ID } from '../../../context/DataContext'
import { formatDateLong, formatTime, isBusinessOpenNow } from '../../../utils/date'
import { todayIso as todayInTz } from '../../../lib/time'

export default function WelcomeSection() {
  const { t, lang, isRtl } = useLanguage()
  const navigate = useNavigate()
  const { businessSettings, perDayHours, appointments, clientProfile, services } = useData()

  const isOpen = isBusinessOpenNow(perDayHours)
  const todayIso = todayInTz()
  const nextAppointment = appointments
    .filter((a) => a.clientId === MOCK_CLIENT_ID && a.status !== 'cancelled' && a.status !== 'completed' && a.date >= todayIso)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0]
  const nextService = nextAppointment ? services.find((s) => s.id === nextAppointment.serviceId) : null

  return (
    <section className="flex flex-col gap-4 px-margin-mobile">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <h2 className="font-sans text-display-lg-mobile text-on-background">
            {t('Welcome back, {name}').replace('{name}', clientProfile.name || 'You')}
          </h2>
          <p className="font-sans text-body-sm text-on-surface-variant mt-0.5">{businessSettings.name}</p>
        </div>
        <span
          className={`self-start shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-label-caps ${
            isOpen ? 'bg-success-container text-on-success-container' : 'bg-surface-container-highest text-on-surface-variant'
          }`}
        >
          <span className="relative flex w-2 h-2">
            {isOpen && <span className="absolute inset-0 rounded-full bg-green-500 animate-ping" />}
            <span className={`relative w-2 h-2 rounded-full ${isOpen ? 'bg-green-600' : 'bg-error'}`} />
          </span>
          {isOpen ? t('Open') : t('Closed')}
        </span>
      </div>

      {nextAppointment && nextService && (
        <button
          onClick={() => navigate('/profile#appointments')}
          className="card-client p-4 flex items-center justify-between gap-3 text-start hover:shadow-card-client-lg transition-shadow"
        >
          <div className="min-w-0">
            <p className="font-mono text-label-caps text-on-surface-variant uppercase">{t('Next Appointment')}</p>
            <p className="font-sans text-[16px] text-on-background truncate">
              {serviceName(nextService, t)} • {formatDateLong(nextAppointment.date, lang)} {formatTime(nextAppointment.time, lang)}
            </p>
          </div>
          <ArrowRight size={20} className={`text-primary shrink-0 ${isRtl ? 'rtl-mirror' : ''}`} />
        </button>
      )}
    </section>
  )
}
