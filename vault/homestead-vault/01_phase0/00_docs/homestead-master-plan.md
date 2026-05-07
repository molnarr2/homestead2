# HomeStead Master Plan

> Combined strategy document merging research, improvement planning, and rewrite analysis into a single actionable reference.

---

## Part 1: Where We Are Today

### What HomeStead Is
A React Native app (RN 0.72.7) with Firebase backend, RevenueCat subscriptions, and a modular service architecture. It tracks homestead animals with profiles, care reminders, event history, and deep customization.

### Current Feature Set
- **Animal management:** Create/edit animals with type, breed, color, gender, birthday, state (own/sold/died/processed), photo, registration, notes
- **Care management:** Recurring and one-time care items per animal, mark complete, auto-create next recurring event, all-care view across account
- **Event history:** Per-animal event timeline, generic events with configurable `extraData` fields, event templates, photos and notes
- **Customization:** Custom animal types, breeds, colors, care templates, event templates -- this is the strongest differentiator
- **Account:** Anonymous account creation, upgrade to full account, delete account, feedback collection
- **Notifications:** Firebase messaging integration, device token registration
- **Subscriptions:** RevenueCat with 3 tiers (50/200/500 animals), free tier allows 25 animals

### Current Revenue Signal
- 3 total subscriptions, 1 still active
- Subscription is tied to animal count only
- Paywall triggers when adding an animal beyond the limit
- Paywall copy says "Need More Animals?" with a single bullet: "Unlock more animals to manage"

### Product Strengths
1. **Customization depth** -- more flexible than any competitor for animal types, breeds, care, and event templates
2. **Flexible event system** -- `EventTemplate` + `AnimalWorkingEvent` + `EventExtraDataObject` can model almost anything
3. **Clean service architecture** -- interface-driven services with dependency injection via Bootstrap
4. **Clear niche focus** -- not trying to be everything for everyone

### Product Weaknesses
1. **Not a daily operating system** -- strongest in profiles and reminders, weak in operational workflows
2. **Missing high-frequency features** -- no health records, breeding, production, tasks, notes, feed, inventory, or financials
3. **Thin subscription UX** -- race condition in subscription state refresh, restore doesn't update state, paywall copy mismatches actual value
4. **No analytics** -- Firebase Analytics is a dependency but no events are instrumented
5. **Minimal test coverage** -- single render test in `__tests__`
6. **Incomplete flows** -- empty `onDeleteCare`, TODO markers in subscription/notification/care areas, dev Firebase URL fallback
7. **Outdated stack** -- RN 0.72.7, TypeScript 4.8.4, moment.js (deprecated)
8. **Generic README** -- still the React Native starter template

---

## Part 2: The User's Pain

Homestead and small-farm animal owners face recurring operational pain that this app should solve:

### Record Keeping Chaos
- Animals tracked across notebooks, spreadsheets, sticky notes, and memory
- Health records (vaccinations, deworming, medications) get lost or forgotten
- No single source of truth for an animal's full history
- Breeding lineage and pedigree data is scattered or nonexistent

### Missed Care and Forgotten Tasks
- Recurring care (deworming cycles, hoof trims, vaccinations) slips through the cracks
- Seasonal tasks (winterizing, breeding prep, shearing) are easy to forget
- Withdrawal periods for meat/milk/eggs after medications are safety-critical and easy to miscalculate

### Handoff and Delegation Difficulty
- Farm sitters have no structured guide when the owner is away
- Family members or staff don't know what needs doing without verbal instructions
- Vet visits require pulling together scattered records on the spot

### Production and Cost Blindness
- Owners don't know which animals are profitable vs. money pits
- Feed costs, vet bills, and supply expenses aren't tracked in one place
- Egg/milk/fiber production isn't logged, so trends are invisible

### Selling and Sharing Animal Records
- Buyers want health history, lineage, and photos when purchasing animals
- Breeders need organized records for registration and sales
- No quick way to generate a professional animal profile to share

---

## Part 3: Competitive Landscape

### Feature Comparison

