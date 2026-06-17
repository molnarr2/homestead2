import { Link } from 'react-router-dom'
import { Container } from '../../components/layout/Layout'
import { SeoHead } from '../../components/layout/SeoHead'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'
import { Card } from '../../components/ui/Card'
import { EmailCapture } from '../../components/layout/EmailCapture'
import { PRINTABLES } from '../../content/printables'
import { breadcrumbLd } from '../../lib/seo'
import { track } from '../../lib/analytics'

export default function PrintablesIndex() {
  return (
    <Container className="py-8">
      <SeoHead
        meta={{
          title: 'Free Printable Livestock Record Templates (PDF)',
          description:
            'Free printable PDF log templates for homesteaders: herd inventory, breeding, health & medication, production, deworming schedule, and feed cost logs.',
          path: '/printables',
        }}
        jsonLd={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Printables', path: '/printables' }])]}
      />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Printables', path: '/printables' }]} />
      <h1 className="mt-4 text-3xl sm:text-4xl">Free printable livestock record templates</h1>
      <p className="mt-2 max-w-2xl text-lg text-bark-light">
        Print-and-go PDF logs for your binder or barn wall. Free, no signup to download.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {PRINTABLES.map((p) => (
          <Card key={p.slug}>
            <h2 id={p.slug} className="text-xl">{p.title}</h2>
            <p className="mt-2 text-bark-light">{p.description}</p>
            {p.pairsWith && (
              <p className="mt-2 text-sm">
                Pairs with{' '}
                <Link to={p.pairsWith.to} className="font-medium text-terracotta hover:underline">
                  {p.pairsWith.label}
                </Link>
              </p>
            )}
            <div className="mt-4">
              <a
                href={p.file}
                download
                onClick={() => track('printable_download', { printable: p.slug })}
                className="inline-flex min-h-[48px] items-center rounded-xl bg-terracotta px-5 py-3 font-semibold text-cream hover:bg-terracotta-dark"
              >
                Download PDF
              </a>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-10">
        <EmailCapture source="printables_pack" headline="Want all six as one pack? Get the printable bundle" />
      </div>
    </Container>
  )
}
