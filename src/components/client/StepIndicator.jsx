import { Fragment } from 'react'
import { Check } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

const STEPS = [
  { n: 1, key: 'SERVICE' },
  { n: 2, key: 'TIME' },
  { n: 3, key: 'CONFIRM' },
]

export default function StepIndicator({ step }) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-between max-w-md mx-auto w-full px-4 mb-2">
      {STEPS.map((s, i) => (
        <Fragment key={s.key}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-headline-md text-body-sm shadow-sm transition-colors ${
                s.n < step
                  ? 'bg-primary text-on-primary'
                  : s.n === step
                    ? 'bg-primary text-on-primary ring-4 ring-primary-container/20'
                    : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {s.n < step ? <Check size={16} /> : s.n}
            </div>
            <span
              className={`font-mono text-label-caps ${
                s.n <= step ? 'text-primary' : 'text-on-surface-variant'
              } ${s.n === step ? 'font-bold' : ''}`}
            >
              {t(s.key)}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-px flex-1 mx-2 ${s.n < step ? 'bg-primary' : 'bg-outline-variant'}`} />
          )}
        </Fragment>
      ))}
    </div>
  )
}