| Feature | HomeStead | FarmKeep | Herdwatch | Livestoq | Livestockstar |
|---|---|---|---|---|---|
| Animal profiles | Yes | Yes | Yes | Yes | Yes |
| Custom types/breeds | **Yes (strong)** | Partial | No | No | No |
| Care reminders | Yes | Yes | Yes | Yes | Yes |
| Health/vaccine records | No | **Yes** | **Yes** | **Yes** | Yes |
| Breeding/lineage | No | **Yes (1200+ species)** | **Yes** | **Yes** | Yes |
| Production tracking | No | **Yes** | **Yes** | No | No |
| Feed tracking | No | **Yes** | No | No | No |
| Tasks/chores | No | **Yes** | No | No | No |
| Weight tracking | No | **Yes** | **Yes** | **Yes** | No |
| Notes/journal | No | **Yes** | No | No | No |
| Export/share records | No | Partial | **Yes** | No | No |
| Multi-user | No | No | **Yes** | No | No |
| Offline support | No | No | **Yes** | No | No |
| Calendar view | No | **Yes** | No | **Yes** | No |

### Where FarmKeep Is Strongest
- First-class health/vaccine records
- Breeding management with 1200+ species auto-gestation
- Production tracking (eggs, milk, honey, wool, meat)
- Feed tracking with cost estimates
- Calendar view for tasks and breeding events
- Notes linked to animal profiles
- Redesigned home screen (Dec 2025) with quick access to key features

### Where HomeStead Can Win
1. **Customization depth** -- double down on the most flexible animal/breed/care/event template system in the market
2. **Modern, beautiful UI** -- competitors are utilitarian; a Tailwind-powered design is a real differentiator
3. **Offline-first architecture** -- barns have terrible connectivity; flawless offline with cloud sync is a massive advantage
4. **Caretaker handoff mode** -- no competitor does this well; highly shareable and marketable
5. **Sale-ready animal packets** -- directly helps users make money; no competitor offers a polished version
6. **AI-powered recommendations** -- species-specific care suggestions, smart reminders, photo-based condition tracking

### Strategic Position
> HomeStead is the most customizable, beautiful, and modern animal management app for homesteaders and small livestock owners. It works offline, handles health and breeding records, and helps you hand off care and sell animals with confidence.

---

## Part 4: Schema and Architecture Gaps

### Current Schema Models
- `Animal` -- profiles with type, breed, color, gender, birthday, state, photo, registration, notes
- `AnimalType` / `UserAnimalType` -- system and custom animal types with colors
- `BreedType` / `UserBreedType` -- system and custom breeds per animal type
- `EventTemplate` / `UserEventTemplate` -- care and event templates with cycle, contact, extraData
- `AnimalWorkingEvent` -- active care/events per animal with due date, completion, recurrence, extraData
- `EventExtraDataObject` -- flexible key-value data (string, number, string array) attached to events
- `User` -- profile with name, email, animal count, subscription, anonymous flag
- `UserDevice` -- push notification tokens
- `Feedback` -- user feedback with rating

### What's Missing from the Schema

| Missing Model | Why It Matters | Priority |
|---|---|---|
| **Health Record** (vaccination, medication, deworming, vet visit) | Biggest product gap. Safety-critical. Strongest premium signal. | P0 |
| **Breeding Record** (sire/dam, breeding date, gestation, litter/clutch) | Second biggest gap. Breeders will pay for this. | P0 |
| **Production Log** (eggs, milk, fiber, honey per animal/group per day) | Primary ROI signal for homesteaders. | P1 |
| **Weight/Condition Log** (weight, body condition score, date) | Health and production tracking dependency. | P1 |
| **Task/Chore** (standalone, recurring, assignable, completable) | Increases daily use frequency. | P1 |
| **Note/Observation** (quick timestamped entries with tags and photos) | Low friction, high stickiness. | P1 |
| **Group/Pen/Pasture** (location-based animal grouping) | Operational reality for any farm. | P2 |
| **Financial Record** (purchase price, vet bills, feed cost, sale price) | ROI awareness. | P2 |
| **Inventory/Supply** (medicines, feed, bedding, tags) | Reduces costly surprises. | P2 |
| **Multi-User/Household** (roles, sharing, assignments) | Expands TAM, enables higher pricing. | P2 |

