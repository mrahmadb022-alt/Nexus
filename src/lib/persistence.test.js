import { beforeEach, describe, expect, it } from 'vitest'
import { buildSeedState } from '../context/DataContext'
import { PERSISTED_KEYS, STORAGE_KEY, STORAGE_VERSION, clearState, loadState, saveState } from './persistence'

// In-memory Storage stand-in (Vitest runs in node, without localStorage).
function memoryStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    keys: () => [...map.keys()],
  }
}

// Storage that throws on every call, like a private window or blocked site data.
const throwingStorage = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
  removeItem: () => {
    throw new Error('SecurityError')
  },
}

function seed() {
  return {
    appointments: [{ id: 'apt-1', status: 'confirmed', priceAgorot: 6500 }],
    gallery: [{ id: 'g1', url: 'https://picsum.photos/1' }],
    staffList: [{ id: 'staff-sarah', name: 'Sarah' }],
    services: [{ id: 'svc-haircut', priceAgorot: 6500, duration: 45 }],
    reviews: [],
    announcements: [],
    offers: [],
    waitlist: [],
    perDayHours: { 0: { working: true, start: '09:00', end: '18:00' } },
    businessSettings: { name: 'Nexus Salon', theme: 'classic', heroBackground: 'https://picsum.photos/hero', logoUrl: null },
    clientProfile: { name: 'You', phone: '', email: '' },
    features: { contact: true, finance: true, messaging: true },
    expenses: [{ id: 'exp-1', amountAgorot: 12000 }],
    messagingSettings: { confirmation: true, reminder: true, cancellation: true, reminderHours: 24 },
    messageLog: [],
    receiptSettings: { businessType: 'exempt' },
    confirmations: [],
    marketingConsents: { 'c-noa': true },
  }
}

