import { useLanguage } from '../context/LanguageContext'
import { useData, serviceName } from '../context/DataContext'
import { bookingToEvent } from '../lib/ics'

// appointment → calendar event (lib/ics) with localized service/staff names.
export function useCalendarEvent() {
  const { t } = useLanguage()
  const { services, businessSettings, getStaffById } = useData()
  return (appointment, audience = 'client') =>
    bookingToEvent(appointment, businessSettings, {
      audience,
      serviceName: serviceName(services.find((s) => s.id === appointment.serviceId), t),
      staffName: appointment.staffId ? getStaffById(appointment.staffId)?.name || '' : '',
    })
}
