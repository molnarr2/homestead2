# RN + Firebase Audit: Homestead

A two-pass (horizontal-by-concern, vertical-by-feature) review of the Homestead React Native + Firebase monorepo — the mobile app (`apps/mobile/src`), Cloud Functions (`packages/functions`), security rules (`firebase-rule/`), and shared `@template/common` — covering the v2 (`homestead_v2`) data model only. Production (v1) rules and collections were noted but treated as out of scope per the "DO NOT MODIFY" markers.

## Summary

| Severity | Count | Area |
|---|---|---|
| Critical | 2 | Storage rules (cross-tenant file access); Firestore rules (no field validation → paywall bypass + data tampering) |
| High | 9 | Member self-join, broken indexes, dead push pipeline, no account deletion, logout identity bleed, missing `userId`, withdrawal date math, recurring-event race, unbounded offspring batch |
| Medium | 18 | Silent mutation failures, orphaned Storage blobs, unbounded listeners, N+1 in functions, dead/duplicate code, empty-homesteadId writes, no email verification, no App Check, etc. |

**Headline:** Two security holes are exploitable today — any signed-in user can read/write **every** homestead's photos via Storage rules, and any homestead member can unlock the paid tier for free by writing one Firestore field (rules perform zero field validation). Separately, the entire notification stack is non-functional: FCM tokens are never registered and the composite indexes point at the wrong (pre-`_v2`) collection names, so the one live scheduled function both reads an empty token set *and* would throw on its query.

---

## Critical findings

### C1 — Storage rules grant every authenticated user read/write to every homestead's files
`firebase-rule/storage.rules:24-28`
```
match /homestead/{homesteadId}/{allPaths=**} {
  allow read: if request.auth != null;
  allow write: if request.auth != null;
}
```
There is **no homestead-membership check** — only "is signed in." Animal photos and note photos are stored at `homestead/{homesteadId}/...` (e.g. `NoteService.ts` writes `homestead/{homesteadId}/note/{noteId}/photo.jpg`; `AnimalService.uploadAnimalPhoto`). Any user who creates a free account can list/download/overwrite/delete the images of **any** homestead, and can fill another tenant's storage prefix with arbitrary files.
**Exploit:** sign in as any user → `storage().ref('homestead/<otherId>/...').getDownloadURL()` / `.putFile(...)`. The `homesteadId` leaks readily (it's embedded in `member_v2` docs, returned by `getHomesteadsForUser`, and shows in shared screenshots/support logs). Note Firestore correctly gates the equivalent docs behind `isHomesteadMember`; Storage does not.
**Fix:** Storage rules can't call `exists()` on Firestore directly, so either (a) use `firestore.get()/exists()` cross-service rules to verify membership of `homesteadId`, or (b) restructure paths so ownership is provable (and validate `request.auth.uid`), or (c) front all media through a Cloud Function / signed URLs. At minimum, this must not be `if request.auth != null`.

### C2 — Firestore rules perform no field validation; client-trusted subscription tier is client-writable → free paywall bypass + cross-field tampering
`firebase-rule/firestore.rules:99-102` (homestead update), plus the write path `HomesteadService.updateHomesteadSubscription` → `firestore.rules` allows it; gate read at `feature/subscription/service/ISubscriptionService.ts:6-14` and enforcement at `feature/animal/screen/AnimalListController.ts:141-149`.
```
match /homestead_v2/{homesteadId} {
  allow update: if isHomesteadMember(homesteadId);   // no validation of WHICH fields change
```
Every `*_v2` create/update rule is `if isHomesteadMember(...)` with **no `request.resource.data` validation**. Consequences:
- **Paywall bypass (revenue-impacting, trivially exploitable):** the effective tier is derived purely from `homestead.subscriptionRevenuecat` / `homestead.subscriptionOverride` on the homestead doc (`effectiveSubscription`, `tierRank` at `ISubscriptionService.ts:6`). A member can write `subscriptionOverride: 'pro'` (or `'farm'`, see M14) directly to the homestead doc and unlock unlimited animals; the limit at `AnimalListController.ts:144-145` is the only gate. `SubscriptionService.syncSubscription` (`SubscriptionService.ts:69-85`) already proves clients can write this field. RevenueCat entitlement is never re-verified server-side.
- **Data tampering:** any member can set `admin.deleted`, overwrite `userId`, or corrupt arbitrary fields on any animal/care/health/breeding/note/etc. doc in their homestead, since rules never constrain the payload.
**Fix:** add field-level validation to every `*_v2` rule (immutable `admin.created_at`, `userId == request.auth.uid` on create, type checks). Make `subscriptionRevenuecat`/`subscriptionOverride` **read-only to clients** and write them only from a RevenueCat-webhook Cloud Function with admin privileges. Enforce the animal-count cap server-side (rule count or callable function), not just in the controller.

---

## High findings

### H1 — Anyone who learns a `homesteadId` can self-join, and membership can never be revoked -- NEEDS FIXING
`firebase-rule/firestore.rules:105-110` (`member_v2` create: `... || request.auth.uid == memberId`) and `:109` / every `delete: if false`.
Member creation allows `request.auth.uid == memberId`, i.e. any authenticated user can write `homestead_v2/{X}/member_v2/{ownUid}` and instantly gain full read/write to all of homestead X's animals, health, breeding, notes, production. There is no invite/authorization record. `homesteadId` is a random 20-char Firestore auto-ID (`HomesteadService.ts:43`), so it isn't brute-forceable — but it isn't secret either (it's stored in member docs and returned by queries). Worse, `delete: if false` on `member_v2` means **a member can never be removed** — a former partner or anyone who once saw the ID retains permanent access.
**Fix:** require an explicit owner-created invite (e.g. `invite_v2/{email}`) as a precondition for `member_v2` create; remove the `request.auth.uid == memberId` self-add; add a controlled revoke path (admin-only update of a `status`/`revoked` field rather than `delete: if false`).