describe('persistence', () => {
  let storage
  beforeEach(() => {
    storage = memoryStorage()
  })

  describe('saveState', () => {
    it('writes every persisted slice under one versioned key', () => {
      const state = { ...seed(), draft: { serviceId: 'svc-haircut' } }
      expect(saveState(state, storage)).toBe(true)
      expect(storage.keys()).toEqual([STORAGE_KEY])
      const saved = JSON.parse(storage.getItem(STORAGE_KEY))
      expect(saved.version).toBe(STORAGE_VERSION)
      expect(typeof saved.savedAt).toBe('number')
      expect(Object.keys(saved.data).sort()).toEqual([...PERSISTED_KEYS].sort())
      expect(saved.data).not.toHaveProperty('draft')
    })

    it('returns false instead of throwing when storage fails', () => {
      expect(saveState(seed(), throwingStorage)).toBe(false)
      expect(saveState(seed(), null)).toBe(false)
    })
  })

  describe('loadState', () => {
    it('round-trips saved data', () => {
      const state = seed()
      state.appointments.push({ id: 'apt-2', status: 'cancelled', paymentStatus: 'cancelled' })
      state.features.finance = false
      state.messageLog.push({ id: 'msg-1', kind: 'confirmation', body: 'שלום' })
      state.confirmations.push({ id: 'pc-1', number: 'DEMO-0001' })
      saveState(state, storage)

      const { state: loaded, source } = loadState(seed(), storage)
      expect(source).toBe('stored')
      expect(loaded).toEqual(state)
    })

    it('uses the seed when nothing is saved', () => {
      const s = seed()
      expect(loadState(s, storage)).toEqual({ state: s, source: 'seed' })
    })

    it('uses the seed when storage throws', () => {
      const s = seed()
      expect(loadState(s, throwingStorage)).toEqual({ state: s, source: 'seed' })
      expect(loadState(s, null)).toEqual({ state: s, source: 'seed' })
    })

    it.each([
      ['invalid JSON', '{"version":1,"data":{'],
      ['JSON null', 'null'],
      ['a bare array', '[1,2,3]'],
      ['an older version', JSON.stringify({ version: STORAGE_VERSION - 1, data: { appointments: [] } })],
      ['a newer version', JSON.stringify({ version: STORAGE_VERSION + 1, data: { appointments: [] } })],
      ['missing data', JSON.stringify({ version: STORAGE_VERSION })],
      ['data that is a string', JSON.stringify({ version: STORAGE_VERSION, data: 'oops' })],
    ])('falls back to the seed on corrupt data: %s', (_, raw) => {
      storage.setItem(STORAGE_KEY, raw)
      const s = seed()
      expect(loadState(s, storage)).toEqual({ state: s, source: 'corrupt' })
    })

    it('replaces only the slices that have the wrong shape', () => {
      const s = seed()
      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          data: { appointments: 'not a list', expenses: [{ id: 'exp-9' }], features: [true], clientProfile: { name: 'Noa' } },
        }),
      )
      const { state, source } = loadState(s, storage)
      expect(source).toBe('stored')
      expect(state.appointments).toBe(s.appointments)
      expect(state.expenses).toEqual([{ id: 'exp-9' }])
      expect(state.features).toBe(s.features)
      expect(state.clientProfile).toEqual({ name: 'Noa', phone: '', email: '' })
      expect(state.services).toBe(s.services)
    })

    it('fills in settings and feature switches added since the save', () => {
      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STORAGE_VERSION, data: { features: { contact: false }, businessSettings: { name: 'Nails by Noa' } } }),
      )
      const { state } = loadState(seed(), storage)
      expect(state.features).toEqual({ contact: false, finance: true, messaging: true })
      expect(state.businessSettings.name).toBe('Nails by Noa')
      expect(state.businessSettings.theme).toBe('classic')
    })

    it('drops uploaded images whose blob: URLs died with the old page', () => {
      const state = seed()
      state.gallery.push({ id: 'g2', url: 'blob:https://example.com/123' })
      state.businessSettings.heroBackground = 'blob:https://example.com/456'
      state.businessSettings.logoUrl = 'blob:https://example.com/789'
      saveState(state, storage)
      const { state: loaded } = loadState(seed(), storage)
      expect(loaded.gallery.map((g) => g.id)).toEqual(['g1'])
      expect(loaded.businessSettings.heroBackground).toBe('https://picsum.photos/hero')
      expect(loaded.businessSettings.logoUrl).toBeNull()
    })
  })

  describe('clearState (reset demo data)', () => {
    it('removes the saved data so the next load is the seed', () => {
      const changed = seed()
      changed.appointments = []
      saveState(changed, storage)
      expect(clearState(storage)).toBe(true)
      expect(storage.getItem(STORAGE_KEY)).toBeNull()
      const s = seed()
      expect(loadState(s, storage)).toEqual({ state: s, source: 'seed' })
    })

    it('only touches its own key', () => {
      storage.setItem('nexus-lang', 'he')
      saveState(seed(), storage)
      clearState(storage)
      expect(storage.getItem('nexus-lang')).toBe('he')
    })

    it('returns false instead of throwing when storage fails', () => {
      expect(clearState(throwingStorage)).toBe(false)
      expect(clearState(null)).toBe(false)
    })
  })

  describe('with the real demo seed', () => {
    it('has exactly the persisted slices', () => {
      expect(Object.keys(buildSeedState()).sort()).toEqual([...PERSISTED_KEYS].sort())
    })

    it('survives a save and load unchanged', () => {
      const s = buildSeedState()
      saveState(s, storage)
      const { state, source } = loadState(buildSeedState(), storage)
      expect(source).toBe('stored')
      expect(state).toEqual(JSON.parse(JSON.stringify(s)))
    })

    it('reset (clear + fresh seed) discards saved edits', () => {
      const edited = buildSeedState()
      edited.appointments = edited.appointments.slice(0, 1)
      edited.businessSettings = { ...edited.businessSettings, name: 'Edited' }
      saveState(edited, storage)
      clearState(storage)
      const fresh = buildSeedState()
      const { state } = loadState(fresh, storage)
      expect(state.appointments.length).toBeGreaterThan(1)
      expect(state.businessSettings.name).toBe('Nexus Salon - Main St')
    })
  })
})
