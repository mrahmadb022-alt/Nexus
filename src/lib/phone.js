// Phone helpers for contact actions (tel: / WhatsApp links). Ported from booking-app's lib/phone.js.
//
// Everything normalizes to E.164 digits WITHOUT the leading "+" (e.g. "972541234567"), which is
// the exact form wa.me expects; tel: links add the "+" back. Israeli numbers are the primary case:
//   054-123-4567 / 0541234567 / +972 54-123-4567 / 972541234567 / +972 054...  → 972541234567
// Other international numbers written with "+" or "00" pass through as their digits. Anything we
// can't confidently interpret returns null so callers hide the action instead of dialing garbage.

const IL_COUNTRY_CODE = '972'

/** Israeli national significant number: 9 digits for mobile (5X...), 8 for landlines. */
function isIsraeliNsn(nsn) {
  return /^[2-9]\d{7,8}$/.test(nsn)
}

/** @returns {string | null} E.164 digits without "+", or null if unusable. */
export function normalizePhone(raw) {
  if (typeof raw !== 'string') return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const hasPlus = trimmed.startsWith('+')
  let digits = trimmed.replace(/\D/g, '')
  if (!digits) return null

  let international = hasPlus
  if (!hasPlus && digits.startsWith('00')) {
    digits = digits.slice(2)
    international = true
  }

  if (digits.startsWith(IL_COUNTRY_CODE)) {
    // "+972 054..." is a common way to write it; the trunk 0 must be dropped.
    const nsn = digits.slice(IL_COUNTRY_CODE.length).replace(/^0/, '')
    return isIsraeliNsn(nsn) ? IL_COUNTRY_CODE + nsn : null
  }

  if (international) {
    // Country codes never start with 0.
    return /^[1-9]\d{7,14}$/.test(digits) ? digits : null
  }

  if (digits.startsWith('0')) {
    const nsn = digits.slice(1)
    return isIsraeliNsn(nsn) ? IL_COUNTRY_CODE + nsn : null
  }

  // Mobile number typed without its leading 0 (e.g. "541234567").
  if (/^5\d{8}$/.test(digits)) return IL_COUNTRY_CODE + digits

  return null
}

/** `tel:+972541234567`, or null when the number is unusable. */
export function telHref(raw) {
  const e164 = normalizePhone(raw)
  return e164 ? `tel:+${e164}` : null
}

/** `https://wa.me/972541234567?text=...` (text URL-encoded), or null when the number is unusable. */
export function whatsappHref(raw, text) {
  const e164 = normalizePhone(raw)
  if (!e164) return null
  return text ? `https://wa.me/${e164}?text=${encodeURIComponent(text)}` : `https://wa.me/${e164}`
}

/** Israeli numbers shown the local way (054-123-4567); others as +digits; unusable input unchanged. */
export function formatPhoneDisplay(raw) {
  const e164 = normalizePhone(raw)
  if (!e164) return raw || ''
  if (!e164.startsWith(IL_COUNTRY_CODE)) return `+${e164}`
  const national = '0' + e164.slice(IL_COUNTRY_CODE.length)
  if (national.length === 10) return `${national.slice(0, 3)}-${national.slice(3, 6)}-${national.slice(6)}`
  return `${national.slice(0, 2)}-${national.slice(2, 5)}-${national.slice(5)}`
}
