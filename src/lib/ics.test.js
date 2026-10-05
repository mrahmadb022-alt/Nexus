import { describe, expect, it } from 'vitest'
import { bookingToEvent, buildCalendar, escapeText, foldLine, googleCalendarUrl } from './ics'

const business = { name: 'Studio, Nails', phone: '03-555-1234', address: 'Herzl 1\nTel Aviv' }
const booking = { id: 'apt-1', clientName: 'דנה', clientPhone: '054-123-4567', date: '2026-10-06', time: '14:00', durationMinutes: 90, status: 'confirmed' }

describe('ics', () => {
  it('escapes TEXT values', () => {
    expect(escapeText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
  })

  it('folds long lines at 75 octets without splitting multibyte characters', () => {
    const line = `SUMMARY:${'ש'.repeat(80)}`
    const folded = foldLine(line)
    const enc = new TextEncoder()
    for (const part of folded.split('\r\n')) expect(enc.encode(part).length).toBeLessThanOrEqual(75)
    expect(folded.replace(/\r\n /g, '')).toBe(line)
  })

  it('places the event at the Jerusalem wall-clock time with the booking duration', () => {
    const e = bookingToEvent(booking, business, { audience: 'client', serviceName: 'ג׳ל' })
    expect(e.start.toISOString()).toBe('2026-10-06T11:00:00.000Z')
    expect(e.end.toISOString()).toBe('2026-10-06T12:30:00.000Z')
    expect(e.summary).toBe('ג׳ל · Studio, Nails')
    expect(e.location).toBe('Herzl 1, Tel Aviv')
    expect(bookingToEvent(booking, business, { audience: 'owner', serviceName: 'Gel' }).summary).toBe('דנה · Gel')
  })

  it('builds a VCALENDAR with CRLF lines and one VEVENT per booking', () => {
    const events = [bookingToEvent(booking, business), bookingToEvent({ ...booking, id: 'apt-2', status: 'cancelled' }, business)]
    const ics = buildCalendar({ name: 'Bookings', events, now: new Date('2026-10-05T00:00:00Z') })
    expect(ics.startsWith('BEGIN:VCALENDAR\r\nVERSION:2.0\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(ics).toContain('DTSTART:20261006T110000Z')
    expect(ics).toContain('DTEND:20261006T123000Z')
    expect(ics).toContain('STATUS:CANCELLED')
    expect(ics).toContain('LOCATION:Herzl 1\\, Tel Aviv')
    expect(ics).not.toMatch(/[^\r]\n/)
  })

  it('builds a Google Calendar template link', () => {
    const url = new URL(googleCalendarUrl(bookingToEvent(booking, business, { serviceName: 'Gel' })))
    expect(url.hostname).toBe('calendar.google.com')
    expect(url.searchParams.get('action')).toBe('TEMPLATE')
    expect(url.searchParams.get('dates')).toBe('20261006T110000Z/20261006T123000Z')
    expect(url.searchParams.get('text')).toBe('Gel · Studio, Nails')
  })
})
