// Business-clock helpers. Every "today" / "now" / "is this in the past" check reads the wall
// clock in Asia/Jerusalem — never the device's local timezone and never `toISOString()`
// (always UTC, which puts late-evening bookings on the wrong day). Gregorian calendar and
// Western digits are forced so Hebrew/Arabic locales can't change the parsed values.

export const BUSINESS_TZ = 'Asia/Jerusalem'

const formatterCache = new Map()

function partsFormatter(timeZone) {
  if (!formatterCache.has(timeZone)) {
    formatterCache.set(
      timeZone,
      new Intl.DateTimeFormat('en-US', {
        timeZone,
        calendar: 'gregory',
        numberingSystem: 'latn',
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        weekday: 'short',
      }),
    )
  }
  return formatterCache.get(timeZone)
}

const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Wall-clock reading of an instant in the business timezone: ISO date, minutes since midnight, weekday (0 = Sunday). */
export function zonedNow(now = new Date(), timeZone = BUSINESS_TZ) {
  const parts = Object.fromEntries(partsFormatter(timeZone).formatToParts(now).map((p) => [p.type, p.value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
    weekday: WEEKDAY_INDEX[parts.weekday],
  }
}

/** Today's date (YYYY-MM-DD) in Asia/Jerusalem. */
export function todayIso(now = new Date()) {
  return zonedNow(now).date
}

/** Calendar arithmetic on YYYY-MM-DD strings (UTC-based, so no DST drift). */
export function addDaysIso(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** Weekday (0 = Sunday) of a YYYY-MM-DD date, independent of any timezone. */
export function weekdayOf(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** Whole days from `from` to `to` (both YYYY-MM-DD), inclusive. */
export function daysInclusive(from, to) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000) + 1
}

/** The UTC instant a wall-clock date + time happens at in the business timezone. */
export function zonedTimeToUtc(isoDate, hhmm, timeZone = BUSINESS_TZ) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const [hh, mm] = hhmm.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  // Offset of the zone at the guessed instant; a second pass settles DST edges.
  let ts = guess
  for (let i = 0; i < 2; i++) {
    const z = zonedNow(new Date(ts), timeZone)
    const [zy, zm, zd] = z.date.split('-').map(Number)
    const asIfUtc = Date.UTC(zy, zm - 1, zd, Math.floor(z.minutes / 60), z.minutes % 60)
    ts = guess - (asIfUtc - ts)
  }
  return new Date(ts)
}
