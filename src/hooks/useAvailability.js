import { useData } from '../context/DataContext'
import { computeAvailableSlots } from '../lib/availability'

// Open slots for a date, per staff member when the Staff availability feature is on:
// staffId = that person's calendar, null = "any available" (union over all staff). With the
// feature off, every booking blocks the slot for everyone (one shared calendar).
export function useAvailability() {
  const { appointments, perDayHours, staffList, services, isFeatureOn } = useData()
  const perStaff = isFeatureOn('staffAvailability')
  return ({ date, serviceId, durationMinutes, staffId = null, excludeBookingId }) => {
    const duration = durationMinutes ?? services.find((s) => s.id === serviceId)?.duration ?? 30
    return computeAvailableSlots({
      perDayHours,
      date,
      durationMinutes: duration,
      bookings: appointments,
      staffIds: perStaff ? (staffId ? [staffId] : staffList.map((s) => s.id)) : undefined,
      excludeBookingId,
    })
  }
}
