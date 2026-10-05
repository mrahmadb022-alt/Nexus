import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Info, Download, FileSpreadsheet } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'
import { useData, serviceName } from '../../context/DataContext'
import ManagerTopBar from '../../components/manager/ManagerTopBar'
import { TrendChart, BarList } from '../../components/manager/finance/charts'
import ExpensesPanel from '../../components/manager/finance/ExpensesPanel'
import { computeFinance, last30DaysRange, lastMonthRange, thisMonthRange, yearToDateRange } from '../../lib/finance'
import { formatShekels } from '../../lib/money'
import { todayIso } from '../../lib/time'
import { buildDataset, EXPORT_TYPES, formatMoneyCellsForCsv } from '../../lib/export/datasets'
import { toCsv } from '../../lib/export/csv'
import { toXlsx } from '../../lib/export/xlsx'
import { downloadFile } from '../../lib/download'
import { WEEKDAY_KEYS } from '../../utils/date'

const PRESETS = [
  { id: 'thisMonth', labelKey: 'finance.range.thisMonth', range: thisMonthRange },
  { id: 'lastMonth', labelKey: 'finance.range.lastMonth', range: lastMonthRange },
  { id: 'last30', labelKey: 'finance.range.last30', range: last30DaysRange },
  { id: 'ytd', labelKey: 'finance.range.ytd', range: yearToDateRange },
]

function Tile({ label, value, tone }) {
  return (
    <div className="bg-surface border border-outline-variant rounded-md p-4 shadow-sm min-w-0">
      <p className="font-mono text-label-caps text-on-surface-variant mb-2">{label}</p>
      <p className={`font-sans text-display-lg-mobile truncate ${tone === 'negative' ? 'text-error' : 'text-on-background'}`}>
        {/* bdi + ltr keeps "-₪12" intact inside RTL text */}
        <bdi dir="ltr">{value}</bdi>
      </p>
    </div>
  )
}

