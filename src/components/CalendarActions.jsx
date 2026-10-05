import { CalendarPlus, CalendarDays } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useData } from '../context/DataContext'
import { buildCalendar, googleCalendarUrl } from '../lib/ics'
import { downloadFile } from '../lib/download'
import { useCalendarEvent } from '../hooks/useCalendarEvent'

// "Add to calendar" (.ics download, works with Apple/Outlook/most phones) + a Google Calendar
// template link, side by side — a button and a link, never one inside the other.
export default function CalendarActions({ appointment, audience = 'client' }) {
  const { t } = useLanguage()
  const { isFeatureOn, businessSettings } = useData()
  const toEvent = useCalendarEvent()
  if (!isFeatureOn('calendar') || appointment.status === 'cancelled') return null

  const event = toEvent(appointment, audience)
  const downloadIcs = () =>
    downloadFile(
      `booking-${appointment.date}-${appointment.time.replace(':', '')}.ics`,
      buildCalendar({ name: businessSettings.name, events: [event] }),
      'text/calendar;charset=utf-8',
    )

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <button type="button" onClick={downloadIcs} className="flex items-center gap-1.5 font-sans text-body-sm text-primary hover:underline">
        <CalendarPlus size={14} /> {t('calendar.add')}
      </button>
      <a
        href={googleCalendarUrl(event)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 font-sans text-body-sm text-primary hover:underline"
      >
        <CalendarDays size={14} /> {t('calendar.google')}
      </a>
    </div>
  )
}
