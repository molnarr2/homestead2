# Research and Options

Options for each issue from 01_code_analysis.md. Each section presents approaches from lightest to heaviest, with a recommendation.

---

## 1. Failure States

The app treats errors identically to empty data. Stores have no error field, the loading screen has no timeout, and multiple controllers don't check mutation results.

### Option A: Minimum Viable Error Handling (Small)

Add result checking to the 3 controllers that skip it, and add a global error toast.

**Scope:**
- Fix `CreateBreedingRecordController`, `CreateNoteController`, `CreateProductionLogController` to check `IResult` and show `Alert.alert()` on failure (same pattern as `CreateAnimalController`).
- Add `.catch()` to the promise chain in `appInitializer.ts`.
- Fix `RegisterController` to check return values of `createUser()`, `createHomestead()`, `setActiveHomestead()` and roll back or show error on failure.

**Pros:** Small diff. Fixes the data-loss-without-warning bugs.
**Cons:** Does not address the deeper problem of stores silently returning empty data on listener failure. Users still can't distinguish "no data" from "failed to load."

### Option B: Error State in Stores + Timeout on Loading (Medium)

Add an `error` field to each Zustand store. Add a timeout to the loading screen.

**Scope:**
- Everything in Option A.
- Add `error: string | null` to each data store's state.
- In each service's `onSnapshot` error callback, set the store's error field instead of returning empty data.
- Screens check `error` and show a retry-capable error state (a simple "Something went wrong. Tap to retry." component).
- Add a 15-second timeout to `LoadingScreen` that shows "Having trouble connecting. Check your connection and try again." with a retry button.

**Pros:** Users can now distinguish errors from empty data. Loading screen no longer hangs forever.
**Cons:** More files touched (~20 stores + screens). Need a reusable error/empty state component.

### Option C: Full Offline-Aware Architecture (Large)

Add network state detection, offline queue, and optimistic UI.

**Scope:**
- Everything in Option B.
- Add `@react-native-community/netinfo` for connectivity detection.
- Show a persistent banner when offline ("You're offline. Changes will sync when reconnected.").
- Leverage Firestore's built-in offline persistence (already enabled by default in React Native Firebase) but surface its status to the user.
- Add optimistic updates to stores so mutations feel instant.

**Pros:** Best UX for rural users with poor connectivity.
**Cons:** Significant architectural change. Optimistic updates require rollback logic. Adds complexity across the entire mutation flow.

### Recommendation

**Option B.** It fixes the actual bugs (Option A) and solves the core UX problem (users can see when something went wrong). Option C is ideal for the user base but is a large effort that can be layered on later. The offline story is partially covered by Firestore's built-in offline cache already.

---

## 2. Registration Recovery

Account creation is a multi-step sequence where any failure leaves the user in a permanently broken state.

### Option A: Check Results and Show Errors (Small)

Add error checking to each step in `RegisterController`. If any step fails, show an error and don't proceed.

**Scope:**
- Check `IResult` from `createUser()`. If it fails, delete the auth account and show error.
- Check return value from `createHomestead()` (empty string = failure). If it fails, delete user doc and auth account, show error.
- Check `setActiveHomestead()` result.

**Pros:** Prevents the broken state from occurring. Small diff.
**Cons:** Doesn't help users who already hit this state. If the cleanup (deleting auth account) also fails, the user is still stuck.

### Option B: Startup Repair Logic (Medium)

Add a recovery check on app startup that detects and repairs incomplete registration.

**Scope:**
- Everything in Option A (prevent new cases).
- In `authStore` subscription handler, after fetching user doc:
  - If user doc doesn't exist but auth does: create user doc with defaults, create homestead, set active homestead.
  - If user doc exists but `activeHomesteadId` is empty: query `getHomesteadsForUser()`. If homesteads exist, set the first one as active. If none exist, create one.
  - If `activeHomesteadId` is set but homestead doc doesn't exist: create homestead, update user doc.
- Log these recovery events to Crashlytics so you know how often it happens.

**Pros:** Fixes both new and existing cases. Self-healing.
**Cons:** More complex. Recovery logic needs to handle its own failures. Must be careful not to create duplicate homesteads.

### Option C: Transactional Registration (Medium)

Wrap the entire registration in a Firestore transaction or batch write.

**Scope:**
- Create user doc and homestead doc in a single batch write (atomic).
- Only call `initializeApp()` after the batch succeeds.
- Auth account creation still happens separately (Firebase Auth is not transactional with Firestore), so handle the auth-exists-but-no-docs case.

