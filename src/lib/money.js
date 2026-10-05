// Money is stored as integer agorot (1 ₪ = 100 agorot) and only turned into shekels for display
// or export. Never store floats — 0.1 + 0.2 style drift adds up across a month of bookings.

/** Integer agorot → "₪65" / "₪65.50" / "-₪12". Western digits in every language. */
export function formatShekels(agorot) {
  const value = Number.isFinite(agorot) ? Math.round(agorot) : 0
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  const whole = Math.floor(abs / 100).toLocaleString('en-US')
  const cents = abs % 100
  return `${sign}₪${whole}${cents ? `.${String(cents).padStart(2, '0')}` : ''}`
}

/** User-typed shekel amount ("65", "65.5", "1,200") → integer agorot, or null if not a valid non-negative amount. */
export function parseShekelsToAgorot(input) {
  if (input === null || input === undefined) return null
  const s = String(input).replace(/[,\s₪]/g, '')
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null
  const [whole, frac = ''] = s.split('.')
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'))
}

/** Integer agorot → plain shekel string for form inputs ("65", "65.5"). */
export function agorotToInput(agorot) {
  if (!Number.isFinite(agorot)) return ''
  return String(agorot / 100)
}
