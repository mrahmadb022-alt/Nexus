// Export tables (bookings / income / expenses) with headers in the viewer's language. Money cells
// are numbers in shekels (agorot / 100): the CSV writer gets them with 2 decimals, the XLSX writer
// as 0.00-formatted numbers. Bookings carry a localized `serviceName` and `staffName`.

import { formatPhoneDisplay } from '../phone'

const inRange = (date, from, to) => date >= from && date <= to
const shekels = (agorot) => (agorot == null ? null : agorot / 100)

export const EXPORT_TYPES = ['bookings', 'income', 'expenses']

const STATUS_KEY = {
  pending: 'status_pending',
  confirmed: 'status_confirmed',
  'in-service': 'status_in_service',
  completed: 'status_completed',
  cancelled: 'status_cancelled',
}

/**
 * @param {'bookings'|'income'|'expenses'} type
 * @param {{ bookings: object[], expenses: object[], from: string, to: string, t: (key: string) => string }} data
 */
export function buildDataset(type, { bookings, expenses, from, to, t }) {
  const byDateTime = (a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)

  if (type === 'bookings') {
    const rows = bookings
      .filter((b) => inRange(b.date, from, to))
      .sort(byDateTime)
      .map((b) => [
        b.date,
        b.time,
        b.clientName,
        formatPhoneDisplay(b.clientPhone),
        b.serviceName,
        b.staffName || '',
        t(STATUS_KEY[b.status] || 'status_pending'),
        shekels(b.priceAgorot),
        t(`payment.status.${b.paymentStatus || 'unpaid'}`),
        b.paymentStatus === 'paid' ? shekels(b.amountPaidAgorot) : null,
        b.paymentMethod ? t(`payment.method.${b.paymentMethod}`) : '',
      ])
    return {
      sheetName: t('export.type.bookings'),
      headers: [
        t('export.col.date'),
        t('export.col.time'),
        t('export.col.client'),
        t('export.col.phone'),
        t('export.col.service'),
        t('export.col.staff'),
        t('export.col.status'),
        t('export.col.price'),
        t('export.col.paymentStatus'),
        t('export.col.amountPaid'),
        t('export.col.method'),
      ],
      rows,
      moneyColumns: [7, 9],
    }
  }

  if (type === 'income') {
    const rows = bookings
      .filter((b) => inRange(b.date, from, to) && b.paymentStatus === 'paid')
      .sort(byDateTime)
      .map((b) => [
        b.date,
        b.clientName,
        b.serviceName,
        b.paymentMethod ? t(`payment.method.${b.paymentMethod}`) : '',
        shekels(b.amountPaidAgorot),
      ])
    return {
      sheetName: t('export.type.income'),
      headers: [t('export.col.date'), t('export.col.client'), t('export.col.service'), t('export.col.method'), t('export.col.amount')],
      rows,
      moneyColumns: [4],
    }
  }

  if (type === 'expenses') {
    const rows = expenses
      .filter((e) => inRange(e.date, from, to))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((e) => [e.date, t(`expense.category.${e.category}`), e.note || '', shekels(e.amountAgorot)])
    return {
      sheetName: t('export.type.expenses'),
      headers: [t('export.col.date'), t('export.col.category'), t('export.col.note'), t('export.col.amount')],
      rows,
      moneyColumns: [3],
    }
  }

  throw new Error(`Unknown export type: ${type}`)
}

/** CSV wants "80.00", not 80 or 80.5. */
export function formatMoneyCellsForCsv({ rows, moneyColumns }) {
  const money = new Set(moneyColumns)
  return rows.map((row) => row.map((v, i) => (money.has(i) && typeof v === 'number' ? v.toFixed(2) : v)))
}
