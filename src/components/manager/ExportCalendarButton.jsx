import { CalendarArrowDown } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { buildCalendar } from '../../lib/ics'
import { downloadFile } from '../../lib/download'
import { todayIso } from '../../lib/time'
import { useCalendarEvent } from '../../hooks/useCalendarEvent'

// Every booking as one .ics file for the manager's own calendar app. Cancelled bookings are
// included with STATUS:CANCELLED so re-importing removes them from calendars that had them.
export default function ExportCalendarButton() {
  const { t } = useLanguage()
  const { isFeatureOn, appointments, businessSettings } = useData()
  const toEvent = useCalendarEvent()
  if (!isFeatureOn('calendar')) return null

  const handleExport = () => {
    const events = appointments.map((a) => toEvent(a, 'owner'))
    downloadFile(`bookings-${todayIso()}.ics`, buildCalendar({ name: businessSettings.name, events }), 'text/calendar;charset=utf-8')
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      className="btn-secondary px-4 py-2 text-sm flex items-center justify-center gap-2 self-start"
    >
      <CalendarArrowDown size={16} />
      {t('calendar.exportAll')}
    </button>
  )
}
