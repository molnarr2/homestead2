import { useMemo, useState } from 'react'
import { ToolShell } from '../../components/tool/ToolShell'
import { SeoHead } from '../../components/layout/SeoHead'
import { Card } from '../../components/ui/Card'
import { SelectField, DateField, NumberField } from '../../components/ui/Fields'
import { ResultPanel, CopyButton } from '../../components/ui/ResultPanel'
import { WITHDRAWAL_SPECIES, WITHDRAWAL_PRESETS, WITHDRAWAL_CUSTOM_ID } from '@template/common'
import type { WithdrawalSpecies } from '@template/common'
import { calculateWithdrawal, presetDaysForSpecies, withdrawalSummary } from '../../lib/withdrawal'
import { todayIso } from '../../content/animals'
import { track } from '../../lib/analytics'
import { webApplicationLd, faqPageLd, howToLd, breadcrumbLd } from '../../lib/seo'

const PATH = '/tools/medication-withdrawal-calculator'

const FAQ = [
  {
    question: 'How is a medication withdrawal date calculated?',
    answer:
      'The safe date is the last dose date plus the product’s withdrawal period in days. Milk and meat/eggs often have different withdrawal periods, so they are shown separately.',
  },
  {
    question: 'Are these withdrawal times official?',
    answer:
      'No. The presets are conservative, indicative values for planning only. Withdrawal periods vary by product, dose, route, and country. Always confirm with the product label and your veterinarian.',
  },
  {
    question: 'What if my medication isn’t listed?',
    answer:
      'Choose “Custom / other” and enter the withdrawal days from your product label for milk and for meat/eggs.',
  },
]

