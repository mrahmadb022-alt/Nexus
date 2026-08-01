import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarClock, XCircle, Scissors } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, SERVICES, MOCK_CLIENT_ID } from '../../context/DataContext'
import { formatDateLong, formatTime } from '../../utils/date'
import StatusPill from '../../components/StatusPill'
import RescheduleModal from '../../components/client/RescheduleModal'
import LanguageSwitcher from '../../components/LanguageSwitcher'

export default function MyAppointments() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const { appointments, getStaffById, cancelAppointment, rescheduleAppointment, setDraftService, setDraftStaff } = useData()
  const [rescheduling, setRescheduling] = useState(null)

  const todayIso = new Date().toISOString().slice(0, 10)

  const mine = appointments.filter((a) => a.clientId === MOCK_CLIENT_ID)
  const upcoming = mine
    .filter((a) => a.status !== 'cancelled' && a.status !== 'completed' && a.date >= todayIso)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
  const past = mine
    .filter((a) => a.status === 'completed' || a.date < todayIso)
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))

  const handleRebook = (appt) => {
    setDraftService(appt.serviceId)
    setDraftStaff(appt.staffId)
    navigate('/datetime')
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto sticky top-0 z-30">
        <h1 className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary">{t('My Appointments')}</h1>
        <LanguageSwitcher />
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-margin-mobile py-8 flex flex-col gap-10 pb-8">
        <section className="flex flex-col gap-4">
          <h3 className="font-mono text-label-caps text-on-surface-variant mb-2 uppercase">{t('Upcoming')}</h3>
          {upcoming.length === 0 && (
            <div className="card-client p-8 text-center">
              <p className="font-headline-md text-headline-md text-on-background mb-1">{t('No upcoming appointments')}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{t('noUpcoming.body')}</p>
            </div>
          )}
          {upcoming.map((appt) => {
            const service = SERVICES.find((s) => s.id === appt.serviceId)
            const staff = appt.staffId ? getStaffById(appt.staffId) : null
            return (
              <div key={appt.id} className="card-client p-5 flex flex-col gap-4 transition-all hover:shadow-card-client-lg">
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0">
                      <Scissors size={20} />
                    </div>
                    <div>
                      <h4 className="font-headline-md text-[18px] text-on-background">{service ? t(service.nameKey) : ''}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {formatDateLong(appt.date, lang)} • {formatTime(appt.time, lang)}
                        {staff ? ` • ${staff.name}` : ''}
                      </p>
                    </div>
                  </div>
                  <StatusPill status={appt.status} />
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setRescheduling(appt)}
                    className="flex-1 bg-surface-container text-primary py-3 rounded-md font-headline-md text-[14px] font-semibold hover:bg-surface-container-high transition-colors active:scale-95 flex items-center justify-center gap-1"
                  >
                    <CalendarClock size={18} /> {t('Reschedule')}
                  </button>
                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="flex-1 bg-transparent border border-outline text-error py-3 rounded-md font-headline-md text-[14px] font-semibold hover:bg-error-container hover:border-error-container transition-colors active:scale-95 flex items-center justify-center gap-1"
                  >
                    <XCircle size={18} /> {t('Cancel')}
                  </button>
                </div>
              </div>
            )
          })}
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="font-mono text-label-caps text-on-surface-variant mb-2 uppercase">{t('Past')}</h3>
          {past.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant">{t('No past appointments')}</p>}
          {past.map((appt) => {
            const service = SERVICES.find((s) => s.id === appt.serviceId)
            return (
              <div
                key={appt.id}
                className="bg-surface rounded-lg p-4 border border-outline-variant opacity-80 flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-surface-variant text-on-surface-variant rounded-full flex items-center justify-center shrink-0">
                    <Scissors size={18} />
                  </div>
                  <div>
                    <h4 className="font-headline-md text-[16px] text-on-background">{service ? t(service.nameKey) : ''}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{formatDateLong(appt.date, lang)}</p>
                  </div>
                </div>
                <button onClick={() => handleRebook(appt)} className="text-primary font-headline-md text-[14px] hover:underline">
                  {t('Rebook')}
                </button>
              </div>
            )
          })}
        </section>
      </main>

      {rescheduling && (
        <RescheduleModal
          appointment={rescheduling}
          onClose={() => setRescheduling(null)}
          onConfirm={(date, time) => {
            rescheduleAppointment(rescheduling.id, date, time)
            setRescheduling(null)
          }}
        />
      )}
    </div>
  )
}
