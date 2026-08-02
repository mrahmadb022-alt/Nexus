import { useRef, useState } from 'react'
import { Store, Settings as SettingsIcon, Image as ImageIcon, Upload } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import ManagerTopBar from '../../components/manager/ManagerTopBar'

const TIMEZONES = [
  { value: 'est', label: 'Eastern Time (ET)' },
  { value: 'cst', label: 'Central Time (CT)' },
  { value: 'pst', label: 'Pacific Time (PT)' },
  { value: 'ist', label: 'Israel Time (IST)' },
]

export default function BusinessSettings() {
  const { t, lang, setLang } = useLanguage()
  const { businessSettings, updateBusinessSettings } = useData()
  const [form, setForm] = useState({ ...businessSettings, language: lang })
  const [saved, setSaved] = useState(false)
  const heroInputRef = useRef(null)
  const logoInputRef = useRef(null)

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  // Image fields apply immediately to shared state (not gated behind Save Changes) —
  // an upload already reads as a complete action, so it shouldn't need a second step
  // to actually show up on the client side.
  const updateImageField = (patch) => {
    update(patch)
    updateBusinessSettings(patch)
  }

  const handleFileSelect = (e, field) => {
    const file = e.target.files?.[0]
    if (file) updateImageField({ [field]: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const handleSave = () => {
    const { language, ...rest } = form
    updateBusinessSettings(rest)
    setLang(language)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => setForm({ ...businessSettings, language: lang })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar title={t('Business Settings')} />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="font-sans text-display-lg text-primary mb-2">{t('Business Settings')}</h1>
            <p className="font-sans text-body-lg text-on-surface-variant">
              {t('Manage your business profile, operating hours, and general preferences.')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-md p-6 shadow-card-client border border-outline-variant/30">
              <h2 className="font-sans text-headline-md text-primary mb-4 flex items-center gap-2">
                <Store size={20} />
                {t('Business Profile')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Business Name')}</label>
                  <input className="input-field" value={form.name} onChange={(e) => update({ name: e.target.value })} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Contact Email')}</label>
                  <input
                    type="email"
                    className="input-field"
                    value={form.email}
                    onChange={(e) => update({ email: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Phone Number')}</label>
                  <input
                    type="tel"
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Address')}</label>
                  <textarea
                    rows={2}
                    className="input-field resize-none"
                    value={form.address}
                    onChange={(e) => update({ address: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-md p-6 shadow-card-client border border-outline-variant/30">
              <h2 className="font-sans text-headline-md text-primary mb-4 flex items-center gap-2">
                <ImageIcon size={20} />
                {t('Storefront & Branding')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Hero Background')}</label>
                  <div className="relative h-32 rounded-md overflow-hidden border border-outline-variant bg-surface-container">
                    {form.heroBackground && <img src={form.heroBackground} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => heroInputRef.current?.click()}
                      className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5"
                    >
                      <Upload size={14} /> {t('Upload')}
                    </button>
                  </div>
                  <input ref={heroInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(e, 'heroBackground')} />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Logo')}</label>
                  <div className="relative h-32 rounded-md overflow-hidden border border-outline-variant bg-surface-container flex items-center justify-center">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="font-sans text-body-sm text-on-surface-variant">{t('Logo')}</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="btn-secondary px-3 py-2 text-sm flex items-center gap-1.5"
                    >
                      <Upload size={14} /> {t('Upload')}
                    </button>
                    {form.logoUrl && (
                      <button onClick={() => updateImageField({ logoUrl: null })} className="btn-ghost px-3 py-2 text-sm">
                        {t('Remove')}
                      </button>
                    )}
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={(e) => handleFileSelect(e, 'logoUrl')} />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('About Text')}</label>
                  <textarea
                    rows={4}
                    className="input-field resize-none"
                    value={form.about || ''}
                    placeholder={t('about.defaultText')}
                    onChange={(e) => update({ about: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-md p-6 shadow-card-client border border-outline-variant/30">
              <h2 className="font-sans text-headline-md text-primary mb-4 flex items-center gap-2">
                <SettingsIcon size={20} />
                {t('Preferences')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Language')}</label>
                  <select className="input-field appearance-none" value={form.language} onChange={(e) => update({ language: e.target.value })}>
                    <option value="en">{t('English')}</option>
                    <option value="he">{t('Hebrew')}</option>
                    <option value="ar">{t('Arabic')}</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-mono text-label-caps text-on-surface-variant">{t('Time Zone')}</label>
                  <select
                    className="input-field appearance-none"
                    value={form.timezone}
                    onChange={(e) => update({ timezone: e.target.value })}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/30">
              {saved && <span className="font-sans text-body-sm text-on-success-container">{t('Save Changes')} ✓</span>}
              <button onClick={handleCancel} className="px-6 py-3 rounded-md font-sans text-headline-md text-primary border border-outline-variant hover:bg-surface-container-high transition-colors">
                {t('Cancel')}
              </button>
              <button onClick={handleSave} className="px-6 py-3 rounded-md font-sans text-headline-md bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm">
                {t('Save Changes')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
