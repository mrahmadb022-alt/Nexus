// Browser persistence for DataContext. Everything lives under one localStorage key as
// { version, savedAt, data }, so a future shape change can bump VERSION and old saves are ignored
// instead of half-loaded. Every storage access is wrapped: private windows, blocked site data and
// full quotas throw, and the app must still work (it falls back to the demo seed).

export const STORAGE_KEY = 'nexus-booking:data'
export const STORAGE_VERSION = 1

// The DataContext slices that survive a reload. The booking draft is deliberately left out: a
// half-finished booking flow shouldn't come back days later.
export const PERSISTED_KEYS = [
  'appointments',
  'gallery',
  'staffList',
  'services',
  'reviews',
  'announcements',
  'offers',
  'waitlist',
  'perDayHours',
  'businessSettings',
  'clientProfile',
  'features',
  'expenses',
  'messagingSettings',
  'messageLog',
  'receiptSettings',
  'confirmations',
  'marketingConsents',
]

const defaultStorage = () => {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)

// Uploaded images are object URLs (blob:...) that die with the page, so they can't be restored.
const isDeadUrl = (url) => typeof url === 'string' && url.startsWith('blob:')

// Takes each slice from storage only when it has the same shape as the seed (array vs object);
// anything else falls back to the seed slice. Objects are merged over the seed so settings and
// feature switches added in a later release get their defaults.
function mergeWithSeed(stored, seed) {
  const state = {}
  for (const key of PERSISTED_KEYS) {
    const s = stored[key]
    const d = seed[key]
    if (Array.isArray(d)) state[key] = Array.isArray(s) ? s : d
    else if (isPlainObject(d)) state[key] = isPlainObject(s) ? { ...d, ...s } : d
    else state[key] = s === undefined ? d : s
  }
  if (Array.isArray(state.gallery)) state.gallery = state.gallery.filter((g) => !isDeadUrl(g?.url))
  if (isPlainObject(state.businessSettings)) {
    const bs = { ...state.businessSettings }
    for (const field of ['heroBackground', 'logoUrl']) {
      if (isDeadUrl(bs[field])) bs[field] = seed.businessSettings?.[field] ?? null
    }
    state.businessSettings = bs
  }
  return state
}

// Returns { state, source }: source is 'stored' when a valid save was loaded, 'seed' when there
// was none (or storage is unavailable) and 'corrupt' when something was there but unusable.
export function loadState(seed, storage = defaultStorage()) {
  let raw
  try {
    raw = storage?.getItem(STORAGE_KEY) ?? null
  } catch {
    return { state: seed, source: 'seed' }
  }
  if (raw === null) return { state: seed, source: 'seed' }
  try {
    const parsed = JSON.parse(raw)
    if (!isPlainObject(parsed) || parsed.version !== STORAGE_VERSION || !isPlainObject(parsed.data)) {
      return { state: seed, source: 'corrupt' }
    }
    return { state: mergeWithSeed(parsed.data, seed), source: 'stored' }
  } catch {
    return { state: seed, source: 'corrupt' }
  }
}

// Returns true when the write went through. A failure (quota, blocked storage) is not fatal:
// the app keeps running from memory, it just won't survive a reload.
export function saveState(state, storage = defaultStorage()) {
  if (!storage) return false
  try {
    const data = Object.fromEntries(PERSISTED_KEYS.map((key) => [key, state[key]]))
    storage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, savedAt: Date.now(), data }))
    return true
  } catch {
    return false
  }
}

export function clearState(storage = defaultStorage()) {
  if (!storage) return false
  try {
    storage.removeItem(STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
