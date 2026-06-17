import { Link } from 'react-router-dom'
import { Container } from '../components/layout/Layout'
import { SeoHead } from '../components/layout/SeoHead'
import { StoreBadges } from '../components/layout/StoreBadges'
import { EmailCapture } from '../components/layout/EmailCapture'
import { LinkCard } from '../components/ui/Card'
import { SITE } from '../config/site'
import { softwareApplicationLd } from '../lib/seo'
import { TOOL_LINKS } from '../components/layout/Nav'

const HOW_CARDS = [
  {
    title: 'Built for homesteads, not generic farms',
    body: 'Goats, sheep, chickens, rabbits, cattle, pigs — the species you actually keep, with the records that actually matter.',
  },
  {
    title: 'Works offline, in the barn',
    body: 'No signal by the goat pen? Log it anyway. Everything syncs when you’re back in range.',
  },
  {
    title: 'Tracks the four things that bite you',
    body: 'Medication withdrawals, upcoming births, overdue care, and production — surfaced before they become a problem.',
  },
  {
    title: 'Turns chores into reminders that never expire',
    body: 'Schedule deworming and vaccinations once; the app re-creates the next “due” automatically.',
  },
]

const WHAT_FEATURES = [
  { title: 'Animals', body: 'Profiles with groups, breeds, and photos.', to: '/tools/gestation-calculator', cta: 'Try the free gestation calculator' },
  { title: 'Care', body: 'Recurring schedules with auto “next due”.', to: '/tools/deworming-vaccination-schedule', cta: 'Try the free schedule generator' },
  { title: 'Health', body: 'Vaccines, meds, dewormers with withdrawal periods.', to: '/tools/medication-withdrawal-calculator', cta: 'Try the free withdrawal calculator' },
  { title: 'Production', body: 'Eggs, milk, fiber, honey, meat — logged over time.', to: '/tools/chicken-egg-feed-cost-calculator', cta: 'Try the free egg cost calculator' },
  { title: 'Breeding', body: 'Cover dates, due-date tracking, kidding alerts.', to: '/tools/gestation-calculator', cta: 'Try the free due-date calculator' },
]

export default function Home() {
  return (
    <>
      <SeoHead
        meta={{
          title: `${SITE.appName} — Homestead Animal Tracker for iPhone & Android`,
          description:
            'Track livestock health, breeding, care, and production on your homestead. Free medication-withdrawal, gestation, schedule, and egg-cost tools. Get the app for iOS & Android.',
          path: '/',
        }}
        jsonLd={[softwareApplicationLd()]}
      />

      {/* WHY — hero */}
      <section className="bg-gradient-to-b from-sand/60 to-cream">
        <Container className="grid gap-10 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Every animal you keep deserves to not be forgotten.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-bark-light">
              A homestead runs on memory — and memory shouldn’t live on a whiteboard in the barn.
              {' '}{SITE.appName} remembers every withdrawal date, due date, and overdue chore so you don’t have to.
            </p>
            <StoreBadges section="hero" className="mt-7" />
            <p className="mt-4 text-sm text-bark-light">Free to start · Works offline · No account needed to try the tools below.</p>
          </div>
          <div className="rounded-3xl border border-sand bg-white/60 p-4 shadow-sm">
            <div className="flex aspect-[3/4] items-center justify-center rounded-2xl bg-sand text-center text-bark-light">
              <span className="px-6">Dashboard preview<br />(resources/screenshots/appstorev2/home.png)</span>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW */}
      <Container className="py-16">
        <h2 className="text-3xl">Why it’s different</h2>
        <p className="mt-2 max-w-2xl text-bark-light">
          Not a generic pet or farm CRM. Designed around how a homestead actually runs.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {HOW_CARDS.map((c) => (
            <div key={c.title} className="rounded-2xl border border-sand bg-white/70 p-6">
              <h3 className="text-xl">{c.title}</h3>
              <p className="mt-2 text-bark-light">{c.body}</p>
            </div>
          ))}
        </div>
      </Container>

      {/* WHAT */}
      <section className="bg-sand/40">
        <Container className="py-16">
          <h2 className="text-3xl">What you can track</h2>
          <p className="mt-2 max-w-2xl text-bark-light">
            Every feature mirrors a free tool you can try right now — no signup.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHAT_FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col rounded-2xl border border-sand bg-white/80 p-6">
                <h3 className="text-xl">{f.title}</h3>
                <p className="mt-2 flex-1 text-bark-light">{f.body}</p>
                <Link to={f.to} className="mt-4 font-semibold text-terracotta hover:underline">
                  {f.cta} →
                </Link>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Free tools & printables band */}
      <Container className="py-16">
        <h2 className="text-3xl">Free tools &amp; printables — no signup</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_LINKS.map((t) => (
            <LinkCard key={t.to} to={t.to} title={t.label} cta="Open">
              Instant answer, free, mobile-friendly.
            </LinkCard>
          ))}
          <LinkCard to="/printables" title="Free printable log templates" cta="Browse printables">
            Herd, breeding, health, and production logs — print and go.
          </LinkCard>
        </div>
      </Container>

      {/* Closing CTA + email capture */}
      <section className="bg-gradient-to-b from-cream to-sand/60">
        <Container className="py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h2 className="text-3xl">Stop keeping it all in your head.</h2>
              <p className="mt-3 text-bark-light">Download free and let the app remember the dates that matter.</p>
              <StoreBadges section="closing" className="mt-5" />
            </div>
            <EmailCapture source="home_closing" />
          </div>
        </Container>
      </section>
    </>
  )
}
