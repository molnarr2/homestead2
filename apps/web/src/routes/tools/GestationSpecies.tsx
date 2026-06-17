import { useParams } from 'react-router-dom'
import { Container } from '../../components/layout/Layout'
import { SeoHead } from '../../components/layout/SeoHead'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'
import { AppCta } from '../../components/layout/AppCta'
import { EmailCapture } from '../../components/layout/EmailCapture'
import { GestationWidget } from '../../components/tool/GestationWidget'
import NotFound from '../NotFound'
import { getSpeciesBySlug, SPECIES_GESTATION } from '@template/common'
import { webApplicationLd, breadcrumbLd, faqPageLd, howToLd } from '../../lib/seo'

const BASE = '/tools/gestation-calculator'

// Pre-rendered, one page per species (programmatic SEO) — distinct H1 + meta so
// "goat gestation calculator" and "sheep gestation calculator" each rank.
export default function GestationSpecies() {
  const { species: slug } = useParams<{ species: string }>()
  const species = slug ? getSpeciesBySlug(slug) : undefined
  if (!species) return <NotFound />

  const path = `${BASE}/${species.slug}`
  const label = species.isPoultry ? 'Incubation' : 'Gestation'
  const title = `${species.name} ${label} Calculator — ${species.gestationDays}-Day Due Date`

  return (
    <Container className="py-8">
      <SeoHead
        meta={{
          title,
          description: `Free ${species.name.toLowerCase()} ${label.toLowerCase()} calculator. Enter the ${
            species.isPoultry ? 'date eggs were set' : 'breeding date'
          } to get the estimated ${species.isPoultry ? 'hatch' : 'due'} date (~${species.gestationDays} days), watch window, and prep checklist.`,
          path,
        }}
        jsonLd={[
          webApplicationLd(title, `${species.name} ${label.toLowerCase()} calculator.`, path),
          howToLd(`Calculate a ${species.name.toLowerCase()} ${label.toLowerCase()} due date`, [
            `Enter the ${species.isPoultry ? 'date the eggs were set' : 'breeding or cover date'}.`,
            `Add ${species.gestationDays} days for the ${label.toLowerCase()} period.`,
            'Watch through the watch window for the birth.',
          ]),
          faqPageLd([
            {
              question: `How long is ${species.name.toLowerCase()} ${label.toLowerCase()}?`,
              answer: `${species.name} ${label.toLowerCase()} averages about ${species.gestationDays} days, give or take a few days.`,
            },
          ]),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Gestation Calculator', path: BASE },
            { name: species.name, path },
          ]),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Tools', path: '/tools' },
          { name: 'Gestation', path: BASE },
          { name: species.name, path },
        ]}
      />
      <h1 className="mt-4 text-3xl sm:text-4xl">{species.name} {label.toLowerCase()} calculator</h1>
      <p className="mt-2 max-w-2xl text-lg text-bark-light">
        {species.name} {label.toLowerCase()} is about <strong>{species.gestationDays} days</strong>. Enter the{' '}
        {species.isPoultry ? 'date you set the eggs' : 'breeding date'} to get the estimated{' '}
        {species.isPoultry ? 'hatch' : 'due'} date.
      </p>

      <div className="mt-8">
        <GestationWidget species={species} />
      </div>

      <section className="prose-article mt-12">
        <h2>How {species.name.toLowerCase()} {label.toLowerCase()} is calculated</h2>
        <p>
          The estimated {species.isPoultry ? 'hatch' : 'due'} date is the{' '}
          {species.isPoultry ? 'set date' : 'breeding date'} plus {species.gestationDays} days. Because
          individual animals vary, plan to watch closely across the {species.watchWindowDays}-day window on
          either side of the estimate.
        </p>
        <h2>Other species</h2>
        <ul>
          {SPECIES_GESTATION.filter((s) => s.slug !== species.slug)
            .slice(0, 6)
            .map((s) => (
              <li key={s.slug}>
                <a href={`${BASE}/${s.slug}`}>{s.name} {s.isPoultry ? 'incubation' : 'gestation'} calculator</a>
              </li>
            ))}
        </ul>
      </section>

      <div className="mt-10">
        <AppCta
          section="tool_gestation"
          headline={`Never miss when she’s due to ${species.birthVerb}`}
          body="The app does this automatically — log the breeding once and get reminded as the date approaches."
        />
      </div>

      <div className="mt-8">
        <EmailCapture source={`tool_gestation_${species.slug}`} headline="Get the free breeding & birth log" />
      </div>
    </Container>
  )
}
