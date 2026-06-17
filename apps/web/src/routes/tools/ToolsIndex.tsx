import { Container } from '../../components/layout/Layout'
import { SeoHead } from '../../components/layout/SeoHead'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'
import { LinkCard } from '../../components/ui/Card'
import { breadcrumbLd } from '../../lib/seo'

const TOOLS = [
  {
    to: '/tools/medication-withdrawal-calculator',
    title: 'Medication Withdrawal Calculator',
    body: 'When is milk, meat, or eggs safe after treating an animal? Enter the drug and dose date.',
  },
  {
    to: '/tools/gestation-calculator',
    title: 'Gestation / Due-Date Calculator',
    body: 'Due dates for goats, sheep, cattle, pigs, rabbits and more — plus a watch window and prep checklist.',
  },
  {
    to: '/tools/deworming-vaccination-schedule',
    title: 'Deworming & Vaccination Schedule Generator',
    body: 'Build a dated, printable care schedule with calendar (.ics) export.',
  },
  {
    to: '/tools/chicken-egg-feed-cost-calculator',
    title: 'Chicken Egg / Feed Cost Calculator',
    body: 'Cost per dozen, break-even price, and whether your eggs beat the store.',
  },
]

export default function ToolsIndex() {
  return (
    <Container className="py-8">
      <SeoHead
        meta={{
          title: 'Free Homestead Tools & Livestock Calculators',
          description:
            'Free, no-signup calculators for homesteaders: medication withdrawal, animal gestation/due dates, deworming & vaccination schedules, and chicken egg feed cost.',
          path: '/tools',
        }}
        jsonLd={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }])]}
      />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }]} />
      <h1 className="mt-4 text-3xl sm:text-4xl">Free homestead tools &amp; livestock calculators</h1>
      <p className="mt-2 max-w-2xl text-lg text-bark-light">
        Instant answers, no signup. Each tool mirrors a feature of the {''}
        app — try it free, then let the app remember it for you.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {TOOLS.map((t) => (
          <LinkCard key={t.to} to={t.to} title={t.title} cta="Open tool">
            {t.body}
          </LinkCard>
        ))}
      </div>
    </Container>
  )
}
