import { describe, expect, it } from 'vitest'
import { formatPhoneDisplay, normalizePhone, telHref, whatsappHref } from './phone'

describe('normalizePhone', () => {
  it.each([
    ['054-123-4567', '972541234567'],
    ['0541234567', '972541234567'],
    ['+972541234567', '972541234567'],
    ['+972 54-123-4567', '972541234567'],
    ['+972 054-123-4567', '972541234567'],
    ['972541234567', '972541234567'],
    ['00972541234567', '972541234567'],
    ['054 123 4567', '972541234567'],
    ['(054) 123-4567', '972541234567'],
    ['541234567', '972541234567'],
    ['03-555-1234', '97235551234'],
    ['+1 (415) 555-0100', '14155550100'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it.each([[''], ['   '], ['abc'], ['12345'], ['054-123'], ['0123456789'], [null], [undefined], [541234567]])(
    'rejects %s',
    (input) => {
      expect(normalizePhone(input)).toBeNull()
    },
  )
})

describe('contact links', () => {
  it('builds tel: with a plus', () => {
    expect(telHref('054-123-4567')).toBe('tel:+972541234567')
    expect(telHref('nope')).toBeNull()
  })

  it('builds wa.me with URL-encoded Hebrew text', () => {
    const href = whatsappHref('0541234567', 'היי דנה, התור אושר')
    expect(href.startsWith('https://wa.me/972541234567?text=')).toBe(true)
    expect(decodeURIComponent(href.split('text=')[1])).toBe('היי דנה, התור אושר')
    expect(whatsappHref('0541234567')).toBe('https://wa.me/972541234567')
    expect(whatsappHref('', 'x')).toBeNull()
  })

  it('formats for display', () => {
    expect(formatPhoneDisplay('+972541234567')).toBe('054-123-4567')
    expect(formatPhoneDisplay('97235551234')).toBe('03-555-1234')
    expect(formatPhoneDisplay('garbage')).toBe('garbage')
  })
})
