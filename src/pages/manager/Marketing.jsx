import { useState } from 'react'
import { Plus, Megaphone, BellRing, Tag, Pencil, Trash2 } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { formatDateLong } from '../../utils/date'
import ManagerTopBar from '../../components/manager/ManagerTopBar'

export default function Marketing() {
  const { t, lang } = useLanguage()
  const { announcements, removeAnnouncement, addAnnouncement, offers, toggleOfferActive, addOffer } = useData()
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [annDraft, setAnnDraft] = useState({ title: '', body: '' })
  const [offerDraft, setOfferDraft] = useState({ title: '', code: '', discountLabel: '' })

  const todayIso = new Date().toISOString().slice(0, 10)

  const saveAnnouncement = () => {
    if (!annDraft.title.trim()) return
    addAnnouncement({ titleKey: null, title: annDraft.title, bodyKey: null, body: annDraft.body, dateLabel: todayIso })
    setAnnDraft({ title: '', body: '' })
    setShowAnnForm(false)
  }

  const saveOffer = () => {
    if (!offerDraft.title.trim() || !offerDraft.code.trim()) return
    addOffer({ titleKey: null, title: offerDraft.title, code: offerDraft.code.toUpperCase(), discountLabel: offerDraft.discountLabel || '—', expiresLabel: null })
    setOfferDraft({ title: '', code: '', discountLabel: '' })
    setShowOfferForm(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar title={t('Marketing & Communications')} />
      <div className="px-margin-mobile md:px-margin-desktop py-6 lg:py-8 border-b border-outline-variant/30">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-sans text-display-lg text-on-background">{t('Marketing & Communications')}</h2>
            <p className="font-sans text-body-lg text-on-surface-variant mt-1">{t('Manage announcements and promotional offers.')}</p>
          </div>
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
        </div>
      </div>

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
                  <button onClick={saveAnnouncement} className="btn-primary px-4 py-2 text-sm">
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
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-container">
                      <Pencil size={18} />
                    </button>
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
                  <input
                    placeholder={t('Code:')}
                    value={offerDraft.code}
                    onChange={(e) => setOfferDraft((s) => ({ ...s, code: e.target.value }))}
                    className="input-field flex-1"
                  />
                  <input
                    placeholder="15%"
                    value={offerDraft.discountLabel}
                    onChange={(e) => setOfferDraft((s) => ({ ...s, discountLabel: e.target.value }))}
                    className="input-field w-24"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowOfferForm(false)} className="btn-secondary px-4 py-2 text-sm">
                    {t('Cancel')}
                  </button>
                  <button onClick={saveOffer} className="btn-primary px-4 py-2 text-sm">
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
                    <div>
                      <h4 className={`font-sans text-[15px] ${offer.active ? 'text-on-background' : 'text-on-surface-variant'}`}>
                        {offer.titleKey ? t(offer.titleKey) : offer.title}
                      </h4>
                      <p className="font-mono text-[12px] text-on-surface-variant">
                        {t('Code:')} {offer.code}
                      </p>
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
    </div>
  )
}
