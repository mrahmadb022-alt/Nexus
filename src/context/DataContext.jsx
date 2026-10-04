import { createContext, useContext, useEffect, useState } from 'react'
import { todayIso, addDaysIso } from '../lib/time'
import { DEFAULT_FEATURES } from '../lib/features'
import { buildSeedHistory } from './seedHistory'
import { useLanguage } from './LanguageContext'
import { bookingMessageVars, renderBookingMessage } from '../lib/messages'
import { canIssueConfirmation, nextConfirmationNumber } from '../lib/receipts'

const DataContext = createContext(null)

export const MOCK_CLIENT_ID = 'you'

// Seed dates are relative to today in Asia/Jerusalem (the business clock), not the device's zone.
const iso = (offset) => addDaysIso(todayIso(), offset)

// Collision-resistant client-generated IDs (not timestamp-based) — two records created in the
// same millisecond, e.g. from a rapid double-tap slipping past the submit guard, must never
// collide. Also the right shape to swap for server-assigned IDs once a backend exists.
const newId = (prefix) => `${prefix}-${crypto.randomUUID()}`

// ---------------------------------------------------------------------------
// Static catalog data
// ---------------------------------------------------------------------------

const INITIAL_SERVICES = [
  {
    id: 'svc-haircut',
    nameKey: 'svc.haircut.name',
    descKey: 'svc.haircut.desc',
    priceAgorot: 6500,
    duration: 45,
    image: 'https://picsum.photos/seed/nexus-haircut/400/400',
  },
  {
    id: 'svc-balayage',
    nameKey: 'svc.balayage.name',
    descKey: 'svc.balayage.desc',
    priceAgorot: 18500,
    duration: 150,
    image: 'https://picsum.photos/seed/nexus-balayage/400/400',
  },
  {
    id: 'svc-treatment',
    nameKey: 'svc.treatment.name',
    descKey: 'svc.treatment.desc',
    priceAgorot: 4500,
    duration: 30,
    image: 'https://picsum.photos/seed/nexus-treatment/400/400',
  },
  {
    id: 'svc-bridal',
    nameKey: 'svc.bridal.name',
    descKey: 'svc.bridal.desc',
    priceAgorot: 22000,
    duration: 90,
    image: 'https://picsum.photos/seed/nexus-bridal/400/400',
  },
  {
    id: 'svc-beard',
    nameKey: 'svc.beard.name',
    descKey: 'svc.beard.desc',
    priceAgorot: 3500,
    duration: 20,
    image: 'https://picsum.photos/seed/nexus-beard/400/400',
  },
  {
    id: 'svc-manicure',
    nameKey: 'svc.manicure.name',
    descKey: 'svc.manicure.desc',
    priceAgorot: 5500,
    duration: 40,
    image: 'https://picsum.photos/seed/nexus-manicure/400/400',
  },
]

export const STAFF = [
  { id: 'staff-sarah', name: 'Sarah Jenkins', roleKey: 'staff.sarah.role', initials: 'SJ', color: 'bg-primary-container text-on-primary-container' },
  { id: 'staff-david', name: 'David Chen', roleKey: 'staff.david.role', initials: 'DC', color: 'bg-secondary-container text-on-secondary-container' },
  { id: 'staff-elena', name: 'Elena Rodriguez', roleKey: 'staff.elena.role', initials: 'ER', color: 'bg-surface-container-highest text-on-surface' },
  { id: 'staff-marcus', name: 'Marcus Lee', roleKey: 'staff.marcus.role', initials: 'ML', color: 'bg-tertiary-container text-on-tertiary-container' },
]

const INITIAL_GALLERY = [
  { id: 'g1', url: 'https://picsum.photos/seed/nexus-gallery-1/500/500' },
  { id: 'g2', url: 'https://picsum.photos/seed/nexus-gallery-2/500/500' },
  { id: 'g3', url: 'https://picsum.photos/seed/nexus-gallery-3/500/500' },
  { id: 'g4', url: 'https://picsum.photos/seed/nexus-gallery-4/500/500' },
  { id: 'g5', url: 'https://picsum.photos/seed/nexus-gallery-5/500/500' },
  { id: 'g6', url: 'https://picsum.photos/seed/nexus-gallery-6/500/500' },
]

