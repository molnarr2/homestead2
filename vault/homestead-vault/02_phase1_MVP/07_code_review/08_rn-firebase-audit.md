# RN + Firebase Audit: Homestead

A current two-pass review (horizontal-by-concern, vertical-by-feature) of the Homestead monorepo — `apps/mobile/src`, Cloud Functions (`packages/functions`), security rules (`firebase-rule/`), and `@template/common` — focused on what is **still exploitable today**. This report **reconciles against the prior `06_rn-firebase-audit.md` (Jun 2)**: it confirms which findings survive in the current tree (after the `iOS release 2.0.0`, push-notification, account-deletion, and v1→v2 migration commits), marks what has been fixed, and downgrades what has been mitigated. v1 (`workevent`/`user/...`) production rules are out of scope per their "DO NOT MODIFY" markers.

## Summary

| Severity | Count | Area |
|---|---|---|
| Critical | 1 | Firestore rules (no field validation → paywall bypass + cross-field tampering) |
| High | 4 | Storage cross-tenant file access (impact High; likelihood limited today by unguessable IDs); member self-join + unrevocable membership; `userId` missing from all 7 entity docs (rule 10); unbounded/unpaginated realtime listeners |
| Medium | 4 | Incomplete index coverage for `_v2`; no App Check; broken+dead `addMember`/role system; unbounded daily function scans |

**Headline:** The Critical hole from the Jun 2 audit is **unchanged and exploitable now** — any homestead member can grant themselves the paid tier (and tamper with any field) because the rules do zero `request.resource.data` validation. The Storage cross-tenant hole (prior C1) is also unchanged, but is **re-rated High**: its impact is severe, yet IDs are not enumerable and are never surfaced to other users in-app, so untargeted exploitation isn't practical today — see H1 for the residual risk. **Fixed since Jun 2:** the push-notification pipeline is now implemented end-to-end, account deletion is a real authenticated Cloud Function, and the Cloud Functions' collection-group queries now have matching `_v2` indexes.

---

## Critical findings

### C1 — Firestore rules do no field validation → free paywall bypass + arbitrary field tampering
`firebase-rule/firestore.rules:99-209` (every `*_v2` create/update is `if isHomesteadMember(...)`), read path `feature/subscription/service/ISubscriptionService.ts:11`, write path `HomesteadService.updateHomesteadSubscription:179-189` and `createHomestead:49-50`.
**What's wrong:** no rule constrains *which* fields change or their types. The effective subscription tier is derived purely from `homestead.subscriptionRevenuecat` / `homestead.subscriptionOverride` on the client-writable homestead doc (`tierRank[homestead.subscriptionOverride]`, `ISubscriptionService.ts:11`). RevenueCat entitlement is never re-verified server-side.
- **Paywall bypass:** any member writes `subscriptionOverride: '<top tier>'` to their homestead doc and unlocks paid features for free. `updateHomesteadSubscription` already proves the client writes this field.
- **Tampering:** any member can set `admin.deleted`, rewrite `admin.created_at`, or corrupt any field on any animal/care/health/breeding/note/production doc in the homestead, because the payload is never validated.
**Fix:** add field-level validation to every `*_v2` rule (immutable `admin.created_at`; type checks; on create require `userId == request.auth.uid` once C/H — `userId` — is added). Make `subscriptionRevenuecat`/`subscriptionOverride` **read-only to clients**, written only by a RevenueCat-webhook Cloud Function. Enforce tier limits server-side, not just in controllers.

---

## High findings

### H1 — Storage rules grant every authenticated user read/write to every homestead's files
`firebase-rule/storage.rules:25-28`
```
match /homestead/{homesteadId}/{allPaths=**} {
  allow read:  if request.auth != null;
  allow write: if request.auth != null;
}
```
**What's wrong:** the only check is "is signed in" — no homestead-membership check, no file size/content-type validation. Animal and note photos live at `homestead/{homesteadId}/...`, so a holder of another tenant's ID can download, overwrite, or delete that tenant's images, or dump arbitrary/large files into the prefix (cost + vandalism). Firestore gates the equivalent docs behind `isHomesteadMember`; Storage does not.
**Severity — High, not Critical (re-rated):** impact is severe (full cross-tenant file read/write/delete), but the `homesteadId` is a non-enumerable 20-char auto-ID and is **never surfaced to other users in-app** — `getHomesteadsForUser` returns only the caller's own homesteads, all Firestore reads are membership-gated, and Storage can't be listed at the root (catch-all denies it). So untargeted/mass exploitation isn't practical today. The residual risk is (a) **targeted** attacks where an ID leaks out-of-band (crash/analytics logs, network capture, support screenshots), and (b) it escalates back to Critical the moment homestead **sharing** ships — members then legitimately learn IDs, and a *removed* member keeps file access forever because there is no membership check here. The control is security-through-obscurity, not authorization.
**Trigger (targeted):** obtain one victim `homesteadId` → `storage().ref('homestead/<id>/...').getDownloadURL()` / `.putFile(...)`.
**Fix (one rule block):** verify membership via cross-service `firestore.get()/exists()` in the Storage rule, or front media through a Cloud Function / signed URLs, and add content-type + size limits. This must not stay `if request.auth != null`.

