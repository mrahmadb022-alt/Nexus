import { useRef, useState } from 'react'
import { Store, Image as ImageIcon, Upload, Scissors, Plus, Pencil, Trash2, Palette, Check } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName, serviceDesc } from '../../context/DataContext'
import { minutesToDuration } from '../../utils/date'
import { THEME_PRESETS } from '../../themes'
import ManagerTopBar from '../../components/manager/ManagerTopBar'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

const EMPTY_SERVICE = { name: '', description: '', price: '', duration: '' }

export default function BusinessSettings() {
  const { t } = useLanguage()
  const { businessSettings, updateBusinessSettings, services, addService, updateService, removeService } = useData()
  const [form, setForm] = useState({ ...businessSettings })
  const [saved, setSaved] = useState(false)
  const heroInputRef = useRef(null)
  const logoInputRef = useRef(null)
  const [savingSettings, guardSaveSettings] = useSubmitGuard()

  const [showServiceForm, setShowServiceForm] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [serviceDraft, setServiceDraft] = useState(EMPTY_SERVICE)
  const [savingService, guardSaveService] = useSubmitGuard()

  const update = (patch) => setForm((f) => ({ ...f, ...patch }))

  // Some fields (image uploads, theme choice) apply immediately to shared state, not gated
  // behind Save Changes — picking one already reads as a complete action. Critically, this
  // also writes the same patch into local `form`, not just `businessSettings` — otherwise
  // `form` would go stale the moment one of these fires, and a later Save Changes (which
  // writes the whole `form` object back over businessSettings) would silently revert it.
  const applyImmediate = (patch) => {
    update(patch)
    updateBusinessSettings(patch)
  }

  const handleFileSelect = (e, field) => {
    const file = e.target.files?.[0]
    if (file) applyImmediate({ [field]: URL.createObjectURL(file) })
    e.target.value = ''
  }

  const handleSave = guardSaveSettings(() => {
    updateBusinessSettings(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  })

  const handleCancel = () => setForm({ ...businessSettings })

  const openAddService = () => {
    setEditingServiceId(null)
    setServiceDraft(EMPTY_SERVICE)
    setShowServiceForm(true)
  }

  const openEditService = (svc) => {
    setEditingServiceId(svc.id)
    setServiceDraft({
      name: serviceName(svc, t),
      description: serviceDesc(svc, t),
      price: svc.price,
      duration: svc.duration,
    })
    setShowServiceForm(true)
  }

  const closeServiceForm = () => {
    setShowServiceForm(false)
    setEditingServiceId(null)
    setServiceDraft(EMPTY_SERVICE)
  }

  const handleSaveService = guardSaveService(() => {
    if (!serviceDraft.name.trim() || !serviceDraft.price || !serviceDraft.duration) return
    const patch = {
      name: serviceDraft.name.trim(),
      description: serviceDraft.description.trim(),
      nameKey: null,
      descKey: null,
      price: Number(serviceDraft.price),
      duration: Number(serviceDraft.duration),
    }
    if (editingServiceId) {
      updateService(editingServiceId, patch)
    } else {
      addService(patch)
    }
    closeServiceForm()
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar />
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
                      <button onClick={() => applyImmediate({ logoUrl: null })} className="btn-ghost px-3 py-2 text-sm">
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
                <Palette size={20} />
                {t('Theme')}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {THEME_PRESETS.map((preset) => {
                  const active = (businessSettings.theme || 'classic') === preset.id
                  return (
                    <button
                      key={preset.id}
                      onClick={() => applyImmediate({ theme: preset.id })}
                      className={`text-start p-4 rounded-md border-2 transition-colors flex flex-col gap-3 ${
                        active ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5 rtl:space-x-reverse">
                          <span
                            className="w-6 h-6 rounded-full border-2 border-surface-container-lowest shadow-sm"
                            style={{ backgroundColor: preset.swatches.background }}
                          />
                          <span
                            className="w-6 h-6 rounded-full border-2 border-surface-container-lowest shadow-sm"
                            style={{ backgroundColor: preset.swatches.primary }}
                          />
                          <span
                            className="w-6 h-6 rounded-full border-2 border-surface-container-lowest shadow-sm"
                            style={{ backgroundColor: preset.swatches.accent }}
                          />
                        </div>
                        {active && (
                          <span className="w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                            <Check size={12} />
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-body-sm font-semibold text-on-surface">{t(preset.nameKey)}</p>
                        <p className="font-sans text-[12px] text-on-surface-variant mt-0.5">{t(preset.descKey)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-md p-6 shadow-card-client border border-outline-variant/30">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-headline-md text-primary flex items-center gap-2">
                  <Scissors size={20} />
                  {t('Services')}
                </h2>
                <button
                  onClick={openAddService}
                  className="bg-primary text-on-primary px-3 py-2 rounded-md font-sans text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={16} />
                  {t('Add Service')}
                </button>
              </div>

              {showServiceForm && (
                <div className="mb-4 p-4 rounded-md border border-primary/30 bg-primary/5 flex flex-col gap-3">
                  <input
                    autoFocus
                    placeholder={t('Service Name')}
                    value={serviceDraft.name}
                    onChange={(e) => setServiceDraft((s) => ({ ...s, name: e.target.value }))}
                    className="input-field"
                  />
                  <textarea
                    rows={2}
                    placeholder={t('Description')}
                    value={serviceDraft.description}
                    onChange={(e) => setServiceDraft((s) => ({ ...s, description: e.target.value }))}
                    className="input-field resize-none"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-label-caps text-on-surface-variant">{t('Price (₪)')}</label>
                      <input
                        type="number"
                        min="0"
                        value={serviceDraft.price}
                        onChange={(e) => setServiceDraft((s) => ({ ...s, price: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-mono text-label-caps text-on-surface-variant">{t('Duration (min)')}</label>
                      <input
                        type="number"
                        min="0"
                        value={serviceDraft.duration}
                        onChange={(e) => setServiceDraft((s) => ({ ...s, duration: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={closeServiceForm} className="btn-secondary px-4 py-2 text-sm">
                      {t('Cancel')}
                    </button>
                    <button onClick={handleSaveService} disabled={savingService} className="btn-primary px-4 py-2 text-sm disabled:opacity-60 disabled:pointer-events-none">
                      {t('Save')}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {services.map((svc) => (
                  <div
                    key={svc.id}
                    className="group flex items-center justify-between gap-3 p-3 rounded-md border border-outline-variant/30 hover:border-primary/30 hover:bg-surface-container-low transition-all"
                  >
                    <div className="min-w-0">
                      <h3 className="font-sans text-base text-on-surface">{serviceName(svc, t)}</h3>
                      <p className="font-sans text-body-sm text-on-surface-variant truncate">{serviceDesc(svc, t)}</p>
                      <p className="font-mono text-label-caps text-on-surface-variant mt-1">
                        ₪{svc.price} • {minutesToDuration(svc.duration, t)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditService(svc)}
                        className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-md transition-colors"
                        title={t('Edit')}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => removeService(svc.id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md transition-colors"
                        title={t('Remove')}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4 border-t border-outline-variant/30">
              {saved && <span className="font-sans text-body-sm text-on-success-container">{t('Save Changes')} ✓</span>}
              <button onClick={handleCancel} className="px-6 py-3 rounded-md font-sans text-headline-md text-primary border border-outline-variant hover:bg-surface-container-high transition-colors">
                {t('Cancel')}
              </button>
              <button onClick={handleSave} disabled={savingSettings} className="px-6 py-3 rounded-md font-sans text-headline-md bg-primary text-on-primary hover:bg-primary-container transition-colors shadow-sm disabled:opacity-60 disabled:pointer-events-none">
                {t('Save Changes')}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
