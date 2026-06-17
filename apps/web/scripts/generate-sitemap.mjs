// Builds sitemap.xml from the actual pre-rendered output in dist/. Decoupled
// from the route source, so every SSG-emitted page (including per-species and
// dynamic variants) is included automatically.
import { readdirSync, statSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve, relative } from 'node:path'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '../dist')
const DOMAIN = 'https://homesteadkeeper.app'

if (!existsSync(DIST)) {
  console.error('dist/ not found — run the SSG build first.')
  process.exit(1)
}

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (name === 'index.html') acc.push(full)
  }
  return acc
}

const urls = walk(DIST)
  .map((file) => {
    const rel = relative(DIST, file).replace(/index\.html$/, '').replace(/\/$/, '')
    return rel === '' ? '/' : `/${rel}`
  })
  .filter((path) => path !== '/404' && !path.startsWith('/404'))
  .sort()

const body = urls
  .map((path) => {
    const loc = path === '/' ? `${DOMAIN}/` : `${DOMAIN}${path}`
    const priority = path === '/' ? '1.0' : path.startsWith('/tools') ? '0.8' : '0.6'
    return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`

writeFileSync(resolve(DIST, 'sitemap.xml'), xml)
console.log(`✓ sitemap.xml written with ${urls.length} URLs`)
