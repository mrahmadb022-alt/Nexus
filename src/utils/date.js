export function toISODate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay() // 0 = Sunday
  return addDays(d, -day)
}

const LOCALE_MAP = { en: 'en-US', he: 'he-IL', ar: 'ar' }

export function formatDateLong(isoDate, lang) {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString(LOCALE_MAP[lang] || 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateFull(isoDate, lang) {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString(LOCALE_MAP[lang] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMonthYear(date, lang) {
  return date.toLocaleDateString(LOCALE_MAP[lang] || 'en-US', { month: 'long', year: 'numeric' })
}

// time24 like "14:30". English shows 12h with AM/PM, he/ar show 24h (local convention).
export function formatTime(time24, lang) {
  const [h, m] = time24.split(':').map(Number)
  if (lang === 'en') {
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, '0')} ${period}`
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function minutesToDuration(min, t) {
  return `${min} ${t('min')}`
}

export const WEEKDAY_KEYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
export const WEEKDAY_SHORT_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function formatDateRange(startDate, endDate, lang) {
  const locale = LOCALE_MAP[lang] || 'en-US'
  const startLabel = startDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' })
  const endLabel = endDate.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })
  return `${startLabel} – ${endLabel}`
}

export function daysSince(isoDate) {
  const then = new Date(isoDate + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.round((now - then) / 86400000))
}

export function agoLabel(isoDate, t) {
  const days = daysSince(isoDate)
  if (days < 7) return t('ago.days').replace('{n}', days)
  return t('ago.weeks').replace('{n}', Math.round(days / 7))
}

export function minutesAgoLabel(timestamp) {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000))
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  return `${hours}h`
}

export function isBusinessOpenNow(perDayHours) {
  const now = new Date()
  const hours = perDayHours[now.getDay()]
  if (!hours || !hours.working || hours.locked) return false
  const [sh, sm] = hours.start.split(':').map(Number)
  const [eh, em] = hours.end.split(':').map(Number)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return nowMinutes >= sh * 60 + sm && nowMinutes < eh * 60 + em
}

export function generateSlots(start, end, stepMinutes = 30) {
  const slots = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let cursor = sh * 60 + sm
  const endMinutes = eh * 60 + em
  while (cursor + stepMinutes <= endMinutes) {
    const h = Math.floor(cursor / 60)
    const m = cursor % 60
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    cursor += stepMinutes
  }
  return slots
}
