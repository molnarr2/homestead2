# V1-to-V2 User Migration

## Summary

When a v1 user logs in, they have a Firebase Auth account and a document in the `user` collection but nothing in `user_v2`. The app currently gets stuck on the loading screen because `authStore.ts:17` returns early when `getUser` returns null. This spec adds a v1 detection path that shows a transition screen, then funnels the user through normal onboarding to create `user_v2` and `homestead_v2` records.

## Current Behavior

1. User signs in via `LoginController.ts` → calls `bsAuthService.signin(email, password)`.
2. Firebase triggers `onAuthStateChanged` → `authStore.ts:11` fires with `loggedIn = true`.
3. `authStore.ts:16` calls `bsUserService.getUser(userId)` which queries the `user_v2` collection (`Collections.ts:2`).
4. For a v1 user, no `user_v2` doc exists → `getUser` returns `null`.
5. `authStore.ts:17`: `if (!user) return` — the app never calls `initializeApp`, so `homesteadId` stays empty and `homestead` stays null.
6. `RootNavigation.tsx:125`: `showLoading` stays `true` → user is stuck on `LoadingScreen` forever.

## Desired Behavior

1. User signs in → Firebase Auth succeeds (same Firebase project, same Auth).
2. `authStore` fetches `user_v2` → null.
3. `authStore` checks the v1 `user` collection → doc exists.
4. `authStore` sets `migrationUser` on the auth store with the v1 user data (firstName, lastName, email).
5. `RootNavigation` detects `migrationUser` is set → renders `V1TransitionScreen`.
6. User reads the transition message, taps "Continue".
7. Transition screen runs the same creation logic as `RegisterController`:
   - Creates `user_v2` doc with firstName, lastName, email from the v1 user.
   - Creates `homestead_v2` doc via `bsHomesteadService.createHomestead()`.
   - Sets `activeHomesteadId` on the new `user_v2`.
   - Calls `initializeApp(userId, homesteadId)`.
   - Clears `migrationUser` from the store.
8. `homestead.onboardingComplete` is `false` → RootNavigation routes to `SpeciesSelectionScreen`.
9. Normal onboarding from here.

## Schema Changes

None. The v1 `user` collection is read-only (one-time read to pull name/email). New `user_v2` and `homestead_v2` docs use the existing schemas unchanged.

## Data Access Audit

- **Round trip count on the critical path (login)**: Currently 1 read (`user_v2`). For v1 users, this becomes 2 reads: 1 miss on `user_v2` + 1 hit on `user` (v1). This only happens once per v1 user — after migration, the `user_v2` doc exists and the normal 1-read path resumes.
- **N+1 / fan-out queries**: None. The v1 check is a single `doc(userId).get()` — not a collection query.
- **Data locality**: The v1 user doc contains firstName, lastName, email at the top level — no subcollection traversal needed.
- **Write-vs-read tradeoff**: Not applicable. This is a one-time migration path. After the `user_v2` doc is created, the v1 check never runs again.

## Touch Points

### Service layer

- `apps/mobile/src/feature/user/service/UserService.ts` — Add `getV1User(userId)` method that reads from the hardcoded `user` collection (not `Col.user`). Returns `{firstName, lastName, email} | null`.
- `apps/mobile/src/feature/user/service/IUserService.ts` — Add `getV1User` to the interface.

### Store layer

- `apps/mobile/src/store/authStore.ts` — Add `migrationUser: {firstName: string, lastName: string, email: string} | null` to state. After the `getUser` null check on line 17, call `getV1User`. If found, set `migrationUser` and return (do not call `initializeApp`). Add `clearMigration()` action.

### Navigation

- `apps/mobile/src/navigation/RootNavigation.tsx` — Add a new gate between the `isLoggedIn === false` check and the `onboardingComplete === false` check. When `migrationUser` is set (and `homesteadId` is empty), render `V1TransitionScreen`. Add to `RootStackParamList`.

### New screen

- `apps/mobile/src/feature/auth/screen/V1TransitionScreen.tsx` — Pure UI. Centered layout with a message about the app rework and a "Continue" button.
- `apps/mobile/src/feature/auth/screen/V1TransitionController.ts` — Hook that runs the migration on "Continue": creates `user_v2`, creates `homestead_v2`, sets `activeHomesteadId`, calls `initializeApp`, clears `migrationUser`.

## V1 Transition Screen Content

Title: "Welcome to the New Homestead"

Body: "We've rebuilt Homestead from the ground up to give you a more complete experience. Your animals will need to be re-entered — we're sorry for the inconvenience, but we think you'll love what's new. Give it a try!"

Button: "Continue"

## Data Migration

Lazy, one-time, client-side. No migration scripts. No backfill jobs.

When a v1 user logs in:
1. Read v1 `user` doc → extract firstName, lastName, email.
2. Create new `user_v2` and `homestead_v2` docs using the same logic as registration.
3. The v1 `user` doc is left untouched — no writes to v1 collections.
4. v1 animal/care/health data is not migrated. Users re-enter their animals.

## Risk

- **Stuck state if migration fails mid-way**: If `user_v2` creation succeeds but `homestead_v2` fails, the user will have a `user_v2` with no `activeHomesteadId`. On next login, `authStore` will find the `user_v2` doc, see empty `activeHomesteadId`, and not call `initializeApp` — stuck on loading again. Mitigation: the `authStore` already needs to handle `activeHomesteadId === ''` for the normal flow. Add a check: if `user_v2` exists but `activeHomesteadId` is empty, treat it like a fresh migration (show transition screen, create homestead only).
- **Anonymous v1 users**: If a v1 anonymous user's session is still valid, they'll hit this path too. The v1 user doc will have `anonymous: true` and no name/email. The migration should carry `anonymous: true` forward so `CreateAccountPromptModal` still works.
- **Race with authStore subscription**: The `authStore` subscription fires synchronously on login. The v1 check adds an async read. Between setting `isLoggedIn = true` and setting `migrationUser`, `RootNavigation` briefly sees `isLoggedIn = true` + `homesteadId = ''` → `showLoading = true` → `LoadingScreen`. This is fine — it's the same loading screen the user already sees during normal login. Once `migrationUser` is set, the loading condition must also account for migration: `showLoading` should be false when `migrationUser` is set.
