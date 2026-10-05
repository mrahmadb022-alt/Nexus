// Message bodies for WhatsApp links and the (simulated) automated-message log. Pure: callers pass
// the translation function, so every language stays in sync with translations.features.js.

import { zonedTimeToUtc } from './time'

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

/**
 * Reminders that would be scheduled for upcoming bookings: one per active booking that hasn't
 * started, sent `hoursBefore` hours ahead (or right away when the booking is already inside that
 * window). Sorted by send time.
 */
export function scheduledReminders(appointments, { hoursBefore, now = Date.now() }) {
  return appointments
    .filter((a) => a.status === 'confirmed' || a.status === 'pending')
    .map((a) => {
      const startMs = zonedTimeToUtc(a.date, a.time).getTime()
      return { appointment: a, startMs, sendAtMs: Math.max(now, startMs - hoursBefore * 3600000) }
    })
    .filter((r) => r.startMs > now)
    .sort((x, y) => x.sendAtMs - y.sendAtMs || x.startMs - y.startMs)
}
