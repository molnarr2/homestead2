import { Link } from 'react-router-dom'
import { Container } from '../../components/layout/Layout'
import { SeoHead } from '../../components/layout/SeoHead'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'
import { Card } from '../../components/ui/Card'
import { ARTICLES } from '../../content/articles'
import { breadcrumbLd } from '../../lib/seo'

export default function ArticlesIndex() {
  return (
    <Container className="py-8">
      <SeoHead
        meta={{
          title: 'Homestead & Livestock Guides',
          description:
            'Practical guides for homesteaders: goat gestation, medication withdrawal, egg costs, deworming, and more — written to pair with our free tools.',
          path: '/articles',
        }}
        jsonLd={[breadcrumbLd([{ name: 'Home', path: '/' }, { name: 'Articles', path: '/articles' }])]}
      />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Articles', path: '/articles' }]} />
      <h1 className="mt-4 text-3xl sm:text-4xl">Homestead &amp; livestock guides</h1>
      <p className="mt-2 max-w-2xl text-lg text-bark-light">
        Short, practical reads that pair with our free tools.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {ARTICLES.map((a) => (
          <Card key={a.slug}>
            <p className="text-xs uppercase tracking-wide text-bark-light">{a.readMinutes} min read</p>
            <h2 className="mt-1 text-xl">
              <Link to={`/articles/${a.slug}`} className="hover:text-terracotta">
                {a.title}
              </Link>
            </h2>
            <p className="mt-2 text-bark-light">{a.description}</p>
            <Link to={`/articles/${a.slug}`} className="mt-3 inline-block font-semibold text-terracotta hover:underline">
              Read →
            </Link>
          </Card>
        ))}
      </div>
    </Container>
  )
}
