import { ToggleRight } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { FEATURES } from '../../lib/features'
import Switch from '../Switch'

// Manager on/off switches for each roadmap feature. Toggles apply immediately (like the theme
// picker), so they aren't tied to the page's Save Changes button.
export default function FeatureSettings() {
  const { t } = useLanguage()
  const { features, setFeature } = useData()
  return (
    <div className="bg-surface-container-lowest rounded-md p-6 shadow-card-client border border-outline-variant/30">
      <h2 className="font-sans text-headline-md text-primary mb-1 flex items-center gap-2">
        <ToggleRight size={20} />
        {t('features.title')}
      </h2>
      <p className="font-sans text-body-sm text-on-surface-variant mb-5">{t('features.subtitle')}</p>
      <div className="flex flex-col divide-y divide-outline-variant/30">
        {FEATURES.map((f) => (
          <div key={f.key} className="py-3 first:pt-0 last:pb-0">
            <Switch
              checked={features[f.key] !== false}
              onChange={(on) => setFeature(f.key, on)}
              label={t(f.nameKey)}
              description={t(f.descKey)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
