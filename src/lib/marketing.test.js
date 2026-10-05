import { describe, expect, it } from 'vitest'
import { AD_PREFIX, cleanCampaignBody, consentedRecipients, MAX_CAMPAIGN_BODY, renderCampaign } from './marketing'

describe('campaign text', () => {
  it('uses the exact ad prefixes; Hebrew starts with U+05E4', () => {
    expect(AD_PREFIX.he).toBe('פרסומת')
    expect(AD_PREFIX.he.codePointAt(0)).toBe(0x05e4)
    expect(AD_PREFIX.ar).toBe('إعلان')
    expect(AD_PREFIX.en).toBe('Ad')
  })

  it('opens with prefix + business and ends with the opt-out line', () => {
    const he = renderCampaign({ lang: 'he', business: 'הסטודיו', body: '  20% הנחה  ', optOutLine: 'להסרה השיבו "הסר".' })
    expect(he).toBe('פרסומת: הסטודיו\n20% הנחה\n\nלהסרה השיבו "הסר".')
    expect(he.codePointAt(0)).toBe(0x05e4)
    expect(renderCampaign({ lang: 'ar', business: 'S', body: 'x', optOutLine: 'o' }).startsWith('إعلان: S')).toBe(true)
    expect(renderCampaign({ lang: 'xx', business: 'S', body: 'x', optOutLine: 'o' }).startsWith('Ad: S')).toBe(true)
  })

  it('cleans bodies', () => {
    expect(cleanCampaignBody('a\r\n\r\n\r\n\r\nb\u0007')).toBe('a\n\nb')
    expect(cleanCampaignBody('x'.repeat(900))).toHaveLength(MAX_CAMPAIGN_BODY)
  })
})

describe('consentedRecipients', () => {
  const appts = [
    { clientId: 'a', clientName: 'A old', clientPhone: '1', createdAt: 1 },
    { clientId: 'a', clientName: 'A', clientPhone: '2', createdAt: 5 },
    { clientId: 'b', clientName: 'B', createdAt: 1 },
    { clientId: 'c', clientName: 'C', createdAt: 3 },
  ]

  it('counts each consenting client once, with details from their latest booking', () => {
    expect(consentedRecipients(appts, { a: true, b: false, c: true })).toEqual([
      { clientId: 'a', name: 'A', phone: '2' },
      { clientId: 'c', name: 'C', phone: undefined },
    ])
  })

  it('ignores clients without a consent record', () => {
    expect(consentedRecipients(appts, {})).toEqual([])
  })
})