**Pros:** Eliminates the partial-state problem at the database level.
**Cons:** Can't include Firebase Auth in the transaction. Still need Option A's cleanup for the auth-before-docs case. Batch writes have a 500-doc limit (not an issue here but worth noting).

### Recommendation

**Option A + the startup repair from Option B.** Option A prevents new cases (cheap). The repair logic from B heals existing cases and handles edge cases that A can't prevent (app killed mid-write). Option C is clean but doesn't eliminate the auth/Firestore split, so you still need A.

---

## 3. Subscription Enforcement

Paywall only gates animal creation in 2 UI locations. No server-side enforcement.

### Option A: Extend Client-Side Checks (Small)

Add subscription checks to all create flows.

**Scope:**
- Define tier limits for each entity type (care events, health records, breeding records, production logs, notes, groups).
- Add `effectiveSubscription()` check in each create controller, matching the existing pattern in `AnimalListController`.
- Extract a shared `checkSubscriptionLimit(tier, entityType, currentCount)` utility to avoid duplicating the logic.
- Call `logoutRevenueCat()` in the logout flow.

**Pros:** Quick. Consistent with existing pattern.
**Cons:** Still client-side only. Doesn't prevent API-level abuse. Any motivated user can bypass it.

### Option B: Server-Side Enforcement via Security Rules (Medium)

Add Firestore security rules that count documents and reject writes over the limit.

**Scope:**
- Store the subscription tier on the homestead document (already exists: `subscriptionRevenuecat` and `subscriptionOverride`).
- In security rules, for each collection's `create` rule, add a condition that reads the homestead document and checks the tier against limits.
- Example: `allow create: if isHomesteadMember(homesteadId) && get(/databases/$(database)/documents/homestead_v2/$(homesteadId)).data.subscriptionRevenuecat != 'free' || existingDocCount < limit`

**Problem:** Firestore rules cannot count documents in a collection. There is no `count()` operation in rules. You would need to maintain a counter document that increments on each write, which requires a Cloud Function trigger.

**Revised approach:**
- Add a Cloud Function `onDocumentCreated` trigger for each gated collection.
- The trigger counts documents. If over limit, soft-delete the newly created document and (optionally) send a push notification.
- Alternatively, maintain a `documentCounts` map on the homestead document, updated by triggers. Security rules read this map.

**Pros:** Actual enforcement. Can't be bypassed by modified clients.
**Cons:** Added complexity. Counter documents can drift if triggers fail. Firestore rule reads count against billing. The "delete after create" approach means the user briefly sees the document before it disappears.

### Option C: Callable Cloud Function for All Mutations (Large)

Route all create operations through callable Cloud Functions instead of direct Firestore writes.

**Scope:**
- Create a callable function for each entity type (createAnimal, createCareEvent, etc.).
- Functions validate auth, check subscription tier, enforce limits, then write to Firestore.
- Remove direct write permissions from security rules (read-only for clients).
- Mobile services call the function instead of writing directly.

**Pros:** Complete server-side control. Can enforce any business logic. Single source of truth for validation.
**Cons:** Large refactor. Loses Firestore's offline write capability (callable functions require network). Adds latency to every write. Breaks the real-time optimistic feel of the app.

### Recommendation

**Option A now, Option B later.** Client-side checks cover 99% of real users. The people who would bypass it via the REST API are not your target market (farmers). Add the `logoutRevenueCat()` call immediately. If abuse becomes a real problem, add the counter-document approach from Option B. Option C is over-engineered for this app's scale.

---

## 4. Unbounded Queries

All real-time listeners load entire collections without pagination or date filtering.

### Option A: Add Limits to Historical Collections (Medium)

Keep real-time listeners for "active" data. Paginate historical data.

**Scope:**
- Animals, groups, animal types: keep as unbounded listeners. These collections grow slowly and are always needed in full for dropdowns and references.
- Care events: filter to `completedDate == null OR dueDate >= 90 days ago`. Completed events older than 90 days load on demand in an "archive" view.
- Health records: filter to `date >= 1 year ago`. Older records load on demand.
- Weight logs: filter to `date >= 1 year ago`.
- Production logs: filter to `date >= 6 months ago`.
- Notes: keep unbounded (typically small).
- Breeding records: filter to `status == 'active'` for the real-time listener. Completed records load on demand.
- Add a "Load older records" button or infinite scroll to list screens.

**Pros:** Dramatically reduces startup reads. Covers the 80% case (users mostly care about recent data).
**Cons:** Users can't search old records without a secondary fetch. Date boundaries are somewhat arbitrary. Changes the store subscription patterns.

