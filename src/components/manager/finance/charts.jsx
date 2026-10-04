import { useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import { formatShekels } from '../../../lib/money'
import { LOCALE_MAP } from '../../../utils/date'

// Finance charts in plain HTML/flex, so RTL mirroring comes for free from `dir`. Two-series
// colors are the validated --viz-* tokens (index.css); single-series bars use the theme primary.
// Text always uses text tokens, never the series color.

/** Round a max value up to a clean axis top (1/2/2.5/5 × 10^n). */
function niceCeil(value) {
  if (value <= 0) return 1
  const exp = 10 ** Math.floor(Math.log10(value))
  const f = value / exp
  const step = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10
  return step * exp
}

function bucketLabel(key, unit, lang) {
  const [y, m, d] = key.split('-').map(Number)
  const opts =
    unit === 'month'
      ? { month: 'short', year: '2-digit', timeZone: 'UTC' }
      : { month: 'short', day: 'numeric', timeZone: 'UTC' }
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(LOCALE_MAP[lang] || 'en-US', opts)
}

function LegendKey({ colorClass, label }) {
  return (
    <span className="flex items-center gap-1.5 font-sans text-[12px] text-on-surface-variant">
      <span className={`w-2.5 h-2.5 rounded-sm ${colorClass}`} />
      {label}
    </span>
  )
}

/** Income vs expenses per bucket: paired columns on one ₪ axis, hover/focus tooltip, table view. */
export function TrendChart({ trend, unit }) {
  const { t, lang } = useLanguage()
  const [active, setActive] = useState(null)
  const [showTable, setShowTable] = useState(false)
  const top = niceCeil(Math.max(0, ...trend.map((b) => Math.max(b.incomeAgorot, b.expensesAgorot))))
  const ticks = [top, top / 2, 0]
  const activeBucket = active === null ? null : trend[active]

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <LegendKey colorClass="bg-viz-income" label={t('finance.income')} />
          <LegendKey colorClass="bg-viz-expense" label={t('finance.expenses')} />
        </div>
        <button type="button" onClick={() => setShowTable((v) => !v)} className="font-sans text-body-sm text-primary hover:underline">
          {showTable ? t('finance.showChart') : t('finance.showTable')}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto max-h-72 overflow-y-auto">
          <table className="w-full text-body-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="text-on-surface-variant font-mono text-label-caps">
                <th className="text-start py-2 pe-3 font-normal">{t('export.col.date')}</th>
                <th className="text-end py-2 pe-3 font-normal">{t('finance.income')}</th>
                <th className="text-end py-2 font-normal">{t('finance.expenses')}</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((b) => (
                <tr key={b.key} className="border-t border-outline-variant/40">
                  <td className="py-1.5 pe-3 text-on-surface">{bucketLabel(b.key, unit, lang)}</td>
                  <td className="py-1.5 pe-3 text-end font-mono text-on-surface">{formatShekels(b.incomeAgorot)}</td>
                  <td className="py-1.5 text-end font-mono text-on-surface">{formatShekels(b.expensesAgorot)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-2">
            <div className="flex flex-col justify-between h-40 w-14 shrink-0 font-mono text-[10px] text-on-surface-variant text-end">
              {ticks.map((v) => (
                <span key={v} className="leading-none -translate-y-1/2 first:translate-y-0 last:translate-y-0">
                  {formatShekels(Math.round(v))}
                </span>
              ))}
            </div>
            <div className="relative flex-1 min-w-0 h-40">
              {/* hairline gridlines */}
              <div className="absolute inset-x-0 top-0 border-t border-outline-variant/50" />
              <div className="absolute inset-x-0 top-1/2 border-t border-outline-variant/50" />
              <div className="absolute inset-x-0 bottom-0 border-t border-outline-variant" />
              <div className="absolute inset-0 flex items-end" onMouseLeave={() => setActive(null)}>
                {trend.map((b, i) => (
                  <div
                    key={b.key}
                    tabIndex={0}
                    aria-label={`${bucketLabel(b.key, unit, lang)}: ${t('finance.income')} ${formatShekels(b.incomeAgorot)}, ${t('finance.expenses')} ${formatShekels(b.expensesAgorot)}`}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className={`flex-1 min-w-0 h-full flex items-end justify-center gap-[2px] px-[1px] outline-none rounded-sm ${
                      active === i ? 'bg-surface-container' : ''
                    }`}
                  >
                    <div
                      className="bg-viz-income rounded-t-[4px] w-full max-w-[12px]"
                      style={{ height: `${(b.incomeAgorot / top) * 100}%` }}
                    />
                    <div
                      className="bg-viz-expense rounded-t-[4px] w-full max-w-[12px]"
                      style={{ height: `${(b.expensesAgorot / top) * 100}%` }}
                    />
                  </div>
                ))}
              </div>
              {activeBucket && (
                <div className="absolute top-0 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 z-10 pointer-events-none bg-inverse-surface text-inverse-on-surface rounded-md px-3 py-2 shadow-modal text-[12px] whitespace-nowrap">
                  <p className="font-semibold mb-1">{bucketLabel(activeBucket.key, unit, lang)}</p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-viz-income" /> {t('finance.income')}: {formatShekels(activeBucket.incomeAgorot)}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-viz-expense" /> {t('finance.expenses')}: {formatShekels(activeBucket.expensesAgorot)}
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* First / middle / last bucket labels only, pinned so they never collide or overflow. */}
          <div className="relative h-4 ms-16 mt-1 font-mono text-[10px] text-on-surface-variant">
            <span className="absolute start-0">{bucketLabel(trend[0].key, unit, lang)}</span>
            {trend.length > 2 && (
              <span className="absolute start-1/2 -translate-x-1/2 rtl:translate-x-1/2">
                {bucketLabel(trend[Math.floor((trend.length - 1) / 2)].key, unit, lang)}
              </span>
            )}
            {trend.length > 1 && <span className="absolute end-0">{bucketLabel(trend[trend.length - 1].key, unit, lang)}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

/** Horizontal single-series bars with the value at the tip — mobile friendly, no axis needed. */
export function BarList({ items, emptyLabel }) {
  const max = Math.max(0, ...items.map((i) => i.value))
  if (!items.length || max === 0) return <p className="font-sans text-body-sm text-on-surface-variant">{emptyLabel}</p>
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.key} className="grid grid-cols-[minmax(0,7rem)_1fr_auto] items-center gap-3">
          <span className="font-sans text-body-sm text-on-surface truncate" title={item.label}>
            {item.label}
          </span>
          <span className="h-3 min-w-0">
            <span
              className="block h-full rounded-e-[4px] bg-primary"
              style={{ width: `${(item.value / max) * 100}%`, minWidth: item.value > 0 ? 3 : 0 }}
            />
          </span>
          <bdi dir="ltr" className="font-mono text-[12px] text-on-surface-variant whitespace-nowrap min-w-[2.5rem] text-end">
            {item.display}
          </bdi>
        </li>
      ))}
    </ul>
  )
}