### Code and Architecture Issues to Fix in Rewrite
- React Native 0.72.7 -> 0.81+ (New Architecture)
- TypeScript 4.8.4 -> 5.x
- moment.js -> `date-fns` or `dayjs`
- Formik -> `react-hook-form`
- React Native Paper -> NativeWind (Tailwind)
- No analytics -> instrument from day one
- No tests -> test critical flows (subscription, sync, recurrence)
- Firestore-only -> offline-first with local DB + cloud sync
- Race condition in subscription state refresh
- Empty/incomplete controller methods
- Dev Firebase URL fallback image

---

## Part 5: Technology Rewrite Decision

### React Native Paper vs. NativeWind (Tailwind)

#### Pros of NativeWind
1. **Faster UI iteration** -- utility classes, less context-switching, rapid prototyping
2. **AI-gen friendly** -- LLMs generate Tailwind excellently, directly supports AI-gen workflow
3. **Full design control** -- own every pixel, no Material Design constraints
4. **Modern RN** -- v5 requires RN 0.81+, forces New Architecture adoption
5. **Tailwind ecosystem** -- massive community, transfers from web knowledge
6. **Dark mode, responsive, platform-specific** styles built-in
7. **Smaller bundle** -- only ship styles you use

#### Cons of NativeWind
1. **No pre-built components** -- must build or source Button, Input, Modal, Dialog, etc.
2. **Initial velocity hit** -- 2-3 weeks building component primitives before full speed
3. **NativeWind v5 is new** -- fewer community answers, possible edge cases
4. **No Material Design** -- irrelevant for a homestead app
5. **Contributor learning curve** -- Tailwind conventions required

#### Decision: Switch to NativeWind
- Full rewrite absorbs the "no pre-built components" cost
- AI-gen development is dramatically better with Tailwind
- Distinctive look is a competitive advantage
- Pair with a headless library for complex interactions (bottom sheets, dropdowns, date pickers)

### Additional Technology Decisions for Rewrite

| Current | Replace With | Why |
|---|---|---|
| RN 0.72.7 | RN 0.81+ | New Architecture, Fabric, TurboModules |
| React Native Paper | NativeWind v5 | Tailwind, AI-gen friendly, design freedom |
| moment.js | date-fns or dayjs | Smaller, maintained, tree-shakeable |
| Formik | react-hook-form | Better performance, simpler API |
| Firestore-only | Local DB + Firestore sync | Offline-first for barn use |
| @react-navigation/stack v6 | React Navigation v7 or Expo Router | Typed routes, modern API |
| No analytics | Firebase Analytics + custom events | Instrument from day one |
| No tests | Jest + React Native Testing Library | Test critical flows |

---

## Part 6: Monetization Strategy

### Current Model (Weak)
- Free: 25 animals
- Paid tiers: 50 / 200 / 500 animals
- Paywall triggers on animal count limit
- Value proposition: "more of the same"

### New Model (Feature-Gated)

#### Free (Hook)
- Up to 10 animals
- Basic profiles, photos, notes
- Basic care reminders (up to 3 active per animal)
- Species-specific starter playbooks (first setup only)

#### Pro -- $4.99/month or $39.99/year (Core Revenue)

**Killer Feature #1: Health Records + Withdrawal Calculator**
- Full vaccination, medication, deworming, vet visit tracking
- Automatic withdrawal period calculator for meat/milk/eggs
- Medication reminders with dosage history
- Safety-critical, high-anxiety, currently done on paper

**Killer Feature #2: Breeding Manager + Gestation Tracker**
- Breeding events with sire/dam
- Automatic gestation/incubation countdown per species
- Due date notifications
- Litter/clutch recording with birth outcomes
- Pedigree view (2-3 generations)

**Killer Feature #3: Production Dashboard**
- Daily/weekly/monthly egg, milk, fiber, honey logging
- Per-animal and per-flock production trends
- Cost-per-unit calculations
- Visual charts

**Additional Pro:**
- Unlimited animals and care reminders
- Advanced recurring schedules
- Photo attachments on all records
- Export animal records as PDF
- Weight/body condition tracking with charts
- Notes/observation journal with tags

#### Farm -- $9.99/month or $79.99/year (Growth Revenue)

**Killer Feature #4: Caretaker Handoff Mode**
- Simplified daily checklist for farm sitters
- Shareable link (no app install required)
- Emergency contacts and vet info
- Task completion tracking

**Killer Feature #5: Sale-Ready Animal Packet**
- One-tap professional animal profile generation
- Photos, health history, lineage, registration, production data
- Shareable as PDF or web link
- QR code for barn/pen identification

