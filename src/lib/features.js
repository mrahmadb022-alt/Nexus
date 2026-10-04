// Manager-toggleable roadmap features. Each key gates its UI everywhere it appears; all default on
// so the demo shows everything. Order here is the order of the toggles in Settings.

export const FEATURES = [
  { key: 'contact', nameKey: 'feature.contact.name', descKey: 'feature.contact.desc' },
  { key: 'finance', nameKey: 'feature.finance.name', descKey: 'feature.finance.desc' },
]

export const DEFAULT_FEATURES = Object.fromEntries(FEATURES.map((f) => [f.key, true]))
