import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileText, Lock } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { BUSINESS_TYPES, OFFICIAL_DOCUMENTS, formatConfirmationNumber } from '../../lib/receipts'
import { formatShekels } from '../../lib/money'
import DemoBadge from '../DemoBadge'

// Business type + which official documents become available once an invoicing provider is
// connected, and the list of demo payment confirmations issued so far.
export default function ReceiptSettings() {
  const { t } = useLanguage()
  const { hash } = useLocation()
  const { isFeatureOn, receiptSettings, updateReceiptSettings, confirmations } = useData()
  const on = isFeatureOn('receipts')

  useEffect(() => {
    if (on && hash === '#receipts') document.getElementById('receipts')?.scrollIntoView({ block: 'start' })
  }, [hash, on])

  if (!on) return null
  const type = receiptSettings.businessType

  return (
    <div id="receipts" className="scroll-mt-20 bg-surface-container-lowest rounded-md p-6 shadow-card-client border border-outline-variant/30 flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="font-sans text-headline-md text-primary flex items-center gap-2">
          <FileText size={20} />
          {t('receipt.settingsTitle')}
        </h2>
        <div>
          <DemoBadge />
        </div>
        <p className="font-sans text-body-sm text-on-surface-variant">{t('receipt.settingsBody')}</p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="font-mono text-label-caps text-on-surface-variant mb-2">{t('receipt.businessType')}</legend>
        {BUSINESS_TYPES.map((bt) => (
          <label
            key={bt}
            className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
              type === bt ? 'border-primary bg-primary/5' : 'border-outline-variant/50 hover:border-primary/40'
            }`}
          >
            <input
              type="radio"
              name="businessType"
              value={bt}
              checked={type === bt}
              onChange={() => updateReceiptSettings({ businessType: bt })}
              className="mt-1 accent-[rgb(var(--color-primary))]"
            />
            <span>
              <span className="block font-sans text-body-sm font-semibold text-on-surface">{t(`receipt.type.${bt}`)}</span>
              <span className="block font-sans text-[12px] text-on-surface-variant">{t(`receipt.type.${bt}.desc`)}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-label-caps text-on-surface-variant">{t('receipt.officialDocs')}</p>
        <ul className="flex flex-col gap-1.5">
          {OFFICIAL_DOCUMENTS[type].map((doc) => (
            <li key={doc} className="flex items-center gap-2 font-sans text-body-sm text-on-surface-variant">
              <Lock size={14} className="shrink-0 text-outline" />
              {t(`receipt.doc.${doc}`)}
            </li>
          ))}
        </ul>
        {type !== 'exempt' && <p className="font-sans text-[12px] text-on-surface-variant">{t('receipt.allocationNote')}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-label-caps text-on-surface-variant">{t('receipt.issued')}</p>
        {confirmations.length === 0 ? (
          <p className="font-sans text-body-sm text-on-surface-variant">{t('receipt.noneIssued')}</p>
        ) : (
          <ul className="flex flex-col divide-y divide-outline-variant/40">
            {[...confirmations].reverse().map((c) => (
              <li key={c.id}>
                <Link to={`/manager/confirmation/${c.id}`} className="flex items-center justify-between gap-3 py-2.5 hover:bg-surface-container-low -mx-2 px-2 rounded">
                  <span className="min-w-0">
                    <span className="block font-mono text-body-sm text-primary">
                      <bdi dir="ltr">{formatConfirmationNumber(c.number)}</bdi>
                    </span>
                    <span className="block font-sans text-[12px] text-on-surface-variant truncate">{c.clientName}</span>
                  </span>
                  <bdi dir="ltr" className="font-mono text-body-sm text-on-surface">
                    {formatShekels(c.amountAgorot)}
                  </bdi>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
