import { useLanguage } from '../../../context/LanguageContext'
import { useData } from '../../../context/DataContext'

export default function AboutSection() {
  const { t } = useLanguage()
  const { businessSettings } = useData()
  const text = businessSettings.about || t('about.defaultText')

  return (
    <section className="max-w-2xl mx-auto text-center px-margin-mobile">
      <h2 className="font-sans text-display-lg-mobile text-on-background mb-3">{t('About Us')}</h2>
      <p className="font-sans text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">{text}</p>
    </section>
  )
}
