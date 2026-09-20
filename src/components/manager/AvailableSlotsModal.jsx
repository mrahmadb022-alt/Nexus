import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Clock } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { formatDateLong, formatTime, generateSlots } from '../../utils/date'

export default function AvailableSlotsModal({ date, onClose }) {
  const { t, lang } = useLanguage()
  const { perDayHours, appointments } = useData()

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

  const weekday = new Date(date + 'T00:00:00').getDay()
  const hours = perDayHours[weekday]
  const closed = !hours || !hours.working || hours.locked

  const bookedTimes = appointments.filter((a) => a.date === date && a.status !== 'cancelled').map((a) => a.time)
  const availableSlots = closed ? [] : generateSlots(hours.start, hours.end).filter((s) => !bookedTimes.includes(s))

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[440px] bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl shadow-modal flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-sans text-headline-md text-on-background">{formatDateLong(date, lang)}</h3>
          <button
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <h4 className="font-sans text-body-lg font-semibold text-on-background flex items-center gap-2 mb-4">
            <Clock size={18} className="text-primary" />
            {t('Available Slots')}
          </h4>
          {closed && <p className="font-sans text-body-sm text-on-surface-variant">{t('Closed')}</p>}
          {!closed && availableSlots.length === 0 && (
            <p className="font-sans text-body-sm text-on-surface-variant">{t('Fully Booked')}</p>
          )}
          {!closed && availableSlots.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map((slot) => (
                <div
                  key={slot}
                  className="py-3 px-2 rounded-xl border border-outline-variant text-on-background text-center font-sans text-body-sm"
                >
                  {formatTime(slot, lang)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
