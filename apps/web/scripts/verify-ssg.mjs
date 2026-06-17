// CI guard: asserts that the SSG actually rendered real content into the HTML.
// If anyone "simplifies" to a plain SPA, these files would only contain an empty
// <div id="root"></div> and this check fails — protecting the whole SEO thesis.
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = resolve(__dirname, '../dist')

const CHECKS = [
  { file: 'index.html', mustInclude: ['deserves to not be forgotten', '<title>'] },
  { file: 'tools/index.html', mustInclude: ['livestock calculators'] },
  { file: 'tools/medication-withdrawal-calculator/index.html', mustInclude: ['Withdrawal', 'Safe dates'] },
  { file: 'tools/gestation-calculator/index.html', mustInclude: ['gestation'] },
  { file: 'tools/gestation-calculator/goat/index.html', mustInclude: ['Goat', '150 days'] },
  { file: 'tools/deworming-vaccination-schedule/index.html', mustInclude: ['Schedule'] },
  { file: 'tools/chicken-egg-feed-cost-calculator/index.html', mustInclude: ['cost per dozen', 'Cost per dozen'] },
  { file: 'printables/index.html', mustInclude: ['printable'] },
  { file: 'articles/index.html', mustInclude: ['guides'] },
  { file: 'articles/goat-gestation-explained/index.html', mustInclude: ['gestation'] },
  { file: 'disclaimer/index.html', mustInclude: ['not veterinary advice'] },
]

let failed = 0
for (const check of CHECKS) {
  const full = resolve(DIST, check.file)
  if (!existsSync(full)) {
    console.error(`✗ MISSING: ${check.file}`)
    failed++
    continue
  }
  const html = readFileSync(full, 'utf8')
  // Reject an empty SPA shell.
  if (/<div id="root">\s*<\/div>/.test(html)) {
    console.error(`✗ EMPTY SHELL: ${check.file} (no pre-rendered content)`)
    failed++
    continue
  }
  const missing = check.mustInclude.filter((needle) => !html.includes(needle))
  // For OR-style needles where any variant is acceptable, only fail if ALL are missing.
  if (missing.length === check.mustInclude.length) {
    console.error(`✗ CONTENT: ${check.file} missing all of: ${check.mustInclude.join(' | ')}`)
    failed++
  } else {
    console.log(`✓ ${check.file}`)
  }
}

if (failed > 0) {
  console.error(`\nSSG verification FAILED: ${failed} problem(s).`)
  process.exit(1)
}
console.log(`\n✓ SSG verification passed (${CHECKS.length} routes rendered real HTML).`)
