# Account Deletion Flow

## Summary
Add an in-app "Delete Account" flow that permanently removes a user's auth record, their Firestore documents, and their Storage files. Deletion runs in a re-auth-gated callable Cloud Function using the Admin SDK, because security rules set `delete: if false` on every `*_v2` collection and the client cannot delete this data. This closes audit finding H4 and satisfies App Store Guideline 5.1.1(v).

## Current Behavior
- No "Delete Account" UI exists. `SettingsScreen.tsx` has only notifications/units/app-info; `ProfileController.ts:31-35` exposes logout only.
- `AuthService.deleteAuthAccount()` (`core/service/auth/AuthService.ts:49-51`) → `FirebaseAuth.deleteAuthAccount()` (`library/cloudplatform/firebase/FirebaseAuth.ts:153-155`) calls `currentUser.delete()` and is referenced nowhere (dead code).
- Even if wired, `currentUser.delete()`:
  - throws `auth/requires-recent-login` for any non-fresh session (the existing `reauthenticate()` at `AuthService.ts:53-55` is never called), and
  - deletes only the Firebase Auth record — leaving `user_v2/{uid}`, the `homestead_v2/{homesteadId}` doc, its `member_v2/{uid}` entry, and every animal/care/health/breeding/note/weight/production subcollection orphaned, plus Storage prefixes `user/{uid}/...` and `homestead/{homesteadId}/...`.
- `delete: if false` on every collection (`firebase-rule/firestore.rules`) means the client is structurally unable to delete any of this — server-side Admin SDK is required.

## Desired Behavior
1. User opens Settings → taps **Delete Account** → confirmation screen.
2. **Identity confirmation (re-auth):**
   - Email/password user: must re-enter password; client calls `bsAuthService.reauthenticate(email, password)` to confirm identity before proceeding.
   - Anonymous user: no credential exists, so require a typed `DELETE` confirmation instead.
3. Client invokes the callable `deleteAccount` (no arguments). The function trusts `context.auth.uid` only — never a client-supplied id.
4. The function, using the Admin SDK (bypasses rules):
   - Finds every homestead the user belongs to via `collectionGroup(member_v2).where('userId','==',uid)`.
   - For each homestead, applies the **ownership policy** (below).
   - Deletes `user_v2/{uid}` (recursive, includes `device_v2`) and the `user/{uid}/` Storage prefix.
   - Deletes the Firebase Auth user via `getAuth().deleteUser(uid)` **last**.
5. On success the client calls `bsAuthService.signout()` + `teardownApp()` and routes to the auth screen.

**Ownership policy** (per homestead the user is a member of):
- **Sole member** → `recursiveDelete(homestead_v2/{id})` (removes the doc and all subcollections) + delete `homestead/{id}/` Storage prefix.
- **Other members exist, user is not owner** → delete only that user's `member_v2/{uid}` doc; homestead and data remain.
- **Other members exist, user is owner** → transfer `role: 'owner'` to the earliest-joined remaining member (by `admin.created_at`), then delete the leaving user's `member_v2/{uid}` doc.

In the current MVP, sharing/invites are not shipped (H1: `addMember` is unused), so the sole-member full-deletion path is the only one exercised in practice; the other two branches are defensive for the multi-member schema.

## Schema Changes
None. No new fields or collections. (Auth deletion via Admin SDK avoids any `deletionRequested` status flag or async queue.)

## Data Access Audit

This flow runs entirely inside a Cloud Function, off the app's interactive critical path.

- **Client critical path round trips:** exactly **2** — one `reauthenticate` auth call, one `deleteAccount` callable. Anonymous users: **1** (callable only). No Firestore reads on the client for this flow.
- **Function reads:**
  - 1 `collectionGroup(member_v2)` query to resolve the user's homesteads.
  - Per resolved homestead: 1 read of its `member_v2` collection to get the member count/owner. This is a fan-out bounded by *homesteads-per-user*, which is 1 in the MVP (each user owns one homestead; sharing not shipped). Not an unbounded N+1 — it cannot grow with homestead size, only with how many homesteads a single user has joined.
  - `recursiveDelete` performs its own server-side paginated reads of subcollections; this is internal to the Admin SDK, batched, and not on any user-facing path.
- **Data locality:** the function reads membership from the `member_v2` collection-group, which is the canonical place that maps users→homesteads. No data is read from a worse location than where it lives.
- **Write-vs-read tradeoff:** N/A — this is a one-shot destructive operation, not a hot read path; denormalization does not apply.

**Idempotency / ordering:** delete data and Storage first, Auth record last. `recursiveDelete` and Storage prefix deletion are idempotent (already-deleted = no-op), so a failure after partial deletion is safe to retry; the client only signs out on a success response. Deleting Auth last guarantees that if data deletion fails, the user can still re-authenticate and retry (avoids the orphaned-auth-with-no-data dead end).

## Touch Points

**Cloud Functions**
- `packages/functions/src/account/deleteAccount.ts` (new) — `onCall` callable: resolves memberships, applies ownership policy, `recursiveDelete` user + sole-owned homesteads, deletes Storage prefixes (`getStorage().bucket().deleteFiles({ prefix })`), then `getAuth().deleteUser(uid)`. Rejects if `context.auth` is null.
- `packages/functions/src/index.ts` — export `deleteAccount`.

**Client service**
- `core/service/auth/IAuthService.ts` / `AuthService.ts` — replace dead `deleteAuthAccount()` with `deleteAccount(): Promise<IResult>` that invokes the callable via `@react-native-firebase/functions` (already a dependency). Keep `reauthenticate()` (now actually used).
- `library/cloudplatform/firebase/FirebaseAuth.ts` — remove the unused `deleteAuthAccount()` (client-side `currentUser.delete()` is no longer the deletion mechanism).

**UI**
- `feature/profile/screen/SettingsScreen.tsx` — add a destructive "Delete Account" row that navigates to the new screen.
- `feature/profile/screen/DeleteAccountScreen.tsx` + `DeleteAccountController.ts` (new) — password input (email users) or typed-`DELETE` confirm (anonymous); calls `reauthenticate` then `deleteAccount`; on success `signout()` + `teardownApp()`; surfaces errors instead of silently navigating.
- `navigation/RootNavigation.tsx` — register the `DeleteAccount` route.

## Data Migration
None. Lazy by nature — deletion only touches the account being deleted. No backfill or migration script. Already-orphaned data from any prior partial deletion is not auto-reclaimed by this change (out of scope; would need a one-off cleanup pass if such records exist).

## Risk
- **Callable timeout on large homesteads.** `recursiveDelete` over many subcollection docs could exceed the function timeout for a heavy account. Set a generous timeout (e.g. 300s) and memory; for MVP data volumes this is sufficient. If accounts grow large, move to a batched/queued deletion — not needed now.
- **Partial failure leaving orphaned data.** Mitigated by ordering (Auth deleted last) + idempotent retry. The client must treat a non-success response as "not deleted" and let the user retry; do not sign out until success.
- **Wrong-tenant deletion.** Mitigated by trusting only `context.auth.uid` server-side and never a client-passed id. Ownership transfer must select a *remaining* member, not the leaving user.
- **App Store compliance gap until shipped.** Until this lands, the app has no deletion path and risks 5.1.1(v) rejection — this is the blocking reason to prioritize it.
- **Anonymous re-auth.** Anonymous users cannot password-re-auth; the typed-`DELETE` gate is the substitute. Acceptable because the Admin SDK performs the actual auth deletion (no `requires-recent-login` dependency).
