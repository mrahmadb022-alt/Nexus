import { useRef, useState } from 'react'
import { Plus, Megaphone, BellRing, Tag, Trash2, Images, ImagePlus } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { formatDateLong } from '../../utils/date'
import ManagerTopBar from '../../components/manager/ManagerTopBar'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'
import { todayIso as todayInTz } from '../../lib/time'

const TABS = [
  { id: 'content', label: 'Announcements & Offers', icon: Megaphone },
  { id: 'gallery', label: 'Portfolio Gallery', icon: Images },
]

export default function PublicPage() {
  const { t, lang } = useLanguage()
  const {
    announcements,
    removeAnnouncement,
    addAnnouncement,
    offers,
    toggleOfferActive,
    addOffer,
    gallery,
    addPhoto,
    removePhotos,
  } = useData()
  const [tab, setTab] = useState('content')
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [annDraft, setAnnDraft] = useState({ title: '', body: '' })
  const [offerDraft, setOfferDraft] = useState({ title: '', description: '', discountLabel: '' })
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const fileInputRef = useRef(null)
  const [savingAnn, guardSaveAnn] = useSubmitGuard()
  const [savingOffer, guardSaveOffer] = useSubmitGuard()

  const todayIso = todayInTz()

  const saveAnnouncement = guardSaveAnn(() => {
    if (!annDraft.title.trim()) return
    addAnnouncement({ titleKey: null, title: annDraft.title, bodyKey: null, body: annDraft.body, dateLabel: todayIso })
    setAnnDraft({ title: '', body: '' })
    setShowAnnForm(false)
  })

  const saveOffer = guardSaveOffer(() => {
    if (!offerDraft.title.trim()) return
    addOffer({
      titleKey: null,
      title: offerDraft.title,
      descriptionKey: null,
      description: offerDraft.description,
      discountLabel: offerDraft.discountLabel || '—',
      expiresLabel: null,
    })
    setOfferDraft({ title: '', description: '', discountLabel: '' })
    setShowOfferForm(false)
  })

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => addPhoto(URL.createObjectURL(file)))
    e.target.value = ''
  }

  const togglePhoto = (id) =>
    setSelectedPhotos((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))

  const handleDeleteSelected = () => {
    removePhotos(selectedPhotos)
    setSelectedPhotos([])
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar />
      <div className="px-margin-mobile md:px-margin-desktop py-6 lg:py-8 border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-sans text-display-lg text-on-background">{t('Public Page')}</h2>
              <p className="font-sans text-body-lg text-on-surface-variant mt-1">{t('Manage announcements, offers, and your portfolio gallery.')}</p>
            </div>
            {tab === 'content' && (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowOfferForm((s) => !s)}
                  className="h-10 px-4 flex items-center justify-center gap-2 rounded-md border border-outline text-on-surface hover:bg-surface-container-high transition-colors font-sans text-body-sm font-semibold"
                >
                  <Plus size={18} />
                  {t('New Offer')}
                </button>
                <button
                  onClick={() => setShowAnnForm((s) => !s)}
                  className="h-10 px-4 flex items-center justify-center gap-2 rounded-md bg-primary text-on-primary hover:bg-primary-container transition-colors font-sans text-body-sm font-bold shadow-sm"
                >
                  <Megaphone size={18} />
                  {t('New Announcement')}
                </button>
              </div>
            )}
            {tab === 'gallery' && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-10 px-4 flex items-center justify-center gap-2 rounded-md bg-primary text-on-primary hover:bg-primary-container transition-colors font-sans text-body-sm font-bold shadow-sm self-start"
              >
                <ImagePlus size={18} />
                {t('Add Photos')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-surface-container-low rounded-md p-1 border border-outline-variant self-start">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded text-body-sm font-sans transition-colors ${
                  tab === id ? 'bg-primary text-on-primary shadow-sm font-semibold' : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <Icon size={16} />
                {t(label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {tab === 'content' && (
        <div className="flex-1 p-margin-mobile md:p-margin-desktop">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-sans text-headline-md text-on-background flex items-center gap-2">
                  <BellRing className="text-primary" size={20} />
                  {t('Active Announcements')}
                </h3>
                <span className="font-mono text-label-caps text-on-surface-variant bg-surface-container-high px-2 py-1 rounded-md">
                  {t('{n} Items').replace('{n}', announcements.length)}
                </span>
              </div>

              {showAnnForm && (
                <div className="p-4 rounded-md border border-primary/30 bg-primary/5 flex flex-col gap-3">
                  <input
                    autoFocus
                    placeholder={t('New Announcement')}
                    value={annDraft.title}
                    onChange={(e) => setAnnDraft((s) => ({ ...s, title: e.target.value }))}
                    className="input-field"
                  />
                  <textarea
                    rows={2}
                    value={annDraft.body}
                    onChange={(e) => setAnnDraft((s) => ({ ...s, body: e.target.value }))}
                    className="input-field resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAnnForm(false)} className="btn-secondary px-4 py-2 text-sm">
                      {t('Cancel')}
                    </button>
                    <button onClick={saveAnnouncement} disabled={savingAnn} className="btn-primary px-4 py-2 text-sm disabled:opacity-60 disabled:pointer-events-none">
                      {t('Save')}
                    </button>
                  </div>
                </div>
              )}

              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-surface-container-lowest rounded-md p-4 shadow-card-client border border-outline-variant/50 hover:border-primary/30 transition-colors group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full ${ann.dot}`} />
                        <h4 className="font-sans text-[16px] text-on-background">{ann.titleKey ? t(ann.titleKey) : ann.title}</h4>
                      </div>
                      <p className="font-mono text-data-tabular text-on-surface-variant">
                        {ann.dateLabel >= todayIso ? t('Scheduled:') : t('Published:')} {formatDateLong(ann.dateLabel, lang)}
                      </p>
                    </div>
                    <div className="flex">
                      <button
                        onClick={() => removeAnnouncement(ann.id)}
                        className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <p className="font-sans text-body-sm text-on-surface line-clamp-2">{ann.bodyKey ? t(ann.bodyKey) : ann.body}</p>
                  <div className="mt-4 flex gap-2">
                    {ann.channels.map((c) => (
                      <span key={c} className="px-2 py-1 bg-surface-container-high text-on-surface-variant font-mono text-[10px] rounded">
                        {t(c)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-sans text-headline-md text-on-background flex items-center gap-2">
                  <Tag className="text-primary" size={20} />
                  {t('Promotional Offers')}
                </h3>
              </div>

              {showOfferForm && (
                <div className="p-4 rounded-md border border-primary/30 bg-primary/5 flex flex-col gap-3">
                  <input
                    autoFocus
                    placeholder={t('New Offer')}
                    value={offerDraft.title}
                    onChange={(e) => setOfferDraft((s) => ({ ...s, title: e.target.value }))}
                    className="input-field"
                  />
                  <div className="flex gap-2">
                    <textarea
                      rows={2}
                      placeholder={t('Description')}
                      value={offerDraft.description}
                      onChange={(e) => setOfferDraft((s) => ({ ...s, description: e.target.value }))}
                      className="input-field flex-1 resize-none"
                    />
                    <input
                      placeholder="15%"
                      value={offerDraft.discountLabel}
                      onChange={(e) => setOfferDraft((s) => ({ ...s, discountLabel: e.target.value }))}
                      className="input-field w-24 self-start"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowOfferForm(false)} className="btn-secondary px-4 py-2 text-sm">
                      {t('Cancel')}
                    </button>
                    <button onClick={saveOffer} disabled={savingOffer} className="btn-primary px-4 py-2 text-sm disabled:opacity-60 disabled:pointer-events-none">
                      {t('Save')}
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-surface-container-lowest rounded-md shadow-card-client border border-outline-variant/50 overflow-hidden">
                {offers.map((offer) => (
                  <div key={offer.id} className="p-4 border-b border-outline-variant/30 last:border-0 hover:bg-surface-container-low transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-md flex items-center justify-center shrink-0 ${
                          offer.active ? 'bg-primary-container/20 text-primary-container' : 'bg-surface-container-highest text-on-surface-variant'
                        }`}
                      >
                        <span className="font-sans text-headline-md">{offer.discountLabel}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-sans text-[15px] ${offer.active ? 'text-on-background' : 'text-on-surface-variant'}`}>
                          {offer.titleKey ? t(offer.titleKey) : offer.title}
                        </h4>
                        {(offer.descriptionKey || offer.description) && (
                          <p className="font-sans text-[12px] text-on-surface-variant line-clamp-1">
                            {offer.descriptionKey ? t(offer.descriptionKey) : offer.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <label className="relative inline-block w-10 h-6 cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={offer.active}
                        onChange={() => toggleOfferActive(offer.id)}
                      />
                      <div className="w-10 h-6 bg-surface-variant rounded-full peer peer-checked:bg-primary transition-colors" />
                      <div className="absolute top-[2px] start-[2px] bg-white border border-outline-variant rounded-full h-5 w-5 transition-transform peer-checked:translate-x-4 rtl:peer-checked:-translate-x-4" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'gallery' && (
        <div className="flex-1 p-margin-mobile md:p-margin-desktop">
          <div className="max-w-6xl mx-auto">
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            <section className="bg-surface rounded-md border border-outline-variant/40 shadow-sm p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sans text-headline-md text-on-surface flex items-center gap-2">
                  <Images className="text-primary" size={20} />
                  {t('Portfolio Gallery')}
                </h2>
                {selectedPhotos.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="text-error hover:text-error text-sm font-mono flex items-center gap-1"
                  >
                    <Trash2 size={16} /> {t('Delete Selected')} ({selectedPhotos.length})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {gallery.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group aspect-square rounded-md overflow-hidden bg-surface-variant border border-outline-variant/20"
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div
                      className={`absolute inset-0 transition-opacity ${selectedPhotos.includes(photo.id) ? 'bg-primary/30 opacity-100' : 'bg-black/20 opacity-0 group-hover:opacity-100'}`}
                    />
                    <label className="absolute top-2 start-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPhotos.includes(photo.id)}
                        onChange={() => togglePhoto(photo.id)}
                        className="w-5 h-5 rounded border-outline text-primary focus:ring-primary focus:ring-offset-0 bg-surface/80 backdrop-blur-sm"
                      />
                    </label>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-md border-2 border-dashed border-outline-variant/50 hover:border-primary hover:bg-surface-container-low transition-all flex flex-col items-center justify-center text-on-surface-variant hover:text-primary gap-2"
                >
                  <ImagePlus size={28} />
                  <span className="font-mono text-label-caps">{t('Upload')}</span>
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
