import { Head } from 'vite-react-ssg'
import { SITE } from '../../config/site'
import { canonical, pageTitle, defaultOgImage, type SeoMeta } from '../../lib/seo'

// Renders per-route <head> during SSG (real tags in the built HTML) and on the
// client. Pass any JSON-LD objects to embed as <script type="application/ld+json">.
export function SeoHead({ meta, jsonLd = [] }: { meta: SeoMeta; jsonLd?: Record<string, unknown>[] }) {
  const url = canonical(meta.path)
  const title = pageTitle(meta.title)
  const og = meta.ogImage ?? defaultOgImage()
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />
      {meta.noindex && <meta name="robots" content="noindex" />}
      <meta property="og:type" content={meta.type ?? 'website'} />
      <meta property="og:site_name" content={SITE.appName} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={og} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={og} />
      {jsonLd.map((obj, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(obj)}
        </script>
      ))}
    </Head>
  )
}
