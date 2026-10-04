import { useLanguage } from '../context/LanguageContext'
import { useData, serviceName } from '../context/DataContext'
import { bookingMessageVars, renderBookingMessage } from '../lib/messages'

// (kind, appointment) → localized message text in the current UI language, e.g. the prefilled
// WhatsApp confirmation, or what the simulated message log records.
export function useBookingMessage() {
  const { t, lang } = useLanguage()
  const { services, businessSettings } = useData()
  return (kind, appointment) => {
    const svc = services.find((s) => s.id === appointment.serviceId)
    const vars = bookingMessageVars({
      appointment,
      businessName: businessSettings.name,
      serviceLabel: serviceName(svc, t),
      lang,
    })
    return renderBookingMessage(kind, vars, t)
  }
}
