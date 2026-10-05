import { describe, expect, it } from 'vitest'
import { agorotToInput, formatShekels, parseShekelsToAgorot } from './money'

describe('money in agorot', () => {
  it('formats agorot as shekels', () => {
    expect(formatShekels(6500)).toBe('₪65')
    expect(formatShekels(6550)).toBe('₪65.50')
    expect(formatShekels(123456)).toBe('₪1,234.56')
    expect(formatShekels(-1200)).toBe('-₪12')
    expect(formatShekels(undefined)).toBe('₪0')
  })

  it('parses typed shekel amounts to integer agorot', () => {
    expect(parseShekelsToAgorot('65')).toBe(6500)
    expect(parseShekelsToAgorot('65.5')).toBe(6550)
    expect(parseShekelsToAgorot('0.07')).toBe(7)
    expect(parseShekelsToAgorot('1,200')).toBe(120000)
    expect(parseShekelsToAgorot('₪ 80')).toBe(8000)
    expect(parseShekelsToAgorot('-5')).toBeNull()
    expect(parseShekelsToAgorot('abc')).toBeNull()
    expect(parseShekelsToAgorot('1.234')).toBeNull()
  })

  it('round-trips to form input', () => {
    expect(agorotToInput(6550)).toBe('65.5')
    expect(parseShekelsToAgorot(agorotToInput(19990))).toBe(19990)
  })
})
