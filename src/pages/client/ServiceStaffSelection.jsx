import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Clock, UserSearch } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, SERVICES } from '../../context/DataContext'
import { minutesToDuration } from '../../utils/date'
import StepIndicator from '../../components/client/StepIndicator'

export default function ServiceStaffSelection() {
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()
  const { draft, setDraftService, setDraftStaff, staffList } = useData()

  const selectedService = SERVICES.find((s) => s.id === draft.serviceId)

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
        <div className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary">{t('Nexus Booking')}</div>
        <div className="w-10" />
      </header>

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile pt-6 pb-40 md:pb-24 flex flex-col gap-10 md:gap-12">
        <StepIndicator step={1} />

        <section className="flex flex-col gap-6">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
            {t('Select a Service')}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((svc) => {
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
                  <div className="w-16 h-16 rounded-2xl bg-surface-container mb-4 overflow-hidden">
                    <img src={svc.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-headline-md text-headline-md text-on-background mb-2">{t(svc.nameKey)}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">{t(svc.descKey)}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-surface-variant">
                    <span className={`font-headline-md text-headline-md ${active ? 'text-primary' : 'text-on-background'}`}>
                      ${svc.price}
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

        <section className="flex flex-col gap-6 relative">
          <div className="flex justify-between items-end">
            <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">
              {t('Choose a Professional')}
            </h2>
            <button
              onClick={() => setDraftStaff(null)}
              className="font-mono text-label-caps text-on-surface-variant hover:text-primary transition-colors uppercase"
            >
              {t('Any Available')}
            </button>
          </div>
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-margin-mobile px-margin-mobile md:mx-0 md:px-0 snap-x">
            {staffList.map((member) => {
              const active = draft.staffId === member.id
              return (
                <button
                  key={member.id}
                  onClick={() => setDraftStaff(member.id)}
                  className="flex-none w-40 flex flex-col items-center gap-3 snap-start cursor-pointer group"
                >
                  <div
                    className={`w-32 h-32 rounded-full p-1 border-2 bg-surface relative transition-colors ${
                      active ? 'border-primary' : 'border-transparent group-hover:border-outline-variant'
                    }`}
                  >
                    <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center font-headline-md text-headline-md ${member.color}`}>
                      {member.initials}
                    </div>
                    {active && (
                      <div className="absolute bottom-0 end-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-on-primary border-2 border-surface">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className={`font-headline-md text-body-lg font-semibold ${active ? 'text-primary' : 'text-on-background'}`}>
                      {member.name}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{member.roleKey ? t(member.roleKey) : member.role}</p>
                  </div>
                </button>
              )
            })}
            <button
              onClick={() => setDraftStaff(null)}
              className="flex-none w-40 flex flex-col items-center gap-3 snap-start cursor-pointer group"
            >
              <div className="w-32 h-32 rounded-full p-1 border-2 border-transparent group-hover:border-outline-variant transition-colors bg-surface-container-low flex items-center justify-center">
                <UserSearch size={36} className="text-on-surface-variant group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <h4 className="font-headline-md text-body-lg font-semibold text-on-background group-hover:text-primary transition-colors">
                  {t('No Preference')}
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('Any available staff')}</p>
              </div>
            </button>
          </div>
        </section>
      </main>

      <div className="fixed bottom-20 md:bottom-0 start-0 w-full bg-surface/90 backdrop-blur-md border-t border-outline-variant/30 p-4 pb-safe z-30 md:relative md:bg-transparent md:border-none md:backdrop-blur-none md:pb-8">
        <div className="max-w-container-max mx-auto flex justify-between items-center gap-4">
          <div className="hidden md:block text-on-surface-variant">
            {selectedService ? (
              <>
                <span className="font-bold text-on-background">{t('Total')}:</span> ${selectedService.price.toFixed(2)}{' '}
                <span className="mx-2">•</span> {minutesToDuration(selectedService.duration, t)}
              </>
            ) : (
              <span className="font-body-sm text-body-sm">{t('Select a Service')}</span>
            )}
          </div>
          <button
            disabled={!draft.serviceId}
            onClick={() => navigate('/datetime')}
            className="w-full md:w-auto flex-1 md:flex-none bg-primary text-on-primary h-14 px-8 rounded-full font-headline-md text-body-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-card-client-lg disabled:opacity-40 disabled:pointer-events-none"
          >
            {t('Continue to Time')}
            <ArrowRight size={20} className={isRtl ? 'rtl-mirror' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