### Option B: Lazy-Load Per Entity (Medium)

Only load collection data when the user navigates to that screen.

**Scope:**
- On app start, only subscribe to: animals, homestead, user, animal types (core reference data).
- Care events, health records, breeding records, etc. subscribe when the user opens that screen and unsubscribe when they leave.
- The group store stops creating child listeners on init. Group sub-data loads when a group is tapped.

**Pros:** Minimal reads on startup. Only pays for what the user looks at.
**Cons:** Screen transitions feel slower (loading spinner on first visit). Real-time listeners tear down and re-create on navigation, which adds complexity. Push notification deep-links need to trigger the right subscription.

### Option C: Pagination + Cursor-Based Loading (Large)

Full cursor-based pagination with infinite scroll.

**Scope:**
- All list screens use `limit(50)` + `startAfter(lastDoc)` pattern.
- Stores maintain a cursor and expose a `loadMore()` action.
- Real-time listener only covers the current page (first 50 docs). Changes beyond the current page are missed until the user scrolls.

**Pros:** Scales to any data size.
**Cons:** Complex interaction with real-time listeners (Firestore pagination + onSnapshot is tricky). New documents may not appear in the current page. Significantly more complex store logic.

### Recommendation

**Option A.** It's the right tradeoff: animals and reference data stay fully loaded (they're always needed), while historical records that grow unboundedly get date-filtered. The date boundaries match how farmers actually use the app (they care about upcoming and recent events, not 3-year-old records). Option B saves more reads but makes the app feel slower. Option C is over-engineered.

---

## 5. Cloud Function Scalability

Scheduled functions scan all homesteads in a single invocation. The care event trigger has no transaction safety.

### Option A: Fix the Trigger + Delete Duplicates (Small)

Address the correctness bugs without changing the architecture.

**Scope:**
- Wrap `onCareEventComplete` in a Firestore transaction: read the original doc, check `createdNextRecurringEvent`, create next event and update original atomically.
- Delete `onCareEventDue` (exact duplicate of `dailyCareReminder`).
- Enable the 3 commented-out notification functions if they're intended for ship, or delete them.

**Pros:** Small diff. Fixes the duplicate event bug. Cleans up dead code.
**Cons:** Doesn't address the scaling problem.

### Option B: Shard by Homestead (Medium)

Replace collection-group queries with per-homestead iteration.

**Scope:**
- Scheduled functions first query all homesteads, then iterate and query each homestead's subcollection individually.
- Process each homestead in a try/catch so one failure doesn't block others.
- Add a `lastNotificationCheck` timestamp to homestead docs to enable incremental processing.

**Pros:** Failures are isolated per homestead. Can add parallelism (process N homesteads concurrently).
**Cons:** More Firestore reads (one query per homestead instead of one collection-group query). The collection-group approach is actually more efficient at small scale. Only becomes a win at hundreds of homesteads.

### Option C: Event-Driven Architecture (Large)

Replace scheduled scans with event-driven triggers.

**Scope:**
- When a care event is created or updated, schedule a notification via a "pending notifications" collection with a `sendAt` timestamp.
- A scheduled function (runs every hour) queries only the pending notifications collection for `sendAt <= now`.
- Sends notifications and marks them as sent.
- Same pattern for breeding due dates and withdrawal periods.

**Pros:** Scales linearly with notifications, not with total data. No full-table scans. Easy to add notification preferences (skip weekends, custom times).
**Cons:** Requires a new collection and new triggers on every entity that generates notifications. Migration effort for existing data. More moving parts.

### Recommendation

**Option A now.** The transaction fix and duplicate cleanup are mandatory regardless of scale. The collection-group queries are fine for the first 500-1000 homesteads. When you see function execution times growing in the Firebase console, move to Option B. Option C is the right long-term answer but is premature right now.

---

## 6. Orphaned References

Breeding records and child animals retain dangling references to deleted animals.

### Option A: Graceful UI Handling (Small)

Don't fix the data. Fix the display.

**Scope:**
- Where breeding records display sire/dam, show "Removed animal" instead of blank when the referenced animal isn't found.
- Where animal detail shows sire/dam, show "Removed animal" for dangling references.
- Where breeding records show offspring, add a note like "2 of 3 offspring still in herd" when some offspring are missing.

**Pros:** Minimal code change. Users understand what happened.
**Cons:** Dangling references accumulate in the database forever. Gestation calculation still returns wrong values for breeding records with deleted dams.

