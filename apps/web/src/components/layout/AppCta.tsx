import { StoreBadges } from './StoreBadges'
import type { StoreSection } from '../../lib/storeLinks'
import { SITE } from '../../config/site'

// Soft, single CTA reused across tool pages. The copy is per-tool ("the app
// remembers this for you") and the badges carry the section for attribution.
export function AppCta({
  section,
  headline,
  body,
}: {
  section: StoreSection
  headline?: string
  body?: string
}) {
  return (
    <section className="rounded-2xl bg-sand p-6 sm:p-8">
      <h2 className="text-2xl">{headline ?? `${SITE.appName} remembers this for you`}</h2>
      <p className="mt-2 max-w-2xl text-bark-light">
        {body ?? 'Free on the App Store and Google Play. Track every animal, never miss a date again.'}
      </p>
      <StoreBadges section={section} className="mt-5" />
    </section>
  )
}
