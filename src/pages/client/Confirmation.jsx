import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, CheckCircle2, ArrowRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName } from '../../context/DataContext'
import { formatDateFull, formatTime } from '../../utils/date'
import StepIndicator from '../../components/client/StepIndicator'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'
import { formatShekels } from '../../lib/money'
import CalendarActions from '../../components/CalendarActions'

export default function Confirmation() {
  const { t, lang, isRtl } = useLanguage()
  const navigate = useNavigate()
  const { draft, getStaffById, confirmDraftBooking, resetDraft, businessSettings, services } = useData()
  const [confirmed, setConfirmed] = useState(null)
  const [submitting, guard] = useSubmitGuard()

  const service = services.find((s) => s.id === draft.serviceId)
  const staff = draft.staffId ? getStaffById(draft.staffId) : null

  useEffect(() => {
    // Skip once confirmed: handleDone() clears the draft on its way out, which would
    // otherwise satisfy this same guard and race navigate('/profile') with a stray
    // navigate('/services') on Confirmation's last render before it unmounts.
    if (!confirmed && (!draft.serviceId || !draft.date || !draft.time)) {
      navigate('/services', { replace: true })
    }
  }, [draft, confirmed])

  const handleConfirm = guard(() => {
    setConfirmed(confirmDraftBooking())
  })

  const handleDone = () => {
    resetDraft()
    navigate('/profile#appointments')
  }

  if (confirmed) {
    return (
      <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center px-margin-mobile text-center">
        <div className="w-20 h-20 rounded-full bg-success-container text-on-success-container flex items-center justify-center mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h1 className="font-sans text-display-lg text-on-background mb-3">{t('Booking Confirmed')}</h1>
        <p className="font-sans text-body-lg text-on-surface-variant max-w-sm mb-6">{t('confirm.successBody')}</p>
        <div className="mb-8">
          <CalendarActions appointment={confirmed} />
        </div>
        <button
          onClick={handleDone}
          className="h-14 px-8 bg-primary text-on-primary rounded-xl font-sans text-headline-md flex items-center gap-2 shadow-card-client-lg hover:bg-primary-container transition-all active:scale-95"
        >
          {t('My Appointments')}
          <ArrowRight size={20} className={isRtl ? 'rtl-mirror' : ''} />
        </button>
      </div>
    )
  }

  if (!service || !draft.date || !draft.time) return null

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto sticky top-0 z-30">
        <div
          className="font-sans text-display-lg-mobile font-bold text-primary truncate min-w-0"
          title={businessSettings.name || t('Nexus Booking')}
        >
          {businessSettings.name || t('Nexus Booking')}
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-margin-mobile py-8 flex flex-col gap-10 pb-32">
        <StepIndicator step={4} />

        <section className="flex flex-col gap-6">
          <h1 className="font-sans md:font-sans text-display-lg-mobile md:text-display-lg text-primary">
            {t('Confirm Booking')}
          </h1>
          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card-client border border-surface-variant flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-6 md:items-start">
              <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 shadow-sm bg-surface-container flex items-center justify-center">
                {service.image && <img src={service.image} alt="" className="w-full h-full object-cover" />}
              </div>
              <div className="flex-grow flex flex-col gap-4">
                <div>
                  <h3 className="font-sans text-headline-md text-on-background">{serviceName(service, t)}</h3>
                  {staff && (
                    <p className="font-sans text-body-lg text-on-surface-variant mt-1">
                      {t('with')} {staff.name}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-label-caps text-on-surface-variant">{t('Date')}</span>
                    <span className="font-sans text-[16px] text-on-background flex items-center gap-2">
                      <CalendarDays size={18} className="text-primary" /> {formatDateFull(draft.date, lang)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-label-caps text-on-surface-variant">{t('Time')}</span>
                    <span className="font-sans text-[16px] text-on-background flex items-center gap-2">
                      <Clock size={18} className="text-primary" /> {formatTime(draft.time, lang)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="md:text-end flex flex-col gap-1 md:shrink-0 border-t md:border-t-0 md:border-s border-outline-variant pt-4 md:pt-0 md:ps-6">
                <span className="font-mono text-label-caps text-on-surface-variant">{t('Total')}</span>
                <span className="font-sans text-display-lg-mobile text-primary">{formatShekels(service.priceAgorot)}</span>
              </div>
            </div>

            <div className="bg-surface p-4 rounded-xl border border-outline-variant flex items-start gap-3">
              <MapPin className="text-on-surface-variant mt-0.5" size={20} />
              <div>
                <p className="font-sans text-[16px] text-on-background">{businessSettings.name}</p>
                <p className="font-sans text-body-sm text-on-surface-variant whitespace-pre-line">{businessSettings.address}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-outline-variant">
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-grow bg-primary text-on-primary py-4 px-6 rounded-xl font-sans text-[16px] font-bold shadow-sm hover:bg-primary-container transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {t('Confirm Appointment')} <CheckCircle2 size={20} />
              </button>
              <button
                onClick={() => navigate('/services')}
                className="sm:w-auto bg-transparent border border-outline text-primary py-4 px-6 rounded-xl font-sans text-[16px] font-bold hover:bg-surface-container transition-colors active:scale-95"
              >
                {t('Edit Details')}
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
