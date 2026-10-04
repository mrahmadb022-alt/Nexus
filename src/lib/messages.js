// Message bodies for WhatsApp links and the (simulated) automated-message log. Pure: callers pass
// the translation function, so every language stays in sync with translations.features.js.

export const MESSAGE_KINDS = ['confirmation', 'reminder', 'cancellation']

const INTL_LOCALE = { en: 'en-US', he: 'he-IL', ar: 'ar' }

export function interpolate(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

/** "Tuesday, October 6" in the message language — Gregorian calendar, Western digits, no timezone shift. */
export function formatMessageDate(isoDate, lang) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Intl.DateTimeFormat(INTL_LOCALE[lang] || 'en-US', {
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(Date.UTC(y, m - 1, d)))
}

/** The values a booking message is built from. Times stay 24h ("14:00") in every language. */
export function bookingMessageVars({ appointment, businessName, serviceLabel, lang }) {
  return {
    name: (appointment.clientName || '').trim(),
    business: businessName || '',
    service: serviceLabel || '',
    date: formatMessageDate(appointment.date, lang),
    time: appointment.time,
  }
}

/** Plain-text body for a booking message kind (confirmation / reminder / cancellation / clientToBusiness). */
export function renderBookingMessage(kind, vars, t) {
  return interpolate(t(`msg.${kind}`), vars)
}

/** Hours before the appointment a reminder would go out; null if the booking has no future start. */
export function reminderSendTime(startMs, hoursBefore) {
  if (!Number.isFinite(startMs)) return null
  return startMs - hoursBefore * 60 * 60 * 1000
}
