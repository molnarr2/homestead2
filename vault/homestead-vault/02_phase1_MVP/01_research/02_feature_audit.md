# Feature Audit: Core Features, Killer Features, and Current App Status

> Comparison of what the master plan requires vs what the codebase has today. Updated based on decisions made during research: simplified to Free + Pro tiers, no task/chore system, multi-user caretaker role replaces the original Caretaker Handoff Mode.

---

## Tier Structure (Revised)

Based on research conversations, the original 3-tier model (Free / Pro / Farm) is simplified to 2 tiers for MVP. A third tier can be introduced later once the user base and feature set justify it.

- **Free** -- limited animals, basic profiles, basic care
- **Pro** -- all features including health, breeding, production, multi-user

---

## Core Features (Free Tier)

These are the foundation. Users get them for free to reach first value quickly.

| # | Feature | Status | Schema | Service | Screen(s) | Notes |
|---|---------|--------|--------|---------|-----------|-------|
| 1 | Animal profiles (CRUD, photo, type, breed, gender, birthday, state) | BUILT | Animal.ts | AnimalService (full CRUD + photo upload) | AnimalListScreen, AnimalDetailScreen, CreateAnimalScreen, EditAnimalScreen | Fully functional with sire/dam, purchase price, weight |
| 2 | Animal list grouped by type with search/filter | BUILT | -- | -- | AnimalListScreen, AnimalListByType | Grouped display, search exists in AnimalListController |
| 3 | Care reminders (recurring + single, mark complete, auto-create next) | BUILT | CareEvent.ts | CareService (full CRUD + complete) | CareListScreen, CareEventDetailScreen, CreateCareEventScreen | Per-animal, with contact info, templates, recurrence |
| 4 | All-care view across account | BUILT | -- | -- | CareListScreen with CareFilterBar, CareEventsByStatus | Filterable by status |
| 5 | Dashboard (overdue care, due today, withdrawal alerts, breeding countdowns) | BUILT | -- | -- | HomeScreen + 4 section components | Real-time computed from stores |
| 6 | Custom animal types, breeds, care templates | BUILT | AnimalType.ts, Breed.ts, CareTemplate.ts | AnimalTypeService (full CRUD for types, breeds, templates) | CustomizationHomeScreen, AnimalTypeDetailScreen, Edit screens | Strongest differentiator from competitors |
| 7 | Species-specific starter playbooks | BUILT | StarterPlaybooks.ts | AnimalTypeService.seedStarterPlaybooks() | SpeciesSelectionScreen | Seeds default types/breeds/care templates during onboarding |
| 8 | Auth (login, register, anonymous) | BUILT | User.ts | AuthService | LoginScreen, RegisterScreen | Firebase auth |
| 9 | Onboarding with species selection | BUILT | -- | AnimalTypeService | SpeciesSelectionScreen | Seeds playbooks based on selection |
| 10 | Profile management | BUILT | -- | ProfileService, UserService | ProfileScreen, EditProfileScreen, SettingsScreen | Name, email, photo |
| 11 | Feedback collection | BUILT | Feedback.ts | ProfileService | SendFeedbackScreen | |
| 12 | Homestead entity (multi-tenant foundation) | BUILT | Homestead.ts, HomesteadMember.ts | HomesteadService (create, members, roles) | No management UI | Schema + service exist, no invite/manage screens |

---

## Killer Features (Pro Tier)

These drive conversions from Free to Pro. Each solves a high-anxiety, safety-critical, or high-frequency pain point.

### Killer Feature #1: Health Records + Withdrawal Calculator