const INITIAL_REVIEWS = [
  { id: 'r1', name: 'Sarah Jenkins', initials: 'SJ', rating: 5, textKey: 'review.1', date: iso(-2) },
  { id: 'r2', name: 'Michael R.', initials: 'MR', rating: 4, textKey: 'review.2', date: iso(-7) },
  { id: 'r3', name: 'Emma Thompson', initials: 'ET', rating: 5, textKey: 'review.3', date: iso(-14) },
  { id: 'r4', name: 'James Okafor', initials: 'JO', rating: 5, textKey: 'review.4', date: iso(-18) },
  { id: 'r5', name: 'Priya Patel', initials: 'PP', rating: 5, textKey: 'review.5', date: iso(-25) },
  { id: 'r6', name: 'Lucas Meyer', initials: 'LM', rating: 4, textKey: 'review.6', date: iso(-30) },
]

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'a1',
    titleKey: 'ann.holiday.title',
    bodyKey: 'ann.holiday.body',
    dateLabel: iso(20),
    channels: ['Client App', 'Email Blast'],
    dot: 'bg-error',
  },
  {
    id: 'a2',
    titleKey: 'ann.newstaff.title',
    bodyKey: 'ann.newstaff.body',
    dateLabel: iso(-3),
    channels: ['Client App'],
    dot: 'bg-primary',
  },
  {
    id: 'a3',
    titleKey: 'ann.renovation.title',
    bodyKey: 'ann.renovation.body',
    dateLabel: iso(-10),
    channels: ['Client App', 'Email Blast'],
    dot: 'bg-secondary',
  },
]

const INITIAL_OFFERS = [
  { id: 'o1', titleKey: 'offer.welcome.title', descriptionKey: 'offer.welcome.desc', discountLabel: '15%', active: true, expiresLabel: iso(60) },
  { id: 'o2', titleKey: 'offer.fall.title', descriptionKey: 'offer.fall.desc', discountLabel: '₪20', active: false, expiresLabel: iso(-5) },
  { id: 'o3', titleKey: 'offer.referral.title', descriptionKey: 'offer.referral.desc', discountLabel: '10%', active: true, expiresLabel: iso(90) },
]

const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-1',
    clientId: MOCK_CLIENT_ID,
    clientName: 'You',
    initials: 'YO',
    clientPhone: '054-123-4567',
    clientEmail: 'you@example.com',
    serviceId: 'svc-haircut',
    staffId: 'staff-sarah',
    date: iso(1),
    time: '14:00',
    status: 'confirmed',
  },
  {
    id: 'apt-2',
    clientId: MOCK_CLIENT_ID,
    clientName: 'You',
    initials: 'YO',
    clientPhone: '054-123-4567',
    clientEmail: 'you@example.com',
    serviceId: 'svc-treatment',
    staffId: 'staff-elena',
    date: iso(-30),
    time: '11:00',
    status: 'completed',
  },
  {
    id: 'apt-3',
    clientId: 'c-marcus',
    clientName: 'Marcus Johnson',
    initials: 'MJ',
    clientPhone: '0527654321',
    clientEmail: 'marcus.johnson@example.com',
    serviceId: 'svc-haircut',
    staffId: 'staff-marcus',
    date: iso(0),
    time: '11:00',
    status: 'pending',
  },
  {
    id: 'apt-4',
    clientId: 'c-emma',
    clientName: 'Emma Lawson',
    initials: 'EL',
    clientPhone: '+972 50-555-1234',
    clientEmail: 'emma.lawson@example.com',
    serviceId: 'svc-balayage',
    staffId: 'staff-david',
    date: iso(0),
    time: '12:30',
    status: 'in-service',
  },
  {
    id: 'apt-5',
    clientId: 'c-tom',
    clientName: 'Tom Richards',
    initials: 'TR',
    clientPhone: '+972541112233',
    clientEmail: 'tom.richards@example.com',
    serviceId: 'svc-beard',
    staffId: 'staff-marcus',
    date: iso(0),
    time: '15:00',
    status: 'confirmed',
  },
]

