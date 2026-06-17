import { useMemo, useState } from 'react'
import type { SpeciesGestationInfo } from '@template/common'
import { Card } from '../ui/Card'
import { DateField } from '../ui/Fields'
import { ResultPanel, CopyButton } from '../ui/ResultPanel'
import { calculateGestation, prepChecklist } from '../../lib/gestation'
import { todayIso } from '../../content/animals'
import { track } from '../../lib/analytics'

export function GestationWidget({ species }: { species: SpeciesGestationInfo }) {
  const [coverDate, setCoverDate] = useState(todayIso())

  const result = useMemo(
    () => calculateGestation(coverDate, species, todayIso()),
    [coverDate, species],
  )
  const checklist = useMemo(() => prepChecklist(species), [species])
  const verb = species.isPoultry ? 'set' : 'bred'
  const label = species.isPoultry ? 'incubation' : 'gestation'

  const summary = `${species.name} due ${result.dueDateLabel} (watch window ${result.watchStartLabel}–${result.watchEndLabel}).`

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <div className="space-y-4">
          <DateField
            id="cover"
            label={species.isPoultry ? 'Date eggs were set' : 'Breeding / cover date'}
            value={coverDate}
            onChange={(v) => {
              setCoverDate(v)
              track('tool_calculate', { tool: 'gestation', species: species.slug })
            }}
          />
          <p className="text-sm text-bark-light">
            {species.name} {label} is about <strong>{species.gestationDays} days</strong>.
          </p>
        </div>
      </Card>

      <ResultPanel tone="safe">
        <p className="text-sm font-semibold uppercase tracking-wide text-meadow">Estimated due date</p>
        <p className="mt-1 text-2xl font-semibold text-bark">{result.dueDateLabel}</p>
        <p className="mt-1 text-bark-light">
          {result.isOverdue
            ? `Overdue — she was due to ${species.birthVerb} already.`
            : `${result.daysToGo} days to go`}
        </p>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white">
          <div className="h-full bg-meadow" style={{ width: `${result.progressPercent}%` }} />
        </div>

        <p className="mt-4 text-sm text-bark">
          <strong>Watch window:</strong> {result.watchStartLabel} – {result.watchEndLabel}
        </p>

        <div className="mt-4">
          <CopyButton text={summary} label="Copy due date" />
        </div>
      </ResultPanel>

      <div className="lg:col-span-2">
        <Card>
          <h2 className="text-xl">Prep checklist</h2>
          <ul className="mt-3 space-y-2">
            {checklist.map((step) => (
              <li key={step.text} className="flex gap-3 text-bark-light">
                <span className="font-semibold text-terracotta">
                  {step.weeksBefore === 0 ? 'Due week' : `${step.weeksBefore} wk before`}
                </span>
                <span>{step.text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-bark-light">Counting from the date she was {verb}.</p>
        </Card>
      </div>
    </div>
  )
}