| # | Sub-Feature | Status | Details |
|---|-------------|--------|---------|
| 1a | Vaccination tracking | BUILT | HealthRecord.ts with vaccineRoute, vaccineLotNumber, vaccineNextDueDate |
| 1b | Medication tracking with dosage | BUILT | medicationDosage, medicationDosageUnit, medicationRoute, medicationFrequency |
| 1c | Deworming tracking | BUILT | dewormingDosage, dewormingDosageUnit fields |
| 1d | Vet visit tracking | BUILT | vetClinicName, vetDiagnosis, vetTreatmentNotes, vetFollowUpDate |
| 1e | Illness/injury tracking | BUILT | symptoms, treatment, resolvedDate, outcome fields |
| 1f | Withdrawal period calculator | BUILT | WithdrawalUtility.ts calculates active/clear status, days remaining |
| 1g | Withdrawal alerts on dashboard | BUILT | HomeController computes activeWithdrawals, WithdrawalAlertSection displays them |
| 1h | Auto-create care event from vaccination next-due-date | BUILT | HealthService.createHealthRecord creates care event when vaccineNextDueDate set |
| 1i | Health tab on animal detail | BUILT | AnimalHealthTab.tsx |
| 1j | Medication reminders with dosage history | PARTIAL | Vaccination auto-creates care event for next dose, but no general medication reminder system |
| 1k | Update/delete health records | MISSING | IHealthService only has subscribe + create, no update/delete |
| 1l | Photo on health records | BUILT | photoUri support in createHealthRecord, photoUrl display in detail screen |

**Verdict: ~85% built.** Needs update/delete on health records and possibly medication-specific reminders.

### Killer Feature #2: Breeding Manager + Gestation Tracker

| # | Sub-Feature | Status | Details |
|---|-------------|--------|---------|
| 2a | Breeding events with sire/dam | BUILT | BreedingRecord.ts with animalId (dam), sireId, sireName, method |
| 2b | Automatic gestation countdown per species | BUILT | GestationUtility.ts + GestationTable.ts with species-specific days |
| 2c | Due date notifications | PARTIAL | Breeding countdowns on dashboard, but no push notification for approaching due dates |
| 2d | Litter/clutch recording with birth outcomes | BUILT | BirthOutcome interface, RecordBirthOutcomeScreen, completeBirth service method |
| 2e | Pedigree view (2-3 generations) | MISSING | Animal has sireId/damId but no pedigree tree view component |
| 2f | Sire selector | BUILT | SireSelector.tsx component |
| 2g | Offspring list | BUILT | OffspringList.tsx component |
| 2h | Breeding tab on animal detail | BUILT | AnimalBreedingTab.tsx |
| 2i | Fail breeding | BUILT | IBreedingService.failBreeding() |
| 2j | Delete breeding record | BUILT | IBreedingService.deleteBreedingRecord() |
| 2k | Breeding countdown on dashboard | BUILT | BreedingCountdownSection.tsx on HomeScreen |

**Verdict: ~80% built.** Missing pedigree view and push notifications for due dates.

### Killer Feature #3: Production Dashboard

| # | Sub-Feature | Status | Details |
|---|-------------|--------|---------|
| 3a | Daily logging (eggs, milk, fiber, honey, meat) | BUILT | ProductionLog.ts with ProductionType, CreateProductionLogScreen |
| 3b | Per-animal and per-group logging | BUILT | ProductionLog has animalId + groupName fields |
| 3c | Production trends (visual chart) | BUILT | ProductionTrendChart.tsx component |
| 3d | Production summary card | BUILT | ProductionSummaryCard.tsx |
| 3e | Quick log entry | BUILT | QuickLogEntry.tsx component |
| 3f | Type filtering | BUILT | ProductionTypeSelector.tsx |
| 3g | Production tab in main navigation | BUILT | MainScreen has Production tab |
| 3h | Update/delete production logs | BUILT | IProductionService has update + delete |
| 3i | Cost-per-unit calculations | MISSING | No cost field on ProductionLog, no cost calculation |
| 3j | Weekly/monthly aggregation views | MISSING | Only daily summary + 30-day trend chart |

**Verdict: ~75% built.** Core logging and trends work. Missing cost tracking and time-period aggregations.

---

## Additional Pro Features