### H2 — Composite indexes reference legacy collection names and wrong scope → v2 queries fail (silently in the client, hard in functions)
`firebase-rule/firestore.indexes.json` (all 13 entries).
Every index targets a pre-`_v2` `collectionGroup` (`"animal"`, `"careEvent"`, `"healthRecord"`, `"breedingRecord"`, `"note"`, `"weightLog"`, `"productionLog"`) at `"queryScope": "COLLECTION"`. But the app queries the **`_v2`** collections (`Col.careEvent === 'careEvent_v2'`, etc.), and the Cloud Functions query them at **collection-group** scope.
- **Server:** `dailyCareReminder` (`packages/functions/src/scheduled/dailyCareReminder.ts:11-17`) runs `collectionGroup('careEvent_v2').where('admin.deleted','==',false).where('completedDate','==',null).where('dueDate','<=',today)` — a 3-field range query needing a `COLLECTION_GROUP` composite index on `careEvent_v2`. None exists → `FAILED_PRECONDITION` at runtime, every day.
- **Client:** range/order composite queries on `*_v2` (e.g. `getHealthRecordsForAnimal` order-by-date, production `orderBy('date','desc')`) have no matching index; the services catch the error and `return []` (e.g. `HealthService`, `BreedingService.getBreedingRecordsForAnimal:46-62`), so the UI shows **empty history** with no error.
**Fix:** regenerate `firestore.indexes.json` against the `_v2` collection names, and add `COLLECTION_GROUP`-scoped composites for every collection-group query in the functions. Deploy and let them build before relying on those screens/functions.

