import { describe, expect, it } from 'vitest'
import { canIssueConfirmation, formatConfirmationNumber, nextConfirmationNumber, OFFICIAL_DOCUMENTS } from './receipts'

describe('demo payment confirmations', () => {
  it('numbers sequentially without reusing numbers', () => {
    expect(nextConfirmationNumber([])).toBe(1)
    expect(nextConfirmationNumber([{ number: 1 }, { number: 3 }])).toBe(4)
    expect(formatConfirmationNumber(7)).toBe('DEMO-0007')
    expect(formatConfirmationNumber(12345)).toBe('DEMO-12345')
  })

  it('only allows paid bookings with an amount', () => {
    expect(canIssueConfirmation({ paymentStatus: 'paid', amountPaidAgorot: 15000 })).toBe(true)
    expect(canIssueConfirmation({ paymentStatus: 'paid', amountPaidAgorot: null })).toBe(false)
    expect(canIssueConfirmation({ paymentStatus: 'unpaid', amountPaidAgorot: 15000 })).toBe(false)
  })

  it('lists official documents per business type', () => {
    expect(OFFICIAL_DOCUMENTS.exempt).toEqual(['receipt'])
    expect(OFFICIAL_DOCUMENTS.licensed).toContain('taxInvoice')
    expect(OFFICIAL_DOCUMENTS.company).toContain('taxInvoiceReceipt')
  })
})