**Additional Farm:**
- Multi-user household access (up to 5 users)
- Task assignment and completion tracking
- Feed tracking with cost estimates
- Inventory/supply tracking with low-stock alerts
- Financial summary per animal
- Data export (CSV/PDF)
- Priority support

### Upgrade Trigger Points
- When user tries to add a health record -> Pro upsell
- When user tries to record a breeding event -> Pro upsell
- When user tries to log production -> Pro upsell
- When user tries to export/share -> Pro upsell
- When user tries to invite a family member -> Farm upsell
- When user tries to create a caretaker handoff -> Farm upsell
- When user tries to generate a sale packet -> Farm upsell

### Conversion Tools
- 7-day free trial for Pro
- Feature comparison table on paywall
- Use-case-based premium examples
- Upgrade prompts tied to real actions, not arbitrary limits

---

## Part 7: Purple Cow Features (Remarkable Differentiators)

Build **one** after core features are solid. Ranked by fit and impact:

### 1. Shareable Animal Timeline
A beautiful, visual timeline per animal with photo history, treatments, care events, milestones. Downloadable for vet, breeder, or buyer. Emotionally compelling and practically useful.

### 2. Species-Specific Starter Playbooks
When a user adds chickens, goats, rabbits, etc., the app offers a ready-made care system with default recurring care, seasonal reminders, health checklists, and starter tasks. Instantly useful, reduces blank-screen problem.

### 3. QR Code Barn Mode
Generate a QR code per animal or pen. Scan to open record, log treatment, add note, mark task complete. Barn-friendly, highly demoable, reduces friction dramatically.

### 4. Caretaker Handoff Mode
(Also a killer premium feature.) Temporary simplified view for farm sitters with daily checklists, emergency info, and completion tracking. Solves a real pain point.

### 5. Sale-Ready Animal Packet
(Also a killer premium feature.) Professional animal profile with photos, health history, lineage, and registration. Helps users make money.

### 6. Seasonal Farm Brain
Dashboard that changes by month/season/species. Recommends likely care due soon, weather-related reminders, seasonal tasks, breeding/prep reminders. Feels proactive, not archival.

---

## Part 8: Execution Plan

### Development Principles
- **Schema first.** Get the data model right before building screens.
- **15 core components, reuse everywhere.** Button, Card, Input, TextArea, Select, Modal, BottomSheet, List, ListItem, Badge, Avatar, Chip, DatePicker, FAB, EmptyState.
- **One feature per sprint (2 weeks).** Don't parallelize. Ship, validate, iterate.
- **AI-gen everything possible.** Tailwind + react-hook-form + typed schemas = LLMs generate 80% of screens.
- **Cut scope ruthlessly.** V1 needs: profiles, health records, breeding, care reminders, paywall. Everything else is V1.1+.

### Sprint Plan

| Sprint | Focus | Deliverable |
|---|---|---|
| 0 | Project setup, schema design, component library | Buildable app with navigation and 15 core components |
| 1 | Animal profiles + dashboard | CRUD animals, photo upload, grouped dashboard, search/filter |
| 2 | Care reminders | Recurring care, templates, notifications, all-care view |
| 3 | Health records | Vaccinations, medications, vet visits, withdrawal calculator |
| 4 | Breeding manager | Breeding events, gestation tracker, due dates, lineage |
| 5 | Production tracking | Daily logging, trends, per-animal stats |
| 6 | Paywall + subscription | Tiered pricing, feature gating, restore, analytics |
| 7 | Polish + launch prep | Onboarding, empty states, error handling, app store assets |

### 90-Day Milestone Map

**Days 1-30: Foundation + Core**
- New project with RN 0.81+, NativeWind, react-hook-form, offline-first DB
- Schema design for all P0 and P1 models
- Component library (15 primitives)
- Animal profiles + dashboard
- Care reminders with templates and notifications
- Analytics instrumentation

**Days 31-60: Premium Features**
- Health records MVP (vaccinations, medications, vet visits, withdrawal calculator)
- Breeding manager MVP (events, gestation tracker, due dates, lineage)
- Production tracking MVP (daily logging, trends)
- Notes/observation journal

