# Tech Spec: Push-Notification Pipeline (FCM Token Registration)

## Summary
The app declares `@react-native-firebase/messaging` but never registers an FCM token or writes a `device_v2` doc, so every scheduled notification function sends to an empty token list and nothing is ever delivered. This spec adds device-token registration on the mobile side (request permission → `getToken` → write `device_v2/{token}` → `onTokenRefresh` → delete on logout/delete-account), wires the Settings toggle to it, and cleans up the dead/duplicate cloud functions so the pipeline works end-to-end.

## Current Behavior

**Mobile (sender of tokens) — missing entirely.**
- `@react-native-firebase/messaging@^24` is declared in `apps/mobile/package.json:20` but imported nowhere in `apps/mobile/src`.
- No code requests notification permission, calls `getToken`, registers `onTokenRefresh`, or writes a `device_v2` document.
- The Settings toggle `onToggleNotifications` (`apps/mobile/src/feature/profile/screen/SettingsController.ts:28-31`) only writes a boolean to MMKV — a local no-op with no FCM side effect.
- Login flow runs through `useAuthStore` (`apps/mobile/src/store/authStore.ts:11-26`) → `initializeApp(userId, hsId)` (`apps/mobile/src/store/appInitializer.ts:7-17`). No token work happens here.
- Logout runs through `ProfileController.onLogoutConfirm` (`apps/mobile/src/feature/profile/screen/ProfileController.ts:31-35`) and `SideMenuController.logout` (`apps/mobile/src/navigation/SideMenuController.ts:12-17`): both call `bsAuthService.signout()` + `teardownApp()`. No token cleanup.
- `deleteAuthAccount` exists (`AuthService.ts:49`, `FirebaseAuth.ts:153`) but has no UI caller and no token cleanup.

**Cloud functions (consumer of tokens).**
- `dailyCareReminder` (`packages/functions/src/scheduled/dailyCareReminder.ts`) is the only exported function (`packages/functions/src/index.ts:5`). It collection-group-queries due `careEvent_v2`, groups by homestead, then per homestead reads `member_v2`, then per member reads the `device_v2` subcollection and collects `tokenId` values. The token list is always empty, so `sendEachForMulticast` is always skipped.
- `onCareEventDue` (`packages/functions/src/notifications/onCareEventDue.ts`) is a byte-for-byte duplicate of `dailyCareReminder` and is **not exported** (`index.ts:8`, commented out).
- `onBreedingDue` and `onWithdrawalClear` are implemented but **not exported** (`index.ts:9-10`, commented out).
- Tokens are read at `user_v2/{uid}/device_v2/*.tokenId`; Firestore rules already allow owner read/write at `user_v2/{userId}/device_v2/{deviceId}` (`firebase-rule/firestore.rules:94-96`). No schema or rules work is needed for the path itself.

## Desired Behavior

1. On login/init, if the user has notifications enabled, request notification permission; if authorized, fetch the FCM token and upsert `user_v2/{uid}/device_v2/{token}`.
2. Register an `onTokenRefresh` listener (once per session) that upserts the new token doc and deletes the stale one.
3. On logout and on delete-account, delete the current device's token doc **before** auth state is torn down (rules require an authenticated owner to write).
4. The Settings toggle drives registration: ON → request permission + register; OFF → unregister the current device's token.
5. Cloud functions: export `dailyCareReminder`, `onBreedingDue`, `onWithdrawalClear`; delete the duplicate `onCareEventDue`. With tokens now present, multicasts fire.

## Schema Changes

New schema `apps/mobile/src/schema/device/Device.ts` (interface + `device_default()` only, per rule 18):
- `id: string` — the FCM token (also used as the Firestore doc ID)
- `admin: AdminObject` — Tstamp `created_at` / `updated_at` (rule 3)
- `schemaVersion: number` — `2`
- `userId: string` — owner uid (rule 10)
- `tokenId: string` — the FCM token; field name fixed by the functions that read `d.data().tokenId`
- `platform: string` — `'ios' | 'android'`

Doc ID = the FCM token. This makes refresh and logout idempotent (upsert/delete by token, no duplicate docs per device) and avoids a read to find an existing doc.

No collection enum change: `Col.device = 'device_v2'` already exists (`packages/common/src/Collections.ts:3`).

## Data Access Audit

**New mobile writes (the added path):**
- `registerDevice(userId)`: 1 native `getToken()` (not a DB read) + 1 Firestore `set` on `device_v2/{token}` (merge). No read first — token is the doc ID, so set-with-merge is an idempotent upsert.
- `onTokenRefresh`: 1 `set` (new token) + 1 `delete` (old token).
- `unregisterDevice`: 1 `delete`.
- Settings toggle: 1 `set` or 1 `delete`.