| # | Feature | Status | Details |
|---|---------|--------|---------|
| A1 | Weight/body condition tracking | BUILT | WeightLog.ts schema, WeightService (full CRUD), AnimalWeightTab.tsx |
| A2 | Weight charts | MISSING | AnimalWeightTab exists but no chart component for weight history |
| A3 | Notes/observation journal with tags | BUILT | Note.ts with NoteTag[], NoteService, CreateNoteScreen, NoteDetailScreen, AnimalNotesTab |
| A4 | Unlimited animals and care reminders | PARTIAL | SubscriptionService + tiers exist, but no enforcement logic gating animal count or care count |
| A5 | Photo attachments on all records | PARTIAL | Animal and HealthRecord support photos, but Note, ProductionLog, WeightLog, BreedingRecord do not |
| A6 | Export animal records as PDF | MISSING | No PDF generation, no share/export functionality anywhere |
| A7 | Advanced recurring schedules | PARTIAL | CareEvent has cycle-based recurrence but no advanced options (e.g., specific days of week) |
| A8 | Multi-user household access | PARTIAL | HomesteadMember schema with roles (owner/manager/caretaker/viewer), HomesteadService with add/get members. No UI: no invite flow, no member management screen, no role-based view filtering |
| A9 | Timeline tab on animal detail | BUILT | AnimalTimelineTab.tsx |

---

## Subscription and Paywall

| # | Feature | Status | Details |
|---|---------|--------|---------|
| S1 | Subscription tiers defined | BUILT | ISubscriptionService with SubscriptionTier: free/pro/farm |
| S2 | RevenueCat integration | BUILT | RevenueCatInAppPurchases.ts, purchase/restore/sync methods |
| S3 | Effective subscription calculation (override + RevenueCat) | BUILT | effectiveSubscription() in ISubscriptionService.ts |
| S4 | Paywall screen | MISSING | Subscription route exists in navigation but points to PlaceholderScreen |
| S5 | Feature gating enforcement | MISSING | No checks in controllers/screens to gate features by tier |
| S6 | Upgrade trigger points (contextual upsells) | MISSING | No paywall triggers when accessing premium features |
| S7 | Free trial | MISSING | No trial logic |
| S8 | Subscription analytics | MISSING | No analytics instrumentation at all |

---

## Infrastructure

| # | Feature | Status | Details |
|---|---------|--------|---------|
| I1 | Push notifications / reminders | MISSING | No notification scheduling, no FCM integration for care reminders or breeding due dates |
| I2 | Analytics instrumentation | MISSING | No Firebase Analytics events, no tracking anywhere |
| I3 | Offline-first / local DB | MISSING | Firestore-only, no local persistence layer |
| I4 | Tests | MISSING | No test files found |

---

## Summary: What's Built vs What's Missing

### Built and Functional
- Animal profiles with full CRUD, photos, sire/dam
- Care reminders with recurring/single, templates, completion, all-care view
- Dashboard with overdue care, due today, withdrawals, breeding countdowns
- Health records (vaccination, medication, deworming, vet visit, illness/injury)
- Withdrawal calculator + dashboard alerts
- Breeding manager with gestation countdown, birth outcomes, offspring
- Production logging with trends, quick entry, type filtering, summary
- Weight/body condition logging
- Notes with tags
- Custom animal types, breeds, care templates
- Species starter playbooks + onboarding
- Auth, profile, feedback, homestead entity
- RevenueCat subscription integration
- Animal detail with 6 tabs (timeline, health, breeding, care, notes, weight)

### Missing (Required for MVP Launch)
1. **Paywall screen** -- currently a placeholder
2. **Feature gating** -- no enforcement of free vs pro limits
3. **Health record update/delete** -- create-only right now
4. **Pedigree view** -- sire/dam data exists, no visual tree
5. **Multi-user UI** -- schema and service built, zero screens
6. **Push notifications** -- no care reminders, no breeding due date alerts
7. **Analytics** -- completely absent
8. **PDF export / share** -- no export capability
9. **Weight charts** -- tab exists, no chart visualization
10. **Cost-per-unit on production** -- no cost field or calculation

### Missing (Can Ship After MVP)
- Offline-first local DB
- Advanced recurring schedules
- Production weekly/monthly aggregations
- Photo attachments on notes, production, weight, breeding
- Free trial logic
- Subscription analytics
- Tests
