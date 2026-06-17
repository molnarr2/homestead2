import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../../components/layout/Layout'
import { SeoHead } from '../../components/layout/SeoHead'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'
import { SelectField } from '../../components/ui/Fields'
import { AppCta } from '../../components/layout/AppCta'
import { EmailCapture } from '../../components/layout/EmailCapture'
import { GestationWidget } from '../../components/tool/GestationWidget'
import { SPECIES_GESTATION, getSpeciesBySlug } from '@template/common'
import { webApplicationLd, breadcrumbLd, faqPageLd } from '../../lib/seo'

const PATH = '/tools/gestation-calculator'

export default function GestationCalculator() {
  const [slug, setSlug] = useState('goat')
  const species = getSpeciesBySlug(slug) ?? SPECIES_GESTATION[0]

  return (
    <Container className="py-8">
      <SeoHead
        meta={{
          title: 'Animal Gestation & Due-Date Calculator (Goat, Sheep, Cow & more)',
          description:
            'Free gestation calculator for goats, sheep, cattle, pigs, rabbits, and poultry. Enter the breeding date to get an estimated due date, watch window, and prep checklist.',
          path: PATH,
        }}
        jsonLd={[
          webApplicationLd('Gestation & Due-Date Calculator', 'Estimate animal due dates from a breeding date.', PATH),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Tools', path: '/tools' },
            { name: 'Gestation Calculator', path: PATH },
          ]),
          faqPageLd([
            {
              question: 'How is gestation length calculated?',
              answer:
                'The due date is the breeding (or cover) date plus the species’ average gestation length in days — for example, about 150 days for goats and 283 for cattle.',
            },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Tools', path: '/tools' }, { name: 'Gestation Calculator', path: PATH }]} />
      <h1 className="mt-4 text-3xl sm:text-4xl">Animal gestation &amp; due-date calculator</h1>
      <p className="mt-2 max-w-2xl text-lg text-bark-light">
        Pick a species and breeding date to get an estimated due date, a realistic watch window, and a prep checklist.
      </p>

      <div className="mt-6 max-w-xs">
        <SelectField
          id="species"
          label="Species"
          value={slug}
          onChange={setSlug}
          options={SPECIES_GESTATION.map((s) => ({ value: s.slug, label: s.name }))}
        />
      </div>

      <div className="mt-6">
        <GestationWidget species={species} />
      </div>

      <section className="mt-10">
        <h2 className="text-xl">Per-species calculators</h2>
        <p className="mt-1 text-bark-light">Dedicated pages with species-specific guidance:</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {SPECIES_GESTATION.map((s) => (
            <li key={s.slug}>
              <Link
                to={`${PATH}/${s.slug}`}
                className="inline-block rounded-full border border-sand bg-white px-4 py-2 text-sm font-medium text-bark hover:border-terracotta hover:text-terracotta"
              >
                {s.name} {s.isPoultry ? 'incubation' : 'gestation'}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10">
        <AppCta
          section="tool_gestation"
          headline="Get a reminder when she’s actually due"
          body="The app tracks every breeding and reminds you automatically as the due date approaches."
        />
      </div>

      <div className="mt-8">
        <EmailCapture source="tool_gestation" headline="Was this helpful? Get the free breeding log" />
      </div>
    </Container>
  )
}
