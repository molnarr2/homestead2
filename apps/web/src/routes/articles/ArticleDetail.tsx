import { useParams } from 'react-router-dom'
import { Container } from '../../components/layout/Layout'
import { SeoHead } from '../../components/layout/SeoHead'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'
import { AppCta } from '../../components/layout/AppCta'
import NotFound from '../NotFound'
import { getArticleBySlug } from '../../content/articles'
import { articleLd, breadcrumbLd } from '../../lib/seo'

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>()
  const article = slug ? getArticleBySlug(slug) : undefined
  if (!article) return <NotFound />

  const path = `/articles/${article.slug}`
  const Body = article.Component

  return (
    <Container className="py-8">
      <SeoHead
        meta={{ title: article.title, description: article.description, path, type: 'article' }}
        jsonLd={[
          articleLd(article.title, article.description, path, article.datePublished),
          breadcrumbLd([
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/articles' },
            { name: article.title, path },
          ]),
        ]}
      />
      <Breadcrumbs
        items={[
          { name: 'Home', path: '/' },
          { name: 'Articles', path: '/articles' },
          { name: article.title, path },
        ]}
      />
      <article className="mt-4">
        <h1 className="text-3xl sm:text-4xl">{article.title}</h1>
        <p className="mt-2 text-sm text-bark-light">{article.readMinutes} min read</p>
        <div className="prose-article mt-6">
          <Body />
        </div>
      </article>

      <div className="mt-12">
        <AppCta section="article" />
      </div>
    </Container>
  )
}
