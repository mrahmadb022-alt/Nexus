import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, Printer, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName } from '../../context/DataContext'
import { formatConfirmationNumber } from '../../lib/receipts'
import { formatShekels } from '../../lib/money'
import { formatDateFull, formatStamp } from '../../utils/date'
import DemoBadge from '../../components/DemoBadge'

// Printable demo payment confirmation. The "not a tax document" notice is part of the printed
// page itself (not just the screen chrome), so it can't be cropped off a printout.
export default function PaymentConfirmation() {
  const { id } = useParams()
  const { t, lang, isRtl } = useLanguage()
  const { confirmations, services, businessSettings, isFeatureOn } = useData()
  const c = confirmations.find((x) => x.id === id)

  if (!isFeatureOn('receipts') || !c) return <Navigate to="/manager/settings" replace />

  const rows = [
    [t('receipt.issuedAt'), formatStamp(c.issuedAt, lang)],
    [t('export.col.client'), c.clientName],
    [t('export.col.service'), serviceName(services.find((s) => s.id === c.serviceId), t) || '—'],
    [t('receipt.appointmentDate'), formatDateFull(c.appointmentDate, lang)],
    [t('payment.method'), c.paymentMethod ? t(`payment.method.${c.paymentMethod}`) : '—'],
  ]

  return (
    <div className="min-h-screen bg-background px-margin-mobile py-6 print:p-0 print:bg-white">
      <div className="max-w-xl mx-auto flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link to="/manager/settings#receipts" className="flex items-center gap-2 text-primary font-sans text-body-sm hover:underline">
            <ArrowLeft size={18} className={isRtl ? 'rtl-mirror' : ''} />
            {t('Back')}
          </Link>
          <button type="button" onClick={() => window.print()} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
            <Printer size={16} />
            {t('receipt.print')}
          </button>
        </div>
        <div className="print:hidden">
          <DemoBadge />
        </div>

        <article className="bg-surface-container-lowest border border-outline-variant rounded-md p-6 flex flex-col gap-5 print:border-black print:rounded-none print:text-black">
          <div className="flex items-start gap-3 rounded-md border-2 border-error bg-error-container/40 p-3 text-on-error-container print:bg-white print:text-black">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-body-sm font-bold uppercase">{t('receipt.notTaxDocument')}</p>
              <p className="font-sans text-[12px] mt-1">{t('receipt.notTaxDocumentBody')}</p>
            </div>
          </div>

          <header className="flex flex-col gap-1">
            <p className="font-sans text-headline-md text-on-background">{businessSettings.name}</p>
            <p className="font-sans text-[12px] text-on-surface-variant whitespace-pre-line">{businessSettings.address}</p>
            <p className="font-sans text-[12px] text-on-surface-variant">
              <bdi dir="ltr">{businessSettings.phone}</bdi>
            </p>
            <p className="font-sans text-[12px] text-on-surface-variant">{t(`receipt.type.${c.businessType}`)}</p>
          </header>

          <div className="border-t border-outline-variant pt-4">
            <h1 className="font-sans text-display-lg-mobile text-on-background">{t('receipt.title')}</h1>
            <p className="font-mono text-body-sm text-on-surface-variant mt-1">
              <bdi dir="ltr">{formatConfirmationNumber(c.number)}</bdi>
            </p>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
            {rows.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="font-mono text-label-caps text-on-surface-variant self-center">{label}</dt>
                <dd className="font-sans text-body-sm text-on-surface">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="border-t border-outline-variant pt-4 flex items-center justify-between">
            <span className="font-sans text-body-lg font-semibold text-on-background">{t('receipt.amount')}</span>
            <bdi dir="ltr" className="font-sans text-display-lg-mobile text-on-background">
              {formatShekels(c.amountAgorot)}
            </bdi>
          </div>

          <p className="font-sans text-[11px] text-on-surface-variant border-t border-outline-variant pt-3">{t('receipt.footer')}</p>
        </article>
      </div>
    </div>
  )
}
