// Manager-toggleable roadmap features. Each key gates its UI everywhere it appears; all default on
// so the demo shows everything. Order here is the order of the toggles in Settings.

export const FEATURES = [
  { key: 'contact', nameKey: 'feature.contact.name', descKey: 'feature.contact.desc' },
  { key: 'finance', nameKey: 'feature.finance.name', descKey: 'feature.finance.desc' },
  { key: 'messaging', nameKey: 'feature.messaging.name', descKey: 'feature.messaging.desc' },
  { key: 'calendar', nameKey: 'feature.calendar.name', descKey: 'feature.calendar.desc' },
  { key: 'receipts', nameKey: 'feature.receipts.name', descKey: 'feature.receipts.desc' },
]

export const DEFAULT_FEATURES = Object.fromEntries(FEATURES.map((f) => [f.key, true]))
