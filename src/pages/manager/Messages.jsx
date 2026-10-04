import { Navigate } from 'react-router-dom'
import { BellRing, MessageCircle, Send, Clock } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import ManagerTopBar from '../../components/manager/ManagerTopBar'
import Switch from '../../components/Switch'
import DemoBadge from '../../components/DemoBadge'
import { scheduledReminders } from '../../lib/messages'
import { whatsappHref } from '../../lib/phone'
import { formatStamp } from '../../utils/date'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

const REMINDER_HOURS = [2, 3, 12, 24, 48]

const KIND_STYLE = {
  confirmation: 'bg-secondary-container text-on-secondary-container',
  reminder: 'bg-pending-container text-on-pending-container',
  cancellation: 'bg-error-container text-on-error-container',
  marketing: 'bg-tertiary-container text-on-tertiary-container',
}

export default function Messages() {
  const { t, lang } = useLanguage()
  const {
    isFeatureOn,
    messagingSettings,
    updateMessagingSettings,
    messageLog,
    appointments,
    logBookingMessage,
    renderMessage,
  } = useData()
  const [sending, guard] = useSubmitGuard()

  if (!isFeatureOn('messaging')) return <Navigate to="/manager/settings" replace />

  const upcoming = scheduledReminders(appointments, { hoursBefore: messagingSettings.reminderHours })
  const nextReminder = upcoming[0]

  const sendDemoReminder = guard(() => {
    if (nextReminder) logBookingMessage('reminder', nextReminder.appointment, { manual: true })
  })

  const entryView = (entry) => {
    const appt = entry.appointmentId ? appointments.find((a) => a.id === entry.appointmentId) : null
    return {
      body: entry.body ?? (appt ? renderMessage(entry.kind, appt) : ''),
      name: entry.clientName ?? appt?.clientName ?? '',
      phone: entry.phone ?? appt?.clientPhone ?? '',
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar />
      <div className="px-margin-mobile lg:px-margin-desktop py-6 max-w-3xl mx-auto w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="font-sans text-display-lg text-on-background">{t('messages.title')}</h2>
          <div>
            <DemoBadge />
          </div>
          <p className="font-sans text-body-sm text-on-surface-variant">{t('messages.subtitle')}</p>
        </div>

        <section className="bg-surface border border-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-4">
          <h3 className="font-sans text-headline-md text-on-background flex items-center gap-2">
            <BellRing size={20} className="text-primary" />
            {t('messages.automatic')}
          </h3>
          <div className="flex flex-col divide-y divide-outline-variant/30">
            {['confirmation', 'reminder', 'cancellation'].map((kind) => (
              <div key={kind} className="py-3 first:pt-0">
                <Switch
                  checked={messagingSettings[kind]}
                  onChange={(on) => updateMessagingSettings({ [kind]: on })}
                  label={t(`messages.kind.${kind}`)}
                  description={t(`messages.kind.${kind}.desc`)}
                />
              </div>
            ))}
            <div className="py-3 last:pb-0 flex items-center justify-between gap-4">
              <label htmlFor="reminder-hours" className="font-sans text-body-sm font-semibold text-on-surface">
                {t('messages.reminderTiming')}
              </label>
              <select
                id="reminder-hours"
                value={messagingSettings.reminderHours}
                disabled={!messagingSettings.reminder}
                onChange={(e) => updateMessagingSettings({ reminderHours: Number(e.target.value) })}
                className="input-field py-2 w-auto disabled:opacity-50"
              >
                {REMINDER_HOURS.map((h) => (
                  <option key={h} value={h}>
                    {t('messages.hoursBefore').replace('{n}', h)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="bg-surface border border-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-sans text-headline-md text-on-background flex items-center gap-2">
              <Clock size={20} className="text-primary" />
              {t('messages.scheduled')}
            </h3>
            <button
              type="button"
              onClick={sendDemoReminder}
              disabled={sending || !nextReminder}
              className="btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <Send size={16} className="rtl-mirror" />
              {t('messages.sendDemoReminder')}
            </button>
          </div>
          {nextReminder && (
            <p className="font-sans text-[12px] text-on-surface-variant -mt-2">
              {t('messages.demoReminderTarget').replace('{name}', nextReminder.appointment.clientName)}
            </p>
          )}
          {upcoming.length === 0 ? (
            <p className="font-sans text-body-sm text-on-surface-variant">{t('messages.noScheduled')}</p>
          ) : (
            <ul className="flex flex-col divide-y divide-outline-variant/40">
              {upcoming.slice(0, 5).map((r) => (
                <li key={r.appointment.id} className="py-2.5 flex items-center justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block font-sans text-body-sm text-on-surface truncate">{r.appointment.clientName}</span>
                    <span className="block font-mono text-[11px] text-on-surface-variant">
                      {t('messages.appointmentAt').replace('{when}', formatStamp(r.startMs, lang))}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] text-on-surface-variant text-end shrink-0">
                    {t('messages.wouldSend').replace('{when}', formatStamp(r.sendAtMs, lang))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-surface border border-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-4">
          <h3 className="font-sans text-headline-md text-on-background">{t('messages.log')}</h3>
          {messageLog.length === 0 ? (
            <p className="font-sans text-body-sm text-on-surface-variant">{t('messages.emptyLog')}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {messageLog.map((entry) => {
                const view = entryView(entry)
                const wa = entry.kind !== 'marketing' ? whatsappHref(view.phone, view.body) : null
                return (
                  <li key={entry.id} className="rounded-md border border-outline-variant/60 p-4 flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`status-pill ${KIND_STYLE[entry.kind] || KIND_STYLE.confirmation}`}>
                          {t(`messages.kind.${entry.kind}`)}
                        </span>
                        <span className="font-sans text-body-sm font-semibold text-on-surface truncate">
                          {entry.kind === 'marketing'
                            ? t('campaign.recipients').replace('{n}', entry.recipientCount ?? 0)
                            : view.name}
                        </span>
                      </span>
                      <span className="font-mono text-[11px] text-on-surface-variant">{formatStamp(entry.createdAt, lang)}</span>
                    </div>
                    <p className="font-sans text-body-sm text-on-surface-variant whitespace-pre-line">{view.body}</p>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-outline">{t('messages.notSent')}</span>
                      {wa && (
                        <a
                          href={wa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-sans text-body-sm text-primary font-semibold hover:underline"
                        >
                          <MessageCircle size={16} />
                          {t('messages.sendViaWhatsApp')}
                        </a>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