### H2 — Anyone who learns a `homesteadId` can self-join, and membership can never be revoked
`firebase-rule/firestore.rules:107` (`member_v2` create: `... || request.auth.uid == memberId`), `:109` (`delete: if false`), `:16-18` (`isHomesteadMember` checks only `exists()`).
Member create allows `request.auth.uid == memberId`, so any authenticated user can write `homestead_v2/{X}/member_v2/{ownUid}` and instantly gain full read/write to all of homestead X's animals, health, breeding, notes, production — then escalate to `owner` via the unconstrained member `update` rule (C1). Two compounding problems make this permanent: (1) `delete: if false` means a member doc can never be removed from the client; (2) `isHomesteadMember` tests only document *existence* and **ignores `admin.deleted`**, so even a soft-deleted/"removed" member keeps full access. `homesteadId` isn't brute-forceable (20-char auto-ID) but isn't secret either.
**Fix:** drop the `request.auth.uid == memberId` self-add; require an owner-created invite record as a precondition for `member_v2` create; gate `isHomesteadMember` on `... .data.admin.deleted == false`; add an admin-controlled revoke path instead of `delete: if false`.

### H3 — `userId` is missing from all seven entity documents (violates project rule 10)
`schema/animal/Animal.ts`, `schema/care/CareEvent.ts`, `schema/health/HealthRecord.ts`, `schema/breeding/BreedingRecord.ts`, `schema/notes/Note.ts`, `schema/production/ProductionLog.ts`, `schema/weight/WeightLog.ts` — **zero** `userId` field in any of them (verified by grep).
CLAUDE rule 10 requires `userId` on animal, care, health, breeding, production, note, and weight docs. It is absent everywhere (only `HomesteadMember` carries `userId`). Consequences: no per-user attribution of who created/changed a record inside a shared homestead, and no way to write the per-user ownership check that C1's fix depends on. Carried over from prior H6 — still unfixed.
**Fix:** add `userId` to each entity interface + `_default()`, set it on create, and validate `userId == request.auth.uid` in rules.

### H4 — Unbounded, unpaginated realtime listeners that only grow
`feature/care/service/CareService.ts:28-45`, `feature/animal/service/AnimalService.ts:27-41`, plus health/breeding/notes/production/weight services; **0 of 35** Firestore queries use `.limit()` (verified).
Every list subscription `onSnapshot`s the entire collection filtered only by `admin.deleted == false`. `subscribeCareEvents` does **not** exclude completed events, and care events accumulate via recurring generation and are soft-deleted (never removed), so each device streams the full, ever-growing history on every launch. Read cost and client memory grow without bound per homestead.
**Fix:** scope hot listeners to active/recent windows (e.g. incomplete care, last-N or date-bounded) and add `.limit()` + pagination for history screens.

---

## Medium findings

- **M1 — `_v2` composite-index coverage is incomplete (partial fix of prior H2).** `firebase-rule/firestore.indexes.json` now has `COLLECTION_GROUP` indexes for `careEvent_v2`, `healthRecord_v2`, `breedingRecord_v2` — so the three scheduled functions no longer fail. But 12 legacy `COLLECTION`-scoped entries for pre-`_v2` names (`animal`, `careEvent`, `note`, `productionLog`, `weightLog`, …) are dead, and there are **no `_v2` composite indexes for client order/range queries** on `note_v2`, `productionLog_v2`, `weightLog_v2`, or `animal_v2`. Any client query that needs one still errors and the service swallows it (`return []`), showing empty history with no error. Regenerate against `_v2` names; drop the stale entries.

- **M2 — No App Check.** No `appCheck` usage anywhere (verified). With the Firestore/Storage/Functions surface and the scriptable C1/H1/H2 holes, the backend accepts requests from any client holding the (public) Firebase config. Enable App Check on Firestore, Functions, and Storage.

