# Anonymous Auth and Create Account First Flow

## Summary

Flip the auth entry point so new users land on Create Account (not Login). Add a "Try without an account" option that creates an anonymous Firebase user. Anonymous users see "Create Account" prompts in the profile screen, side menu, and after reaching 3, 6, or 10 animals.

## Current Behavior

When `isLoggedIn === false`, `RootNavigation.tsx:131-135` renders Login as the first screen, with Register as a secondary screen navigated to via `LoginController.ts:24` (`goToRegister`). There is no anonymous auth path in the UI, though `FirebaseAuth.ts:104` (`createAccountAnonymously`) and `AuthService.ts:33` (`createAccountAnonymously`) already exist. The `User` schema (`User.ts:10`) already has an `anonymous: boolean` field defaulting to `false`. `FirebaseAuth.ts:168` (`linkUsernamePassword`) also exists for converting anonymous accounts.

## Desired Behavior

### Auth Entry Flow

Register screen shows first. Bottom of Register screen has a "Try without an account" button. Login screen is accessible via "Already have an account? Login" from Register. Login screen has "Don't have an account? Create Account" that navigates back to Register.

### Anonymous Account Creation

Tapping "Try without an account" on Register:

1. Calls `bsAuthService.createAccountAnonymously()`
2. Creates a User doc with `anonymous: true`, empty firstName/lastName/email
3. Creates a Homestead with name "My Homestead"
4. Sets active homestead on user doc
5. Sets homestead in homesteadStore
6. User proceeds to SpeciesSelection, then Main app (same flow as regular registration)

### Account Conversion Prompts

After a successful animal creation in `CreateAnimalController`, check owned animal count. If the user is anonymous and the count crosses 3, 6, or 10, show a modal prompting them to create a real account.

The modal shows:
- Title: "Create an Account"
- Body: "Your data is only stored on this device session. Create an account to keep your animals, health records, and care schedules safe. Without an account, your data cannot be recovered if you lose your device or uninstall the app."
- "Create Account" button (navigates to LinkAccount screen)
- "Not Now" dismiss button

Track the last threshold shown in the User doc (`anonymousPromptLastSeen`). Show the prompt when `ownedCount >= threshold AND anonymousPromptLastSeen < threshold`. On dismiss, update `anonymousPromptLastSeen` to the current threshold.

### Profile Screen and Side Menu (Anonymous Users)

Display "Guest User" where name would appear. Display "No email" where email would appear.

Profile screen: replace "Edit Profile" row with "Create Account" row. Keep Subscription, Settings, Send Feedback rows.

Side menu: add "Create Account" menu item above Profile (only for anonymous users).

Both "Create Account" entry points navigate to the LinkAccount screen.

### Link Account Screen

New full screen with fields: First Name, Last Name, Email, Password.

On submit:
1. Call `bsAuthService.linkUsernamePassword(email, password)`
2. Update User doc: set firstName, lastName, email, `anonymous: false`, clear `anonymousPromptLastSeen`
3. Navigate back (profile/side menu now shows real account info)

### Anonymous Logout Warning

When an anonymous user taps Logout, the confirmation dialog message changes to: "You're using a guest account. Logging out will permanently lose access to all your data. Create an account first to keep your data."

The dialog shows three buttons: "Create Account" (navigates to LinkAccount), "Log Out" (destructive, proceeds with logout), "Cancel".

## Schema Changes

`User.ts`: add `anonymousPromptLastSeen: number` (default `0`). Existing users unaffected (field absent = treated as 0, only relevant when `anonymous: true`).

## Data Access Audit

**No new queries.** Anonymous auth uses the same Firestore reads/writes as regular auth. The `anonymousPromptLastSeen` field is read from the existing User doc already in memory via `userStore`. The write to update it on dismiss is a single doc update (same as any user mutation). The animal count check after creation reads from `animalStore.animals` already in memory via the real-time listener. Zero additional round trips on the critical path.

## Touch Points

