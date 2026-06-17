import { useMemo, useState } from 'react'
import { ToolShell } from '../../components/tool/ToolShell'
import { SeoHead } from '../../components/layout/SeoHead'
import { Card } from '../../components/ui/Card'
import { SelectField, DateField } from '../../components/ui/Fields'
import { PrintButton } from '../../components/ui/ResultPanel'
import { Button } from '../../components/ui/Button'
import { CARE_SPECIES } from '@template/common'
import type { CareSpecies } from '@template/common'
import { generateSchedule, scheduleToIcs } from '../../lib/schedule'
import { todayIso } from '../../content/animals'
import { track } from '../../lib/analytics'
import { webApplicationLd, howToLd, faqPageLd, breadcrumbLd } from '../../lib/seo'

const PATH = '/tools/deworming-vaccination-schedule'

const CATEGORY_STYLE: Record<string, string> = {
  vaccination: 'bg-meadow/15 text-meadow',
  deworming: 'bg-terracotta/15 text-terracotta',
  health: 'bg-bark/10 text-bark',
}

export default function ScheduleGenerator() {
  const [species, setSpecies] = useState<CareSpecies>('goat')
  const [startDate, setStartDate] = useState(todayIso())
  const [birthDate, setBirthDate] = useState('')

  const entries = useMemo(
    () => generateSchedule({ species, startDateIso: startDate, birthDateIso: birthDate || undefined }),
    [species, startDate, birthDate],
  )
  const speciesName = CARE_SPECIES.find((s) => s.slug === species)?.name ?? species

  const downloadIcs = () => {
    track('tool_calculate', { tool: 'schedule', species, export: 'ics' })
    const ics = scheduleToIcs(entries, `${speciesName} care schedule`)
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${species}-care-schedule.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <SeoHead
        meta={{
          title: 'Deworming & Vaccination Schedule Generator (Goats, Sheep, Cattle)',
          description:
            'Free deworming and vaccination schedule generator for livestock. Pick a species and start date to get a dated, printable care schedule with calendar (.ics) export.',
          path: PATH,
        }}
        jsonLd={[
          webApplicationLd('Deworming & Vaccination Schedule Generator', 'Generate a dated livestock care schedule.', PATH),
          howToLd('Generate a deworming and vaccination schedule', [
            'Pick your species.',
            'Choose a start date (and birth date for age-based vaccines).',
            'Download the schedule as a calendar (.ics) or print it.',
          ]),
          faqPageLd([
            {
              question: 'How often should goats be dewormed?',
              answer:
                'Deworm based on FAMACHA scoring and fecal counts rather than a fixed calendar, since over-deworming breeds resistance. This generator suggests an indicative cadence you can adjust with your vet.',
            },
          ]),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Schedule Generator', path: PATH },
          ]),
        ]}
      />
      <ToolShell
        title="Deworming & Vaccination Schedule Generator"
        valueProp="Build a dated, printable care schedule — then export it to your calendar."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          { name: 'Schedule Generator', path: PATH },
        ]}
        ctaSection="tool_schedule"
        ctaHeadline="Stop reprinting this every season"
        ctaBody="The app turns this schedule into recurring reminders that re-create themselves — they never expire."
        showDisclaimer
        emailSource="tool_schedule"
        related={[
          { label: 'Medication Withdrawal Calculator', to: '/tools/medication-withdrawal-calculator' },
          { label: 'Gestation / Due-Date Calculator', to: '/tools/gestation-calculator' },
        ]}
        seoBody={
          <>
            <h2>How the schedule is built</h2>
            <p>
              Recurring tasks (like deworming and annual boosters) are projected forward from your start
              date at the typical cadence. Age-based vaccines are placed relative to a birth date when you
              provide one. These are indicative best-practice intervals — your veterinarian’s regional
              guidance always overrides them.
            </p>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <div className="space-y-4">
              <SelectField
                id="species"
                label="Species"
                value={species}
                onChange={(v) => setSpecies(v as CareSpecies)}
                options={CARE_SPECIES.map((s) => ({ value: s.slug, label: s.name }))}
              />
              <DateField id="start" label="Schedule start date" value={startDate} onChange={setStartDate} />
              <DateField id="birth" label="Birth date (optional, for age-based vaccines)" value={birthDate} onChange={setBirthDate} />
              <div className="flex flex-wrap gap-2 pt-2">
                <Button onClick={downloadIcs}>Add to calendar (.ics)</Button>
                <PrintButton label="Download / Print PDF" />
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h2 className="text-xl">{speciesName} care schedule</h2>
            {entries.length === 0 ? (
              <p className="mt-2 text-bark-light">No default items for this species yet.</p>
            ) : (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-sand text-bark-light">
                    <th className="py-2 pr-4 font-semibold">Date</th>
                    <th className="py-2 pr-4 font-semibold">Task</th>
                    <th className="py-2 font-semibold">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e, i) => (
                    <tr key={`${e.date}-${e.label}-${i}`} className="border-b border-sand/60">
                      <td className="py-2 pr-4 align-top font-medium text-bark">{e.dateLabel}</td>
                      <td className="py-2 pr-4 align-top">
                        <span className="text-bark">{e.label}</span>
                        {e.note && <span className="block text-xs text-bark-light">{e.note}</span>}
                      </td>
                      <td className="py-2 align-top">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_STYLE[e.category]}`}>
                          {e.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      </ToolShell>
    </>
  )
}