**Round trips on critical paths:** App load / screen open add **zero** Firestore reads. Registration is a single write fired off the login init path (`initializeApp`), not blocking render. No N+1 introduced on the client.

**N+1 in the consuming functions (pre-existing, addressed here):** Each scheduled function reads `member_v2` per homestead, then the `device_v2` subcollection **once per member** — O(members) reads per notified homestead. Decision: **do not denormalize tokens onto member docs.** Tokens refresh relatively often (every refresh would write the member doc, with write amplification and a device→member coupling), while these functions read at most once per day per homestead. Denormalizing trades a cheap once-daily read for frequent writes — a net loss. Instead, parallelize the per-member device reads within a homestead with `Promise.all` to collapse them into one round-trip wave. Fan-out stays bounded by the number of members in homesteads that actually have due items, which is small and acceptable for MVP.

**Data locality:** Tokens live in `device_v2` under the owning user, exactly where both the owner (write) and the scheduled functions (read, via known uid) need them. No cross-collection denormalization warranted.

## Touch Points

**Schema**
- `apps/mobile/src/schema/device/Device.ts` — new: `Device` interface + `device_default()`.

**Service (only layer allowed to import `@react-native-firebase/messaging`, rule 7)**
- `apps/mobile/src/feature/notification/service/INotificationService.ts` — new interface: `registerDevice(userId)`, `unregisterDevice(userId)`, `startTokenRefreshListener(userId)`, `requestPermission(): Promise<boolean>`. Mutations return `Promise<IResult>` (rule 16).
- `apps/mobile/src/feature/notification/service/NotificationService.ts` — new: wraps `messaging()` permission + `getToken` + `onTokenRefresh`; writes/deletes `device_v2/{token}` via `firestore()`.
- `apps/mobile/src/Bootstrap.ts` — instantiate and export `bsNotificationService` (rule 17).

**Wiring (controllers/stores never import Firebase, rule 8 — they call `bsNotificationService`)**
- `apps/mobile/src/store/appInitializer.ts` — in `initializeApp`, call `bsNotificationService.registerDevice(userId)` (gated on the persisted notifications-enabled pref) and `startTokenRefreshListener(userId)`.
- `apps/mobile/src/feature/profile/screen/ProfileController.ts` — `onLogoutConfirm`: `await bsNotificationService.unregisterDevice(userId)` **before** `bsAuthService.signout()`.
- `apps/mobile/src/navigation/SideMenuController.ts` — same pre-signout unregister.
- `apps/mobile/src/feature/profile/screen/SettingsController.ts` — `onToggleNotifications(true)` requests permission + registers; `(false)` unregisters; keep the MMKV pref write.
- Delete-account flow (wherever `bsAuthService.deleteAuthAccount()` is eventually called) — unregister before delete.

**Native config (required for token issuance)**
- iOS: enable Push Notifications + Background Modes (remote notifications) capability; APNs key in Firebase. Android 13+: `POST_NOTIFICATIONS` runtime permission requested via `messaging().requestPermission()` / permissions API.

**Cloud functions**
- `packages/functions/src/index.ts` — export `dailyCareReminder`, `onBreedingDue`, `onWithdrawalClear`.
- `packages/functions/src/notifications/onCareEventDue.ts` — delete (duplicate of `dailyCareReminder`).
- `onBreedingDue.ts` / `onWithdrawalClear.ts` / `dailyCareReminder.ts` — wrap the per-member `device_v2` reads in `Promise.all`.

## Data Migration
None. Tokens are registered lazily as existing users open the app post-update (registration fires on the next login/init). No backfill script. Pre-existing `device_v2` docs do not exist, so there is nothing to migrate.

## Risk
- **Tokens not deleted on logout** if unregister runs after `signout()` — the write is rejected by rules (`isOwner` fails). Order matters: unregister must complete before `signout()`. A stale token left behind is self-healing: `sendEachForMulticast` returns `messaging/registration-token-not-registered` for it and it is simply skipped; add cleanup of such tokens in the functions to keep the collection from growing.
- **Permission denied / simulator without APNs** yields no token; `registerDevice` must no-op gracefully (return success-with-no-token, not an error that blocks login).
- **Duplicate-device accumulation** is prevented by using the token as the doc ID (upsert), but a device whose token rotates while the app is offline can leave one stale doc until the next invalid-token cleanup.
- **Multi-member fan-out** notifies every member of a homestead with due items; this is the intended behavior but confirm it is desired before shipping (no per-member mute beyond the global toggle in MVP).