function Card({ title, children, action }) {
  return (
    <section className="bg-surface border border-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-sans text-headline-md text-on-background">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function Finance() {
  const { t, isRtl } = useLanguage()
  const { appointments, expenses, services, getStaffById, isFeatureOn } = useData()
  const today = todayIso()
  const [preset, setPreset] = useState('last30')
  const [custom, setCustom] = useState(() => thisMonthRange(today))
  const [exportType, setExportType] = useState('bookings')

  const range = preset === 'custom' ? custom : PRESETS.find((p) => p.id === preset).range(today)
  const validRange = range.from && range.to && range.from <= range.to

  // Localized names are attached here, so the pure finance/export code never needs `t`.
  const bookings = useMemo(
    () =>
      appointments.map((a) => ({
        ...a,
        serviceName: serviceName(services.find((s) => s.id === a.serviceId), t) || '—',
        staffName: a.staffId ? getStaffById(a.staffId)?.name || '' : '',
      })),
    [appointments, services, t, getStaffById],
  )
  const localizedExpenses = useMemo(
    () => expenses.map((e) => ({ ...e, note: e.noteKey ? t(e.noteKey) : e.note })),
    [expenses, t],
  )

  const stats = useMemo(
    () => (validRange ? computeFinance({ bookings, expenses: localizedExpenses, from: range.from, to: range.to, today }) : null),
    [bookings, localizedExpenses, range.from, range.to, today, validRange],
  )

  if (!isFeatureOn('finance')) return <Navigate to="/manager/settings" replace />

  const runExport = (format) => {
    const ds = buildDataset(exportType, { bookings, expenses: localizedExpenses, from: range.from, to: range.to, t })
    const base = `${exportType}_${range.from}_${range.to}`
    if (format === 'csv') {
      downloadFile(`${base}.csv`, toCsv(ds.headers, formatMoneyCellsForCsv(ds)), 'text/csv;charset=utf-8')
    } else {
      const bytes = toXlsx({ ...ds, rtl: isRtl })
      downloadFile(`${base}.xlsx`, bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    }
  }

  const pct = (r) => `${Math.round(r * 1000) / 10}%`

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ManagerTopBar />
      <div className="px-margin-mobile lg:px-margin-desktop py-6 max-w-container-max mx-auto w-full flex flex-col gap-6">
        <div>
          <h2 className="font-sans text-display-lg text-on-background mb-1">{t('finance.title')}</h2>
          <p className="flex items-start gap-2 text-on-surface-variant text-body-sm">
            <Info size={16} className="shrink-0 mt-0.5" />
            {t('finance.disclaimer')}
          </p>
        </div>

        {/* Date range */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('finance.range')}>
            {[...PRESETS, { id: 'custom', labelKey: 'finance.range.custom' }].map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={preset === p.id}
                onClick={() => {
                  if (p.id === 'custom') setCustom(range)
                  setPreset(p.id)
                }}
                className={`px-4 py-2 rounded-full font-sans text-body-sm border transition-colors ${
                  preset === p.id
                    ? 'bg-primary text-on-primary border-primary'
                    : 'bg-surface text-on-surface-variant border-outline-variant hover:border-primary/50'
                }`}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <label className="flex flex-col gap-1">
                <span className="font-mono text-label-caps text-on-surface-variant">{t('finance.from')}</span>
                <input type="date" className="input-field py-2" value={custom.from} max={custom.to} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value }))} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-mono text-label-caps text-on-surface-variant">{t('finance.to')}</span>
                <input type="date" className="input-field py-2" value={custom.to} min={custom.from} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value }))} />
              </label>
            </div>
          )}
          {!validRange && <p className="font-sans text-body-sm text-error">{t('finance.invalidRange')}</p>}
        </div>

        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Tile label={t('finance.income')} value={formatShekels(stats.incomeAgorot)} />
              <Tile label={t('finance.expenses')} value={formatShekels(stats.expensesAgorot)} />
              <Tile label={t('finance.profit')} value={formatShekels(stats.profitAgorot)} tone={stats.profitAgorot < 0 ? 'negative' : null} />
              <Tile label={t('finance.noShowRate')} value={`${pct(stats.noShowRate)}`} />
            </div>
            <p className="-mt-3 font-sans text-[12px] text-on-surface-variant">
              {t('finance.noShowDetail').replace('{n}', stats.noShowCount).replace('{total}', stats.happenedCount)}
            </p>

            <Card title={t('finance.trend')}>
              <TrendChart trend={stats.trend} unit={stats.trendUnit} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card title={t('finance.byService')}>
                <BarList
                  emptyLabel={t('finance.noData')}
                  items={stats.revenueByService.map((s) => ({ key: s.name, label: s.name, value: s.agorot, display: formatShekels(s.agorot) }))}
                />
              </Card>
              <Card title={t('finance.busiestDays')}>
                <BarList
                  emptyLabel={t('finance.noData')}
                  items={stats.byWeekday.map((d) => ({ key: d.weekday, label: t(WEEKDAY_KEYS[d.weekday]), value: d.count, display: String(d.count) }))}
                />
              </Card>
              <Card title={t('finance.busiestHours')}>
                <BarList
                  emptyLabel={t('finance.noData')}
                  items={stats.byHour.map((h) => ({
                    key: h.hour,
                    label: `${String(h.hour).padStart(2, '0')}:00`,
                    value: h.count,
                    display: String(h.count),
                  }))}
                />
              </Card>
            </div>

            <ExpensesPanel from={range.from} to={range.to} />

            <Card title={t('export.title')}>
              <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                <label className="flex flex-col gap-1 sm:w-56">
                  <span className="font-mono text-label-caps text-on-surface-variant">{t('export.dataset')}</span>
                  <select className="input-field py-2" value={exportType} onChange={(e) => setExportType(e.target.value)}>
                    {EXPORT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {t(`export.type.${type}`)}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button type="button" onClick={() => runExport('csv')} className="btn-secondary px-4 py-2.5 text-sm flex items-center justify-center gap-2">
                    <Download size={16} /> CSV
                  </button>
                  <button type="button" onClick={() => runExport('xlsx')} className="btn-primary px-4 py-2.5 text-sm flex items-center justify-center gap-2">
                    <FileSpreadsheet size={16} /> Excel
                  </button>
                </div>
              </div>
              <p className="font-sans text-[12px] text-on-surface-variant">{t('export.hint')}</p>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
