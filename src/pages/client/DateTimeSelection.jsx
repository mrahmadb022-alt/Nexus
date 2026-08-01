import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { formatDateLong, formatMonthYear, formatTime, generateSlots, toISODate } from '../../utils/date'
import StepIndicator from '../../components/client/StepIndicator'

const WEEKDAY_LETTERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function DateTimeSelection() {
  const { t, lang, isRtl } = useLanguage()
  const navigate = useNavigate()
  const { draft, setDraftDateTime, perDayHours, appointments } = useData()

  const today = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])

  const [viewMonth, setViewMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState(draft.date || toISODate(today))
  const [selectedTime, setSelectedTime] = useState(draft.time || null)

  const bookedTimesForDate = (isoDate) =>
    appointments.filter((a) => a.date === isoDate && a.status !== 'cancelled').map((a) => a.time)

  const slotsForDate = (isoDate) => {
    const weekday = new Date(isoDate + 'T00:00:00').getDay()
    const hours = perDayHours[weekday]
    if (!hours || !hours.working || hours.locked) return []
    return generateSlots(hours.start, hours.end)
  }

  const availableSlotsToday = useMemo(() => {
    const all = slotsForDate(selectedDate)
    const booked = bookedTimesForDate(selectedDate)
    return all.filter((s) => !booked.includes(s))
  }, [selectedDate, perDayHours, appointments])

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate()
  const firstWeekday = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay()

  const dayCells = []
  for (let i = 0; i < firstWeekday; i++) dayCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) dayCells.push(d)

  const cellStatus = (day) => {
    const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
    cellDate.setHours(0, 0, 0, 0)
    const iso = toISODate(cellDate)
    if (cellDate < today) return 'past'
    const slots = slotsForDate(iso)
    if (slots.length === 0) return 'closed'
    const booked = bookedTimesForDate(iso)
    const remaining = slots.filter((s) => !booked.includes(s))
    if (remaining.length === 0) return 'full'
    return 'available'
  }

  const handleSelectDay = (day) => {
    const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
    const iso = toISODate(cellDate)
    setSelectedDate(iso)
    setSelectedTime(null)
  }

  const canContinue = Boolean(selectedDate && selectedTime)

  const handleContinue = () => {
    setDraftDateTime(selectedDate, selectedTime)
    navigate('/confirm')
  }

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <header className="bg-surface flex justify-between items-center px-margin-mobile h-16 w-full max-w-container-max mx-auto sticky top-0 z-30">
        <button
          onClick={() => navigate('/services')}
          aria-label={t('Back')}
          className="text-primary hover:bg-surface-container transition-colors p-2 -ms-2 rounded-full active:scale-95"
        >
          <ArrowLeft size={22} className={isRtl ? 'rtl-mirror' : ''} />
        </button>
        <h1 className="font-display-lg-mobile text-display-lg-mobile font-bold text-primary">{t('Nexus Booking')}</h1>
        <div className="w-10" />
      </header>

      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile py-8 space-y-10 pb-40">
        <StepIndicator step={2} />

        <section className="max-w-2xl mx-auto w-full">
          <h2 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
            {t('Select Date & Time')}
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">{t("Choose when you'd like your appointment.")}</p>

          <div className="bg-surface shadow-card-client rounded-2xl p-6 mb-8 border border-surface-variant">
            <div className="flex items-center justify-between mb-6">
              <button
                aria-label={t('Previous Week')}
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-primary"
              >
                <PrevIcon size={20} />
              </button>
              <h3 className="font-headline-md text-headline-md text-primary">{formatMonthYear(viewMonth, lang)}</h3>
              <button
                aria-label={t('Next Week')}
                onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                className="p-2 hover:bg-surface-container rounded-full transition-colors text-primary"
              >
                <NextIcon size={20} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {WEEKDAY_LETTERS.map((w) => (
                <div key={w} className="text-center font-mono text-label-caps text-on-surface-variant">
                  {t(w)}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-4 gap-x-2">
              {dayCells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="h-10" />
                const cellDate = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day)
                const iso = toISODate(cellDate)
                const status = cellStatus(day)
                const isSelected = iso === selectedDate
                if (status === 'past' || status === 'closed') {
                  return (
                    <button
                      key={day}
                      disabled
                      className="h-10 flex items-center justify-center font-body-lg text-body-lg text-on-surface-variant opacity-30 cursor-not-allowed"
                    >
                      {day}
                    </button>
                  )
                }
                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDay(day)}
                    className={`h-10 flex items-center justify-center font-body-lg text-body-lg rounded transition-colors relative group ${
                      isSelected
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-background hover:bg-surface-container'
                    }`}
                  >
                    {day}
                    {!isSelected && (
                      <span
                        className={`absolute bottom-1 w-1 h-1 rounded-full ${
                          status === 'full' ? 'bg-error' : 'bg-primary opacity-50 group-hover:opacity-100'
                        }`}
                      />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 border-t border-surface-variant pt-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                <span className="font-mono text-label-caps text-on-surface-variant">{t('Available')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-error rounded-full" />
                <span className="font-mono text-label-caps text-on-surface-variant">{t('Waitlist')}</span>
              </div>
            </div>
          </div>

          {availableSlotsToday.length > 0 ? (
            <div className="mb-8">
              <h3 className="font-headline-md text-headline-md text-primary mb-4">
                {t('Available on')} {formatDateLong(selectedDate, lang)}
              </h3>
              <div className="flex overflow-x-auto gap-3 pb-4 hide-scrollbar snap-x">
                {availableSlotsToday.map((slot) => {
                  const active = slot === selectedTime
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`snap-start shrink-0 px-6 py-3 rounded-lg border transition-all font-mono text-data-tabular bg-surface ${
                        active
                          ? 'border-2 border-primary bg-primary/5 text-primary shadow-sm font-semibold'
                          : 'border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                      }`}
                    >
                      {formatTime(slot, lang)}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-error-container/30 rounded-2xl border border-error-container">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-error shrink-0" size={22} />
                <div>
                  <h4 className="font-headline-md text-headline-md text-on-background mb-1">{t('Fully Booked')}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">{t('dt.fullyBookedBody')}</p>
                  <button className="bg-surface text-error border border-error px-4 py-2 rounded-full font-mono text-label-caps hover:bg-error-container transition-colors">
                    {t('Join Waitlist')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <div className="fixed bottom-20 md:bottom-0 start-0 w-full bg-surface-container-lowest border-t border-surface-variant px-margin-mobile py-4 z-30 shadow-[0px_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-2xl mx-auto flex gap-4">
          <button
            disabled={!canContinue}
            onClick={handleContinue}
            className="flex-1 py-4 bg-primary text-on-primary rounded-full font-headline-md text-headline-md hover:bg-primary-container transition-colors shadow-sm active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {t('Continue')}
            <ArrowRight size={18} className={isRtl ? 'rtl-mirror' : ''} />
          </button>
        </div>
      </div>
    </div>
  )
}
