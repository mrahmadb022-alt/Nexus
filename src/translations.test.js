import { describe, expect, it } from 'vitest'
import { featureTranslations } from './translations.features'

describe('feature translations', () => {
  const en = Object.keys(featureTranslations.en).sort()

  it.each(['he', 'ar'])('%s has exactly the same keys as en', (lang) => {
    expect(Object.keys(featureTranslations[lang]).sort()).toEqual(en)
  })

  it.each(['en', 'he', 'ar'])('%s has no empty strings', (lang) => {
    for (const [key, value] of Object.entries(featureTranslations[lang])) {
      expect(value, key).toBeTruthy()
    }
  })

  it('keeps the same {placeholders} across languages', () => {
    const vars = (s) => (s.match(/\{\w+\}/g) || []).sort().join(',')
    for (const key of en) {
      for (const lang of ['he', 'ar']) {
        expect(vars(featureTranslations[lang][key]), `${lang}:${key}`).toBe(vars(featureTranslations.en[key]))
      }
    }
  })
})
