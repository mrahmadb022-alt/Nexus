import { describe, expect, it } from 'vitest'
import { addDaysIso, daysInclusive, todayIso, weekdayOf, zonedNow, zonedTimeToUtc } from './time'

describe('business clock (Asia/Jerusalem)', () => {
  it('reads today in Jerusalem, not UTC', () => {
    // 22:30 UTC on Oct 5 is already 01:30 on Oct 6 in Jerusalem (IDT, UTC+3).
    expect(todayIso(new Date('2026-10-05T22:30:00Z'))).toBe('2026-10-06')
    expect(zonedNow(new Date('2026-10-05T22:30:00Z')).minutes).toBe(90)
  })

  it('converts wall-clock time to UTC across DST', () => {
    expect(zonedTimeToUtc('2026-07-01', '10:00').toISOString()).toBe('2026-07-01T07:00:00.000Z') // IDT +3
    expect(zonedTimeToUtc('2026-12-01', '10:00').toISOString()).toBe('2026-12-01T08:00:00.000Z') // IST +2
  })

  it('does date arithmetic on ISO strings', () => {
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDaysIso('2026-03-01', -1)).toBe('2026-02-28')
    expect(weekdayOf('2026-10-04')).toBe(0)
    expect(daysInclusive('2026-10-01', '2026-10-31')).toBe(31)
  })
})
