import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, User, Scissors, CalendarDays, Clock, Phone, Mail } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName } from '../../context/DataContext'
import { formatDateLong, formatTime, minutesToDuration } from '../../utils/date'
import StatusPill from '../StatusPill'

export default function AppointmentDetailsModal({ appointment, onClose }) {
  const { t, lang } = useLanguage()
  const { services, getStaffById, updateAppointmentStatus } = useData()

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

  const svc = services.find((s) => s.id === appointment.serviceId)
  const staff = appointment.staffId ? getStaffById(appointment.staffId) : null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[440px] bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl shadow-modal flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-sans text-headline-md text-on-background">{t('Appointment Details')}</h3>
          <button
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold shrink-0">
                {appointment.initials}
              </div>
              <p className="font-sans text-headline-md text-on-background">{appointment.clientName}</p>
            </div>
            <StatusPill status={appointment.status} />
          </div>

          <div className="flex flex-col gap-3">
            {appointment.clientPhone && (
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Phone size={18} className="shrink-0" />
                <span className="text-body-sm text-on-surface">{appointment.clientPhone}</span>
              </div>
            )}
            {appointment.clientEmail && (
              <div className="flex items-center gap-3 text-on-surface-variant">
                <Mail size={18} className="shrink-0" />
                <span className="text-body-sm text-on-surface">{appointment.clientEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-3 text-on-surface-variant">
              <Scissors size={18} className="shrink-0" />
              <span className="text-body-sm text-on-surface">
                {serviceName(svc, t)}
                {svc ? ` • ${minutesToDuration(svc.duration, t)} • ₪${svc.price}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <CalendarDays size={18} className="shrink-0" />
              <span className="text-body-sm text-on-surface">{formatDateLong(appointment.date, lang)}</span>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant">
              <Clock size={18} className="shrink-0" />
              <span className="text-body-sm text-on-surface">{formatTime(appointment.time, lang)}</span>
            </div>
            {staff && (
              <div className="flex items-center gap-3 text-on-surface-variant">
                <User size={18} className="shrink-0" />
                <span className="text-body-sm text-on-surface">{staff.name}</span>
              </div>
            )}
          </div>
        </div>

        {appointment.status !== 'in-service' && appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
          <div className="p-6 border-t border-outline-variant bg-surface">
            <button
              onClick={() => {
                updateAppointmentStatus(appointment.id, 'in-service')
                onClose()
              }}
              className="w-full bg-primary text-on-primary py-3.5 rounded-xl font-sans text-body-lg font-bold shadow-sm hover:bg-primary-container transition-colors active:scale-[0.98]"
            >
              {t('Check In')}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