### Option B: Cascade Cleanup on Delete (Medium)

Extend `AnimalService.deleteAnimal()` to clean up references.

**Scope:**
- When an animal is deleted, query all animals where `sireId == id` or `damId == id`. Clear those fields.
- Query all breeding records where `sireId == id` (not just `animalId`). Set `sireId = ''` and `sireName = 'Removed'`.
- Query all breeding records and remove the animal's ID from `offspringIds[]` arrays.
- All of this can be added to the existing batch write in `deleteAnimal()`.

**Pros:** Database stays clean. No orphaned references.
**Cons:** Increases the number of queries and writes during delete. Could hit the 500-doc batch limit if an animal has many references. Delete becomes slower.

### Option C: Cloud Function Trigger (Medium)

Move cascade logic to a Cloud Function triggered on animal soft-delete.

**Scope:**
- Create `onAnimalDeleted` Cloud Function trigger that fires when an animal document's `admin.deleted` changes to `true`.
- Function handles all the reference cleanup from Option B, server-side.
- Runs asynchronously so the client delete is fast.

**Pros:** Client delete stays fast. Server handles consistency. Can retry on failure.
**Cons:** Eventual consistency. There's a window between delete and cleanup where the UI shows dangling references. Another cloud function to maintain.

### Recommendation

**Option A + Option B.** Do Option A immediately so users see "Removed animal" instead of blanks (cheap, good UX). Then add Option B to the existing `deleteAnimal()` batch. The delete operation is already doing 6 collection queries and a batch write. Adding 2 more queries is marginal. Option C adds unnecessary indirection for something that can be done synchronously in the existing batch.

---

## 7. Observability

No function tests, no notification delivery tracking, no alerting.

### Option A: Basic Monitoring (Small)

Add structured logging and Firebase alerts.

**Scope:**
- Add `functions.logger.info()` with structured data (homesteadId, notificationCount, eventCount) to each cloud function.
- Set up Firebase Alerts for function errors (built into Firebase console, just needs to be enabled).
- Add a simple counter: log the number of notifications sent per function run. Review in Cloud Logging.
- Add Crashlytics non-fatal error reporting for the silent failures identified in Issue 1 (store errors, init failures).

**Pros:** Almost no code. Firebase Alerts is free. You'll know when functions fail.
**Cons:** Reactive, not proactive. You'll see errors after users report them.

### Option B: Health Check Endpoint + Dashboard (Medium)

Add a callable function that reports system health.

**Scope:**
- Create an HTTP cloud function `healthCheck` that queries: number of homesteads, number of pending care events, last notification run timestamp, error count in last 24h.
- Call it from a simple web dashboard or from a scheduled uptime monitor.
- Add a `lastNotificationRun` timestamp to a system config document. Update it each time `dailyCareReminder` runs. Alert if it's stale.

**Pros:** Proactive monitoring. Know before users complain.
**Cons:** Another function to maintain. Dashboard needs hosting.

### Option C: Test Suite for Functions (Medium)

Write unit and integration tests for cloud functions.

**Scope:**
- Use `firebase-functions-test` (official testing library) to write unit tests for each function.
- Test: correct notifications sent for overdue care events, no duplicate events on retry, correct animal names resolved.
- Add to CI pipeline.

**Pros:** Catches regressions before deploy. Validates the duplicate-event fix from Issue 5.
**Cons:** Test setup for Firestore triggers requires emulator configuration. Initial investment.

### Recommendation

**Option A + Option C.** Option A is near-zero effort and gives you basic visibility. Option C catches bugs before they ship (especially important for the transaction fix in Issue 5). Option B is nice-to-have but premature until you have enough users to justify a dashboard.

---

## Summary: Recommended Execution Order

| Order | Issue | Approach | Effort |
|---|---|---|---|
| 1 | Registration recovery | Option A (check results) + Option B (startup repair) | 1-2 days |
| 2 | Failure states | Option B (error state in stores + loading timeout) | 2-3 days |
| 3 | Subscription enforcement | Option A (extend client checks + fix RevenueCat logout) | 1 day |
| 4 | Cloud function correctness | Option A (transaction + delete duplicates) | Half day |
| 5 | Orphaned references | Option A (UI) + Option B (cascade cleanup) | 1 day |
| 6 | Unbounded queries | Option A (date-filter historical collections) | 2-3 days |
| 7 | Observability | Option A (structured logging) + Option C (function tests) | 1-2 days |

**Total estimated effort: 9-13 days**

Items 1-4 are pre-ship. Items 5-7 can ship shortly after launch if needed.
