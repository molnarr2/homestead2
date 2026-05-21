# Analytics Service

## Summary

Add a client-side analytics service that tracks the user journey from account creation to power user. Ported from the Antioch app's analytics system with one key change: instead of a single `core_action` event with `{ action, count }` properties, fire discrete named events (`add_animal`, `add_health_record`, etc.) so each event is its own row in GA4/BigQuery without needing custom event parameter reporting.

## Current Behavior

No analytics exist in Homestead. The `@react-native-firebase/analytics` dependency is in `apps/mobile/package.json` but nothing imports or uses it. There is no `ICloudPlatformAnalytics` plugin, no analytics service, and no event tracking of any kind.

The only local storage usage is in `library/cloudplatform/firebase/FirebaseAuth.ts` which uses `createMMKV()` to persist login state.

## Desired Behavior

### Plugin Layer

A new `core/plugin/ICloudPlatformAnalytics.ts` interface provides a generic analytics contract:

- `logEvent(name, params?)` — fire a named event with optional key-value params
- `setUserId(userId)` / `clearUserId()` — tie events to authenticated user
- `setUserProperty(name, value)` / `clearUserProperties(names[])` — set GA4 user properties
- `appShown: Subscribable<boolean>` — emits when the app transitions to active (React Native `AppState`)

A new `library/cloudplatform/firebase/FirebaseAnalytics.ts` implements this interface using `@react-native-firebase/analytics`. It listens to `AppState` changes and emits `appShown` when the app becomes `'active'`.

### Analytics Events

A new `core/service/analytics/AnalyticsEvent.ts` enum defines discrete event names:

- `add_first_animal` — fires once (first animal ever)
- `add_animal` — fires every time an animal is created
- `add_health_record`
- `add_breeding_record`
- `add_care_event`
- `add_note`
- `add_weight_log`
- `add_production_eggs`
- `add_production_milk`
- `add_production_fiber`
- `add_production_honey`
- `add_production_meat`
- `care_event_complete`

### User Properties (GA4)

Six user properties, same as Antioch. Set via `setUserProperty()` and updated on every core action and app foreground:

- `user_stage` — `new_user | activated | engaged | retained | power`
- `active_status` — `active | at_risk | churned`
- `engagement_level` — `new | none | low | medium | high`
- `days_active` — integer count of unique days the app was opened
- `visit_count` — integer count of total app opens
- `last_visit_date` — `YYYY-MM-DD` string

### Engagement Calculation Events

These fire when a user property value changes (not on every recalculation):

- `activation` — fires once when onboarding completes
- `user_stage` with `{ stage }` — when user_stage transitions
- `active_status` with `{ status }` — when active_status transitions
- `engagement_level` with `{ level }` — when engagement_level transitions
- `days_active` with `{ count }` — only on milestones: 1, 2, 3, 5, 7, 10, 15, 20, 25, 50, 100, then every 25

### Analytics Service

A new `core/service/analytics/AnalyticsService.ts` implementing `IAnalyticsService`. Constructor takes `ICloudPlatformAnalytics`, `IFirebaseAuth`, and an MMKV instance (created via `createMMKV()` in Bootstrap).

**Public interface:**

- `logAction(event: AnalyticsEvent): void` — fire the discrete event, append to action log, increment per-event count, recalculate metrics
- `onboardingCompleted(): void` — set user stage to `activated`, fire `activation` event
- `clearAnalytics(): void` — wipe all MMKV keys and clear user properties

**Auth subscription (constructor):** Subscribe to `firebaseAuth.loggedIn`. On login, call `setUserId(currentUserId)`. On logout, call `clearUserId()`.

**App lifecycle (constructor):** Subscribe to `cloudPlatformAnalytics.appShown`. On each emission, call private `appShown()` which increments visit count, sets last visit date, updates days active, and recalculates all metrics.

**Internal action log:** Even though events are discrete, the engagement calculations need a unified timeline. Every `logAction()` call appends `{ event, timestamp }` to a single JSON array in MMKV (`analytics_action_log`). The `coreActionCountSinceDays(days)` and `coreActionCountBetweenDays(from, to)` methods count entries from this log, same as Antioch.

**Per-event counts:** Each event gets its own MMKV key (`analytics_event_count_{event}`) tracking total occurrences. Used for `add_first_animal` logic and passed as `{ count }` param on each event fire.

**Metric calculations** — ported directly from Antioch's `AnalyticsService.ts`:

- `calculateEngagementLevel()` — high (>20 actions in 14 days), medium (>5), low (>1), none (0), new (first 14 days)
- `calculateUserStage()` — new_user -> activated (onboarding) -> engaged (first action) -> retained (actions in each of past 3 weeks) -> power (medium+ engagement each of past 3 weeks). Power can regress to retained; retained cannot regress.
- `calculateActiveStatus()` — active (action in past 7 days), at_risk (no action in 7 days but has action in 21 days), churned (no action in 21 days)