export default function WithdrawalCalculator() {
  const [species, setSpecies] = useState<WithdrawalSpecies>('goat')
  const [presetId, setPresetId] = useState<string>(WITHDRAWAL_PRESETS[0].id)
  const [lastDose, setLastDose] = useState(todayIso())
  const [customMeat, setCustomMeat] = useState<number | ''>('')
  const [customMilk, setCustomMilk] = useState<number | ''>('')
  const [customEggs, setCustomEggs] = useState<number | ''>('')

  const speciesInfo = WITHDRAWAL_SPECIES.find((s) => s.slug === species)!
  const isCustom = presetId === WITHDRAWAL_CUSTOM_ID
  const preset = WITHDRAWAL_PRESETS.find((p) => p.id === presetId)

  const lines = useMemo(() => {
    const days = isCustom
      ? {
          meat: customMeat === '' ? undefined : customMeat,
          milk: customMilk === '' ? undefined : customMilk,
          eggs: customEggs === '' ? undefined : customEggs,
        }
      : presetDaysForSpecies(preset!, species)
    return calculateWithdrawal({
      lastDoseDateIso: lastDose,
      meatDays: days.meat,
      milkDays: speciesInfo.producesMilk ? days.milk : undefined,
      eggDays: speciesInfo.producesEggs ? days.eggs : undefined,
    })
  }, [isCustom, customMeat, customMilk, customEggs, preset, species, lastDose, speciesInfo])

  const onCalc = () => track('tool_calculate', { tool: 'withdrawal', species, preset: presetId })

  return (
    <>
      <SeoHead
        meta={{
          title: 'Medication Withdrawal Calculator — Milk, Meat & Eggs',
          description:
            'Free medication withdrawal calculator for livestock. Find when milk, meat, and eggs are safe after treating goats, sheep, cattle, pigs, chickens, or rabbits.',
          path: PATH,
        }}
        jsonLd={[
          webApplicationLd('Medication Withdrawal Calculator', 'Calculate safe milk, meat and egg dates after medication.', PATH),
          howToLd('Calculate a medication withdrawal date', [
            'Pick the species you treated.',
            'Choose the medication (or enter custom withdrawal days from the label).',
            'Enter the date of the last dose.',
            'Read the safe dates for milk and meat/eggs.',
          ]),
          faqPageLd(FAQ),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Withdrawal Calculator', path: PATH },
          ]),
        ]}
      />
      <ToolShell
        title="Medication / Milk / Egg Withdrawal Calculator"
        valueProp="Find out exactly when milk, meat, and eggs are safe again after treating an animal."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          { name: 'Withdrawal Calculator', path: PATH },
        ]}
        ctaSection="tool_withdrawal"
        ctaHeadline="The app tracks every active withdrawal for you"
        ctaBody="It warns you before you sell or drink anything still in its withdrawal window — automatically, for every animal."
        showDisclaimer
        emailSource="tool_withdrawal"
        related={[
          { label: 'Deworming & Vaccination Schedule', to: '/tools/deworming-vaccination-schedule' },
          { label: 'Gestation / Due-Date Calculator', to: '/tools/gestation-calculator' },
        ]}
        seoBody={
          <>
            <h2>How withdrawal dates are calculated</h2>
            <p>
              The safe date is simply the date of the last dose plus the withdrawal period for that
              product, measured in days. Many medications have a <strong>different</strong> withdrawal
              period for milk than for meat or eggs, so this calculator shows them separately.
            </p>
            <h2>Why “confirm with the label” matters</h2>
            <p>
              Withdrawal periods are not universal. They change with the product brand, the dose, the
              route of administration (injection vs. oral vs. pour-on), the species, and the country.
              The presets here are deliberately conservative and are a convenience, not an authority.
              A wrong “milk safe” date can put unsafe product in the food chain — always verify against
              the label and ask your veterinarian.
            </p>
            <h2>FAQ</h2>
            {FAQ.map((f) => (
              <div key={f.question}>
                <h3>{f.question}</h3>
                <p>{f.answer}</p>
              </div>
            ))}
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="space-y-4">
              <SelectField
                id="species"
                label="Species"
                value={species}
                onChange={(v) => setSpecies(v as WithdrawalSpecies)}
                options={WITHDRAWAL_SPECIES.map((s) => ({ value: s.slug, label: s.name }))}
              />
              <SelectField
                id="preset"
                label="Medication / product"
                value={presetId}
                onChange={setPresetId}
                options={[
                  ...WITHDRAWAL_PRESETS.map((p) => ({ value: p.id, label: p.name })),
                  { value: WITHDRAWAL_CUSTOM_ID, label: 'Custom / other (enter from label)' },
                ]}
              />
              {!isCustom && preset?.note && (
                <p className="text-sm text-bark-light">Note: {preset.note}</p>
              )}
              {isCustom && (
                <div className="grid gap-3 sm:grid-cols-3">
                  <NumberField id="cmeat" label="Meat days" value={customMeat} onChange={setCustomMeat} suffix="d" />
                  {speciesInfo.producesMilk && (
                    <NumberField id="cmilk" label="Milk days" value={customMilk} onChange={setCustomMilk} suffix="d" />
                  )}
                  {speciesInfo.producesEggs && (
                    <NumberField id="ceggs" label="Egg days" value={customEggs} onChange={setCustomEggs} suffix="d" />
                  )}
                </div>
              )}
              <DateField id="lastdose" label="Date of last dose" value={lastDose} onChange={setLastDose} />
            </div>
          </Card>

          <ResultPanel tone={lines.length ? 'warn' : 'neutral'}>
            <h2 className="text-xl">Safe dates</h2>
            {lines.length === 0 ? (
              <p className="mt-2 text-bark-light">
                No labeled withdrawal for this product/species combination — enter custom days from the label.
              </p>
            ) : (
              <ul className="mt-4 space-y-3" onMouseEnter={onCalc}>
                {lines.map((l) => (
                  <li key={l.kind} className="rounded-xl bg-white p-4">
                    <span className="text-sm font-semibold uppercase tracking-wide text-terracotta">{l.kind}</span>
                    <p className="text-lg font-semibold text-bark">{l.label} {l.safeDateLabel}</p>
                    <p className="text-sm text-bark-light">{l.days} day withdrawal from last dose</p>
                  </li>
                ))}
              </ul>
            )}
            {lines.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <CopyButton text={withdrawalSummary(lines)} />
              </div>
            )}
            <p className="mt-4 text-xs text-bark-light">
              Always confirm against the product label and your veterinarian before selling or consuming.
            </p>
          </ResultPanel>
        </div>
      </ToolShell>
    </>
  )
}
