import { createContext, useContext, useState } from 'react'
import { addDays, toISODate } from '../utils/date'

const DataContext = createContext(null)

export const MOCK_CLIENT_ID = 'you'

const today = new Date()
const iso = (offset) => toISODate(addDays(today, offset))

// ---------------------------------------------------------------------------
// Static catalog data
// ---------------------------------------------------------------------------

export const SERVICES = [
  {
    id: 'svc-haircut',
    nameKey: 'svc.haircut.name',
    descKey: 'svc.haircut.desc',
    price: 65,
    duration: 45,
    image: 'https://picsum.photos/seed/nexus-haircut/400/400',
  },
  {
    id: 'svc-balayage',
    nameKey: 'svc.balayage.name',
    descKey: 'svc.balayage.desc',
    price: 185,
    duration: 150,
    image: 'https://picsum.photos/seed/nexus-balayage/400/400',
  },
  {
    id: 'svc-treatment',
    nameKey: 'svc.treatment.name',
    descKey: 'svc.treatment.desc',
    price: 45,
    duration: 30,
    image: 'https://picsum.photos/seed/nexus-treatment/400/400',
  },
  {
    id: 'svc-bridal',
    nameKey: 'svc.bridal.name',
    descKey: 'svc.bridal.desc',
    price: 220,
    duration: 90,
    image: 'https://picsum.photos/seed/nexus-bridal/400/400',
  },
  {
    id: 'svc-beard',
    nameKey: 'svc.beard.name',
    descKey: 'svc.beard.desc',
    price: 35,
    duration: 20,
    image: 'https://picsum.photos/seed/nexus-beard/400/400',
  },
  {
    id: 'svc-manicure',
    nameKey: 'svc.manicure.name',
    descKey: 'svc.manicure.desc',
    price: 55,
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
  { id: 'r1', name: 'Sarah Jenkins', initials: 'SJ', rating: 5, textKey: 'review.1', daysAgo: 2 },
  { id: 'r2', name: 'Michael R.', initials: 'MR', rating: 4, textKey: 'review.2', daysAgo: 7 },
  { id: 'r3', name: 'Emma Thompson', initials: 'ET', rating: 5, textKey: 'review.3', daysAgo: 14 },
  { id: 'r4', name: 'James Okafor', initials: 'JO', rating: 5, textKey: 'review.4', daysAgo: 18 },
  { id: 'r5', name: 'Priya Patel', initials: 'PP', rating: 5, textKey: 'review.5', daysAgo: 25 },
  { id: 'r6', name: 'Lucas Meyer', initials: 'LM', rating: 4, textKey: 'review.6', daysAgo: 30 },
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
  { id: 'o1', titleKey: 'offer.welcome.title', code: 'WELCOME15', discountLabel: '15%', active: true, expiresLabel: iso(60) },
  { id: 'o2', titleKey: 'offer.fall.title', code: 'FALL20', discountLabel: '$20', active: false, expiresLabel: iso(-5) },
  { id: 'o3', titleKey: 'offer.referral.title', code: 'FRIEND10', discountLabel: '10%', active: true, expiresLabel: iso(90) },
]

const INITIAL_APPOINTMENTS = [
  {
    id: 'apt-1',
    clientId: MOCK_CLIENT_ID,
    clientName: 'You',
    initials: 'YO',
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
    serviceId: 'svc-beard',
    staffId: 'staff-marcus',
    date: iso(0),
    time: '15:00',
    status: 'confirmed',
  },
]

const INITIAL_WAITLIST = [
  { id: 'w1', name: 'Amanda Lee', noteKey: 'Needs:', detail: 'Any cut before 4PM', minutesAgo: 10 },
  { id: 'w2', name: 'David Chen', noteKey: 'Needs:', detail: 'Color touch-up (urgent)', minutesAgo: 60 },
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
  phone: '+1 (555) 123-4567',
  address: '123 Main Street, Suite 200\nMetropolis, NY 10001',
  timezone: 'est',
}

export function DataProvider({ children }) {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS)
  const [gallery, setGallery] = useState(INITIAL_GALLERY)
  const [staffList, setStaffList] = useState(STAFF)
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS)
  const [offers, setOffers] = useState(INITIAL_OFFERS)
  const [waitlist, setWaitlist] = useState(INITIAL_WAITLIST)
  const [perDayHours, setPerDayHours] = useState(DEFAULT_PER_DAY_HOURS)
  const [businessSettings, setBusinessSettings] = useState(DEFAULT_BUSINESS_SETTINGS)

  // Booking draft (multi-step client flow)
  const [draft, setDraft] = useState({ serviceId: null, staffId: null, date: null, time: null })

  const setDraftService = (serviceId) => setDraft((d) => ({ ...d, serviceId }))
  const setDraftStaff = (staffId) => setDraft((d) => ({ ...d, staffId }))
  const setDraftDateTime = (date, time) => setDraft((d) => ({ ...d, date, time }))
  const resetDraft = () => setDraft({ serviceId: null, staffId: null, date: null, time: null })

  const confirmDraftBooking = () => {
    const newAppt = {
      id: `apt-${Date.now()}`,
      clientId: MOCK_CLIENT_ID,
      clientName: 'You',
      initials: 'YO',
      serviceId: draft.serviceId,
      staffId: draft.staffId,
      date: draft.date,
      time: draft.time,
      status: 'confirmed',
    }
    setAppointments((prev) => [...prev, newAppt])
    return newAppt
  }

  const cancelAppointment = (id) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' } : a)))

  const rescheduleAppointment = (id, date, time) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, date, time, status: 'confirmed' } : a)))

  const updateAppointmentStatus = (id, status) =>
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))

  const approveWaitlist = (id) => setWaitlist((prev) => prev.filter((w) => w.id !== id))
  const declineWaitlist = (id) => setWaitlist((prev) => prev.filter((w) => w.id !== id))

  const addPhoto = (url) => setGallery((prev) => [...prev, { id: `g-${Date.now()}`, url }])
  const removePhotos = (ids) => setGallery((prev) => prev.filter((g) => !ids.includes(g.id)))

  const addStaffMember = (member) =>
    setStaffList((prev) => [...prev, { id: `staff-${Date.now()}`, color: 'bg-surface-container-highest text-on-surface', ...member }])
  const removeStaffMember = (id) => setStaffList((prev) => prev.filter((s) => s.id !== id))

  const toggleOfferActive = (id) =>
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, active: !o.active } : o)))
  const addOffer = (offer) => setOffers((prev) => [{ id: `o-${Date.now()}`, active: true, ...offer }, ...prev])
  const removeAnnouncement = (id) => setAnnouncements((prev) => prev.filter((a) => a.id !== id))
  const addAnnouncement = (ann) =>
    setAnnouncements((prev) => [{ id: `a-${Date.now()}`, channels: ['Client App'], dot: 'bg-primary', ...ann }, ...prev])

  const updateDayHours = (dayIndex, patch) =>
    setPerDayHours((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], ...patch } }))
  const toggleDayLock = (dayIndex) =>
    setPerDayHours((prev) => ({ ...prev, [dayIndex]: { ...prev[dayIndex], locked: !prev[dayIndex].locked } }))

  const updateBusinessSettings = (patch) => setBusinessSettings((prev) => ({ ...prev, ...patch }))

  const getStaffById = (id) => staffList.find((s) => s.id === id)

  const value = {
    appointments,
    gallery,
    staffList,
    reviews,
    announcements,
    offers,
    waitlist,
    perDayHours,
    businessSettings,
    draft,

    setDraftService,
    setDraftStaff,
    setDraftDateTime,
    resetDraft,
    confirmDraftBooking,
    cancelAppointment,
    rescheduleAppointment,
    updateAppointmentStatus,
    approveWaitlist,
    declineWaitlist,
    addPhoto,
    removePhotos,
    addStaffMember,
    removeStaffMember,
    toggleOfferActive,
    addOffer,
    removeAnnouncement,
    addAnnouncement,
    updateDayHours,
    toggleDayLock,
    updateBusinessSettings,
    getStaffById,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext)

// eslint-disable-next-line react-refresh/only-export-components
export function getService(id) {
  return SERVICES.find((s) => s.id === id)
}
