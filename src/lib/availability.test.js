import { describe, expect, it } from 'vitest'
import { computeAvailableSlots, freeStaffForSlot, hasConflict, intervalsOverlap } from './availability'

const hours = {
  0: { working: true, start: '09:00', end: '12:00', locked: false },
  1: { working: true, start: '09:00', end: '12:00', locked: false },
  2: { working: true, start: '09:00', end: '12:00', locked: true },
  3: { working: false, start: '00:00', end: '00:00', locked: false },
  4: { working: true, start: '09:00', end: '12:00', locked: false },
  5: { working: true, start: '09:00', end: '12:00', locked: false },
  6: { working: false, start: '00:00', end: '00:00', locked: true },
}
// 2026-10-11 is a Sunday; "now" is well before it.
const DATE = '2026-10-11'
const now = new Date('2026-10-05T06:00:00Z')
const b = (o) => ({ id: Math.random().toString(36).slice(2), date: DATE, status: 'confirmed', durationMinutes: 60, ...o })

describe('intervalsOverlap', () => {
  it('treats touching intervals as free and partial overlap as a conflict', () => {
    expect(intervalsOverlap(600, 60, 660, 60)).toBe(false)
    expect(intervalsOverlap(600, 60, 630, 60)).toBe(true)
    expect(intervalsOverlap(600, 120, 630, 15)).toBe(true)
  })
})

describe('computeAvailableSlots', () => {
  it('fits the service duration before closing', () => {
    const slots = computeAvailableSlots({ perDayHours: hours, date: DATE, durationMinutes: 90, bookings: [], now })
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30'])
  })

  it('returns nothing on closed or locked days and in the past', () => {
    expect(computeAvailableSlots({ perDayHours: hours, date: '2026-10-13', durationMinutes: 30, bookings: [], now })).toEqual([]) // Tue locked
    expect(computeAvailableSlots({ perDayHours: hours, date: '2026-10-14', durationMinutes: 30, bookings: [], now })).toEqual([]) // Wed closed
    expect(computeAvailableSlots({ perDayHours: hours, date: '2026-10-04', durationMinutes: 30, bookings: [], now })).toEqual([])
  })

  it("skips today's slots that already started (Jerusalem clock)", () => {
    // 07:15 UTC = 10:15 in Jerusalem on Sunday 2026-10-11
    const slots = computeAvailableSlots({ perDayHours: hours, date: DATE, durationMinutes: 30, bookings: [], now: new Date('2026-10-11T07:15:00Z') })
    expect(slots).toEqual(['10:30', '11:00', '11:30'])
  })

  it('blocks overlapping starts, not just equal ones (shared calendar)', () => {
    const bookings = [b({ staffId: 'sarah', time: '10:00', durationMinutes: 60 })]
    const slots = computeAvailableSlots({ perDayHours: hours, date: DATE, durationMinutes: 60, bookings, now })
    expect(slots).toEqual(['09:00', '11:00'])
  })

  it("only blocks that staff member's own calendar", () => {
    const bookings = [b({ staffId: 'sarah', time: '10:00', durationMinutes: 60 })]
    const sarah = computeAvailableSlots({ perDayHours: hours, date: DATE, durationMinutes: 60, bookings, staffIds: ['sarah'], now })
    const david = computeAvailableSlots({ perDayHours: hours, date: DATE, durationMinutes: 60, bookings, staffIds: ['david'], now })
    expect(sarah).toEqual(['09:00', '11:00'])
    expect(david).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00'])
  })

  it('"any available" is open while at least one staff member is free', () => {
    const bookings = [b({ staffId: 'sarah', time: '09:00', durationMinutes: 180 }), b({ staffId: 'david', time: '10:00', durationMinutes: 60 })]
    const any = computeAvailableSlots({ perDayHours: hours, date: DATE, durationMinutes: 60, bookings, staffIds: ['sarah', 'david'], now })
    expect(any).toEqual(['09:00', '11:00'])
  })

  it('ignores cancelled bookings and the booking being rescheduled', () => {
    const own = b({ staffId: 'sarah', time: '09:00', durationMinutes: 180 })
    const bookings = [own, b({ staffId: 'sarah', time: '09:00', status: 'cancelled', durationMinutes: 180 })]
    const slots = computeAvailableSlots({ perDayHours: hours, date: DATE, durationMinutes: 60, bookings, staffIds: ['sarah'], excludeBookingId: own.id, now })
    expect(slots).toHaveLength(5)
  })
})

describe('double-booking checks', () => {
  const bookings = [b({ staffId: 'sarah', time: '10:00', durationMinutes: 60 }), b({ staffId: 'david', time: '09:00', durationMinutes: 30 })]

  it('detects conflicts per staff member', () => {
    expect(hasConflict({ date: DATE, time: '10:30', durationMinutes: 30, bookings, staffId: 'sarah' })).toBe(true)
    expect(hasConflict({ date: DATE, time: '10:30', durationMinutes: 30, bookings, staffId: 'david' })).toBe(false)
    expect(hasConflict({ date: DATE, time: '09:15', durationMinutes: 30, bookings })).toBe(true)
  })

  it('assigns "any available" to the least busy free staff member', () => {
    const extra = [...bookings, b({ staffId: 'sarah', time: '11:00', durationMinutes: 30 })]
    expect(freeStaffForSlot({ date: DATE, time: '09:30', durationMinutes: 30, bookings: extra, staffIds: ['sarah', 'david', 'elena'] })).toEqual([
      'elena',
      'david',
      'sarah',
    ])
    expect(freeStaffForSlot({ date: DATE, time: '10:00', durationMinutes: 60, bookings, staffIds: ['sarah'] })).toEqual([])
  })
})
