import { useState } from 'react'
import { Megaphone } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { consentedRecipients, MAX_CAMPAIGN_BODY, renderCampaign, cleanCampaignBody } from '../../lib/marketing'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

// Compose a marketing message for opted-in clients. Simulated: "send" only appends it to the
// message log. The "Ad" prefix, sender name and opt-out line are added automatically and can't
// be removed, as Israeli anti-spam law requires.
export default function CampaignComposer() {
  const { t, lang } = useLanguage()
  const { isFeatureOn, appointments, marketingConsents, businessSettings, logCampaign } = useData()
  const [body, setBody] = useState('')
  const [done, setDone] = useState(false)
  const [sending, guard] = useSubmitGuard()

  if (!isFeatureOn('marketing')) return null

  const recipients = consentedRecipients(appointments, marketingConsents)
  const preview = renderCampaign({ lang, business: businessSettings.name, body, optOutLine: t('campaign.optOut') })
  const canSend = cleanCampaignBody(body).length > 0 && recipients.length > 0

  const handleSend = guard(() => {
    if (!canSend) return
    logCampaign({ body: preview, recipientCount: recipients.length })
    setBody('')
    setDone(true)
    setTimeout(() => setDone(false), 2500)
  })

  return (
    <section className="bg-surface border border-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-sans text-headline-md text-on-background flex items-center gap-2">
          <Megaphone size={20} className="text-primary" />
          {t('campaign.title')}
        </h3>
        <p className="font-sans text-body-sm text-on-surface-variant">
          {t('campaign.audience').replace('{n}', recipients.length)}
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-mono text-label-caps text-on-surface-variant">{t('campaign.body')}</span>
        <textarea
          rows={4}
          maxLength={MAX_CAMPAIGN_BODY}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('campaign.placeholder')}
          className="input-field resize-none"
        />
        <span className="font-mono text-[11px] text-outline self-end">
          {body.length}/{MAX_CAMPAIGN_BODY}
        </span>
      </label>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-label-caps text-on-surface-variant">{t('campaign.preview')}</span>
        <p className="rounded-md bg-surface-container-low border border-outline-variant/50 p-3 font-sans text-body-sm text-on-surface whitespace-pre-line">
          {preview}
        </p>
        <span className="font-sans text-[12px] text-on-surface-variant">{t('campaign.legalNote')}</span>
      </div>

      <div className="flex items-center justify-end gap-3">
        {done && <span className="font-sans text-body-sm text-on-success-container">{t('campaign.logged')}</span>}
        <button
          type="button"
          onClick={handleSend}
          disabled={sending || !canSend}
          className="btn-primary px-4 py-2.5 text-sm disabled:opacity-50 disabled:pointer-events-none"
        >
          {t('campaign.send')}
        </button>
      </div>
    </section>
  )
}