### H3 — Push-notification pipeline is dead end-to-end
`apps/mobile/src` (no `messaging`/`getToken`/`device_v2` writes anywhere) vs. `packages/functions/src/scheduled/dailyCareReminder.ts:33-44`.
`@react-native-firebase/messaging` is a declared dependency (`apps/mobile/package.json:20`) but **no code registers an FCM token, handles `onTokenRefresh`, or ever writes a `device_v2` doc**. `dailyCareReminder` reads `user_v2/{uid}/device_v2[].tokenId` and sends to that token list — which is always empty, so the multicast is skipped for every homestead. The Settings "notifications" toggle (`SettingsController.ts`) is a local-MMKV no-op. Additionally, `onCareEventDue`, `onBreedingDue`, `onWithdrawalClear` are written but **commented out / never exported** (`packages/functions/src/index.ts:7-10`), and `onCareEventDue` is a byte-for-byte duplicate of `dailyCareReminder`.
**Fix:** implement token registration (request permission → `getToken` → write `device_v2/{token}` → `onTokenRefresh` → delete on logout/delete-account), or remove the dependency/toggle and the dead functions if push is out of MVP scope. Combined with H2, no scheduled notification can currently fire.

### H4 — No account-deletion flow; existing helper only deletes the Auth record
`core/service/auth/AuthService.ts:49-51`, `library/cloudplatform/firebase/FirebaseAuth.ts:153-155`, consumed nowhere (only logout exists: `feature/profile/screen/ProfileController.ts:31-35`).
There is no "Delete account" UI. `deleteAuthAccount()` is dead code, and even if wired it calls only `currentUser.delete()` — leaving `user_v2/{uid}`, the `homestead_v2` doc, `member_v2`, all animal/care/health/breeding/note subcollections, and Storage avatars/photos **orphaned** (and, given `delete: if false` on every collection, undeletable from the client). It would also throw `auth/requires-recent-login` without the unused `reauthenticate` path.
**Impact:** App Store Guideline 5.1.1(v) requires in-app account deletion — likely rejection — plus indefinite retention of user PII (emails, animal photos).
**Fix:** add a re-auth-gated delete flow backed by a Cloud Function (admin SDK) that recursively deletes the user's Firestore docs + Storage prefixes + Auth record.

### H5 — Logout doesn't sign out of RevenueCat or clear analytics → cross-account bleed on shared devices
`feature/profile/screen/ProfileController.ts:31-35` → `store/appInitializer.ts:20-23` (`teardownApp` only calls `resetAllStores()`).
`SubscriptionService.logoutRevenueCat` (`SubscriptionService.ts:51-57`) and `AnalyticsService.clearAnalytics` (`AnalyticsService.ts:107-115`) exist but are **never called**. RevenueCat is `login()`-identified at `appInitializer.ts:14` and never logged out. After User A logs out and User B logs in on the same device, RevenueCat still reports User A's entitlements (so B may inherit A's subscription), and A's persisted analytics counters/action-log (in the `analytics` MMKV) are attributed to B.
**Fix:** call `logoutRevenueCat()` and `clearAnalytics()` in `teardownApp`/logout; also clear the `homestead` MMKV `lastActiveDate` key (see M10).

### H6 — `userId` is missing from every v2 document (violates project rule 10)
Schemas: `schema/animal/Animal.ts`, `schema/weight/WeightLog.ts`, `schema/care/CareEvent.ts`, `schema/health/HealthRecord.ts`, `schema/breeding/BreedingRecord.ts`, `schema/notes/Note.ts`, `schema/production/ProductionLog.ts` — none declare `userId`, and no `*_default()` or create method sets it.
CLAUDE.md rule 10 mandates `userId` on animal/care/health/breeding/production/note/weight docs. Its absence blocks any per-user attribution/audit and would break the field-level rule validation recommended in C2 (`userId == request.auth.uid`). Offspring animals created in `BreedingService.completeBirth` are likewise unattributed.
**Fix:** add `userId: string` to each schema/default and stamp it from the auth/user store on every create (including batch-created offspring).

