// Same toggle markup as the Calendar's "Working Day" switch, extracted for reuse. The whole row is
// one <label>, so the text is part of the click target and there's no nested interactive element.
export default function Switch({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className={`flex items-center justify-between gap-4 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <span className="min-w-0">
        <span className="block font-sans text-body-sm font-semibold text-on-surface">{label}</span>
        {description && <span className="block font-sans text-[12px] text-on-surface-variant mt-0.5">{description}</span>}
      </span>
      <span className="relative shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="block w-11 h-6 bg-surface-variant rounded-full peer-checked:bg-primary transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40" />
        <span className="absolute top-[2px] start-[2px] bg-white border border-outline-variant rounded-full h-5 w-5 transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
      </span>
    </label>
  )
}