const SEED_HISTORY = buildSeedHistory({ services: INITIAL_SERVICES, staff: STAFF })

// Every booking snapshots its price and duration at creation (so later catalog edits don't
// rewrite history) and carries payment fields. Money is integer agorot.
function withBookingDefaults(appt, services) {
  const svc = services.find((s) => s.id === appt.serviceId)
  return {
    paymentStatus: appt.status === 'cancelled' ? 'cancelled' : 'unpaid',
    paymentMethod: null,
    amountPaidAgorot: null,
    marketingConsent: false,
    createdAt: Date.now() - 7 * 86400000,
    ...appt,
    priceAgorot: appt.priceAgorot ?? svc?.priceAgorot ?? 0,
    durationMinutes: appt.durationMinutes ?? svc?.duration ?? 30,
  }
}

const SEEDED_APPOINTMENTS = [...SEED_HISTORY.bookings, ...INITIAL_APPOINTMENTS].map((a) =>
  withBookingDefaults(a, INITIAL_SERVICES),
)

const DEFAULT_MESSAGING_SETTINGS = { confirmation: true, reminder: true, cancellation: true, reminderHours: 24 }

// A couple of entries so the (simulated) message log isn't empty on first open. `body: null`
// means "render in the current language when shown"; live entries store the text they'd send.
const INITIAL_MESSAGE_LOG = [
  { id: 'msg-seed-1', kind: 'confirmation', appointmentId: 'apt-5', createdAt: Date.now() - 26 * 3600000, body: null },
  { id: 'msg-seed-2', kind: 'confirmation', appointmentId: 'apt-3', createdAt: Date.now() - 3 * 3600000, body: null },
]

const INITIAL_WAITLIST = [
  {
    id: 'w1',
    clientId: 'c-amanda',
    clientName: 'Amanda Lee',
    clientPhone: '053 444 5566',
    date: iso(2),
    note: 'Any cut before 4PM',
    createdAt: Date.now() - 10 * 60000,
  },
  {
    id: 'w2',
    clientId: 'c-david2',
    clientName: 'David Chen',
    clientPhone: '058-777-8899',
    date: iso(1),
    note: 'Color touch-up (urgent)',
    createdAt: Date.now() - 60 * 60000,
  },
]

const DEFAULT_PER_DAY_HOURS = {
  0: { working: true, start: '09:00', end: '18:00', locked: false }, // Sunday
  1: { working: true, start: '09:00', end: '18:00', locked: false }, // Monday
  2: { working: true, start: '09:00', end: '18:00', locked: false }, // Tuesday
  3: { working: true, start: '09:00', end: '18:00', locked: false }, // Wednesday
  4: { working: true, start: '09:00', end: '20:00', locked: false }, // Thursday
  5: { working: true, start: '09:00', end: '14:00', locked: false }, // Friday
  6: { working: false, start: '00:00', end: '00:00', locked: true }, // Saturday
}

const DEFAULT_BUSINESS_SETTINGS = {
  name: 'Nexus Salon - Main St',
  email: 'hello@nexusbooking.com',
  phone: '03-555-1234',
  address: '123 Main Street, Suite 200\nMetropolis, NY 10001',
  timezone: 'est',
  heroBackground: 'https://picsum.photos/seed/nexus-hero-bg/1600/900',
  logoUrl: null,
  about: null,
  theme: 'classic',
}

const DEFAULT_CLIENT_PROFILE = {
  name: 'You',
  phone: '',
  email: '',
}

function initialsFromName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'YO'
  return parts
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')
}

