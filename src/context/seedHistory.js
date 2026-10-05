// Deterministic demo history so the finance dashboard has something to show: ~10 weeks of past
// bookings with payments (and the odd no-show/cancellation), plus a handful of expenses. A seeded
// PRNG keeps the numbers stable across reloads.

import { addDaysIso, todayIso, weekdayOf } from '../lib/time'

function mulberry32(seed) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const CLIENTS = [
  { clientId: 'c-noa', clientName: 'Noa Levi', initials: 'NL', clientPhone: '054-318-2290', marketingConsent: true },
  { clientId: 'c-maya', clientName: 'Maya Cohen', initials: 'MC', clientPhone: '052-447-1180', marketingConsent: true },
  { clientId: 'c-yael', clientName: 'Yael Mizrahi', initials: 'YM', clientPhone: '+972 50-662-0193', marketingConsent: false },
  { clientId: 'c-rana', clientName: 'Rana Haddad', initials: 'RH', clientPhone: '0538824415', marketingConsent: true },
  { clientId: 'c-shira', clientName: 'Shira Peretz', initials: 'SP', clientPhone: '058-120-7734', marketingConsent: false },
  { clientId: 'c-lina', clientName: 'Lina Khoury', initials: 'LK', clientPhone: '054-900-3321', marketingConsent: true },
  { clientId: 'c-tamar', clientName: 'Tamar Avraham', initials: 'TA', clientPhone: '050-733-5508', marketingConsent: false },
  { clientId: 'c-dana', clientName: 'Dana Friedman', initials: 'DF', clientPhone: '052-288-6645', marketingConsent: true },
]

const METHODS = ['cash', 'bit', 'bit', 'card', 'card', 'transfer']
const START_TIMES = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30']

export function buildSeedHistory({ services, staff, days = 75 }) {
  const rand = mulberry32(20261005)
  const pick = (list) => list[Math.floor(rand() * list.length)]
  const today = todayIso()
  const bookings = []

  for (let offset = days; offset >= 1; offset--) {
    const date = addDaysIso(today, -offset)
    const weekday = weekdayOf(date)
    if (weekday === 6) continue // closed Saturdays
    const perStaff = weekday === 5 ? 1 : 2 + Math.floor(rand() * 2)
    for (const member of staff) {
      // Each staff member gets a few non-overlapping 90-minute blocks that day.
      const times = [...(weekday === 5 ? START_TIMES.slice(0, 3) : START_TIMES)].sort(() => rand() - 0.5).slice(0, perStaff).sort()
      for (const time of times) {
        if (rand() < 0.35) continue
        const svc = pick(services)
        const client = pick(CLIENTS)
        const roll = rand()
        const paymentStatus = roll < 0.06 ? 'no_show' : roll < 0.1 ? 'cancelled' : 'paid'
        // Occasional tip or small discount, so "amount paid" isn't always the list price.
        const adjust = rand() < 0.2 ? (rand() < 0.5 ? 1000 : -500) : 0
        bookings.push({
          id: `apt-h-${date}-${member.id}-${time}`,
          ...client,
          clientEmail: '',
          serviceId: svc.id,
          staffId: member.id,
          date,
          time,
          status: paymentStatus === 'cancelled' ? 'cancelled' : 'completed',
          paymentStatus,
          paymentMethod: paymentStatus === 'paid' ? pick(METHODS) : null,
          amountPaidAgorot: paymentStatus === 'paid' ? svc.priceAgorot + adjust : null,
        })
      }
    }
  }

  const expenses = []
  for (let m = 0; m < 3; m++) {
    const monthStart = `${addDaysIso(today, -30 * m).slice(0, 7)}-01`
    const day = (n) => (addDaysIso(monthStart, n) <= today ? addDaysIso(monthStart, n) : null)
    const entries = [
      [day(0), 'rent', 350000, 'expense.seed.rent'],
      [day(4), 'materials', 42000 + Math.floor(rand() * 20000), 'expense.seed.gel'],
      [day(12), 'equipment', m === 1 ? 89000 : 0, 'expense.seed.lamp'],
      [day(18), 'marketing', 15000, 'expense.seed.ads'],
      [day(22), 'materials', 18500, 'expense.seed.files'],
    ]
    for (const [date, category, amountAgorot, noteKey] of entries) {
      if (!date || !amountAgorot) continue
      expenses.push({ id: `exp-seed-${date}-${category}`, date, category, amountAgorot, noteKey, note: '' })
    }
  }

  return { bookings, expenses, clients: CLIENTS }
}
