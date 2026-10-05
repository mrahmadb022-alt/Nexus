// Slot generation + double-booking checks, adapted from booking-app's lib/availability.js to
// Nexus's per-weekday hours ({ working, start, end, locked }).
//
// Conflicts are duration-aware interval overlap, not start-time equality: two 60-minute
// appointments starting 30 minutes apart do overlap. Availability is per staff member — a
// booking only blocks its own staff member's calendar (unassigned bookings share the `null`
// calendar) — and "any available" is the union over all staff.

import { weekdayOf, zonedNow } from './time'

export const SLOT_STEP_MINUTES = 30

export function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function toHHMM(minutes) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

const isActive = (b) => b.status !== 'cancelled'
const durationOf = (b) => b.durationMinutes || SLOT_STEP_MINUTES

/** [startA, startA+durA) and [startB, startB+durB) overlap. */
export function intervalsOverlap(startA, durA, startB, durB) {
  return startA < startB + durB && startB < startA + durA
}

function bookingsOfStaff(bookings, staffId) {
  return bookings.filter((b) => (b.staffId ?? null) === staffId)
}

/** Open hours for a date, or null when closed/locked. */
export function hoursForDate(perDayHours, date) {
  const hours = perDayHours[weekdayOf(date)]
  if (!hours || !hours.working || hours.locked) return null
  return hours
}

/**
 * Open start times on `date` for a service of `durationMinutes`.
 * - `staffIds` given: a slot is open when at least one listed staff member is free
 *   (one id = that person; every id = "any available").
 * - `staffIds` omitted: one shared calendar, every booking blocks.
 * Slots must fit before closing, and today's slots that have already started are skipped
 * (Jerusalem clock).
 */
export function computeAvailableSlots({
  perDayHours,
  date,
  durationMinutes,
  bookings,
  staffIds,
  excludeBookingId,
  now = new Date(),
  step = SLOT_STEP_MINUTES,
}) {
  const hours = hoursForDate(perDayHours, date)
  if (!hours) return []
  const pool = bookings.filter((b) => b.date === date && isActive(b) && b.id !== excludeBookingId)

  const openMin = toMinutes(hours.start)
  const closeMin = toMinutes(hours.end)
  const clock = zonedNow(now)
  const isToday = date === clock.date
  if (date < clock.date) return []

  const calendars = Array.isArray(staffIds) && staffIds.length > 0 ? staffIds.map((id) => bookingsOfStaff(pool, id)) : [pool]

  const slots = []
  for (let start = openMin; start + durationMinutes <= closeMin; start += step) {
    if (isToday && start <= clock.minutes) continue
    const someoneFree = calendars.some((cal) =>
      cal.every((b) => !intervalsOverlap(start, durationMinutes, toMinutes(b.time), durationOf(b))),
    )
    if (someoneFree) slots.push(toHHMM(start))
  }
  return slots
}

/**
 * Would (date, time, duration) collide with an existing booking? With `staffId` (null =
 * unassigned) only that staff member's bookings count; with `staffId` undefined, all do.
 */
export function hasConflict({ date, time, durationMinutes, bookings, staffId, excludeBookingId }) {
  const start = toMinutes(time)
  const pool = staffId === undefined ? bookings : bookingsOfStaff(bookings, staffId)
  return pool
    .filter((b) => b.date === date && isActive(b) && b.id !== excludeBookingId)
    .some((b) => intervalsOverlap(start, durationMinutes, toMinutes(b.time), durationOf(b)))
}

/**
 * "Any available": staff free for this slot, least busy that day first (spreads the load),
 * ties in the given order. Empty when nobody is free.
 */
export function freeStaffForSlot({ date, time, durationMinutes, bookings, staffIds }) {
  const dayLoad = (staffId) => bookingsOfStaff(bookings, staffId).filter((b) => b.date === date && isActive(b)).length
  return staffIds
    .filter((staffId) => !hasConflict({ date, time, durationMinutes, bookings, staffId }))
    .map((staffId, order) => ({ staffId, order, load: dayLoad(staffId) }))
    .sort((a, b) => a.load - b.load || a.order - b.order)
    .map((x) => x.staffId)
}
