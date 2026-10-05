// Manager finance overview numbers. Pure functions over plain booking/expense objects, so the
// dashboard, the exports and the tests all agree. Ported from booking-app's lib/finance.js.
//
// Definitions (management overview, not bookkeeping):
//   income       = sum of amountPaidAgorot over bookings with paymentStatus "paid", attributed to
//                  the booking's date (the day the service happened)
//   expenses     = sum of expense amounts dated in the range
//   no-show rate = no-show bookings / bookings that already happened in the range
//                  (date <= today, not cancelled)
//   busiest days/hours count non-cancelled bookings

import { addDaysIso, daysInclusive, weekdayOf } from './time'

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'no_show', 'cancelled']
export const PAYMENT_METHODS = ['cash', 'bit', 'card', 'transfer', 'other']
export const EXPENSE_CATEGORIES = ['materials', 'rent', 'equipment', 'marketing', 'other']

const inRange = (date, from, to) => date >= from && date <= to
const isCancelled = (b) => b.status === 'cancelled' || b.paymentStatus === 'cancelled'

/** Trend buckets: daily up to ~2 months, weekly up to ~6 months, monthly beyond. Keys are bucket-start ISO dates. */
export function trendBuckets(from, to) {
  const span = daysInclusive(from, to)
  const unit = span <= 62 ? 'day' : span <= 190 ? 'week' : 'month'
  const buckets = []
  let cursor = from
  if (unit === 'week') cursor = addDaysIso(from, -weekdayOf(from))
  if (unit === 'month') cursor = `${from.slice(0, 7)}-01`
  while (cursor <= to) {
    buckets.push(cursor)
    if (unit === 'day') cursor = addDaysIso(cursor, 1)
    else if (unit === 'week') cursor = addDaysIso(cursor, 7)
    else {
      const [y, m] = cursor.split('-').map(Number)
      cursor = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`
    }
  }
  return { unit, buckets }
}

function bucketFor(date, unit) {
  if (unit === 'day') return date
  if (unit === 'week') return addDaysIso(date, -weekdayOf(date))
  return `${date.slice(0, 7)}-01`
}

/**
 * @param {{ bookings: object[], expenses: object[], from: string, to: string, today: string }} input
 * Bookings carry `serviceName` (already localized) for the revenue-by-service breakdown.
 */
export function computeFinance({ bookings, expenses, from, to, today }) {
  const ranged = bookings.filter((b) => inRange(b.date, from, to))
  const paid = ranged.filter((b) => b.paymentStatus === 'paid')
  const rangedExpenses = expenses.filter((e) => inRange(e.date, from, to))

  const incomeAgorot = paid.reduce((sum, b) => sum + (b.amountPaidAgorot || 0), 0)
  const expensesAgorot = rangedExpenses.reduce((sum, e) => sum + e.amountAgorot, 0)

  const happened = ranged.filter((b) => b.date <= today && !isCancelled(b))
  const noShows = happened.filter((b) => b.paymentStatus === 'no_show').length

  const byService = new Map()
  for (const b of paid) {
    const key = b.serviceId || b.serviceName || '—'
    const entry = byService.get(key) || { name: b.serviceName || '—', agorot: 0, count: 0 }
    entry.agorot += b.amountPaidAgorot || 0
    entry.count += 1
    byService.set(key, entry)
  }

  const active = ranged.filter((b) => !isCancelled(b))
  const byWeekday = Array.from({ length: 7 }, (_, weekday) => ({ weekday, count: 0 }))
  const byHour = new Map()
  for (const b of active) {
    byWeekday[weekdayOf(b.date)].count += 1
    const hour = Number(b.time.slice(0, 2))
    byHour.set(hour, (byHour.get(hour) || 0) + 1)
  }

  const { unit, buckets } = trendBuckets(from, to)
  const trendMap = new Map(buckets.map((key) => [key, { key, incomeAgorot: 0, expensesAgorot: 0 }]))
  // A range that starts mid-week/mid-month still has its first bucket keyed at the period start.
  const slot = (date) => trendMap.get(bucketFor(date, unit)) || trendMap.get(buckets[0])
  for (const b of paid) slot(b.date).incomeAgorot += b.amountPaidAgorot || 0
  for (const e of rangedExpenses) slot(e.date).expensesAgorot += e.amountAgorot

  const expensesByCategory = EXPENSE_CATEGORIES.map((category) => ({
    category,
    agorot: rangedExpenses.filter((e) => e.category === category).reduce((s, e) => s + e.amountAgorot, 0),
  })).filter((c) => c.agorot > 0)

  return {
    from,
    to,
    incomeAgorot,
    expensesAgorot,
    profitAgorot: incomeAgorot - expensesAgorot,
    paidCount: paid.length,
    bookingCount: active.length,
    noShowCount: noShows,
    happenedCount: happened.length,
    noShowRate: happened.length ? noShows / happened.length : 0,
    revenueByService: [...byService.values()].sort((a, b) => b.agorot - a.agorot),
    byWeekday,
    byHour: [...byHour.entries()].map(([hour, count]) => ({ hour, count })).sort((a, b) => a.hour - b.hour),
    trendUnit: unit,
    trend: [...trendMap.values()],
    expensesByCategory,
  }
}

/** "This month": first of the month → today. */
export function thisMonthRange(today) {
  return { from: `${today.slice(0, 7)}-01`, to: today }
}

export function lastMonthRange(today) {
  const [y, m] = today.split('-').map(Number)
  const from = m === 1 ? `${y - 1}-12-01` : `${y}-${String(m - 1).padStart(2, '0')}-01`
  return { from, to: addDaysIso(`${today.slice(0, 7)}-01`, -1) }
}

export function last30DaysRange(today) {
  return { from: addDaysIso(today, -29), to: today }
}

export function yearToDateRange(today) {
  return { from: `${today.slice(0, 4)}-01-01`, to: today }
}