### H7 — Withdrawal-period date math is off by up to a day (food-safety relevant)
`util/WithdrawalUtility.ts:20-22, 36-53` (via `util/DateUtility.ts:23-29`).
`addDays(dateAdministered, n)` carries the administration time-of-day, and `daysBetween(todayIso(), end)` uses date-fns `differenceInDays`, which **truncates the fractional day toward zero**. A medication given at 09:00 with a 7-day meat withdrawal, checked at 08:00 on the clear day, returns `0` and flips status to `CLEAR` while withdrawal genuinely remains — potentially marking an animal sellable/milkable a day early. The same `addDays`/`daysBetween` pattern is reused for gestation (`util/GestationUtility.ts`) and the "withdrawal ends" preview (`MedicationFields.tsx:125`, `DewormingFields.tsx:115`).
**Fix:** normalize both ends to start-of-day (`differenceInCalendarDays(startOfDay(parseISO(end)), startOfDay(new Date()))`) and treat withdrawal as ACTIVE through end-of-day (`>= 0`).

### H8 — Recurring care-event generation has no idempotency guard → duplicate/compounding writes
`feature/care/service/CareService.ts:82-118`, `feature/group/service/GroupService.ts:175-212`.
The "create next occurrence" guard reads `createdNextRecurringEvent` from an in-memory store snapshot and the write uses a blind `firestore().batch()`, not a transaction. Double-tapping "Mark Complete" (the button has no in-flight disable — `CareEventDetailController.ts:34`, `CareEventDetailScreen.tsx:141`), completing a medical event via both `CareEventDetailController.performComplete` and `CreateHealthRecordController.completeCareEvent` (`feature/health/screen/CreateHealthRecordController.ts:174-188`), or two devices completing the same event, each generate a fresh recurring child. Each child is itself recurring → unbounded duplication over time.
**Fix:** use `runTransaction`, re-read the event, and create the next occurrence only if stored `createdNextRecurringEvent`/`completedDate` is still false/null; disable the button while in flight; make one code path own medical-event completion.

### H9 — `completeBirth` writes an unbounded offspring batch (exceeds the 500-op limit, fails silently)
`feature/breeding/service/BreedingService.ts:88-133`; input at `BirthOutcomeForm.tsx:39-43`.
`for (i=0; i<outcome.bornAlive; i++)` adds one animal doc per offspring (plus the record update) to a single `batch()`, with `bornAlive` coming from an unbounded numeric `TextInput`. Entering e.g. `600` exceeds Firestore's 500-operation batch cap → `commit()` throws and **nothing** is written (no offspring, no status change), surfaced only as a generic alert. `bornAlive: 0` is also accepted, allowing a "completed" birth with zero offspring.
**Fix:** validate/cap `bornAlive` per species, require `bornAlive + stillborn > 0`, and chunk into ≤500-op batches.

---

## Medium findings

