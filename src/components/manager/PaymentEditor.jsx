import { useState } from 'react'
import { Wallet } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../../lib/finance'
import { agorotToInput, formatShekels, parseShekelsToAgorot } from '../../lib/money'
import { useSubmitGuard } from '../../hooks/useSubmitGuard'

// Payment status / method / amount for one booking, inside the appointment details modal.
export default function PaymentEditor({ appointment }) {
  const { t } = useLanguage()
  const { recordPayment } = useData()
  const [saving, guard] = useSubmitGuard()
  const [status, setStatus] = useState(appointment.paymentStatus || 'unpaid')
  const [method, setMethod] = useState(appointment.paymentMethod || 'cash')
  const [amount, setAmount] = useState(agorotToInput(appointment.amountPaidAgorot ?? appointment.priceAgorot))
  const [saved, setSaved] = useState(false)

  const amountAgorot = parseShekelsToAgorot(amount)
  const invalid = status === 'paid' && amountAgorot === null

  const handleSave = guard(() => {
    if (invalid) return
    recordPayment(appointment.id, { paymentStatus: status, paymentMethod: method, amountPaidAgorot: amountAgorot })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  })

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-outline-variant p-4">
      <div className="flex items-center justify-between gap-2">
        <h4 className="font-sans text-body-lg font-semibold text-on-background flex items-center gap-2">
          <Wallet size={18} className="text-primary" />
          {t('payment.title')}
        </h4>
        <span className="font-mono text-label-caps text-on-surface-variant">
          {t('payment.price')}: {formatShekels(appointment.priceAgorot)}
        </span>
      </div>

      <div role="radiogroup" aria-label={t('payment.status')} className="grid grid-cols-2 gap-2">
        {PAYMENT_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={status === s}
            onClick={() => setStatus(s)}
            className={`py-2 px-2 rounded-lg border font-sans text-body-sm transition-colors ${
              status === s
                ? 'border-primary bg-primary/5 text-primary font-semibold'
                : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
            }`}
          >
            {t(`payment.status.${s}`)}
          </button>
        ))}
      </div>

      {status === 'paid' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="pay-method" className="font-mono text-label-caps text-on-surface-variant">
              {t('payment.method')}
            </label>
            <select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)} className="input-field py-2">
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>
                  {t(`payment.method.${m}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="pay-amount" className="font-mono text-label-caps text-on-surface-variant">
              {t('payment.amountPaid')}
            </label>
            <input
              id="pay-amount"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`input-field py-2 ${invalid ? 'border-error' : ''}`}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {saved && <span className="font-sans text-body-sm text-on-success-container">{t('payment.saved')}</span>}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || invalid}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-60 disabled:pointer-events-none"
        >
          {t('payment.save')}
        </button>
      </div>
    </section>
  )
}
