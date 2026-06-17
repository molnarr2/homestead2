import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../layout/Layout'
import { Breadcrumbs } from '../layout/Breadcrumbs'
import { Disclaimer } from '../layout/Disclaimer'
import { AppCta } from '../layout/AppCta'
import { EmailCapture } from '../layout/EmailCapture'
import type { BreadcrumbItem } from '../../lib/seo'
import type { StoreSection } from '../../lib/storeLinks'
import type { NavItem } from '../layout/Nav'

// Shared tool-page anatomy so every tool is consistent (= trust + reuse):
// H1 + value prop → calculator/result → soft CTA → helpful + email capture →
// SEO body → related links. Disclaimer shown for health tools.
export function ToolShell({
  title,
  valueProp,
  breadcrumbs,
  ctaSection,
  ctaHeadline,
  ctaBody,
  showDisclaimer = false,
  related,
  seoBody,
  emailSource,
  children,
}: {
  title: string
  valueProp: string
  breadcrumbs: BreadcrumbItem[]
  ctaSection: StoreSection
  ctaHeadline?: string
  ctaBody?: string
  showDisclaimer?: boolean
  related: NavItem[]
  seoBody: ReactNode
  emailSource: string
  children: ReactNode
}) {
  return (
    <Container className="py-8">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-lg text-bark-light">{valueProp}</p>

      {showDisclaimer && (
        <div className="mt-6">
          <Disclaimer />
        </div>
      )}

      <div className="mt-8">{children}</div>

      <div className="mt-10">
        <AppCta section={ctaSection} headline={ctaHeadline} body={ctaBody} />
      </div>

      <div className="mt-8">
        <EmailCapture source={emailSource} headline="Was this helpful? Get the free printable pack" />
      </div>

      <section className="prose-article mt-12">{seoBody}</section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl">Related tools</h2>
          <ul className="mt-3 space-y-2">
            {related.map((r) => (
              <li key={r.to}>
                <Link to={r.to} className="font-medium text-terracotta hover:underline">
                  {r.label} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  )
}
