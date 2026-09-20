import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Lock, LockOpen, PlaneTakeoff, ChevronDown, Clock3 } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { addDays, formatDateRange, startOfWeek, toISODate, WEEKDAY_KEYS } from '../../utils/date'
import ManagerTopBar from '../../components/manager/ManagerTopBar'
import DayViewModal from '../../components/manager/DayViewModal'
import AppointmentDetailsModal from '../../components/manager/AppointmentDetailsModal'
import AvailableSlotsModal from '../../components/manager/AvailableSlotsModal'

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

function TimeSelect({ value, onChange, disabled }) {
  const [h, m] = value.split(':')
  return (
    <div className="flex items-center gap-1">
      <select
        value={h}
        disabled={disabled}
        onChange={(e) => onChange(`${e.target.value}:${m}`)}
        className="bg-surface border border-outline-variant rounded px-2 py-1.5 font-mono text-data-tabular disabled:opacity-40 focus:outline-none focus:border-primary"
      >
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>
            {hh}
          </option>
        ))}
      </select>
      <span className="text-on-surface-variant">:</span>
      <select
        value={m}
        disabled={disabled}
        onChange={(e) => onChange(`${h}:${e.target.value}`)}
        className="bg-surface border border-outline-variant rounded px-2 py-1.5 font-mono text-data-tabular disabled:opacity-40 focus:outline-none focus:border-primary"
      >
        {MINUTES.map((mm) => (
          <option key={mm} value={mm}>
            {mm}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function ManagerCalendar() {
  const { t, lang, isRtl } = useLanguage()
  const { perDayHours, updateDayHours, toggleDayLock } = useData()
  const [weekOffset, setWeekOffset] = useState(0)
  const [dayViewDate, setDayViewDate] = useState(null)
  const [availDate, setAvailDate] = useState(null)
  const [detailsAppt, setDetailsAppt] = useState(null)

  const weekStart = useMemo(() => addDays(startOfWeek(new Date()), weekOffset * 7), [weekOffset])
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const weekEnd = weekDates[6]

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  const todayIso = toISODate(new Date())

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar />
      <div className="flex-1 p-gutter lg:p-margin-desktop">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="font-sans text-display-lg text-primary">{t('Schedule')}</h2>
            <p className="font-sans text-body-lg text-on-surface-variant mt-1">{t('Manage weekly availability and working hours.')}</p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-low rounded-md p-1 border border-outline-variant shadow-sm self-start">
            <button
              aria-label={t('Previous Week')}
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <PrevIcon size={20} />
            </button>
            <span className="font-sans text-headline-md px-4 py-1 text-primary min-w-[190px] text-center">
              {formatDateRange(weekStart, weekEnd, lang)}
            </span>
            <button
              aria-label={t('Next Week')}
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-2 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant"
            >
              <NextIcon size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-4">
          {weekDates.map((date, i) => {
            const hours = perDayHours[i]
            const iso = toISODate(date)
            const isToday = iso === todayIso

            return (
              <div
                key={i}
                className={`rounded-md border p-4 flex flex-col gap-4 shadow-sm ${
                  hours.locked
                    ? 'bg-error-container/40 border-error/30'
                    : isToday
                      ? 'bg-primary-fixed/10 border-primary/30'
                      : 'bg-surface border-outline-variant'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-mono text-label-caps uppercase ${isToday ? 'text-primary' : 'text-outline'}`}>
                      {t(WEEKDAY_KEYS[i])}
                    </div>
                    <div className={`font-sans text-headline-md ${isToday ? 'text-primary font-bold' : 'text-on-surface'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleDayLock(i)}
                    aria-label={hours.locked ? t('Unlock Day') : t('Lock Day')}
                    title={hours.locked ? t('Unlock Day') : t('Lock Day')}
                    className={`p-2 rounded-full transition-colors ${
                      hours.locked
                        ? 'bg-error text-on-error hover:opacity-90'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {hours.locked ? <Lock size={16} /> : <LockOpen size={16} />}
                  </button>
                </div>

                {hours.locked ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                    <PlaneTakeoff className="text-error" size={26} />
                    <span className="font-sans text-body-sm text-on-error-container font-semibold">{t('Vacation / Locked')}</span>
                    <p className="font-sans text-[12px] text-on-error-container/80">{t('cal.lockedBody')}</p>
                  </div>
                ) : (
                  <>
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="font-sans text-body-sm text-on-surface-variant">{t('Working Day')}</span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={hours.working}
                          onChange={(e) => updateDayHours(i, { working: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary transition-colors" />
                        <div className="absolute top-[2px] start-[2px] bg-white border border-outline-variant rounded-full h-5 w-5 transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
                      </div>
                    </label>

                    {hours.working ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-label-caps text-on-surface-variant">{t('Start Time')}</span>
                          <TimeSelect value={hours.start} onChange={(v) => updateDayHours(i, { start: v })} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-label-caps text-on-surface-variant">{t('End Time')}</span>
                          <TimeSelect value={hours.end} onChange={(v) => updateDayHours(i, { end: v })} />
                        </div>
                      </div>
                    ) : (
                      <p className="font-sans text-body-sm text-on-surface-variant py-2 text-center">{t('Closed')}</p>
                    )}

                    <div className="border-t border-outline-variant/50 pt-3 flex items-stretch gap-2">
                      <button
                        onClick={() => setDayViewDate(iso)}
                        className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-1.5 py-2 rounded border border-outline-variant/50 hover:border-primary/50 font-mono text-[10px] leading-tight text-on-surface-variant hover:text-primary transition-colors text-center"
                      >
                        <ChevronDown size={13} className="shrink-0" />
                        <span className="break-words">{t('Appointments Today')}</span>
                      </button>
                      <button
                        onClick={() => setAvailDate(iso)}
                        className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1 px-1.5 py-2 rounded border border-outline-variant/50 hover:border-primary/50 font-mono text-[10px] leading-tight text-on-surface-variant hover:text-primary transition-colors text-center"
                      >
                        <Clock3 size={13} className="shrink-0" />
                        <span className="break-words">{t('Available')}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
      {dayViewDate && (
        <DayViewModal
          date={dayViewDate}
          onClose={() => setDayViewDate(null)}
          onSelectAppointment={(appt) => {
            setDayViewDate(null)
            setDetailsAppt(appt)
          }}
        />
      )}
      {detailsAppt && <AppointmentDetailsModal appointment={detailsAppt} onClose={() => setDetailsAppt(null)} />}
      {availDate && <AvailableSlotsModal date={availDate} onClose={() => setAvailDate(null)} />}
    </div>
  )
}
