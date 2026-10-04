import { describe, expect, it } from 'vitest'
import { computeFinance, lastMonthRange, thisMonthRange, trendBuckets, yearToDateRange } from './finance'

let seq = 0
const b = (o) => ({ id: `b${seq++}`, status: 'completed', time: '10:00', paymentStatus: 'unpaid', ...o })

describe('computeFinance', () => {
  const bookings = [
    b({ date: '2026-10-01', paymentStatus: 'paid', amountPaidAgorot: 15000, serviceId: 'gel', serviceName: 'Gel' }),
    b({ date: '2026-10-02', paymentStatus: 'paid', amountPaidAgorot: 8000, serviceId: 'mani', serviceName: 'Manicure', time: '14:30' }),
    b({ date: '2026-10-02', paymentStatus: 'paid', amountPaidAgorot: 15000, serviceId: 'gel', serviceName: 'Gel' }),
    b({ date: '2026-10-03', paymentStatus: 'no_show' }),
    b({ date: '2026-10-03', status: 'cancelled', paymentStatus: 'cancelled' }),
    b({ date: '2026-10-09', status: 'confirmed' }), // future
    b({ date: '2026-09-30', paymentStatus: 'paid', amountPaidAgorot: 99900 }), // out of range
  ]
  const expenses = [
    { id: 'e1', date: '2026-10-02', category: 'materials', amountAgorot: 4550 },
    { id: 'e2', date: '2026-10-05', category: 'rent', amountAgorot: 100000 },
    { id: 'e3', date: '2026-11-01', category: 'rent', amountAgorot: 100000 },
  ]
  const r = computeFinance({ bookings, expenses, from: '2026-10-01', to: '2026-10-31', today: '2026-10-05' })

  it('sums income, expenses and profit in agorot', () => {
    expect(r.incomeAgorot).toBe(38000)
    expect(r.expensesAgorot).toBe(104550)
    expect(r.profitAgorot).toBe(38000 - 104550)
  })

  it('computes the no-show rate over bookings that already happened, excluding cancellations', () => {
    expect(r.happenedCount).toBe(4)
    expect(r.noShowCount).toBe(1)
    expect(r.noShowRate).toBeCloseTo(0.25)
  })

  it('ranks revenue by service', () => {
    expect(r.revenueByService).toEqual([
      { name: 'Gel', agorot: 30000, count: 2 },
      { name: 'Manicure', agorot: 8000, count: 1 },
    ])
  })

  it('counts busiest weekdays and hours without cancellations', () => {
    expect(r.bookingCount).toBe(5)
    expect(r.byWeekday[5].count).toBe(3) // two on Fri 2026-10-02 + the upcoming Fri 2026-10-09
    expect(r.byHour).toEqual([
      { hour: 10, count: 4 },
      { hour: 14, count: 1 },
    ])
  })

  it('fills daily trend buckets', () => {
    expect(r.trendUnit).toBe('day')
    expect(r.trend).toHaveLength(31)
    expect(r.trend[1]).toEqual({ key: '2026-10-02', incomeAgorot: 23000, expensesAgorot: 4550 })
  })
})

describe('ranges and buckets', () => {
  it('builds preset ranges', () => {
    expect(thisMonthRange('2026-10-05')).toEqual({ from: '2026-10-01', to: '2026-10-05' })
    expect(lastMonthRange('2026-01-15')).toEqual({ from: '2025-12-01', to: '2025-12-31' })
    expect(yearToDateRange('2026-10-05')).toEqual({ from: '2026-01-01', to: '2026-10-05' })
  })

  it('switches to weekly and monthly buckets for longer ranges', () => {
    const weekly = trendBuckets('2026-07-01', '2026-10-05')
    expect(weekly.unit).toBe('week')
    expect(weekly.buckets[0]).toBe('2026-06-28') // Sunday-start week
    const monthly = trendBuckets('2026-01-01', '2026-10-05')
    expect(monthly.unit).toBe('month')
    expect(monthly.buckets).toHaveLength(10)
  })

  it('attributes a mid-month range start to the first monthly bucket', () => {
    const r = computeFinance({
      bookings: [b({ date: '2026-01-20', paymentStatus: 'paid', amountPaidAgorot: 500 })],
      expenses: [],
      from: '2026-01-15',
      to: '2026-10-05',
      today: '2026-10-05',
    })
    expect(r.trend[0]).toMatchObject({ key: '2026-01-01', incomeAgorot: 500 })
  })
})
