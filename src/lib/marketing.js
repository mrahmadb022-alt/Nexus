// Marketing campaigns (simulated: they only go to the message log). Israeli anti-spam rules
// (Communications Law §30A) shape this: only clients who opted in are counted, every message
// opens with the word "Ad" (פרסומת / إعلان) and the sender's name, and every message says how to
// opt out. The prefixes live here, not in translations, so their exact characters can't drift —
// "פרסומת" must start with U+05E4 (פ).

export const AD_PREFIX = { he: 'פרסומת', ar: 'إعلان', en: 'Ad' }

export const MAX_CAMPAIGN_BODY = 500

/** Trims, drops control characters, collapses blank-line runs, caps length. */
export function cleanCampaignBody(value) {
  return String(value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, '') // eslint-disable-line no-control-regex
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_CAMPAIGN_BODY)
}

/** "פרסומת: <business>\n<body>\n\n<opt-out line>" in the given language. */
export function renderCampaign({ lang, business, body, optOutLine }) {
  const prefix = AD_PREFIX[lang] || AD_PREFIX.en
  return `${prefix}: ${business}\n${cleanCampaignBody(body)}\n\n${optOutLine}`
}

/**
 * Clients who may receive marketing. `consents` maps clientId → boolean and is the only source of
 * truth: ticking the (never pre-checked) box on a booking sets it to true, and only an explicit
 * opt-out sets it back — leaving the box unticked on a later booking doesn't withdraw anything.
 * Name and phone come from the client's most recent booking. Each client is counted once.
 */
export function consentedRecipients(appointments, consents) {
  const latest = new Map()
  for (const a of appointments) {
    if (!consents[a.clientId]) continue
    const prev = latest.get(a.clientId)
    if (!prev || (a.createdAt ?? 0) >= (prev.createdAt ?? 0)) latest.set(a.clientId, a)
  }
  return [...latest.values()].map((a) => ({ clientId: a.clientId, name: a.clientName, phone: a.clientPhone }))
}