### Schema
- `schema/user/User.ts` — add `anonymousPromptLastSeen: number` to interface and default

### Navigation
- `navigation/RootNavigation.tsx` — swap Register/Login screen order (lines 133-134); add LinkAccount screen to authenticated stack
- `navigation/RootNavigation.tsx` — add `LinkAccount` to `RootStackParamList`

### Auth Screens
- `feature/auth/screen/RegisterScreen.tsx` — add "Try without an account" button; change "Already have an account? Login" to use `navigation.navigate('Login')` instead of `goBack()`
- `feature/auth/screen/RegisterController.ts` — add `registerAnonymously()` method; accept navigation prop; add `goToLogin()` method
- `feature/auth/screen/LoginScreen.tsx` — change "Create Account" link to use `navigation.goBack()` instead of `controller.goToRegister`
- `feature/auth/screen/LoginController.ts` — remove `goToRegister` method

### New Files
- `feature/auth/screen/LinkAccountScreen.tsx` — screen with name/email/password fields
- `feature/auth/screen/LinkAccountController.ts` — calls linkUsernamePassword, updates user doc
- `feature/auth/component/CreateAccountPromptModal.tsx` — global modal (mounted in RootNavigation like PaywallModal)
- `store/createAccountPromptStore.ts` — Zustand store with show/hide (same pattern as paywallStore)

### Profile and Side Menu
- `feature/profile/screen/ProfileScreen.tsx` — show "Create Account" instead of "Edit Profile" when anonymous; show "Guest User" / "No email"
- `feature/profile/screen/ProfileController.ts` — add `isAnonymous` derived from `bsAuthService.isAnonymous`; add `onCreateAccount` handler; modify logout dialog for anonymous users
- `navigation/SideMenu.tsx` — add "Create Account" menu item for anonymous users; show "Guest User" / "No email"
- `navigation/SideMenuController.ts` — add `isAnonymous`; modify logout to warn anonymous users

### Animal Creation
- `feature/animal/screen/CreateAnimalController.ts` — after successful `submit()`, check if anonymous + owned count crosses threshold, call `createAccountPromptStore.show()`

## Data Migration

None. The `anonymousPromptLastSeen` field defaults to 0. Existing users have `anonymous: false` so the field is never read. No backfill needed.

## Risk

**Orphaned data on anonymous logout.** Anonymous users who log out lose access to their Firestore data permanently. The enhanced logout warning mitigates this but cannot prevent it. No cleanup mechanism is proposed — orphaned docs are negligible in volume.

**Race condition on registration (fixed).** When `createAccount()` or `signInAnonymously()` completes, Firebase's `onAuthStateChanged` fires immediately — before the User doc or Homestead exist in Firestore. The `authStore` subscription calls `getUser()`, gets null, and bails. This means `authStore` never calls `subscribeAllStores()` or initializes RevenueCat for new registrations. Additionally, if `getUser()` happens to succeed (fast Firestore write), both `authStore` and the controller would double-initialize stores and RevenueCat.

Fix: app initialization is separated from auth state tracking via `store/appInitializer.ts`. It exports two functions: `initializeApp(userId, homesteadId)` and `teardownApp()`. `initializeApp` is guarded by an idempotency flag — the first caller wins, subsequent calls are no-ops. `teardownApp` resets the flag and clears all stores. `authStore` only tracks `isLoggedIn` and `userId`, then calls `initializeApp` when the user doc is ready (login, app restart). Registration controllers create the User doc and Homestead first, then call `initializeApp` directly. If both `authStore` and the controller race to call `initializeApp`, the guard ensures it runs exactly once. All logout paths call `teardownApp` instead of `resetAllStores` directly. The anonymous registration controller calls `initializeApp(userId, homesteadId)` after creating docs — no flags, no coordination needed.

**Firebase security rules.** Anonymous users are authenticated Firebase users with a UID. Existing Firestore rules that check `request.auth != null` will pass. Verify that no rules check for `request.auth.token.email` — anonymous users have no email until they link an account.
