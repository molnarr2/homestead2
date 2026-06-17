import { Container } from '../components/layout/Layout'
import { SeoHead } from '../components/layout/SeoHead'
import { LinkButton } from '../components/ui/Button'

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <SeoHead
        meta={{ title: 'Page not found', description: 'That page could not be found.', path: '/404', noindex: true }}
      />
      <h1 className="text-4xl">Page not found</h1>
      <p className="mt-3 text-bark-light">The page you’re looking for isn’t here.</p>
      <div className="mt-6 flex justify-center gap-3">
        <LinkButton to="/">Go home</LinkButton>
        <LinkButton to="/tools" variant="ghost">Browse tools</LinkButton>
      </div>
    </Container>
  )
}