- **M1 — Silent mutation failures across many controllers.** Several controllers discard the returned `IResult` and `navigation.goBack()` unconditionally, so offline/permission failures look like success: `CreateWeightLogController.ts:44-46`, `component/ExportAnimalModalController.ts:49-58`, `NoteDetailController.ts:16-19`, care/group completion + delete (`CareEventDetailController.ts:52-57,89-95`; `GroupDetailController.ts:45-49`), `BreedingRecordDetailController.ts:25-28` (`failBreeding`), and `EditProfileController.ts:22-26`. Check `result.success` and alert on failure (siblings already do).
- **M2 — Queries run with an empty `homesteadId` (no guard).** `homesteadId` defaults to `''` (`store/homesteadStore.ts:17`) and is reset to `''` on logout; services build `collection(homestead).doc('')...` with no guard (`NoteService.ts:22-25`, `ProductionService.ts:30-33`, and `HomesteadService.updateLastActiveIfNeeded`/`createHomestead` empty-string path). A cold-start race or in-flight write after logout targets an invalid path. Guard every method: `if (!homesteadId) return`.
- **M3 — Unbounded, unpaginated realtime listeners that only grow.** Care (`CareService.ts:28-45`), group care (`GroupService.ts:43-62`), production (`ProductionService.ts:35-52`), and notes (`NoteService.ts:27-44`) `onSnapshot` the full collection with only `admin.deleted==false` — no `limit`/window. Completed care events are never excluded server-side, and recurring completion keeps adding docs (compounded by H8), so every device streams the entire history forever. Scope to active work and/or `limit()` + paginate.
- **M4 — Orphaned Storage blobs on edit and delete.** Editing an animal/note photo uploads to a new path without deleting the old object (`EditAnimalController.ts:87-92`; `NoteService` update), and `deleteAnimal` (`AnimalService.ts:81-152`) / `deleteNote` (`NoteService.ts:94-105`) soft-delete Firestore but never remove the Storage objects — unbounded cost and lingering PII images with still-valid download URLs. Delete old/owned objects (best-effort, try/catch).
- **M5 — `deleteAnimal` cascade reads are unbounded and skip the deleted filter.** `AnimalService.ts:98-108` queries six child collections by `animalId` without `admin.deleted==false`, re-batching already-deleted docs and reading an animal's entire history into memory. Add the filter (rule 9); consider a Cloud Function for large histories.
- **M6 — Recurring next-due date anchors to completion date, not due date.** `util/CareUtility.ts:28-31` computes `addDays(completedDate, cycle)`. Completing early/late permanently shifts the whole future fixed-cadence schedule (vaccines, deworming). Anchor on `event.dueDate` and advance in `cycle` steps until future.
- **M7 — Cloud Functions are N+1 read-amplified.** `dailyCareReminder.ts:33-44` (and the dead `onBreedingDue`/`onWithdrawalClear`) loop per-homestead, then per-member, issuing a separate `device_v2` `.get()` each — O(members) reads per homestead per run. Batch device reads or denormalize tokens.
- **M8 — `removeAnimalFromAllGroups` can exceed the 500-op batch limit.** `GroupService.ts:292-315` adds an update per matching group to one batch with no chunking; >500 groups → `commit()` throws and removal silently fails. Chunk, or query only groups containing the animal.
- **M9 — Group listener bookkeeping races leak `onSnapshot` subscriptions.** `store/groupStore.ts:33-77` rebuilds the `eventUnsubs`/`healthUnsubs` maps from `get()` inside async snapshot closures and writes them back, so interleaved snapshots can overwrite the maps with a stale copy, losing (never calling) an unsub fn. Use functional `set(state => …)` updates for the unsub maps.
- **M10 — `updateLastActiveIfNeeded` throttle key is device-global and survives logout.** `HomesteadService.ts:191-203` stores `lastActiveDate` in shared MMKV with no homestead/user namespace and never clears it on logout, so after switching accounts the same day the new homestead's `lastActiveAt` update is skipped. Namespace the key by homesteadId or clear it in `teardownApp`.
- **M11 — `addMember` keys the member doc by a random auto-ID, not the user's uid.** `HomesteadService.ts:121-128` uses `.doc()` while `createHomestead` (`:55`) and `getMemberRole` (`:154-167`) key by `userId`. Members added this way would never match `getMemberRole`'s `.doc(userId)` lookup (latent — `addMember` is currently unused). Key by `member.userId`.
- **M12 — Withdrawal detail shows only one withdrawal when both med and deworming are set.** `HealthRecordDetailController.ts:24-30` assigns a single `withdrawalStatus`; the deworming branch overwrites the medication branch, hiding an active meat/milk withdrawal (inconsistent with `getActiveWithdrawals`). Render all active withdrawals.
- **M13 — Withdrawal calc can render `NaN` on empty dates.** `WithdrawalUtility.ts:36-53` is called whenever `medicationWithdrawalDays > 0` without guarding that `record.date` is non-empty; `healthRecord_default()` sets `date: ''` and `validate()` never checks it (`CreateHealthRecordController.ts:83-101`). Guard empty dates and add `date` to validation.
- **M14 — Hidden `farm` tier maps to pro privileges.** `ISubscriptionService.ts:6` has `tierRank = { free:0, standard:1, pro:2, farm:2 }` though `farm` isn't in the `SubscriptionTier` union or `tiers` array — combined with C2's client-writable tier, `subscriptionOverride: 'farm'` is an undocumented escalation alias. Remove or formalize it.
- **M15 — No email verification anywhere.** No `sendEmailVerification`/`emailVerified` usage; `RegisterController`/`LinkAccountController` write the unverified, self-asserted email into `user_v2` and `member_v2`, which is later used as member identity (H1). Send verification and gate sensitive actions on `emailVerified`.
- **M16 — Weak/contradictory password policy.** Client-only `password.length < 6` (`RegisterController.ts:23`, `LinkAccountController.ts:27`) while error strings claim "at least 8" (`FirebaseAuth.ts:94,203`). Align to ≥8 and enforce via Firebase password policy.
- **M17 — No App Check.** No `appCheck` usage despite the messaging/Firestore surface; backends accept requests from any client. Enable App Check on Firestore/Functions/Storage.
- **M18 — Dead/duplicate code & UI inconsistencies.** `feature/home/component/ProductionSnapshotSection.tsx` is never rendered (the dashboard ships no production section); `packages/functions/src/index.ts:7-10` leaves three notification functions unexported and `onCareEventDue` duplicates `dailyCareReminder`; `HomeFullListScreen.tsx:57,69` omits the `completedDate === null` predicate the dashboard uses (`HomeController.ts:69`), so "View all" disagrees with the badge counts; unused `SectionHeader` imports (`OverdueCareSection.tsx:4`). Several `doc.exists` (property) checks (`CareService.ts:49-51`) should be `doc.exists()` on the modular RNFB API.

