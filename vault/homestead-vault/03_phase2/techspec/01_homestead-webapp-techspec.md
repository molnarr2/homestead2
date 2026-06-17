# Tech Spec — Homestead Marketing Webapp (`apps/web`)

## Summary

Build a new static React/Vite/Tailwind webapp at `apps/web/` that serves two jobs: a **"Start With Why" landing page** that sells the Homestead mobile app and links to the App/Play stores, and a set of **free, no-login homestead tools + printables** (Engineering-as-Marketing per the growth playbook) that rank in search and funnel visitors to the app. The site is statically pre-rendered for SEO and ships zero backend.

## Goals

- Single owned acquisition asset hosting the landing page, free tools, printables, and (later) articles, all under one domain to compound SEO authority.
- Every tool is a standalone, instant-value page with one soft App-Store CTA — no signup wall.
- Real HTML per route (pre-rendered) so Google/Bing index content, not an empty SPA shell.
- Instrument every CTA and store-referral click for channel attribution (North Star = subs/week; leading indicator = tool→store CTR).

## Non-Goals

- No user accounts, no Firestore reads/writes, no auth on the web side. The tools are pure client-side computation.
- No syncing tool input back into the mobile app. The CTA is the only bridge.
- No blog CMS in v1 — articles are MDX/markdown files committed to the repo (Channel 2 content can start as flat files).
- No paid-ads landing pages, no A/B testing infra in v1 (store-side A/B lives in App Store / Play Console per the ASO playbook).

## Current State

- Monorepo is a Yarn workspace: root `package.json` declares `workspaces: ["apps/*", "packages/*"]`. Today `apps/` contains only `mobile` (React Native 0.84, `displayName: "Homestead"`). `packages/` contains `common` and `functions`.
- **No web app exists.** `apps/web/` is greenfield.
- The mobile app (per app-store screenshots in `resources/screenshots/appstorev2/`) already does: dashboard with overdue care + upcoming births + active withdrawals; animal profiles with groups/breeds/photos; care scheduling; production logging (eggs/milk/fiber/honey/meat); health records (vaccination/medication/deworming/vet/illness/injury) with withdrawal periods and auto-created "next due" care; breeding with due-date tracking. Each free tool below is a thin, public mirror of one of these features — that mirror **is** the pitch.
- The product name is still officially TBD (ASO playbook TODO: "Pick the niche-native app name"). This spec uses **"Homestead"** as a placeholder; the name lives in one config constant (`SITE.appName`) so a rename is a one-line change.

## Desired Architecture

A new workspace package `apps/web`:

- **Stack:** Vite + React 19 + TypeScript (strict) + Tailwind CSS v3 (standard Tailwind, NOT Uniwind — Uniwind is RN-only; the CLAUDE.md Uniwind rule applies to `apps/mobile/src/` only).
- **Routing:** `react-router` (data router). File-per-route under `apps/web/src/routes/`.
- **Static pre-rendering for SEO (the critical decision):** use **`vite-react-ssg`**. It wraps React Router, crawls all routes at build time, and emits a real `index.html` per route with fully rendered markup + per-page `<head>`. This keeps the user's required Vite/React stack while giving every tool/article page server-quality HTML for crawlers. Chosen over a plain Vite SPA (empty shell, bad for SEO) and over migrating to Astro/Next (the user specified Vite). All routes are known at build time (no user-generated URLs), so full SSG is viable — no SSR server needed.
- **Hosting:** static output (`dist/`) on **Vercel** (free tier, playbook-sanctioned). `vercel.json` for redirects, caching headers, and trailing-slash normalization. Cloudflare/Netlify are drop-in alternatives; nothing in the design is host-specific beyond that one config file.
- **Styling:** Tailwind with a small design-token layer (`tailwind.config.ts`) mirroring the app's warm earthy palette (cream background, terracotta `#B5562B`-ish accent, dark-brown headings) so the site visually matches the store screenshots.
- **No state library.** Tools hold local component state with `useState`/`useReducer`. The Zustand rule (CLAUDE.md #5) is a mobile-app rule and does not bind here; there is no shared client state to manage.

### Directory layout

```
apps/web/
  index.html
  vite.config.ts
  tailwind.config.ts
  vercel.json
  public/
    robots.txt
    favicon / og images
    printables/*.pdf        (generated, committed)
  src/
    main.tsx                (vite-react-ssg entry; exports routes)
    routes/
      Home.tsx              (Start-With-Why landing)
      tools/
        ToolsIndex.tsx
        WithdrawalCalculator.tsx
        GestationCalculator.tsx
        ScheduleGenerator.tsx
        EggFeedCostCalculator.tsx
      printables/
        PrintablesIndex.tsx
      articles/
        ArticlesIndex.tsx
        [slug].tsx          (renders MDX)
      legal/ (privacy, terms, disclaimer)
    components/
      layout/ (Header, Footer, Nav, SeoHead, AppCta, Breadcrumbs)
      ui/ (Button, Card, NumberField, AnimalPicker, ResultPanel, Share/PrintButton)
    content/
      animals.ts            (gestation/withdrawal/schedule reference data)
      articles/*.mdx
    lib/
      seo.ts                (per-page meta + JSON-LD builders)
      analytics.ts          (event wrapper)
      storeLinks.ts         (App Store / Play deep links + UTM)
      gestation.ts, withdrawal.ts, schedule.ts, eggCost.ts  (pure calc fns)
    config/site.ts          (SITE constant: appName, domain, storeUrls, social)
```

### Shared reference data — `packages/common`

The mobile app already encodes domain constants (gestation lengths, common withdrawal periods, species lists). To avoid two drifting copies, the canonical reference tables (gestation days per species, common medication withdrawal periods, default care intervals) should live in **`packages/common/src/`** and be imported by both `apps/mobile` and `apps/web`. If the mobile values currently live inside mobile schema/util files, lift the plain-data tables up to `packages/common` and have mobile re-import them — a pure refactor, no behavior change. This makes "the tool matches the app exactly" true by construction.

## Page & Route Inventory

| Route | Purpose | Primary keyword target |
|---|---|---|
| `/` | Start-With-Why landing; sells app, store CTAs | brand + "homestead animal app / livestock tracker" |
| `/tools` | Index of all free tools | "free homestead tools / livestock calculators" |
| `/tools/medication-withdrawal-calculator` | Milk/meat/egg withdrawal date calc | "medication withdrawal calculator milk meat" |
| `/tools/gestation-calculator` | Goat/sheep/cow/pig/rabbit due-date calc | "goat gestation calculator", per-species variants |
| `/tools/deworming-vaccination-schedule` | Generates a printable care schedule | "deworming schedule goats", "chicken vaccination schedule" |
| `/tools/chicken-egg-feed-cost-calculator` | Eggs vs feed cost / cost-per-egg | "chicken feed cost calculator", "cost per egg" |
| `/printables` | Free printable PDF log templates | "free livestock record template printable" |
| `/articles` + `/articles/{slug}` | SEO long-tail content (Channel 2) | per-article long-tail queries |
| `/privacy`, `/terms`, `/disclaimer` | Legal + the veterinary disclaimer | — |

Global nav surfaces: **Home · Tools · Printables · Articles · Get the App**. Footer repeats nav + per-tool links + social + legal (internal linking compounds SEO authority).

## The Landing Page — "Start With Why" (Simon Sinek Golden Circle)

Structure the home page as the Golden Circle, in order, so the *why* leads and the app (the *what*) is the proof:

1. **WHY (hero).** Belief-led headline, not a feature list. e.g. *"Every animal you keep deserves to not be forgotten."* / *"We believe a homestead runs on memory — and memory shouldn't live on a whiteboard in the barn."* Sub-line + dual store badges (App Store / Google Play) + a phone mockup (reuse `appstorev2/home.png`). One sentence of social proof when available.
2. **HOW.** The differentiated approach: built *for homesteads* (not a generic pet/farm CRM), works offline in the barn, tracks the four things that actually bite you — withdrawals, births, overdue care, production. Three-to-four "how" cards, each pairing a belief with a screenshot (`care.png`, `health.png`, `production.png`, `animal_detail.png`).
3. **WHAT.** Concrete feature grid mirroring the app tabs (Animals / Care / Production / Health / Breeding). Each feature tile links to the matching **free tool** ("Try the free withdrawal calculator →") so the landing page itself feeds the tools, and the tools feed installs.
4. **Free tools & printables band.** "Use these free, no signup" — cards to all four tools + printables.
5. **Closing CTA + soft email capture.** Repeat store badges; one-field email capture ("Get the free printable pack") for visitors not ready to install.

Every store badge/link routes through `storeLinks.ts` so it carries UTM params (`utm_source=web&utm_medium=<section>&utm_campaign=landing`) for attribution.

## The Free Tools (each is its own screen)

Shared tool-page anatomy (consistency = trust + reusable components): H1 with the exact keyword → 1-line value prop → the calculator (mobile-first, large tap targets — audience is on a phone in a barn) → result panel → **soft CTA** ("Homestead remembers this for you — free on the App Store →") → "Was this helpful?" + one-field email capture → a short SEO body section (how it's calculated, FAQ) → internal links to related tools/articles. A **non-dismissable veterinary disclaimer** appears on every tool that touches animal health (`disclaimer` partial): *"For planning only — not veterinary advice. Confirm withdrawal/dosing with your vet and the product label."*

### 1. Medication / Milk / Egg Withdrawal Calculator — `withdrawal.ts`

- **Inputs:** species (goat/sheep/cow/pig/chicken/rabbit), product (dropdown of common meds with preset withdrawal days for milk and for meat/eggs, sourced from `packages/common`, **plus** a "custom / other" option with manual day entry), treatment date (+ time), number of doses / last-dose date.
- **Output:** safe date(s) — "Milk safe after `<date>`", "Meat/eggs safe after `<date>`" — computed as `lastDoseDate + withdrawalDays`, using `date-fns` (already a monorepo dep). Show a clear red→green visual and a copyable summary.
- **Critical correctness:** withdrawal data must be conservative and clearly labeled "verify against the label"; mislabeling is the scary failure mode the playbook calls out. Preset table is a convenience, not authority — the disclaimer + "confirm with label" must be prominent.
- **App tie-in copy:** "The app tracks every active withdrawal and warns you before you sell or drink it."

### 2. Gestation / Due-Date Calculator — `gestation.ts`

- **Inputs:** species (goat ~150d, sheep ~147d, cow ~283d, pig ~114d, rabbit ~31d, alpaca/llama, etc. — table in `packages/common`), breeding/cover date.
- **Output:** estimated due date = `breedingDate + gestationDays`, plus a "watch window" (±range), a countdown ("21 days to go"), and a small "prep checklist by week before" section (good for dwell time + keywords).
- **SEO note:** ship per-species H1 variants. Because "goat gestation calculator" and "sheep gestation calculator" are distinct high-volume queries, render **one page per species** at `/tools/gestation-calculator/{species}` (pre-rendered from the species table) plus the species-picker index at `/tools/gestation-calculator`. This multiplies indexed long-tail pages at near-zero authoring cost — the programmatic-SEO lever from the bootstrap doc.
- **App tie-in:** "Get a reminder when she's actually due → the app does this automatically."

### 3. Deworming / Vaccination Schedule Generator — `schedule.ts`

- **Inputs:** species, start date, optional birth date (for age-based vaccines), region/season toggle.
- **Output:** a dated schedule of recurring care events (deworming intervals, core vaccines by week/age) rendered as a printable table + an **"Add to calendar" (.ics download)** and a **"Download PDF"** button.
- **App tie-in:** "Stop reprinting this every season — the app turns this into recurring reminders that never expire."
- Generated schedules reuse the same default-interval data the mobile care feature uses (`packages/common`).

### 4. Chicken Egg / Feed Cost Calculator — `eggCost.ts`

- **Inputs:** number of hens, feed price per bag + bag weight, daily feed per hen, avg eggs/hen/week, optional other costs.
- **Output:** cost per dozen eggs, monthly feed cost, break-even egg price, "are your eggs cheaper than the store?" verdict. Pure arithmetic, instant.
- **App tie-in:** entry point to production tracking — "Log real egg counts and feed buys → see your true cost over time."

## Printables (free PDF log templates)

Static, print-optimized PDFs offered on `/printables`, each a lead magnet (one-field email capture to download, or direct download + soft capture). Generate them deterministically at build time and **commit the output** to `public/printables/` so they're CDN-served and crawlable:

- Flock / herd inventory log
- Breeding & kidding/lambing/farrowing log (pairs with the gestation tool)
- Health & medication record (pairs with the withdrawal tool; includes withdrawal columns)
- Production log (eggs/milk/honey)
- Deworming & vaccination schedule (blank + the generated version from Tool 3)
- Feed & cost log (pairs with Tool 4)

Generation: a small build script renders an HTML/CSS print template → PDF (e.g. Playwright/`@react-pdf` at build, run via an `apps/web` npm script). Each printable page has its own indexable HTML landing section describing it (keywords + preview image) above the download.

## SEO (dedicated — this is the site's whole point)

SEO is a first-class feature here, not a finishing touch. Requirements:

### Rendering & indexability
- **Static pre-render every route** via `vite-react-ssg` → real HTML + content in the initial response. This is the single biggest SEO lever; a plain Vite SPA would ship an empty `<div id="root">` and tank indexing.
- Per-species and per-printable pages are pre-rendered from data tables (programmatic SEO).

### On-page metadata (`lib/seo.ts`, applied per route)
- Unique `<title>` and `<meta name="description">` per page, keyword-led, ≤60/≤155 chars.
- Canonical URL per page; self-referencing canonicals on species variants to avoid dup-content flags.
- Open Graph + Twitter card tags with a per-page OG image (tool pages get a branded "free calculator" OG card for social shares in FB groups — Channel 3).
- One `<h1>` per page containing the exact target query.

### Structured data (JSON-LD)
- `SoftwareApplication` on `/` (the mobile app: name, OS, price/free tier, ratings when available, store URLs).
- `WebApplication` / `HowTo` / `FAQPage` on tool pages (FAQ schema can win rich snippets for "how is goat gestation calculated").
- `BreadcrumbList` on nested pages. `Article` on `/articles/*`.

### Crawl infrastructure
- `sitemap.xml` generated at build from the route manifest (include all species/printable variants).
- `robots.txt` allowing all, pointing to the sitemap.
- Clean, keyword-bearing slugs (already specified above). Trailing-slash policy normalized in `vercel.json` to avoid dup URLs.
- Internal linking: tools ↔ related tools ↔ related articles ↔ printables ↔ app CTA. Footer links every tool. This is the cheapest ranking lever and must be wired deliberately, not ad hoc.

### Performance (Core Web Vitals = ranking factor)
- Mobile-first, Tailwind only (no heavy UI kit), code-split per route (Vite default), lazy-load below-fold images, served from CDN with long cache headers on hashed assets.
- Target Lighthouse SEO 100 and green CWV (LCP < 2.5s) — the calculators are tiny so this is achievable and should be a CI check.
- Self-host fonts (no render-blocking third-party font CSS).

### Off-page hooks
- Verify the domain in **Google Search Console** + **Bing Webmaster** day one (playbook: "Search Console install day 1"). This is the only way to measure the Channel-2 success metric (first organic impressions by week 6).
- Submit sitemap to both.

## Analytics & Attribution

- **GA4 via Firebase** (the org already uses Firebase Analytics in mobile — reuse the project, add a Web app). Single `analytics.ts` wrapper; gate behind a lightweight consent banner for GDPR/CCPA.
- **Events to track** (these are the playbook's leading indicators): `tool_view`, `tool_calculate`, `cta_store_click` (with `tool` + `section` params), `printable_download`, `email_capture`, `outbound_app_store`.
- **Store-link attribution:** every store URL carries UTM params via `storeLinks.ts`; iOS uses an App Store campaign token, Android uses Play `referrer`. This is what lets the week-6 decision log attribute installs to Tools vs Content vs Community.
- **Email capture:** one field, POSTs to a no-backend provider (e.g. ConvertKit/Buttondown/Formspark form endpoint) — keeps "no backend" true. Email is a capture mechanism only (playbook: not an acquisition channel yet).

## Touch Points (files to create)

Workspace scaffolding:
- `apps/web/package.json` — new workspace member; deps: `react`, `react-dom`, `react-router`, `vite`, `vite-react-ssg`, `tailwindcss`, `@mdx-js/rollup`, `date-fns`, analytics SDK. Scripts: `dev`, `build` (ssg), `preview`, `generate:printables`, `generate:sitemap`.
- `apps/web/vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `vercel.json`, `index.html`.
- Root: confirm `apps/*` workspace glob already includes it (it does) — no root change beyond a possible top-level `web` script alias.

App shell & layout:
- `src/main.tsx`, `src/config/site.ts`, `src/components/layout/*` (Header, Footer, SeoHead, AppCta, Breadcrumbs, EmailCapture, Disclaimer).

Routes: the eight+ route files listed in the layout, plus pre-rendered species/printable variants.

Logic (pure, unit-testable, no UI): `src/lib/{gestation,withdrawal,schedule,eggCost,seo,analytics,storeLinks}.ts`.

Shared data: lift gestation/withdrawal/interval tables into `packages/common/src/` and import from both apps (pure refactor on the mobile side).

Build tooling: `scripts/generate-printables.*`, sitemap generator (or `vite-plugin-sitemap`).

Content: `src/content/articles/*.mdx` (seed with the 4–5 starter articles from the playbook), `public/robots.txt`, OG images, store badges.

## Data / Content Sourcing

- **No database, no migration.** All tool inputs are ephemeral client state; nothing persists server-side. The only persisted data is committed reference tables and PDFs.
- **Reference accuracy is a real risk, not a DB risk.** Gestation lengths are well-established; **medication withdrawal periods are not universal** and are the legally sensitive item. Source presets conservatively, cite that they're indicative, and force the "verify with label + vet" disclaimer. Treat the withdrawal table as the highest-review-scrutiny content in the repo.
- Articles start as committed MDX (no CMS); a CMS is a later optimization only if authoring volume demands it.

## Risks

- **SEO renders nothing if SSG is skipped.** If anyone "simplifies" to a plain Vite SPA, every tool page becomes an empty shell to crawlers and the entire growth thesis fails silently (traffic just never comes). The `vite-react-ssg` pre-render must be verified in CI by asserting rendered text exists in built `dist/**/index.html`.
- **Withdrawal-calculator correctness / liability.** A wrong "milk safe" date is the worst failure in the product. Mitigate with conservative presets, mandatory disclaimer, "confirm with label," and no claim of veterinary authority. Legal `/disclaimer` page linked from every health tool.
- **Reference-data drift** between app and web if tables are copied instead of shared. Mitigate by making `packages/common` the single source (refactor mobile to consume it).
- **Attribution blind spot.** If store links ship without UTM/campaign tokens, the week-6 channel decision (the whole point of the 6-week test) can't be made. UTM wiring is not optional polish — it's the success metric's plumbing.
- **Name churn.** Product name is TBD; building copy/OG/badges around a hardcoded name means rework on rename. Mitigate via the single `SITE.appName` constant and templated OG images.
- **Scope creep into a "real web app."** Email/consent/CMS can balloon. Keep v1 strictly static + one form endpoint; resist adding a backend.

## Phasing (maps to the growth playbook's 6-week test)

1. **Foundations:** scaffold `apps/web`, layout shell, SSG pipeline, deploy to Vercel, Search Console + GA4 wired, the Start-With-Why landing live with store CTAs. (Playbook Weeks 1–2 / Sprint 1.)
2. **Spike tools:** ship Tool 1 (withdrawal) + Tool 2 (gestation, incl. per-species pages) with full SEO + analytics. (Playbook Weeks 1–2 / Sprint 2.)
3. **Lead magnets:** `/printables` + the 6 PDFs with email capture; Tools 3 & 4. (Sprint 3.)
4. **Content:** `/articles` with the 4–5 starter posts, internally linked to tools. (Weeks 3–6 / Channel 2.)

> Tool 1 (withdrawal) and Tool 2 (gestation) are the two spikes the playbook says to ship first — they unblock the 6-week test. Everything else can follow without blocking measurement.