export function DataProvider({ children }) {
  const [appointments, setAppointments] = useState(SEEDED_APPOINTMENTS)
  const [gallery, setGallery] = useState(INITIAL_GALLERY)
  const [staffList, setStaffList] = useState(STAFF)
  const [services, setServices] = useState(INITIAL_SERVICES)
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS)
  const [offers, setOffers] = useState(INITIAL_OFFERS)
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST)
  const [perDayHours, setPerDayHours] = useState(DEFAULT_PER_DAY_HOURS)
  const [businessSettings, setBusinessSettings] = useState(DEFAULT_BUSINESS_SETTINGS)
  const [clientProfile, setClientProfile] = useState(DEFAULT_CLIENT_PROFILE)
  // Kept out of businessSettings on purpose: the Settings page edits a local copy of
  // businessSettings and writes the whole object back on Save, which would revert toggles.
  const [features, setFeatures] = useState(DEFAULT_FEATURES)
  const [expenses, setExpenses] = useState(SEED_HISTORY.expenses)
  const [messagingSettings, setMessagingSettings] = useState(DEFAULT_MESSAGING_SETTINGS)
  const [messageLog, setMessageLog] = useState(INITIAL_MESSAGE_LOG)
  const { t, lang } = useLanguage()
  const [receiptSettings, setReceiptSettings] = useState({ businessType: 'exempt' })
  const [confirmations, setConfirmations] = useState([])

  // Applied on <html> (not a nested div) so CSS variables reach modals rendered via
  // createPortal(..., document.body) too, not just the React tree under this provider.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', businessSettings.theme || 'classic')
  }, [businessSettings.theme])

  // Browser tab title lives outside the React tree (set once in index.html at build time),
  // so it needs its own sync whenever the salon name changes.
  useEffect(() => {
    document.title = businessSettings.name || 'Nexus Booking'
  }, [businessSettings.name])

  // Booking draft (multi-step client flow). staffId starts `undefined` (not yet
  // touched) rather than `null`, since `null` is itself a valid explicit choice
  // ("Any Available" / "No Preference") that the Continue button needs to unlock.
  const [draft, setDraft] = useState({ serviceId: null, staffId: undefined, date: null, time: null })

  const setDraftService = (serviceId) => setDraft((d) => ({ ...d, serviceId }))
  const setDraftStaff = (staffId) => setDraft((d) => ({ ...d, staffId }))
  const setDraftDateTime = (date, time) => setDraft((d) => ({ ...d, date, time }))
  const resetDraft = () => setDraft({ serviceId: null, staffId: undefined, date: null, time: null })

  // --- Simulated automated messages -------------------------------------------------------
  // Nothing is actually sent: entries record what *would* go out once a messaging backend is
  // connected. The manager can still send any of them by hand through its WhatsApp link.
  const renderMessage = (kind, appt) => {
    const svc = services.find((s) => s.id === appt.serviceId)
    const serviceLabel = svc ? (svc.nameKey ? t(svc.nameKey) : svc.name || '') : ''
    return renderBookingMessage(kind, bookingMessageVars({ appointment: appt, businessName: businessSettings.name, serviceLabel, lang }), t)
  }

  const logMessage = (entry) =>
    setMessageLog((prev) => [{ id: newId('msg'), createdAt: Date.now(), lang, ...entry }, ...prev])

  // Automatic kinds respect the feature toggle and their own switch; manual sends (demo
  // reminder) only need the feature on.
  const logBookingMessage = (kind, appt, { manual = false } = {}) => {
    if (features.messaging === false) return
    if (!manual && !messagingSettings[kind]) return
    logMessage({
      kind,
      appointmentId: appt.id,
      clientName: appt.clientName,
      phone: appt.clientPhone,
      body: renderMessage(kind, appt),
      manual,
    })
  }

  const updateMessagingSettings = (patch) => setMessagingSettings((prev) => ({ ...prev, ...patch }))

  const confirmDraftBooking = () => {
    const newAppt = withBookingDefaults({
      id: newId('apt'),
      clientId: MOCK_CLIENT_ID,
      clientName: clientProfile.name || 'You',
      initials: initialsFromName(clientProfile.name || 'You'),
      clientPhone: clientProfile.phone || '',
      clientEmail: clientProfile.email || '',
      serviceId: draft.serviceId,
      staffId: draft.staffId,
      date: draft.date,
      time: draft.time,
      status: 'confirmed',
      createdAt: Date.now(),
    }, services)
    setAppointments((prev) => [...prev, newAppt])
    logBookingMessage('confirmation', newAppt)
    return newAppt
  }

  const cancelAppointment = (id) => {
    const appt = appointments.find((a) => a.id === id)
    if (appt && appt.status !== 'cancelled') logBookingMessage('cancellation', appt)
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, status: 'cancelled', paymentStatus: a.paymentStatus === 'paid' ? 'paid' : 'cancelled', updatedAt: Date.now() }
          : a,
      ),
    )
  }

  // Payment status/method/amount for one booking. Marking it cancelled also cancels the
  // booking; un-cancelling a payment puts a cancelled booking back to confirmed.
  const recordPayment = (id, { paymentStatus, paymentMethod, amountPaidAgorot }) => {
    const appt = appointments.find((a) => a.id === id)
    if (appt && paymentStatus === 'cancelled' && appt.status !== 'cancelled') logBookingMessage('cancellation', appt)
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a
        let status = a.status
        if (paymentStatus === 'cancelled') status = 'cancelled'
        else if (a.status === 'cancelled') status = 'confirmed'
        return {
          ...a,
          status,
          paymentStatus,
          paymentMethod: paymentStatus === 'paid' ? paymentMethod : null,
          amountPaidAgorot: paymentStatus === 'paid' ? amountPaidAgorot : null,
          updatedAt: Date.now(),
        }
      }),
    )
  }

  // Demo payment confirmation (NOT a tax document). One per booking: issuing again returns the
  // existing one, so a number is never spent twice on the same payment.
  const issueConfirmation = (appointmentId) => {
    const existing = confirmations.find((c) => c.appointmentId === appointmentId)
    if (existing) return existing
    const appt = appointments.find((a) => a.id === appointmentId)
    if (!canIssueConfirmation(appt)) return null
    const confirmation = {
      id: newId('pc'),
      number: nextConfirmationNumber(confirmations),
      appointmentId,
      issuedAt: Date.now(),
      clientName: appt.clientName,
      serviceId: appt.serviceId,
      appointmentDate: appt.date,
      amountAgorot: appt.amountPaidAgorot,
      paymentMethod: appt.paymentMethod,
      businessType: receiptSettings.businessType,
    }
    setConfirmations((prev) => [...prev, confirmation])
    return confirmation
  }
  const updateReceiptSettings = (patch) => setReceiptSettings((prev) => ({ ...prev, ...patch }))

  const addExpense = (expense) => setExpenses((prev) => [{ id: newId('exp'), note: '', ...expense }, ...prev])
  const updateExpense = (id, patch) =>
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch, noteKey: 'note' in patch ? null : e.noteKey } : e)))
  const removeExpense = (id) => setExpenses((prev) => prev.filter((e) => e.id !== id))

  const rescheduleAppointment = (id, date, time) =>
    setAppointments((prev) => prev.map((a) =>
        a.id === id
          ? {
              ...a,
              date,
              time,
              status: 'confirmed',
              paymentStatus: a.paymentStatus === 'cancelled' ? 'unpaid' : a.paymentStatus,
              updatedAt: Date.now(),
            }
          : a,
      ),
    )

  const updateAppointmentStatus = (id, status) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))

  const approveWaitlist = (id) => setWaitlist((prev) => prev.filter((w) => w.id !== id))
  const declineWaitlist = (id) => setWaitlist((prev) => prev.filter((w) => w.id !== id))
  const joinWaitlist = (date, note = '') => {
    const entry = {
      id: newId('w'),
      clientId: MOCK_CLIENT_ID,
      clientName: clientProfile.name || 'You',
      clientPhone: clientProfile.phone || '',
      date,
      note,
      createdAt: Date.now(),
    }
    setWaitlist((prev) => [entry, ...prev])
    return entry
  }

  const addReview = (rating, text) => {
    const name = clientProfile.name || 'You'
    const review = {
      id: newId('r'),
      clientId: MOCK_CLIENT_ID,
      name,
      initials: initialsFromName(name),
      rating,
      text,
      date: todayIso(),
    }
    setReviews((prev) => [review, ...prev])
    return review
  }

  const addPhoto = (url) => setGallery((prev) => [...prev, { id: newId('g'), url }])
  const removePhotos = (ids) => setGallery((prev) => prev.filter((g) => !ids.includes(g.id)))

  const addStaffMember = (member) =>
    setStaffList((prev) => [...prev, { id: newId('staff'), color: 'bg-surface-container-highest text-on-surface', ...member }])
  const removeStaffMember = (id) => setStaffList((prev) => prev.filter((s) => s.id !== id))
  const updateStaffMember = (id, patch) =>
    setStaffList((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))

  const addService = (service) =>
    setServices((prev) => [...prev, { id: newId('svc'), nameKey: null, descKey: null, image: null, ...service }])
  const updateService = (id, patch) => setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const removeService = (id) => setServices((prev) => prev.filter((s) => s.id !== id))

  const toggleOfferActive = (id) =>
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o)))
  const addOffer = (offer) => setOffers((prev) => [{ id: newId('o'), active: true, ...offer }, ...prev])
  const removeAnnouncement = (id) => setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  const addAnnouncement = (ann) =>
    setAnnouncements((prev) => [{ id: newId('a'), channels: ['Client App'], dot: 'bg-primary', ...ann }, ...prev])

  const updateDayHours = (dayIndex, patch) =>
    setPerDayHours((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], ...patch } }))
  const toggleDayLock = (dayIndex) =>
    setPerDayHours((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], locked: !prev[dayIndex].locked } }))

  const updateBusinessSettings = (patch) => setBusinessSettings((prev) => ({ ...prev, ...patch }))
  const updateClientProfile = (patch) => setClientProfile((prev) => ({ ...prev, ...patch }))

  const getStaffById = (id) => staffList.find((s) => s.id === id)

  const setFeature = (key, on) => setFeatures((prev) => ({ ...prev, [key]: on }))
  const isFeatureOn = (key) => features[key] !== false

  const value = {
    appointments,
    gallery,
    staffList,
    services,
    reviews,
    announcements,
    offers,
    waitlist,
    perDayHours,
    businessSettings,
    clientProfile,
    draft,
    features,
    expenses,
    messagingSettings,
    receiptSettings,
    confirmations,
    messageLog,

    setDraftService,
    setDraftStaff,
    setDraftDateTime,
    resetDraft,
    confirmDraftBooking,
    cancelAppointment,
    recordPayment,
    issueConfirmation,
    updateReceiptSettings,
    logBookingMessage,
    logMessage,
    renderMessage,
    updateMessagingSettings,
    addExpense,
    updateExpense,
    removeExpense,
    rescheduleAppointment,
    updateAppointmentStatus,
    approveWaitlist,
    declineWaitlist,
    joinWaitlist,
    addReview,
    addPhoto,
    removePhotos,
    addStaffMember,
    removeStaffMember,
    updateStaffMember,
    addService,
    updateService,
    removeService,
    toggleOfferActive,
    addOffer,
    removeAnnouncement,
    addAnnouncement,
    updateDayHours,
    toggleDayLock,
    updateBusinessSettings,
    updateClientProfile,
    getStaffById,
    setFeature,
    isFeatureOn,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext)

// Service names/descriptions come either from a translation key (seed catalog)
// or a plain string (services added by a manager), mirroring how announcements/offers work.
export function serviceName(svc, t) {
  if (!svc) return ''
  return svc.nameKey ? t(svc.nameKey) : svc.name || ''
}

export function serviceDesc(svc, t) {
  if (!svc) return ''
  return svc.descKey ? t(svc.descKey) : svc.description || ''
}
