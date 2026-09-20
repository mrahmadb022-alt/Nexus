import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BellRing, Armchair, MoreVertical, Hourglass, Check, X, Plus } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName } from '../../context/DataContext'
import { formatDateLong, formatTime, minutesAgoLabel, minutesToDuration } from '../../utils/date'
import StatusPill from '../../components/StatusPill'
import ManagerTopBar from '../../components/manager/ManagerTopBar'
import AppointmentDetailsModal from '../../components/manager/AppointmentDetailsModal'

export default function ManagerOverview() {
  const { t, lang } = useLanguage()
  const navigate = useNavigate()
  const { appointments, waitlist, approveWaitlist, declineWaitlist, updateAppointmentStatus, services } = useData()
  const [detailsAppt, setDetailsAppt] = useState(null)

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString(lang === 'en' ? 'en-US' : lang === 'he' ? 'he-IL' : 'ar', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }),
    [lang],
  )

  const todayAppointments = appointments
    .filter((a) => a.date === todayIso && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))

  const nextUp = todayAppointments.find((a) => a.status === 'in-service') || todayAppointments.find((a) => a.status !== 'completed')

  const revenueToday = todayAppointments.reduce((sum, a) => {
    const svc = services.find((s) => s.id === a.serviceId)
    return a.status === 'cancelled' ? sum : sum + (svc?.price || 0)
  }, 0)

  const clientsToday = new Set(todayAppointments.map((a) => a.clientId)).size

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar />
      <div className="px-margin-mobile lg:px-margin-desktop py-6 max-w-container-max mx-auto w-full flex flex-col gap-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="font-sans text-display-lg text-on-background mb-1">{t("Today's Overview")}</h2>
            <p className="text-on-surface-variant text-body-lg">{todayLabel}</p>
          </div>
          <button
            onClick={() => navigate('/manager/calendar')}
            className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full font-sans text-body-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            <Plus size={18} />
            {t('New Booking')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          <div className="lg:col-span-8 flex flex-col gap-6">
            {nextUp && (
              <section className="bg-primary-container text-on-primary-container rounded-md p-6 shadow-sm border border-primary-fixed-dim/30 relative overflow-hidden">
                <div className="absolute -end-10 -top-10 opacity-10 pointer-events-none">
                  <Armchair size={150} />
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <BellRing size={20} className="text-inverse-primary animate-pulse" />
                  <h3 className="font-mono text-label-caps text-inverse-primary uppercase tracking-wider">{t('Next in Chair')}</h3>
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary-fixed bg-surface/20 flex items-center justify-center font-sans text-headline-md text-on-primary-container shrink-0">
                      {nextUp.initials}
                    </div>
                    <div>
                      <p className="font-sans text-headline-md text-on-primary-container">{nextUp.clientName}</p>
                      <p className="text-body-sm text-primary-fixed-dim mt-1">
                        {serviceName(services.find((s) => s.id === nextUp.serviceId), t)}
                        {' • '}
                        {formatTime(nextUp.time, lang)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setDetailsAppt(nextUp)}
                      className="flex-1 sm:flex-none bg-surface/10 hover:bg-surface/20 text-on-primary-container px-4 py-2 rounded-md text-body-sm transition-colors border border-surface/20"
                    >
                      {t('Details')}
                    </button>
                    {nextUp.status !== 'in-service' && (
                      <button
                        onClick={() => updateAppointmentStatus(nextUp.id, 'in-service')}
                        className="flex-1 sm:flex-none bg-inverse-primary text-on-primary-fixed px-4 py-2 rounded-md text-body-sm font-semibold hover:bg-primary-fixed transition-colors"
                      >
                        {t('Check In')}
                      </button>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section className="bg-surface rounded-md border border-outline-variant shadow-sm">
              <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-sans text-headline-md text-on-background">{t('Schedule')}</h3>
                <button onClick={() => navigate('/manager/calendar')} className="text-primary text-body-sm hover:underline">
                  {t('View Calendar')}
                </button>
              </div>
              <div className="flex flex-col">
                {todayAppointments.length === 0 && (
                  <p className="p-6 text-center font-sans text-body-sm text-on-surface-variant">{t('No appointments')}</p>
                )}
                {todayAppointments.map((appt) => {
                  const svc = services.find((s) => s.id === appt.serviceId)
                  const [h, m] = appt.time.split(':')
                  const active = appt.status === 'in-service'
                  return (
                    <div
                      key={appt.id}
                      className={`flex items-stretch border-b border-outline-variant last:border-b-0 transition-colors relative ${
                        active ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-surface-container-lowest'
                      }`}
                    >
                      {active && <div className="absolute start-0 top-0 bottom-0 w-1 bg-primary" />}
                      <div className="w-20 sm:w-24 flex-shrink-0 flex flex-col justify-center items-end pe-4 py-4 border-e border-outline-variant/50">
                        <span className={`font-mono text-data-tabular font-medium ${active ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                          {h}:{m}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm shrink-0">
                            {appt.initials}
                          </div>
                          <div>
                            <p className="text-body-sm font-semibold text-on-surface">{appt.clientName}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {serviceName(svc, t)} • {svc ? minutesToDuration(svc.duration, t) : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusPill status={appt.status} />
                          <button
                            onClick={() => setDetailsAppt(appt)}
                            aria-label={t('Details')}
                            className="text-outline hover:text-primary transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface border border-outline-variant rounded-md p-4 shadow-sm">
                <p className="font-mono text-label-caps text-on-surface-variant mb-2">{t('Revenue Today')}</p>
                <p className="font-sans text-display-lg-mobile text-on-background">₪{revenueToday}</p>
              </div>
              <div className="bg-surface border border-outline-variant rounded-md p-4 shadow-sm">
                <p className="font-mono text-label-caps text-on-surface-variant mb-2">{t('Clients Today')}</p>
                <p className="font-sans text-display-lg-mobile text-on-background">{clientsToday}</p>
              </div>
            </div>

            <section className="bg-surface border border-outline-variant rounded-md shadow-sm overflow-hidden">
              <div className="px-5 py-4 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Hourglass size={20} className="text-on-surface-variant" />
                  <h3 className="font-sans text-[16px] font-semibold text-on-background">{t('Waitlist Requests')}</h3>
                </div>
                {waitlist.length > 0 && (
                  <span className="bg-error-container text-on-error-container text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {waitlist.length} {t('NEW')}
                  </span>
                )}
              </div>
              <div className="p-4 flex flex-col gap-4">
                {waitlist.length === 0 && <p className="text-center font-sans text-body-sm text-on-surface-variant">—</p>}
                {waitlist.map((w) => (
                  <div key={w.id} className="border border-outline-variant/60 rounded-md p-3 bg-surface-bright">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-body-sm font-semibold text-on-surface">{w.clientName}</p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDateLong(w.date, lang)}
                          {w.note ? ` • ${w.note}` : ''}
                        </p>
                      </div>
                      <span className="text-[10px] text-outline">{minutesAgoLabel(w.createdAt)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => declineWaitlist(w.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-surface border border-outline-variant text-on-surface-variant px-2 py-1.5 rounded text-xs font-medium hover:bg-surface-container-high transition-colors"
                      >
                        <X size={16} /> {t('Decline')}
                      </button>
                      <button
                        onClick={() => approveWaitlist(w.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-primary text-on-primary px-2 py-1.5 rounded text-xs font-medium hover:bg-primary-container transition-colors shadow-sm"
                      >
                        <Check size={16} /> {t('Approve')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
      {detailsAppt && <AppointmentDetailsModal appointment={detailsAppt} onClose={() => setDetailsAppt(null)} />}
    </div>
  )
}