- **M3 — Multi-member/invite feature is broken and dead code.** `HomesteadService.addMember:121-134` writes the member doc with an auto-ID (`.doc()`), but `isHomesteadMember` and `deleteAccount` both assume the member doc ID **equals the user's uid** (as `createHomestead:55` does). So a member added via `addMember` would never pass `isHomesteadMember`. `addMember` is also **never called** (verified), and the `manager`/`caretaker`/`viewer` roles in `HomesteadMember` are unused. Collaboration is effectively unbuilt — either finish it (uid-keyed member docs + invite flow per H2) or remove the dead surface.

- **M4 — Daily functions do unbounded collection-group scans.** `onWithdrawalClear.ts:14-18` reads **every** `healthRecord_v2` with `withdrawalPeriodDays > 0` (no date bound in the query) and filters by date in memory; `dailyCareReminder`/`onBreedingDue` similarly scan growing collection groups daily. Fine at current scale, but read volume grows with total history. Add date bounds to the queries.

---

## Per-feature rollup

| Feature | Critical | High | Medium | Worst issue |
|---|---|---|---|---|
| Firestore rules | 1 (C1) | 1 (H2) | — | No field validation → paywall bypass + tampering |
| Storage rules | — | 1 (H1) | — | Cross-tenant read/write of all files (likelihood-limited) |
| Homestead / membership | — | 1 (H2) | 1 (M3) | Self-join + unrevocable membership |
| Subscription | (C1) | — | — | Client-writable tier (paywall bypass) |
| Animal / Care / Health / Breeding / Notes / Production / Weight | — | 2 (H3, H4) | (M1) | Missing `userId`; unbounded listeners |
| Cloud Functions | — | — | 2 (M1, M4) | Unbounded daily collection-group scans |
| Platform / config | — | — | 1 (M2) | No App Check |

**Per-feature notes**
- **Firestore/Storage rules:** C1, H1, H2 — all unchanged since Jun 2 and live in `firestore.rules` / `storage.rules`.
- **Homestead:** `createHomestead` correctly keys the owner member doc by uid; `addMember` does not (M3). `subscribeHomestead` listener is fine.
- **Entity features:** all share H3 (no `userId`) and H4 (unbounded listeners). Stores correctly tear down listeners on `clear()`/logout (`teardown()` is invoked in every `clear()` — no leak; prior concern resolved).
- **Cloud Functions:** `deleteAccount` is authenticated and does a proper recursive Firestore + Storage cleanup; notification senders handle stale-token pruning. Cost-scaling (M4) is the main residual.

## What was fixed since the Jun 2 audit (`06_`)
- **H3 (push pipeline) — FIXED.** `NotificationService` now requests permission, calls `messaging().getToken()`, writes `device_v2` docs (`tokenId`), prunes stale tokens, and handles `onTokenRefresh`; `appInitializer` calls `registerDevice` + `startTokenRefreshListener`.
- **H4 (account deletion) — FIXED.** `deleteAccount` is a real authenticated callable that reassigns/deletes membership, recursively deletes user data, removes Storage prefixes, and deletes the Auth user; wired through `AuthService.deleteAccount`.
- **H2 (indexes) — PARTIALLY FIXED → M1.** Function-side `_v2` collection-group indexes now exist; client-side `_v2` composites remain incomplete.

## Recommended fix order (before shipping)
1. **C1 — Field validation + server-authoritative subscription.** Lock `subscription*` to a webhook function; add payload validation. The only live Critical — stops the paywall bypass and field tampering.
2. **H1 — Storage membership check.** One rule block; closes cross-tenant file access (and pre-empts the escalation to Critical once sharing ships). Cheap, do it alongside C1.
3. **H2 — Replace self-join with an invite flow**, gate `isHomesteadMember` on `admin.deleted == false`, add a revoke path. Required before homestead sharing is safe. (Depends partly on H3's `userId`.)
4. **H3 — Add `userId` to all entity docs** and enforce on create — unblocks per-user rules used by C1/H2.
5. **H4 — Bound the hot listeners** (`.limit()` + active-window scoping), starting with care events.
6. **M1 → M4** — regenerate `_v2` indexes, enable App Check, finish-or-remove the member/role dead code, date-bound the daily scans.

### Coverage & caveats
- Static read only; no emulator/runtime verification. Rule behavior (C1, H1, H2) and `_v2` index gaps (M1) should be confirmed against the Firestore emulator or staging before relying on a fix.
- I re-verified the prior audit's two Criticals, H1–H4, the index state, `userId` presence, the push pipeline, and listener teardown directly against the current tree. I did **not** re-verify every Medium from `06_` (e.g. recurring-event idempotency H8, withdrawal date math H7, batch-limit M8); treat those as still-open unless a later commit addressed them.
