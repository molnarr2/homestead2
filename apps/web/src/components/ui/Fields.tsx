import type { ReactNode } from 'react'

const FIELD =
  'mt-1 w-full rounded-xl border border-sand bg-white px-4 py-3 text-base text-bark min-h-[48px] focus:border-terracotta focus:outline-none'

function Label({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <label className="block" htmlFor={htmlFor}>
      <span className="text-sm font-semibold text-bark">{label}</span>
      {children}
    </label>
  )
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  min = 0,
  step = 1,
  suffix,
}: {
  id: string
  label: string
  value: number | ''
  onChange: (v: number | '') => void
  min?: number
  step?: number
  suffix?: string
}) {
  return (
    <Label label={label} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={FIELD}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-bark-light">
            {suffix}
          </span>
        )}
      </div>
    </Label>
  )
}

export function DateField({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Label label={label} htmlFor={id}>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={FIELD} />
    </Label>
  )
}

export interface SelectOption {
  value: string
  label: string
}

export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
}) {
  return (
    <Label label={label} htmlFor={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={FIELD}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Label>
  )
}
