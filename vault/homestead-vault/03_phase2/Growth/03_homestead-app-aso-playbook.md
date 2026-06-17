# Homestead Animals App — ASO Playbook

*Sprint 1 deliverable. The one channel where buyers find you with intent.*

-----

## Mental model

- **Discovery** (do you show up?) → indexed keyword fields.
- **Conversion** (do they install?) → icon, screenshots, first two copy lines.

For a tiny app, **conversion wins.** You'll rank for long-tail terms easily (no competition for "goat breeding tracker"); the fight is converting the few who find you. **Weight: 30% keywords, 70% creative.**

-----

## iOS ≠ Android — index them differently

| | App Store (iOS) | Play Store (Android) |
|---|---|---|
| Indexed | Title (30), Subtitle (30), **Keyword field (100)** | Title (30), Short desc (80), **Full description (4000)** |
| Description indexed? | No | **Yes — keyword-rich it naturally** |
| Hidden keyword field? | Yes | No |

Don't copy one listing to both.

-----

## Keyword research (do it quantitatively)

1. Pull volume/difficulty from **AppFigures / AstroASO / Sensor Tower** (free tiers fine).
2. Mine **autocomplete** in both stores: type `homestead, chicken, goat, flock, livestock` and log every suggestion.
3. Score each term: **volume × (1/difficulty) × relevance.** Target medium-volume / low-difficulty. Win "flock log," not "farm."

Likely cluster: `homestead, livestock, flock, chicken, hen, coop, goat, sheep, cattle, breeding, egg log, herd, vaccination, lineage, farm animals`.

-----

## Listing copy (example — assumes name "FlockKeeper")

- **Title (30):** `FlockKeeper: Homestead Animals`
- **Subtitle (30):** `Livestock & breeding records`
- **iOS keyword field (100, no spaces, singular, no repeats from title/subtitle):**
  `goat,chicken,hen,coop,sheep,cattle,herd,egg,vaccine,lineage,farm,tracker,log,homesteading,pet,vet`

Rules: no word repeats across fields; no competitor names or "best/app/free" (Apple strips them); Apple auto-pluralizes.

-----

## Screenshots — your real conversion engine

Decided on the **first 2 screenshots** (visible without scrolling).

1. **Caption with a benefit, not a feature** — "Never lose a breeding date" > "Calendar view."
2. **First shot = strongest hook** — the herd dashboard or breeding-due alert (the thing that drives day-30 retention).
3. Device frame + **big readable caption**; people view at thumbnail size.
4. Show **real homestead data**, not "Animal 1."
5. **A/B test continuously** — Play Console experiments + iOS Product Page Optimization (3 variants). Free, data-driven — your strength.

-----

## Rest of the checklist

- **Icon:** one recognizable animal silhouette, high contrast, legible at 1×. A/B test variants.
- **Ratings:** prompt via `SKStoreReviewController` / Play In-App Review **after a positive moment** (10th animal logged, streak hit) — never on launch.
- **iOS Promotional Text (170):** updatable without review — seasonal hooks.
- **In-App Events (iOS) / Promotional Content (Android):** indexed + surfaced. Recurring "Spring breeding season" event = free real estate.
- **Localization hack:** add en-AU / en-GB / en-CA — extra iOS keyword fields, even for English-only.

-----

## Plugs into the sprint plan

- **Sprint 0 feeds the copy.** The exact words users say on validation calls become your captions and subtitle. Write the listing *after* the calls.
- **Sprint 2's free tool feeds keywords.** The phrases people Google for the calculator map straight into the Android description and iOS keyword field.

-----

## Start this week

1. Autocomplete + tool keyword sheet (2 hrs).
2. Draft title / subtitle / keyword field.
3. Make 5 captioned screenshots, strongest hook first.
4. Ship, then **turn on store A/B experiments and never turn them off.**

> **Caution (per the bootstrap doc):** ASO compounds slowly and conversion data needs traffic. Don't over-tune the listing before Sprint 0 confirms retention and the free-tool/Pinterest channels send real visitors to test against.

-----

## Appendix — iOS localization keyword hack (deep dive)

**The trick:** each iOS *localization* gets its own indexed keyword field. The App Store treats en-US, en-AU, en-GB, en-CA as **separate localizations** of the same English listing — so one 100-char field becomes **four (~400 chars)** with zero translation.

**Why it works:** Apple indexes keywords from multiple same-language locales for a searcher, not just their country. A U.S. user can match terms placed in your en-GB or en-AU field. Locales stack. Put highest-volume terms in en-US, then use the others for *different*, non-overlapping terms — including regional vocabulary you'd never otherwise rank for.

| Locale | Keyword field (example, non-overlapping) |
|---|---|
| en-US | `goat,chicken,hen,coop,sheep,cattle,herd,egg,vaccine,lineage,farm,tracker,log,homesteading,pet,vet` |
| en-GB | `smallholding,poultry,livestock,breeding,dairy,fleece,pasture,paddock,manure,incubation,brooder` |
| en-AU | `hobby farm,acreage,chook,paddock,shearing,drench,lambing,kidding,fodder,water trough` |
| en-CA | `barn,winter care,frostbite,heritage breed,rabbitry,quail,duck,turkey,guinea,record keeping` |

**Catches:**
- Region-only **metadata** locales, not app translations — "Add Language" on the listing in App Store Connect. Reuse the same screenshots/description; only the keyword field needs to differ.
- Stay **same-language** — Spanish keywords won't help an English searcher.
- Low effort, set-and-forget: ~30 min in Sprint 1, indexes forever. ~4× keyword surface for zero translation work.

-----

## TODO

- [ ] Pick the niche-native app name (blocks title/subtitle/keyword copy).
- [ ] Run keyword sheet: autocomplete mining + tool volume/difficulty (2 hrs).
- [ ] Draft iOS title (30) / subtitle (30) / keyword field (100).
- [ ] Draft Android title (30) / short desc (80) / keyword-rich full description (4000).
- [ ] Design app icon + 2–3 A/B variants.
- [ ] Make 5 captioned screenshots, strongest hook first; benefit-led captions.
- [ ] Add en-AU / en-GB / en-CA metadata locales with non-overlapping keyword fields.
- [ ] Wire post-positive-moment review prompt (`SKStoreReviewController` / Play In-App Review).
- [ ] Set iOS Promotional Text + a recurring In-App Event (seasonal hook).
- [ ] Ship listing, then turn on Play + iOS A/B experiments and leave them on.
- [ ] Harvest user language from Sprint 0 calls → fold into captions/subtitle.
