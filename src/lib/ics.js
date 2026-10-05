// iCalendar (RFC 5545) writer for "Add to calendar" downloads and the manager's export, plus the
// Google Calendar template link. Pure, ported from booking-app's lib/integrations/ics.js.

import { zonedTimeToUtc } from './time'

const MAX_LINE_OCTETS = 75

/** TEXT value escaping (RFC 5545 §3.3.11). */
export function escapeText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
}

/** Folds a content line at 75 octets without splitting a UTF-8 character (Hebrew/Arabic are 2 bytes each). */
export function foldLine(line) {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= MAX_LINE_OCTETS) return line
  const parts = []
  let current = ''
  let currentBytes = 0
  for (const ch of line) {
    const bytes = encoder.encode(ch).length
    // Continuation lines start with a space, which counts toward their 75 octets.
    const limit = parts.length === 0 ? MAX_LINE_OCTETS : MAX_LINE_OCTETS - 1
    if (currentBytes + bytes > limit) {
      parts.push(current)
      current = ''
      currentBytes = 0
    }
    current += ch
    currentBytes += bytes
  }
  parts.push(current)
  return parts.join('\r\n ')
}

/** 20261006T110000Z */
export function formatUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/**
 * One event from a booking. `audience` decides the wording: the client sees the business, the
 * manager's export shows the client. `serviceName` / `staffName` are passed in already localized.
 */
export function bookingToEvent(booking, business, { audience = 'client', serviceName = '', staffName = '' } = {}) {
  const start = zonedTimeToUtc(booking.date, booking.time)
  const end = new Date(start.getTime() + (booking.durationMinutes || 30) * 60000)
  const isOwner = audience === 'owner'
  const summary = (isOwner ? [booking.clientName, serviceName] : [serviceName, business.name]).filter(Boolean).join(' · ')
  const description = isOwner
    ? [booking.clientPhone, staffName].filter(Boolean).join('\n')
    : [staffName, business.phone].filter(Boolean).join('\n')
  return {
    uid: `${booking.id}@nexus-booking`,
    start,
    end,
    summary,
    description,
    location: (business.address || '').replace(/\n/g, ', '),
    status: booking.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
    // Bumped by reschedules so calendar apps replace the old copy instead of keeping both.
    sequence: Math.floor((booking.updatedAt || booking.createdAt || 0) / 1000) % 2147483647,
  }
}

/** A complete VCALENDAR document (CRLF line endings). */
export function buildCalendar({ name, events, now = new Date() }) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Nexus Booking//Bookings//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH']
  if (name) lines.push(`X-WR-CALNAME:${escapeText(name)}`)
  for (const e of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${escapeText(e.uid)}`,
      `DTSTAMP:${formatUtc(now)}`,
      `DTSTART:${formatUtc(e.start)}`,
      `DTEND:${formatUtc(e.end)}`,
      `SUMMARY:${escapeText(e.summary)}`,
    )
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`)
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`)
    lines.push(`STATUS:${e.status || 'CONFIRMED'}`, `SEQUENCE:${e.sequence || 0}`, 'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}

/** "Add to Google Calendar" template link: no OAuth, opens a prefilled event. */
export function googleCalendarUrl(event) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.summary,
    dates: `${formatUtc(event.start)}/${formatUtc(event.end)}`,
    details: event.description || '',
    location: event.location || '',
    ctz: 'Asia/Jerusalem',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}
