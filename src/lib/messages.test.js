import { describe, expect, it } from 'vitest'
import { bookingMessageVars, formatMessageDate, interpolate, renderBookingMessage } from './messages'
import { featureTranslations } from '../translations.features'

const tFor = (lang) => (key) => featureTranslations[lang][key] ?? key

describe('message templates', () => {
  it('interpolates known vars and leaves unknown ones', () => {
    expect(interpolate('Hi {name}, {missing}', { name: 'Dana' })).toBe('Hi Dana, {missing}')
  })

  it('formats dates with Gregorian calendar and Western digits in every language', () => {
    expect(formatMessageDate('2026-10-06', 'en')).toBe('Tuesday, October 6')
    for (const lang of ['he', 'ar']) {
      const s = formatMessageDate('2026-10-06', lang)
      expect(s).toMatch(/6/)
      expect(s).not.toMatch(/[٠-٩]/)
    }
  })

  it('renders a localized confirmation', () => {
    const vars = bookingMessageVars({
      appointment: { clientName: ' Dana ', date: '2026-10-06', time: '14:00' },
      businessName: 'Studio',
      serviceLabel: 'Gel manicure',
      lang: 'en',
    })
    expect(renderBookingMessage('confirmation', vars, tFor('en'))).toBe(
      'Hi Dana, your booking at Studio is confirmed: Gel manicure on Tuesday, October 6 at 14:00.',
    )
    const he = renderBookingMessage('confirmation', { ...vars, date: formatMessageDate('2026-10-06', 'he') }, tFor('he'))
    expect(he).toContain('Dana')
    expect(he).toContain('14:00')
    expect(he).not.toMatch(/\{\w+\}/)
  })
})
