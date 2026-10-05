import { useState } from 'react'
import { Plus, Pencil, Trash2, Receipt } from 'lucide-react'
import { useLanguage } from '../../../context/LanguageContext'
import { useData } from '../../../context/DataContext'
import { EXPENSE_CATEGORIES } from '../../../lib/finance'
import { agorotToInput, formatShekels, parseShekelsToAgorot } from '../../../lib/money'
import { todayIso } from '../../../lib/time'
import { formatDateLong } from '../../../utils/date'
import { useSubmitGuard } from '../../../hooks/useSubmitGuard'

const emptyDraft = () => ({ date: todayIso(), category: 'materials', amount: '', note: '' })

// Expenses in the selected range, with add / edit / delete. Same inline-form pattern as the
// Services list in Settings.
export default function ExpensesPanel({ from, to }) {
  const { t, lang } = useLanguage()
  const { expenses, addExpense, updateExpense, removeExpense } = useData()
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState(emptyDraft)
  const [saving, guard] = useSubmitGuard()

  const visible = expenses
    .filter((e) => e.date >= from && e.date <= to)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const amountAgorot = parseShekelsToAgorot(draft.amount)
  const canSave = draft.date && amountAgorot !== null && amountAgorot > 0

  const openAdd = () => {
    setEditingId(null)
    setDraft(emptyDraft())
    setShowForm(true)
  }

  const openEdit = (e) => {
    setEditingId(e.id)
    setDraft({ date: e.date, category: e.category, amount: agorotToInput(e.amountAgorot), note: e.noteKey ? t(e.noteKey) : e.note })
    setShowForm(true)
  }

  const close = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const handleSave = guard(() => {
    if (!canSave) return
    const patch = { date: draft.date, category: draft.category, amountAgorot, note: draft.note.trim() }
    if (editingId) updateExpense(editingId, patch)
    else addExpense(patch)
    close()
  })

  return (
    <section className="bg-surface border border-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-sans text-headline-md text-on-background flex items-center gap-2">
          <Receipt size={20} className="text-primary" />
          {t('expense.title')}
        </h3>
        <button
          type="button"
          onClick={openAdd}
          className="bg-primary text-on-primary px-3 py-2 rounded-md font-sans text-sm hover:bg-primary-container transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Plus size={16} />
          {t('expense.add')}
        </button>
      </div>

      {showForm && (
        <div className="p-4 rounded-md border border-primary/30 bg-primary/5 flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label-caps text-on-surface-variant">{t('export.col.date')}</span>
              <input type="date" className="input-field py-2" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-mono text-label-caps text-on-surface-variant">{t('export.col.amount')} (₪)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                className="input-field py-2"
                value={draft.amount}
                onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))}
              />
            </label>
            <label className="flex flex-col gap-1 col-span-2">
              <span className="font-mono text-label-caps text-on-surface-variant">{t('export.col.category')}</span>
              <select className="input-field py-2" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`expense.category.${c}`)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 col-span-2">
              <span className="font-mono text-label-caps text-on-surface-variant">{t('export.col.note')}</span>
              <input className="input-field py-2" value={draft.note} maxLength={120} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} />
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={close} className="btn-secondary px-4 py-2 text-sm">
              {t('Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !canSave}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-60 disabled:pointer-events-none"
            >
              {t('Save')}
            </button>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <p className="font-sans text-body-sm text-on-surface-variant">{t('expense.empty')}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-outline-variant/40">
          {visible.map((e) => (
            <li key={e.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="font-sans text-body-sm text-on-surface truncate">
                  {t(`expense.category.${e.category}`)}
                  {(e.noteKey || e.note) && <span className="text-on-surface-variant"> · {e.noteKey ? t(e.noteKey) : e.note}</span>}
                </p>
                <p className="font-mono text-[11px] text-on-surface-variant">{formatDateLong(e.date, lang)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="font-mono text-body-sm text-on-surface me-2">{formatShekels(e.amountAgorot)}</span>
                <button
                  type="button"
                  onClick={() => openEdit(e)}
                  aria-label={t('Edit')}
                  className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-variant rounded-md transition-colors"
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => removeExpense(e.id)}
                  aria-label={t('Delete')}
                  className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
