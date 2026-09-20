import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, UserSearch } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import StepIndicator from '../../components/client/StepIndicator'

export default function StaffSelection() {
  const { t, isRtl } = useLanguage()
  const navigate = useNavigate()
  const { draft, setDraftStaff, staffList, businessSettings } = useData()

  useEffect(() => {
    if (!draft.serviceId) navigate('/services', { replace: true })
  }, [draft.serviceId])

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto sticky top-0 z-30">
        <button
          onClick={() => navigate('/services')}
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
        <StepIndicator step={2} />

        <section className="flex flex-col gap-6 relative">
          <div className="flex justify-between items-end">
            <h1 className="font-sans md:font-sans text-display-lg-mobile md:text-display-lg text-primary">
              {t('Choose a Professional')}
            </h1>
            <button
              onClick={() => setDraftStaff(null)}
              className="font-mono text-label-caps text-on-surface-variant hover:text-primary transition-colors uppercase"
            >
              {t('Any Available')}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {staffList.map((member) => {
              const active = draft.staffId === member.id
              return (
                <button
                  key={member.id}
                  onClick={() => setDraftStaff(member.id)}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div
                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-2 bg-surface relative transition-colors ${
                      active ? 'border-primary' : 'border-transparent group-hover:border-outline-variant'
                    }`}
                  >
                    <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center font-sans text-headline-md ${member.color}`}>
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        member.initials
                      )}
                    </div>
                    {active && (
                      <div className="absolute bottom-0 end-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-on-primary border-2 border-surface">
                        <Check size={14} />
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h4 className={`font-sans text-body-lg font-semibold ${active ? 'text-primary' : 'text-on-background'}`}>
                      {member.name}
                    </h4>
                    <p className="font-sans text-body-sm text-on-surface-variant">{member.roleKey ? t(member.roleKey) : member.role}</p>
                  </div>
                </button>
              )
            })}
            <button
              onClick={() => setDraftStaff(null)}
              className="flex flex-col items-center gap-3 cursor-pointer group"
            >
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 border-2 border-transparent group-hover:border-outline-variant transition-colors bg-surface-container-low flex items-center justify-center">
                <UserSearch size={32} className="text-on-surface-variant group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <h4 className="font-sans text-body-lg font-semibold text-on-background group-hover:text-primary transition-colors">
                  {t('No Preference')}
                </h4>
                <p className="font-sans text-body-sm text-on-surface-variant">{t('Any available staff')}</p>
              </div>
            </button>
          </div>
        </section>
      </main>

      {draft.staffId !== undefined && (
        <div className="fixed bottom-20 md:bottom-0 start-0 w-full bg-surface-container-lowest border-t border-outline-variant/30 p-4 pb-safe z-30 md:relative md:bg-transparent md:border-none md:pb-8">
          <div className="max-w-container-max mx-auto flex justify-end items-center gap-4">
            <button
              onClick={() => navigate('/datetime')}
              className="w-full md:w-auto flex-1 md:flex-none bg-primary text-on-primary h-14 px-8 rounded-full font-sans text-body-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container transition-colors shadow-card-client-lg"
            >
              {t('Continue to Time')}
              <ArrowRight size={20} className={isRtl ? 'rtl-mirror' : ''} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
