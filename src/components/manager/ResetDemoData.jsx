import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData } from '../../context/DataContext'

// Data is saved in this browser (lib/persistence.js). This puts everything back to the demo seed.
// The confirmation is inline rather than window.confirm so it's translated and styled like the app.
export default function ResetDemoData({ onReset }) {
  const { t } = useLanguage()
  const { resetDemoData } = useData()
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)

  const handleConfirm = () => {
    const seed = resetDemoData()
    onReset?.(seed)
    setConfirming(false)
    setDone(true)
    setTimeout(() => setDone(false), 3000)
  }

  return (
    <div className="bg-surface-container-lowest rounded-md p-6 shadow-card-client border border-outline-variant/30">
      <h2 className="font-sans text-headline-md text-primary mb-1 flex items-center gap-2">
        <RotateCcw size={20} />
        {t('demoData.title')}
      </h2>
      <p className="font-sans text-body-sm text-on-surface-variant mb-5">{t('demoData.subtitle')}</p>
      {confirming ? (
        <div role="alertdialog" aria-labelledby="reset-demo-warning" className="rounded-md border border-error/40 bg-error-container/40 p-4 flex flex-col gap-3">
          <p id="reset-demo-warning" className="font-sans text-body-sm text-on-surface">
            {t('demoData.confirm')}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-md font-sans text-body-sm font-semibold bg-error text-on-error hover:opacity-90 transition-opacity"
            >
              {t('demoData.confirmYes')}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-md font-sans text-body-sm text-primary border border-outline-variant hover:bg-surface-container-high transition-colors"
            >
              {t('Cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => setConfirming(true)}
            className="px-4 py-2 rounded-md font-sans text-body-sm font-semibold text-error border border-error/50 hover:bg-error-container/40 transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} />
            {t('demoData.reset')}
          </button>
          {done && (
            <span role="status" className="font-sans text-body-sm text-on-success-container">
              {t('demoData.done')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
