# Code Analysis: Pre-Ship Review

## 1. The App Has No Concept of Failure

Zustand stores have no `error` field. Every `onSnapshot` error callback returns empty arrays or null. Every unhandled promise silently proceeds. The loading screen has no timeout.

A farmer opens the app in a barn with spotty signal. The app shows a spinner forever, or shows an empty animal list that looks like their data is gone. There is no way to distinguish "loading," "error," or "you have no animals." There is no retry button anywhere.

The entire state layer assumes success.

### Concrete Examples

- `CreateBreedingRecordController`, `CreateNoteController`, `CreateProductionLogController` do not check `IResult` at all. They navigate away regardless of success or failure.
- `RegisterController` lines 38-46: if `createUser()` or `createHomestead()` fails after auth succeeds, the app calls `initializeApp()` anyway. The user ends up with an auth account but no data, stuck on a loading screen permanently.
- `appInitializer.ts`: the RevenueCat `.then()` chain has no `.catch()`. Silent swallow.
- All service `onSnapshot` error handlers log the error and return empty data. The UI renders "no data" identically to "failed to load."
- No React Error Boundaries exist anywhere in the app.
- No network connectivity detection (no NetInfo usage).

---

## 2. Registration Can Leave Users in Unrecoverable States

Account creation is a multi-step sequence (auth -> user doc -> homestead -> set active homestead -> initialize) with no error checking between steps and no recovery path.

| Crash Point | Result |
|---|---|
| After auth, before user doc | Auth exists, no Firestore data. Infinite loading on reopen. |
| After user doc, before homestead | User doc exists, `activeHomesteadId` empty. Infinite loading. |
| After homestead, before setActiveHomestead | Homestead exists but user can't reach it. Infinite loading. |

There is no startup repair logic to detect or recover from any of these. The user's only option is to delete and reinstall.

The same applies to anonymous registration (lines 49-68 in RegisterController). The anonymous flow has the identical multi-step sequence without error checks.

---

## 3. Subscription Enforcement Is Cosmetic

Subscription checks exist in exactly 2 places:
- `AnimalListController` lines 141-149 (animal creation)
- `HomeController` lines 209-220 (animal creation)

Everything else is unlimited on free tier: care events, health records, breeding records, production logs, notes, weights, groups.

There is zero server-side enforcement. Firestore rules check homestead membership but never check subscription tier. A modified client or anyone with the Firestore REST API can write unlimited data regardless of subscription.

`logoutRevenueCat()` is defined in SubscriptionService but never called during logout. RevenueCat session state leaks across accounts.

---

## 4. Every Real-Time Listener Is Unbounded

The app subscribes to the entire contents of 10+ collections on startup with no pagination, no date filtering, no limits. All queries are simply `where('admin.deleted', '==', false)` with no `limit()`.

For a homestead active for 3 years with 500 care events, 200 health records, and daily production logs, thousands of documents load into memory on every app open.

### Startup Cost Estimate (50 animals, 3 years of data)

| Collection | Estimated Docs |
|---|---|
| Animals | 50 |
| Care events | 500 |
| Health records | 200 |
| Breeding records | 30 |
| Notes | 50 |
| Weight logs | 100 |
| Production logs | 300 |
| Animal types | 15 |
| Groups | 5 |
| Group sub-listeners (5 groups x 2) | 10 listeners, ~150 docs |
| **Total** | **~1,400 reads on cold start** |

The group store compounds this. Each group spawns 2 additional real-time listeners (care events + health records). 10 groups = 21 total active listeners.

---

## 5. Cloud Functions Don't Scale with User Base

All scheduled functions use `collectionGroup()` queries that scan every homestead's data in a single function invocation.

| Function                     | Query                                                       | At 1000 Homesteads  |
| ---------------------------- | ----------------------------------------------------------- | ------------------- |
| dailyCareReminder            | Incomplete care events with dueDate <= today (all homesteads) | ~5K-50K reads/run * |
| onBreedingDue (inactive)     | Active breeding records due in next 3 days (all homesteads) | ~1K-5K reads/run    |
| onWithdrawalClear (inactive) | Health records with withdrawal period > 0 (all homesteads)  | ~50K-200K reads/run |

\* dailyCareReminder scales with the number of neglected/overdue care events, not total events. Dead homesteads that never complete tasks accumulate overdue items indefinitely, inflating this query over time. The bigger cost is the N+1 pattern: for each homestead with results, it queries members then devices per member (lines 28-46).

`onCareEventComplete` creates the next recurring care event without a Firestore transaction. Firebase guarantees at-least-once execution for triggers. A retry creates a duplicate care event.

`dailyCareReminder` and `onCareEventDue` are identical functions (duplicate code).

The notification functions do N+1 queries: they loop through matched records and fetch each animal name individually instead of batching.

---

## 6. Orphaned References Degrade Silently

`AnimalService.deleteAnimal()` does cascade soft-deletes to related records (care, health, breeding, notes, weights, production) and removes the animal from groups. This is well done.

What is NOT handled:

| Scenario | Result |
|---|---|
| Animal deleted, referenced as sireId/damId in OTHER animals | Dangling reference. Child animal shows blank parent. |
| Animal deleted, referenced as sireId on breeding records it didn't create | Breeding record shows blank sire, gestation calculation returns 0 days. |
| Offspring deleted individually | Breeding record's `offspringIds[]` contains stale IDs. Offspring silently disappear from list. |

The UI handles all of these by showing blank fields or filtering out missing entries. There is no indication to the user that data is missing versus never entered. This erodes trust over time.

Firestore security rules have no referential integrity constraints. Cloud functions have no cross-entity consistency triggers.

---

## 7. No Observability

- No tests for cloud functions.
- No delivery tracking for push notifications.
- Error logging goes to Crashlytics, but there is no alerting threshold or dashboard.
- No way to know if care reminders stopped working. For an app where missed notifications mean missed animal care, this matters.
- No analytics on error rates, retry rates, or subscription conversion.

---

## Priority Ranking

| Priority | Issue | Why |
|---|---|---|
| 1 | Registration recovery (#2) | Users literally get locked out with no way back |
| 2 | Failure states (#1) | Users are on farms with bad signal; this is their daily experience |
| 3 | Subscription enforcement (#3) | This is revenue |
| 4 | Unbounded queries (#4) | Gets worse every day the app is in production |
| 5 | Function scalability (#5) | Won't matter at launch, will matter at 500+ homesteads |
| 6 | Orphaned references (#6) | Slow trust erosion |
| 7 | Observability (#7) | Won't know about problems 1-6 when they happen |