### add_first_animal Logic

Inside `logAction()`, before firing the event: if the event is `add_animal` and the current count for `add_animal` is 0 (first time), also fire `add_first_animal`. Then fire `add_animal` with its new count. This keeps `add_first_animal` as a distinct event in GA4 for funnel analysis without requiring the implementer to check state in the calling service.

### MMKV Keys

All keys prefixed with `analytics_`:

- `analytics_event_count_{event}` — per-event running total
- `analytics_action_log` — JSON array of `{ event, timestamp }` entries
- `analytics_user_stage` — current stage string
- `analytics_active_status` — current status string
- `analytics_engagement_level` — current level string
- `analytics_days_active` — JSON array of `YYYY-MM-DD` strings
- `analytics_visit_count` — integer
- `analytics_first_seen` — timestamp (ms)

## Data Access Audit

**No Firestore reads or writes.** The analytics service is entirely client-side. All state is stored in MMKV (device-local). Events are sent to Firebase Analytics SDK which batches and uploads them automatically. User properties are set locally and synced by the SDK.

**No N+1 queries.** The action log is a single JSON array read from MMKV. Counting actions over a time range iterates the in-memory array after one MMKV read.

**MMKV performance.** The action log grows unbounded over time. At 50 actions/day for a year, that's ~18K entries (~500KB JSON). MMKV handles this fine — it memory-maps the file. If this becomes a concern in the future, prune entries older than 30 days (only the last 21 days matter for calculations).

**Firebase Analytics batching.** The SDK batches events and uploads approximately every hour (or on app background). No real-time network cost per event.

## Touch Points

### New Files

- `core/plugin/ICloudPlatformAnalytics.ts` — generic analytics interface with `logEvent`, `setUserId`, `clearUserId`, `setUserProperty`, `clearUserProperties`, `appShown`
- `library/cloudplatform/firebase/FirebaseAnalytics.ts` — Firebase implementation using `@react-native-firebase/analytics` and `AppState` listener
- `core/service/analytics/AnalyticsEvent.ts` — enum of 13 discrete event names
- `core/service/analytics/IAnalyticsService.ts` — interface with `logAction`, `onboardingCompleted`, `clearAnalytics`. Exports `UserStage`, `ActiveStatus`, `EngagementLevel` enums
- `core/service/analytics/AnalyticsService.ts` — full implementation with MMKV storage, metric calculations, auth/lifecycle subscriptions

### Modified Files

- `Bootstrap.ts` — instantiate `FirebaseAnalytics`, create MMKV instance, instantiate `AnalyticsService(firebaseAnalytics, firebaseAuth, mmkv)`, export as `bsAnalyticsService`
- `feature/animal/service/AnimalService.ts` — add `IAnalyticsService` constructor param. Call `logAction(add_animal)` at end of `createAnimal()` on success
- `feature/health/service/HealthService.ts` — add `IAnalyticsService` constructor param. Call `logAction(add_health_record)` at end of `createHealthRecord()` on success
- `feature/breeding/service/BreedingService.ts` — add `IAnalyticsService` constructor param. Call `logAction(add_breeding_record)` at end of `createBreedingRecord()` on success
- `feature/care/service/CareService.ts` — add `IAnalyticsService` constructor param. Call `logAction(add_care_event)` at end of `createCareEvent()` on success. Call `logAction(care_event_complete)` at end of `completeCareEvent()` on success
- `feature/notes/service/NoteService.ts` — add `IAnalyticsService` constructor param. Call `logAction(add_note)` at end of `createNote()` on success
- `feature/animal/service/WeightService.ts` — add `IAnalyticsService` constructor param. Call `logAction(add_weight_log)` at end of `createWeightLog()` on success
- `feature/production/service/ProductionService.ts` — add `IAnalyticsService` constructor param. Call `logAction(add_production_{type})` at end of `createProductionLog()` on success, mapping `productionType` to the matching `AnalyticsEvent`
- `feature/auth/screen/RegisterController.ts` — after homestead creation line 43, call `bsAnalyticsService.onboardingCompleted()`

### Service Interface Updates

Each service that gains an `IAnalyticsService` dependency also needs its interface file updated to reflect the new constructor parameter. The interfaces themselves (`IAnimalService`, etc.) don't change — only the concrete class constructors do. No interface method signatures change.

## Risk

**MMKV instance collision.** `createMMKV()` with no ID creates a default instance. `FirebaseAuth.ts` already uses the default instance with key `auth-logged-in`. All analytics keys are prefixed with `analytics_` so there's no collision. However, if a dedicated MMKV instance is preferred for isolation, pass `{ id: 'analytics' }` to `createMMKV()`. Either approach works — the prefix is sufficient.

**Event name length.** GA4 event names must be under 40 characters. The longest is `add_production_fiber` at 20 characters. No risk.

**User property limits.** GA4 allows 25 custom user properties. This feature uses 6. No risk.
