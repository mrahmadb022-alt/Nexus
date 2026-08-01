import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { formatMonthYear, formatTime, generateSlots, toISODate } from '../../utils/date'

const WEEKDAY_LETTERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function RescheduleModal({ appointment, onClose, onConfirm }) {
  const { t, lang, isRtl } = useLanguage()
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

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const initialDate = new Date(appointment.date + 'T00:00:00')
  const [viewMonth, setViewMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(appointment.date)
  const [selectedTime, setSelectedTime] = useState(appointment.time)

  const bookedTimesForDate = (isoDate) =>
    appointments
      .filter((a) => a.date === isoDate && a.status !== 'cancelled' && a.id !== appointment.id)
      .map((a) => a.time)

  const slotsForDate = (isoDate) => {
    const weekday = new Date(isoDate + 'T00:00:00').getDay()
    const hours = perDayHours[weekday]
    if (!hours || !hours.working || hours.locked) return []
    return generateSlots(hours.start, hours.end)
  }

  const availableSlots = useMemo(() => {
    const all = slotsForDate(selectedDate)
    const booked = bookedTimesForDate(selectedDate)
    return all.filter((s) => !booked.includes(s))
  }, [selectedDate, perDayHours, appointments])

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const firstWeekday = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay()
  const dayCells = []
  for (let i = 0; i < firstWeekday; i++) dayCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) dayCells.push(d)

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:w-[520px] bg-surface-container-lowest rounded-t-3xl sm:rounded-2xl shadow-modal flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center sticky top-0 bg-surface-container-lowest z-10">
          <h3 className="font-sans text-headline-md text-on-background">{t('Reschedule Appointment')}</h3>
          <button
            onClick={onClose}
            aria-label={t('Close')}
            className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:bg-outline-variant transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <span className="font-sans text-body-lg text-on-background font-semibold">{formatMonthYear(viewMonth, lang)}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                >
                  <PrevIcon size={16} />
                </button>
                <button
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-container"
                >
                  <NextIcon size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-1">
              {WEEKDAY_LETTERS.map((w) => (
                <span key={w} className="font-mono text-[10px] text-on-surface-variant">
                  {t(w)}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {dayCells.map((day, i) => {
                if (!day) return <div key={`e-${i}`} />
                const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
                cellDate.setHours(0, 0, 0, 0)
                const iso = toISODate(cellDate)
                const isPast = cellDate < today
                const weekday = cellDate.getDay()
                const hours = perDayHours[weekday]
                const closed = !hours || !hours.working || hours.locked
                const disabled = isPast || closed
                const isSelected = iso === selectedDate
                return (
                  <button
                    key={day}
                    disabled={disabled}
                    onClick={() => {
                      setSelectedDate(iso)
                      setSelectedTime(null)
                    }}
                    className={`aspect-square rounded-full flex items-center justify-center font-sans transition-colors ${
                      disabled
                        ? 'text-outline opacity-40 cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'text-on-background hover:bg-surface-variant'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="font-sans text-body-lg text-on-background font-semibold">{t('Select Time')}</span>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {availableSlots.map((slot) => {
                  const active = slot === selectedTime
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-3 px-2 rounded-xl border font-sans transition-colors relative ${
                        active
                          ? 'border-2 border-primary bg-surface-container text-primary font-semibold'
                          : 'border-outline-variant text-on-background hover:border-primary hover:text-primary'
                      }`}
                    >
                      {formatTime(slot, lang)}
                      {active && (
                        <span className="absolute -top-2 -end-2 bg-primary text-on-primary rounded-full p-0.5">
                          <Check size={12} />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="font-sans text-body-sm text-on-surface-variant">{t('Fully Booked')}</p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-outline-variant bg-surface sticky bottom-0">
          <button
            disabled={!selectedDate || !selectedTime}
            onClick={() => onConfirm(selectedDate, selectedTime)}
            className="w-full bg-primary text-on-primary py-4 rounded-xl font-sans text-body-lg font-bold shadow-sm hover:bg-primary-container transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
          >
            {t('Confirm New Time')}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
