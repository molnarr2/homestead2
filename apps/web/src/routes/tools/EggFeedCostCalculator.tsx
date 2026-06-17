import { useMemo, useState } from 'react'
import { ToolShell } from '../../components/tool/ToolShell'
import { SeoHead } from '../../components/layout/SeoHead'
import { Card } from '../../components/ui/Card'
import { NumberField } from '../../components/ui/Fields'
import { ResultPanel, CopyButton } from '../../components/ui/ResultPanel'
import { calculateEggCost } from '../../lib/eggCost'
import { track } from '../../lib/analytics'
import { webApplicationLd, faqPageLd, breadcrumbLd } from '../../lib/seo'

const PATH = '/tools/chicken-egg-feed-cost-calculator'

export default function EggFeedCostCalculator() {
  const [hens, setHens] = useState<number | ''>(6)
  const [bagPrice, setBagPrice] = useState<number | ''>(20)
  const [bagWeight, setBagWeight] = useState<number | ''>(50)
  const [feedPerHen, setFeedPerHen] = useState<number | ''>(0.25)
  const [eggsPerWeek, setEggsPerWeek] = useState<number | ''>(5)
  const [other, setOther] = useState<number | ''>(0)

  const result = useMemo(
    () =>
      calculateEggCost({
        hens: Number(hens) || 0,
        feedPricePerBag: Number(bagPrice) || 0,
        bagWeightLbs: Number(bagWeight) || 0,
        feedPerHenPerDayLbs: Number(feedPerHen) || 0,
        eggsPerHenPerWeek: Number(eggsPerWeek) || 0,
        otherMonthlyCost: Number(other) || 0,
      }),
    [hens, bagPrice, bagWeight, feedPerHen, eggsPerWeek, other],
  )

  const summary = `Cost per dozen: $${result.costPerDozen.toFixed(2)} · Cost per egg: $${result.costPerEgg.toFixed(
    3,
  )} · Monthly feed: $${result.feedCostPerMonth.toFixed(2)}`

  return (
    <>
      <SeoHead
        meta={{
          title: 'Chicken Egg & Feed Cost Calculator — Cost Per Dozen',
          description:
            'Free chicken feed cost calculator. Work out your true cost per dozen eggs, monthly feed cost, and break-even price — and see if your eggs beat the store.',
          path: PATH,
        }}
        jsonLd={[
          webApplicationLd('Chicken Egg & Feed Cost Calculator', 'Calculate your cost per dozen eggs and break-even price.', PATH),
          faqPageLd([
            {
              question: 'How do you calculate the cost per dozen eggs?',
              answer:
                'Divide your total monthly cost (feed plus other costs) by the number of dozens your hens lay in a month. This calculator does it for you from feed price, bag weight, daily feed per hen, and eggs per hen per week.',
            },
          ]),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Egg & Feed Cost Calculator', path: PATH },
          ]),
        ]}
      />
      <ToolShell
        title="Chicken Egg / Feed Cost Calculator"
        valueProp="Find your real cost per dozen — and whether your backyard eggs actually beat the store."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          { name: 'Egg & Feed Cost Calculator', path: PATH },
        ]}
        ctaSection="tool_eggcost"
        ctaHeadline="See your true cost over time"
        ctaBody="Log real egg counts and feed buys in the app — it turns the guesswork above into your actual numbers."
        emailSource="tool_eggcost"
        related={[
          { label: 'Deworming & Vaccination Schedule', to: '/tools/deworming-vaccination-schedule' },
          { label: 'Medication Withdrawal Calculator', to: '/tools/medication-withdrawal-calculator' },
        ]}
        seoBody={
          <>
            <h2>How cost per egg is calculated</h2>
            <p>
              Monthly feed cost is your flock’s feed weight per month times the price per pound of feed.
              Divide total monthly cost by the dozens your hens lay that month to get cost per dozen, and by
              total eggs for cost per egg. The break-even egg price is simply your cost per dozen.
            </p>
          </>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="grid gap-4 sm:grid-cols-2" onChange={() => track('tool_calculate', { tool: 'eggcost' })}>
              <NumberField id="hens" label="Number of hens" value={hens} onChange={setHens} />
              <NumberField id="eggs" label="Eggs / hen / week" value={eggsPerWeek} onChange={setEggsPerWeek} step={0.5} />
              <NumberField id="bagprice" label="Feed price per bag" value={bagPrice} onChange={setBagPrice} suffix="$" step={0.5} />
              <NumberField id="bagweight" label="Bag weight" value={bagWeight} onChange={setBagWeight} suffix="lb" />
              <NumberField id="feedperhen" label="Feed / hen / day" value={feedPerHen} onChange={setFeedPerHen} suffix="lb" step={0.05} />
              <NumberField id="other" label="Other monthly cost" value={other} onChange={setOther} suffix="$" step={1} />
            </div>
          </Card>

          <ResultPanel tone={result.cheaperThanStore ? 'safe' : 'warn'}>
            <p className="text-sm font-semibold uppercase tracking-wide text-terracotta">Cost per dozen</p>
            <p className="mt-1 text-3xl font-semibold text-bark">${result.costPerDozen.toFixed(2)}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Cost per egg" value={`$${result.costPerEgg.toFixed(3)}`} />
              <Stat label="Monthly feed" value={`$${result.feedCostPerMonth.toFixed(2)}`} />
              <Stat label="Dozens / month" value={`${result.dozensPerMonth}`} />
              <Stat label="Break-even / dozen" value={`$${result.breakEvenEggPrice.toFixed(2)}`} />
            </dl>
            <p className="mt-4 font-medium text-bark">
              {result.cheaperThanStore === null
                ? 'Enter your numbers to see the verdict.'
                : result.cheaperThanStore
                  ? '✅ Your eggs are cheaper than the store (~$4/dozen).'
                  : '⚠️ Your eggs cost more than the store right now.'}
            </p>
            <div className="mt-4">
              <CopyButton text={summary} />
            </div>
          </ResultPanel>
        </div>
      </ToolShell>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <dt className="text-xs text-bark-light">{label}</dt>
      <dd className="text-lg font-semibold text-bark">{value}</dd>
    </div>
  )
}
