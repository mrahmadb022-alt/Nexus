import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, CalendarDays, Phone, Scissors, User, Hourglass } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName } from '../../context/DataContext'
import { formatDateLong, formatTime, minutesAgoLabel } from '../../utils/date'
import StatusPill from '../StatusPill'

export default function DayViewModal({ date, onClose, onSelectAppointment }) {
  const { t, lang } = useLanguage()
  const { appointments, waitlist, services, getStaffById } = useData()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const dayAppointments = appointments
    .filter((a) => a.date === date && a.status !== 'cancelled')
    .sort((a, b) => a.time.localeCompare(b.time))
  const dayWaitlist = waitlist.filter((w) => w.date === date)

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[520px] bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl shadow-modal flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center sticky top-0 bg-surface-container-lowest z-10">
          <h3 className="font-sans text-headline-md text-on-background">{formatDateLong(date, lang)}</h3>
          <button
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="font-sans text-body-lg font-semibold text-on-background flex items-center gap-2">
              <CalendarDays size={18} className="text-primary" />
              {t('Bookings')}
            </h4>
            {dayAppointments.length === 0 && (
              <p className="font-sans text-body-sm text-on-surface-variant">{t('No appointments')}</p>
            )}
            {dayAppointments.map((appt) => {
              const svc = services.find((s) => s.id === appt.serviceId)
              const staff = appt.staffId ? getStaffById(appt.staffId) : null
              return (
                <button
                  key={appt.id}
                  onClick={() => onSelectAppointment(appt)}
                  className="text-start p-3 rounded-md border border-outline-variant/50 hover:border-primary/40 hover:bg-surface-container-low transition-colors flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-data-tabular text-primary font-semibold">{formatTime(appt.time, lang)}</span>
                    <StatusPill status={appt.status} />
                  </div>
                  <p className="font-sans text-body-sm font-semibold text-on-surface">{appt.clientName}</p>
                  {appt.clientPhone && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <Phone size={14} className="shrink-0" />
                      <span className="text-xs">{appt.clientPhone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Scissors size={14} className="shrink-0" />
                    <span className="text-xs">{serviceName(svc, t)}</span>
                  </div>
                  {staff && (
                    <div className="flex items-center gap-2 text-on-surface-variant">
                      <User size={14} className="shrink-0" />
                      <span className="text-xs">{staff.name}</span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="font-sans text-body-lg font-semibold text-on-background flex items-center gap-2">
              <Hourglass size={18} className="text-primary" />
              {t('Waitlist Requests')}
            </h4>
            {dayWaitlist.length === 0 && <p className="font-sans text-body-sm text-on-surface-variant">—</p>}
            {dayWaitlist.map((w) => (
              <div key={w.id} className="p-3 rounded-md border border-outline-variant/50 bg-surface-bright flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-sans text-body-sm font-semibold text-on-surface">{w.clientName}</p>
                  <span className="text-[10px] text-outline">{minutesAgoLabel(w.createdAt)}</span>
                </div>
                {w.clientPhone && (
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Phone size={14} className="shrink-0" />
                    <span className="text-xs">{w.clientPhone}</span>
                  </div>
                )}
                {w.note && <p className="text-xs text-on-surface-variant">{w.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