---

## Per-feature rollup

| Feature | Critical | High | Medium | Worst issue |
|---|---|---|---|---|
| Security rules (Firestore) | 1 | 1 | 1 | No field validation → paywall bypass + tampering (C2) |
| Security rules (Storage) | 1 | 0 | 0 | Cross-tenant read/write of all files (C1) |
| Cloud Functions | 0 | 2 | 2 | Broken indexes + dead token pipeline (H2/H3) |
| Account / Homestead / Auth | 0 | 3 | 5 | No account deletion; logout identity bleed (H4/H5) |
| Animal / Weight / Export | 0 | 1 | 4 | Missing `userId`; orphaned photos; client-only caps |
| Care / Group | 0 | 1 | 4 | Recurring-event duplication race (H8) |
| Health | 0 | 1 | 2 | Withdrawal date-math off-by-one (H7) |
| Breeding | 0 | 1 | 2 | Unbounded offspring batch (H9) |
| Production / Notes / Home | 0 | 0 | 5 | Orphaned note photos; unbounded listeners; dead dashboard code |
| Subscription | (C2) | 0 | 1 | Client-trusted tier (C2); `farm` alias (M14) |
| Customization | 0 | 0 | 0 | No findings beyond the cross-cutting `userId`/rules items |

**Per-feature notes** (reconciling the vertical pass with the concern-level findings above):
- **Firestore rules:** C2 (no validation), H1 (member self-join + unrevocable), and per-collection `delete: if false` (intentional soft-delete, but blocks account deletion — H4).
- **Storage rules:** C1 only — but it is the single highest-impact issue.
- **Cloud Functions:** H2 (indexes), H3 (dead push + unexported duplicates), M7 (N+1 reads). All four functions are non-functional today (3 unexported, 1 fails on index + empty tokens).
- **Account/Homestead/Auth:** H4 (deletion), H5 (logout bleed), plus auth-store stranding users with no homestead and `createHomestead` returning `''` on error then initializing with it (folded into M2); M10, M11, M15, M16.
- **Animal:** H6 (`userId`), M1/M4/M5; client-only animal-count cap (covered by C2's server-enforcement fix).
- **Care/Group:** H8 (race), M3 (unbounded listeners), M6 (date anchor), M8 (batch limit), M9 (listener leak), M1.
- **Health:** H7 (withdrawal math), M12 (both-withdrawal display), M13 (NaN on empty date); cross-service tie to CareService is well-formed.
- **Breeding:** H9 (offspring batch), plus no transactional guard on `completeBirth`/`failBreeding` (re-entry can double-create offspring) and inconsistent admin-timestamp handling — both under M1/M-class data-consistency.
- **Production/Notes/Home:** M1, M3, M4, M18 (dead `ProductionSnapshotSection`, dashboard/full-list filter mismatch), M2.
- **Customization:** no feature-specific findings; inherits the cross-cutting `userId` (H6) and rules (C2) gaps.

---

## Recommended fix order

**Block release until fixed:**
1. **C1 — Storage rules.** Replace `if request.auth != null` with a real membership/ownership check. This is live cross-tenant data exposure.
2. **C2 — Firestore field validation + server-side subscription.** Make `subscription*` fields client-read-only, write them from a RevenueCat webhook function, and validate payloads (`userId`, immutable `admin`). Enforce the animal cap server-side.
3. **H4 — Account deletion.** Required for store approval and PII compliance; needs the admin-SDK recursive-delete function.
4. **H6 — Add `userId` to all documents.** Prerequisite for C2's `userId == request.auth.uid` validation.

**Fix before notifications/multi-user are claimed as working:**
5. **H2 — Regenerate indexes** for `_v2` names + collection-group scope (unblocks history screens and the scheduled function).
6. **H3 — Implement FCM token registration** (or remove the dead push surface). Depends on H2 to be useful.
7. **H1 — Replace member self-join with an invite flow** and add a revoke path. Required before sharing a homestead is safe.
8. **H5 — Fix logout** to clear RevenueCat + analytics (depends on the C2 server-side subscription work to fully close the entitlement-bleed path).

**Correctness / data-integrity (fast follows):**
9. **H7** (withdrawal date math — food safety), **H8** (recurring-event transaction + button disable), **H9** (offspring batch cap).
10. **M1** sweep (check `IResult` everywhere), **M2** (empty-homesteadId guards), **M3** (bound listeners), **M4/M5** (Storage cleanup + cascade filters).
11. Remaining Mediums (M6–M18), including **M17 App Check** and the dead-code cleanup in **M18**.

---

### Coverage & caveats
- **Read in full:** both rule files (+ `.prod.v1` backups), `firestore.indexes.json`, `firebase.json`, all four Cloud Functions and `index.ts`, `@template/common` `Collections.ts`, `Bootstrap.ts`, `FirebaseAuth.ts`, `appInitializer.ts`, `HomesteadService.ts`, and a representative sample of every feature module's service/controller/screen.
- **Sampled (not every line):** UI components and per-screen `useEffect` hooks. Store-level listener lifecycle was verified (correct teardown in the animal/weight/care/health/breeding/production/note stores; the group store has the M9 race). The four-finding feature deep-dives (animal; care+group; health+breeding; production+notes+home; account/infra) were produced by parallel readers and reconciled against the rules/indexes/functions I read directly.
- **Not exercised at runtime:** all findings are from static reading. Index/rule behavior (H2, C2, H1) should be confirmed against the Firestore emulator or a staging deploy. The collection-group read in `getHomesteadsForUser` (`HomesteadService.ts:73-101`) also warrants an emulator check — collection-group queries require a `match /{path=**}/member_v2/{id}` rule, which the current path-scoped `member_v2` rule does not provide, so that lookup may be permission-denied in practice.
- **Out of scope:** the v1/production collections and rules (marked DO NOT MODIFY), native iOS/Android project config beyond what's referenced, and third-party SDK internals.
