import type { ReactNode } from 'react'
import { Container } from '../../components/layout/Layout'
import { SeoHead } from '../../components/layout/SeoHead'
import { Breadcrumbs } from '../../components/layout/Breadcrumbs'

export function LegalPage({
  title,
  path,
  description,
  children,
}: {
  title: string
  path: string
  description: string
  children: ReactNode
}) {
  return (
    <Container className="py-8">
      <SeoHead meta={{ title, description, path }} />
      <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: title, path }]} />
      <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>
      <div className="prose-article mt-6">{children}</div>
    </Container>
  )
}
