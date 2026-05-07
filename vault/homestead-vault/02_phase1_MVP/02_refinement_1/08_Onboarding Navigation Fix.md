# Onboarding Navigation Fix

## Summary

Move the onboarding-complete flag from the User document to the Homestead document and use it to conditionally render the SpeciesSelection screen in the navigator. This eliminates the race condition where `RegisterController` navigates to `SpeciesSelection` before the auth state has flipped the navigator to the main stack.

## Current Behavior

`RootNavigation.tsx:102-143` uses conditional rendering based on `isLoggedIn` from `authStore`:

- `isLoggedIn === false` mounts Login + Register only (lines 105-109)
- `isLoggedIn === true` mounts SpeciesSelection + all main screens (lines 110-143)

After `createAccount()` resolves in `RegisterController.ts:35`, the Firebase auth observer fires asynchronously in `authStore.ts:13`. The controller continues through lines 42-49 and calls `navigation.navigate('SpeciesSelection')` while the navigator still only has auth screens mounted. The screen does not exist yet, causing the error.

There is a secondary race: even after `isLoggedIn` flips to `true`, `RootNavigation.tsx:98` shows LoadingScreen while `homesteadId` is still empty, so the main stack may still not be mounted.

The onboarding flag currently lives on the User document (`User.ts:12`, `onboardingComplete: boolean`) and is written by `AnimalTypeService.seedStarterPlaybooks` (line 267-269) and `skipOnboarding` (line 282). Nothing in the app reads this flag to gate navigation.

## Desired Behavior

1. The Homestead document carries `onboardingComplete: boolean` as the single source of truth.
2. `homesteadStore` exposes this field from its real-time subscription — no extra reads needed.
3. `RootNavigation` checks `homestead.onboardingComplete` when the user is logged in. If `false`, it renders SpeciesSelection as the initial screen in the main stack.
4. `RegisterController` removes the manual `navigation.navigate('SpeciesSelection')` call entirely. After account/homestead creation, the auth state settles, the homestead subscription loads the doc with `onboardingComplete: false`, and React Navigation conditionally renders SpeciesSelection.
5. After the user completes or skips species selection, the Homestead document is updated to `onboardingComplete: true`. The real-time subscription fires, `homesteadStore` updates, and the navigator re-renders — replacing SpeciesSelection with DrawerMain automatically.

Data flow on registration:

```
createAccount() → auth observer fires → isLoggedIn = true
→ authStore loads user → gets activeHomesteadId → homesteadStore.setHomestead()
→ real-time subscription delivers Homestead { onboardingComplete: false }
→ RootNavigation renders SpeciesSelection as initial route
→ user completes/skips → Homestead.onboardingComplete = true written
→ subscription fires → navigator re-renders → DrawerMain shown
```

## Schema Changes

**Homestead** (`schema/homestead/Homestead.ts`)

- Add: `onboardingComplete: boolean` (default `false`)

**User** (`schema/user/User.ts`)

- Remove: `onboardingComplete: boolean`
- Keep: `selectedSpecies: string[]` (still useful for analytics/profile)

## Data Access Audit

- **Round trip count**: Zero additional reads. The homestead doc is already loaded via a real-time `onSnapshot` subscription in `homesteadStore.setHomestead()` (line 29). The new field arrives for free on that existing listener.
- **N+1 / fan-out**: None. No new queries introduced.
- **Data locality**: The flag lives on the Homestead document, which is the document that `homesteadStore` already subscribes to and that `RootNavigation` already depends on via `homesteadId`. This is the closest possible location to the consumer.
- **Write-vs-read tradeoff**: The flag is written once (onboarding complete) and read on every app launch. A single field on an already-subscribed document is optimal.

## Touch Points

### Schema

- `schema/homestead/Homestead.ts` — add `onboardingComplete: boolean` to interface and default function
- `schema/user/User.ts` — remove `onboardingComplete: boolean` from interface and default function

### Service

- `feature/homestead/service/HomesteadService.ts` — add `setOnboardingComplete(homesteadId: string): Promise<IResult>` method
- `feature/homestead/service/IHomesteadService.ts` — add `setOnboardingComplete` to interface
- `feature/customization/service/AnimalTypeService.ts` — `seedStarterPlaybooks`: change batch write to update Homestead doc `onboardingComplete: true` instead of User doc. Remove `skipOnboarding` method entirely.
- `feature/customization/service/IAnimalTypeService.ts` — remove `skipOnboarding` from interface

### Store

- No changes to `homesteadStore.ts`. The existing `subscribeHomestead` callback already spreads the full document data into state (`homestead` field), so `onboardingComplete` is available automatically as `homestead.onboardingComplete`.

### Navigation

- `navigation/RootNavigation.tsx` — read `homestead` from `useHomesteadStore`. When `isLoggedIn === true` and homestead is loaded: if `homestead.onboardingComplete === false`, render SpeciesSelection as the only screen in the main branch. Otherwise render the full main stack (without SpeciesSelection).

### Controllers

- `feature/auth/screen/RegisterController.ts` — remove `navigation.navigate('SpeciesSelection')` (line 49). Remove the `useHomesteadStore` import and `setHomestead` call (line 47) — the auth observer in `authStore.ts:13-28` already calls `setHomestead` after reading the user doc. Remove navigation prop from the hook since it is no longer needed.
- `feature/auth/screen/SpeciesSelectionController.ts` — `complete()`: call `bsHomesteadService.setOnboardingComplete(homesteadId)` after seeding playbooks. `skip()`: call `bsHomesteadService.setOnboardingComplete(homesteadId)` instead of `bsAnimalTypeService.skipOnboarding()`.

### Cleanup

- Remove `skipOnboarding` from `AnimalTypeService` and `IAnimalTypeService`
- Remove `onboardingComplete` update from `seedStarterPlaybooks` User doc batch write (keep `selectedSpecies` update)

## Data Migration

Lazy backfill. Existing Homestead documents will not have `onboardingComplete`. When the field is missing, Firestore returns `undefined`. Treat `undefined` as `true` (existing users have already completed or skipped onboarding). In `RootNavigation`, the condition becomes: `homestead.onboardingComplete === false` — which is `false` for `undefined`, so existing users go straight to DrawerMain. No migration script needed.

## Risk

- **RegisterController double-setHomestead**: Currently `RegisterController.ts:47` calls `useHomesteadStore.getState().setHomestead(homesteadId)` and the auth observer in `authStore.ts:21` also calls `setHomestead`. Removing the RegisterController call means the homestead subscription starts only after the auth observer reads the user doc. If `bsUserService.getUser()` in the auth observer fires before `createUser()` in RegisterController finishes, the user doc won't exist yet and the observer bails at line 18 (`if (!user) return`). This is already a latent race. Fix: keep the `setHomestead` call in RegisterController so the subscription starts immediately and does not depend on the auth observer's user-doc read timing. The auth observer's redundant call is harmless — `setHomestead` already unsubscribes the previous listener before resubscribing (line 24-25).
- **SpeciesSelection flash on returning users**: If the homestead subscription is slow, `homestead` will be `null` during loading. The `showLoading` guard (`isLoggedIn === true && homesteadId === ''`) already prevents rendering the main stack until homesteadId is set. Once homesteadId is set and the subscription delivers the doc, `onboardingComplete` will be available. No flash.
