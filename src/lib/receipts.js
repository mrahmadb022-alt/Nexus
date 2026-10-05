// Demo payment confirmations. These are deliberately NOT tax documents: Israeli receipts and tax
// invoices must come from an approved invoicing system (and tax invoices above the Tax
// Authority's threshold need an allocation number). This module only numbers and describes the
// demo confirmation and lists which official documents an invoicing provider would unlock.

export const BUSINESS_TYPES = ['exempt', 'licensed', 'company']

/** Official document types an invoicing provider can issue, per business type. */
export const OFFICIAL_DOCUMENTS = {
  exempt: ['receipt'],
  licensed: ['taxInvoice', 'taxInvoiceReceipt', 'receipt', 'creditInvoice'],
  company: ['taxInvoice', 'taxInvoiceReceipt', 'receipt', 'creditInvoice'],
}

/** DEMO-0001: the prefix makes it obvious at a glance that this isn't an official serial number. */
export function formatConfirmationNumber(n) {
  return `DEMO-${String(n).padStart(4, '0')}`
}

/** Next sequential number: one more than the highest issued so far (numbers are never reused). */
export function nextConfirmationNumber(confirmations) {
  return confirmations.reduce((max, c) => Math.max(max, c.number), 0) + 1
}

/** Only paid bookings with an amount can get a confirmation. */
export function canIssueConfirmation(appointment) {
  return appointment?.paymentStatus === 'paid' && Number.isFinite(appointment.amountPaidAgorot)
}
