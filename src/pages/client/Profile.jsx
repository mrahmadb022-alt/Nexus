import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { CalendarClock, XCircle, Scissors, User } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName, MOCK_CLIENT_ID } from '../../context/DataContext'
import { formatDateLong, formatTime } from '../../utils/date'
import StatusPill from '../../components/StatusPill'
import RescheduleModal from '../../components/client/RescheduleModal'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'
import ContactActions from '../../components/ContactActions'
import CalendarActions from '../../components/CalendarActions'
import { useBookingMessage } from '../../hooks/useBookingMessage'
import { normalizePhone } from '../../lib/phone'
import { todayIso as todayInTz } from '../../lib/time'

export default function Profile() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()
  const {
    appointments,
    getStaffById,
    cancelAppointment,
    rescheduleAppointment,
    setDraftService,
    setDraftStaff,
    clientProfile,
    updateClientProfile,
    services,
    businessSettings,
    isFeatureOn,
  } = useData()
  const bookingMessage = useBookingMessage()
  const [rescheduling, setRescheduling] = useState(null)
  const [form, setForm] = useState(clientProfile)
  const [saved, setSaved] = useState(false)
  const [savingProfile, guardProfileSave] = useSubmitGuard()

  useEffect(() => {
    if (location.hash === '#appointments') {
      document.getElementById('appointments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [location.hash])

  const todayIso = todayInTz()

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

  const handleSaveProfile = guardProfileSave(() => {
    updateClientProfile(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  })

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto sticky top-0 z-30">
        <h1 className="font-sans text-display-lg-mobile font-bold text-primary">{t('Profile')}</h1>
        <LanguageSwitcher />
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-margin-mobile py-8 flex flex-col gap-10 pb-8">
        <section className="card-client p-6 flex flex-col gap-5">
          <h2 className="font-sans text-headline-md text-on-background flex items-center gap-2">
            <User className="text-primary" size={20} />
            {t('Personal Details')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-label-caps text-on-surface-variant">{t('Full Name')}</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-label-caps text-on-surface-variant">{t('Phone Number')}</label>
              <input
                type="tel"
                className="input-field"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
              {isFeatureOn('contact') && form.phone.trim() && !normalizePhone(form.phone) && (
                <p className="font-sans text-[12px] text-error">{t('contact.invalidPhone')}</p>
              )}
            </div>
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="font-mono text-label-caps text-on-surface-variant">
                {t('Email')} <span className="text-outline normal-case">({t('Optional')})</span>
              </label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            {saved && <span className="font-sans text-body-sm text-on-success-container">{t('Save Changes')} ✓</span>}
            <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary px-6 py-2.5 disabled:opacity-60 disabled:pointer-events-none">
              {t('Save Changes')}
            </button>
          </div>
        </section>

        <section id="appointments" className="flex flex-col gap-8 scroll-mt-20">
          <h2 className="font-sans text-headline-md text-on-background">{t('My Bookings')}</h2>

          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-label-caps text-on-surface-variant mb-2 uppercase">{t('Upcoming')}</h3>
            {upcoming.length === 0 && (
              <div className="card-client p-8 text-center">
                <p className="font-sans text-headline-md text-on-background mb-1">{t('No upcoming appointments')}</p>
                <p className="font-sans text-body-sm text-on-surface-variant">{t('noUpcoming.body')}</p>
              </div>
            )}
            {upcoming.map((appt) => {
              const service = services.find((s) => s.id === appt.serviceId)
              const staff = appt.staffId ? getStaffById(appt.staffId) : null
              return (
                <div key={appt.id} className="card-client p-5 flex flex-col gap-4 transition-all hover:shadow-card-client-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0">
                        <Scissors size={20} />
                      </div>
                      <div>
                        <h4 className="font-sans text-[18px] text-on-background">{serviceName(service, t)}</h4>
                        <p className="font-sans text-body-sm text-on-surface-variant">
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
                      className="flex-1 bg-surface-container text-primary py-3 rounded-md font-sans text-[14px] font-semibold hover:bg-surface-container-high transition-colors active:scale-95 flex items-center justify-center gap-1"
                    >
                      <CalendarClock size={18} /> {t('Reschedule')}
                    </button>
                    <button
                      onClick={() => cancelAppointment(appt.id)}
                      className="flex-1 bg-transparent border border-outline text-error py-3 rounded-md font-sans text-[14px] font-semibold hover:bg-error-container hover:border-error-container transition-colors active:scale-95 flex items-center justify-center gap-1"
                    >
                      <XCircle size={18} /> {t('Cancel')}
                    </button>
                  </div>
                  <CalendarActions appointment={appt} />
                  <ContactActions
                    variant="inline"
                    phone={businessSettings.phone}
                    message={bookingMessage('clientToBusiness', appt)}
                  />
                </div>
              )
            })}
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-mono text-label-caps text-on-surface-variant mb-2 uppercase">{t('Past')}</h3>
            {past.length === 0 && <p className="font-sans text-body-sm text-on-surface-variant">{t('No past appointments')}</p>}
            {past.map((appt) => {
              const service = services.find((s) => s.id === appt.serviceId)
              return (
                <div
                  key={appt.id}
                  className="bg-surface rounded-lg p-4 border border-outline-variant opacity-80 flex items-center justify-between gap-3"
                >
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-10 h-10 bg-surface-variant text-on-surface-variant rounded-full flex items-center justify-center shrink-0">
                      <Scissors size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-sans text-[16px] text-on-background truncate">{serviceName(service, t)}</h4>
                      <p className="font-sans text-body-sm text-on-surface-variant">{formatDateLong(appt.date, lang)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRebook(appt)}
                    className="shrink-0 bg-surface-container text-primary px-4 py-2 rounded-md font-sans text-[14px] font-semibold hover:bg-surface-container-high transition-colors active:scale-95"
                  >
                    {t('Rebook')}
                  </button>
                </div>
              )
            })}
          </div>
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