**Days 61-90: Monetization + Launch**
- Paywall with tiered pricing and feature gating
- Onboarding with species selection and starter playbooks
- App store assets (screenshots, description, keywords)
- Subscription flow testing and polish
- Soft launch to narrow segment

---

## Part 9: Marketing Without a Marketer

### Step 1: Pick One Narrow Segment First
Choose one:
- Backyard chicken keepers
- Goat owners
- Rabbit breeders
- Small mixed homesteads

Do not market to everyone at once.

### Step 2: Talk to 15 Real Users
- Active subscriber (the 1 you have is a goldmine)
- Free users
- Homesteaders in Facebook groups, Reddit, 4H/FFA communities

Ask: What do you track today? What do you forget? What causes stress? What would make this worth paying for?

### Step 3: Produce Workflow Content
Short demos around real use cases:
- Track goat vaccinations in HomeStead
- Manage chicken care reminders
- Organize rabbit breeder records
- Prep your farm sitter with HomeStead

Post to TikTok, Instagram Reels, YouTube Shorts, Facebook groups, Reddit.

### Step 4: Improve App Store Presence
- Sharper screenshots showing real workflows
- Clear value proposition in subtitle
- Feature-specific screenshots
- Keywords: livestock, homestead, animal care, farm records, breeding tracker
- Social proof from real users

### Step 5: Build a Lightweight Landing Page
- Headline, screenshots, target user description
- Email capture + short survey
- Gives you a list, feedback, and launch audience

### Step 6: Ambassador Program
- Free premium for 6-12 months in exchange for interviews and testimonials
- Early feature access
- Referral rewards later

### Step 7: Partner with Micro-Creators
Small niche creators in homesteading, backyard chickens, goat care, rabbit breeding. A few credible niche voices beat one generic marketer.

### Step 8: Build in Public
Post what you shipped, what users asked for, before/after UX improvements, upcoming roadmap votes.

### Step 9: Market Outcomes, Not Features
Instead of "custom events, care templates, animal records" say:
- Never miss important care again
- Keep every animal's health and history in one place
- Hand off chores with confidence
- Stay organized when the homestead gets busy

---

## Part 10: Analytics Must-Track Events

### Acquisition and Onboarding
- app_install, account_created, anonymous_account_created
- onboarding_started, onboarding_completed, onboarding_species_selected
- first_animal_added, first_care_item_added

### Engagement
- dashboard_viewed, animal_detail_viewed
- care_completed, event_created, task_completed
- health_record_created, breeding_event_created, production_logged
- note_created, weight_logged

### Monetization
- paywall_opened, paywall_source (which action triggered it)
- plan_selected, purchase_started, purchase_completed
- restore_attempted, restore_succeeded
- trial_started, trial_converted
- cancellation_or_churn

### Metrics to Watch
- Day 1, Day 7, Day 30 retention
- % users who add first animal
- % users who add first care item
- % users who complete onboarding
- Paywall conversion rate by trigger source
- Subscriber retention rate
- Feature adoption by module

---

## Part 11: What Not to Build Yet

Stay focused. Defer until after launch and validation:

- Multi-user collaboration (build after Pro revenue validates)
- Feed/inventory tracking (high effort, moderate retention)
- Financial reporting (complex, needs real user data)
- Community template marketplace (needs user base first)
- Voice logging (cool but complex; validate demand)
- Desktop/web companion (mobile-first, validate before expanding)
- AI features beyond basic recommendations (ship basics first)
- Complicated social/community features
- Full marketplace ecosystem
- Broad enterprise features

---

## Part 12: Success Criteria

The rewrite is successful when:

- [ ] Users complete onboarding and reach first value within 2 minutes
- [ ] Users return weekly for multiple workflows, not just reminders
- [ ] Premium includes clear operational value beyond animal limits
- [ ] At least one niche segment responds strongly to positioning
- [ ] Analytics show which features drive retention and upgrades
- [ ] Active subscribers are increasing with lower confusion around what premium means
- [ ] The app feels like the daily operating system for a small homestead
- [ ] Health records and breeding manager are the primary conversion drivers
- [ ] Paywall conversion rate exceeds 5% of users who hit a trigger point
- [ ] Day 7 retention exceeds 40%

---

## Final North Star

Shift the mindset from:

> Monetizing what exists

To:

> Building a version people would feel bad losing

That is the inflection point where recurring revenue gets much easier.
