# TDD Issues & Questions

Analysis of all 25 TDD documents for inconsistencies, conflicts, and open questions.

## Resolution Status

All CRITICAL and HIGH issues have been resolved. TDD documents 02-08, 12-22 have been updated to implement the decisions from `TDD Decisions.md`. Key resolutions:
- **C1** (Collection names): Singular names used throughout. Docs 15-22 updated. → D1
- **C2** (Flat vs subcollections): Subcollections under `/homestead/{homesteadId}/`. All docs updated. → D2
- **C3** (AuthService): Thin wrapper at `core/service/auth/`, UserService for user CRUD. Docs 04, 05, 12, 13 updated. → D3
- **C4** (dueDate type): Firebase Timestamp (`Tstamp`). Docs 02, 03, 08, 14, 16 updated. → D6
- **C5** (completedDate field): `completedDate: Tstamp | null` (null = not completed). Docs 02, 07, 08, 14, 16 updated. → D6
- **H1** (DI pattern): Minimal injection. Docs 04, 05 updated. → D4
- **H2** (Interfaces): Interface + Implementation for all services. Docs 04, 05 updated. → D5
- **H3** (WithdrawalUtility): Resolved — Doc 03 version is canonical.
- **H4** (cycle type): Number, never string. Docs 02, 16, 22 updated. → D7
- **H5** (Store lifecycle): Store holds unsubscribe with teardown(). Docs 06, 14-22 updated. → D8
- **H8** (Subcollection rules): Homestead membership check via `isHomesteadMember()`. Doc 07 updated. → D13
- **H9** (Storage paths): Homestead-scoped for farm data, user-scoped for avatars. Docs 04, 07, 15, 17, 20 updated. → D10
- **M2** (Missing UserService): Created at `feature/user/service/`. Docs 04, 05, 12, 13 updated. → D12
- **M7** (Note type duplication): Types in schema only. Docs 20, 22 updated. → D9

---

## CRITICAL Issues (RESOLVED)

### C1. Firestore Collection Names — Singular vs Plural Conflict

**Affected docs:** 02, 04, 07, 15, 16, 17, 18, 19, 20, 21, 22

The canonical schema doc (02), services doc (04), and security rules (07) define collection names as **singular**: `animal`, `careEvent`, `healthRecord`, `breedingRecord`, `note`, `weightLog`, `productionLog`, `animalType`, `user`.

However, every feature implementation doc uses **plural** names in their service code:
- Doc 15 (Animal): `firestore().collection('animals')`
- Doc 16 (Care): `firestore().collection('careEvents')`
- Doc 17 (Health): `firestore().collection('healthRecords')`
- Doc 18 (Breeding): `firestore().collection('breedingRecords')`
- Doc 19 (Production): `firestore().collection('productionLogs')`
- Doc 20 (Notes): `firestore().collection('notes')`
- Doc 21 (Profile): `firestore().collection('users')`
- Doc 22 (Customization): `firestore().collection('animalTypes')`, `.collection('breeds')`, `.collection('careTemplates')`, `.collection('eventTemplates')`

The security rules (Doc 07) use singular names. **If the code uses plural and the rules use singular, every Firestore read/write will fail silently due to rule mismatches.**

---

### C2. Flat Collection vs Subcollection Architecture Conflict

**Affected docs:** 02, 04, 07 vs 12, 13, 14

Docs 02, 04, and 07 explicitly state: "All collections are flat root-level with `userId` for ownership." For example, animals are at `/animal/{animalId}` with a `userId` field.

But multiple docs show subcollection patterns instead:
- **Doc 13** (Foundation Context) example code: `firestore().collection('user').doc(userId).collection('animal')`
- **Doc 14** (Today Dashboard) CareService: `firestore().collection('user').doc(userId).collection('careEvent')`
- **Doc 12** (Auth) AnimalTypeService seeding: `firestore().collection('user').doc(userId).collection('animalType')`

These two architectures are fundamentally different and cannot coexist. The security rules only cover the flat collection design. The indexes only cover the flat collection design. A decision is required.

---

### C3. AuthService Defined Three Different Ways

**Affected docs:** 04, 05, 12

Three documents define different AuthService architectures:

1. **Doc 04**: `AuthService` at `feature/auth/service/AuthService.ts` — wraps FirebaseAuth AND handles user Firestore document CRUD (`createAccount` takes firstName/lastName, creates user doc)
2. **Doc 05**: `AuthService` at `core/service/auth/AuthService.ts` — thin delegate-only wrapper around FirebaseAuth, NO user document CRUD, receives `IFirebaseAuth` via constructor
3. **Doc 12**: Introduces a separate `AuthFeatureService` at `feature/auth/service/AuthFeatureService.ts` for user profile creation, with `bsAuthService` being just the raw `FirebaseAuth` instance

Each approach has different file paths, different interfaces, and different responsibilities. Only one can be implemented.

---

### C4. CareEvent `dueDate` Type Conflict — ISO String vs Firebase Timestamp

**Affected docs:** 02, 03, 08, 14

- **Doc 02** (Schema): `dueDate: string // ISO 8601`
- **Doc 03** (Utility): `CareUtility.getCareStatus(dueDate: string)` — uses `daysBetween()` with ISO strings
- **Doc 14** (Today Dashboard): `tstampToMilliseconds(a.dueDate)` and `tstampToDate(event.dueDate)` — treats dueDate as Tstamp
- **Doc 08** (Cloud Functions): `.where('dueDate', '<=', Timestamp.fromDate(today))` — treats as Timestamp

The schema says ISO string but code in Doc 14 and Doc 08 treats it as a Firebase Timestamp. These are completely different data types that require different handling. All date comparison logic, queries, and indexes depend on this decision.

---

### C5. CareEvent Subscribe Query — Field Name Conflict

**Affected docs:** 07, 14, 16

Different docs filter incomplete care events using different field names:
- **Doc 07** (Firestore queries): `.where('completedDate', '==', '')`
- **Doc 14** (Today Dashboard CareService): `.where('completed', '==', false)`

The schema (Doc 02) defines `completedDate: string` (empty = not completed). There is no `completed: boolean` field in the CareEvent schema. The query in Doc 14 would always return zero results because the field doesn't exist.

---

## HIGH Issues

### H1. Service Constructor Dependency Injection — Two Conflicting Patterns

**Affected docs:** 04, 05, 17

- **Doc 04**: Most services take no constructor args, call Firebase directly. `AnimalService()`, `CareService()`, etc. Only `AuthService(firebaseAuth)` and `SubscriptionService(revenueCat)` have constructor deps.
- **Doc 05**: All feature services receive `IAuthService` via constructor for `currentUserId`: `AnimalService(bsAuthService)`, `CareService(bsAuthService)`, etc.
- **Doc 17**: `HealthService` receives `ICareService` via constructor for cross-service vaccination → care event side effect.

The Bootstrap.ts is wired completely differently depending on which pattern is followed.

---

### H2. Interface+Implementation Pairs vs Plain Classes

**Affected docs:** 04, 05

- **Doc 04**: Every service has an interface+implementation pair: `IAnimalService.ts` + `AnimalService.ts`, `ICareService.ts` + `CareService.ts`, etc. Bootstrap types them as interfaces.
- **Doc 05**: Explicitly states: "Feature services are intentionally simple classes, not interface+implementation pairs. The indirection of `IAnimalService` is unnecessary."

All feature docs (15-22) follow Doc 04's pattern with interfaces. This needs a decision.

---

### H3. `WithdrawalUtility` — Two Incompatible Definitions

**Affected docs:** 03, 14

The `WithdrawalResult` interface is defined differently in two docs:

**Doc 03:**
```typescript
interface WithdrawalResult {
  withdrawalEndDate: string     // ISO 8601
  daysRemaining: number
  status: WithdrawalStatus      // 'ACTIVE' | 'CLEAR'
  withdrawalType: string
  medicationName: string
}
```

**Doc 14:**
```typescript
interface WithdrawalResult {
  animalId: string
  animalName: string
  medicationName: string
  withdrawalType: 'meat' | 'milk' | 'eggs'
  daysRemaining: number
  clearDate: Date
}
```

Different fields, different types. Doc 14's version references `record.animalName` which doesn't exist on the HealthRecord schema.

---

### H4. CareEvent `cycle` Field — Number vs String Type

**Affected docs:** 02, 16, 22

- **Doc 02** (Schema): `cycle: number` — "days between recurring events"
- **Doc 16** (Care): Uses `String(cycle)` to convert to string, and `parseInt(event.cycle)` to parse back
- **Doc 22** (Customization CareTemplate): `cycle?: string`

This affects all care event creation and recurrence calculation logic.

---

### H5. Store onSnapshot Lifecycle — Three Different Patterns

**Affected docs:** 04, 06, 15, 16

- **Doc 06**: `subscribe: () => () => void` — store function returns unsubscribe, caller holds it
- **Doc 04**: Store holds `unsubscribe` in its own state via `set({ unsubscribe })`
- **Doc 15/16**: Store holds `unsubscribe` in state, has explicit `teardown()` method, `clear()` calls `teardown()`

The "who holds the unsubscribe function" question affects the entire cleanup architecture.

---

### H6. HealthStore — onSnapshot vs Fetch-on-Demand Contradiction

**Affected docs:** 04, 06, 17

- **Doc 04**: `IHealthService` defines `subscribeActiveWithdrawals(userId, callback)` — onSnapshot pattern
- **Doc 06**: healthStore is "Fetch-on-demand", with a note: "Consider converting activeWithdrawals to onSnapshot if dashboard refresh latency is a problem"
- **Doc 17**: "No `onSnapshot` — health records are historical data"

The interface in Doc 04 has a subscribe method that the implementation in Doc 17 doesn't implement.

---

### H7. Auth Store — Two Different Initialization Patterns

**Affected docs:** 06, 10

- **Doc 06**: Auth store has an `initialize()` function that the caller invokes, which returns an unsubscribe function
- **Doc 10**: Auth store auto-subscribes to `bsAuthService.loggedIn` directly inside the `create()` callback — no explicit initialization needed

These have different lifecycle management implications.

---

### H8. Subcollection Security Rules — Insufficient Authorization

**Affected docs:** 07

The security rules for `breed`, `careTemplate`, and `eventTemplate` subcollections under `animalType` use only `isAuth()`:

```
match /breed/{breedId} {
  allow read: if isAuth();
  allow create: if isAuth();
  allow update: if isAuth();
}
```

This means **any authenticated user can read/write any other user's breeds, care templates, and event templates**. The parent `animalType` doc has ownership checks, but subcollection rules are evaluated independently in Firestore.

---

### H9. Storage Paths — Inconsistent Across Docs

**Affected docs:** 04, 07, 15, 17, 20

- **Doc 04** (canonical): `users/{userId}/animals/{animalId}/{filename}`, `users/{userId}/notes/{noteId}/{filename}`
- **Doc 15** (Animal): `animals/${animal.id}/photo.jpg` — no userId prefix
- **Doc 17** (Health): `healthRecords/${record.id}/photo.jpg` — no userId prefix
- **Doc 20** (Notes): `animals/${note.animalId}/notes/${docRef.id}.jpg` — no userId prefix
- **Doc 07** Storage rules: write allowed to `users/{userId}/` path

The feature docs use paths that don't match the storage security rules. Uploads at `animals/{animalId}/photo.jpg` would fail because the storage rules only allow writes under `users/{userId}/`.

---

### H10. `react-native-device-info` Missing from Dependencies

**Affected docs:** 01, 21

Doc 21 (Profile & Settings) imports `getVersion` from `react-native-device-info`, but this package is not listed in Doc 01 (Project Setup & Dependencies).

---

## MEDIUM Issues

### M1. Missing `Paywall` Route in Navigation

**Affected docs:** 10, 23

Doc 23 (Subscription) navigates to `'Paywall'` screen, but `RootStackParamList` in Doc 10 doesn't include a `Paywall` route. The screen would crash at runtime.

---

### M2. Missing `UserService` / `bsUserService`

**Affected docs:** 06, 13, 21

- Doc 06 (State Mgmt) references `bsUserService` for userStore
- Doc 13 (Foundation Context) Bootstrap table lists `bsUserService: UserService`
- But no document defines `UserService`. Doc 21 defines `ProfileService` instead.

Who owns user profile CRUD? Is it `ProfileService`, `AuthFeatureService`, or a never-defined `UserService`?

---

### M3. Missing `NoteDetail` Route in Navigation

**Affected docs:** 10, 20

Notes doc (20) navigates to `NoteDetailScreen` but `RootStackParamList` (Doc 10) has no `NoteDetail` route.

---

### M4. Feature Directory Naming Inconsistency

**Affected docs:** 01, 13, 22, 24

The feature directory naming varies across docs:
- `feature/animal/` vs `feature/animals/`
- `feature/notes/` vs `feature/note/`
- `feature/customization/` vs `feature/animal-type/`
- `feature/home/` vs `feature/today/`

---

### M5. `BirthOutcome` Type Never Defined in Schema

**Affected docs:** 18

Doc 18 (Breeding) `IBreedingService.completeBirth()` takes a `BirthOutcome` parameter, and the import line says `import { BreedingRecord, BirthOutcome }` from the schema — but `BirthOutcome` is never defined in the BreedingRecord schema (Doc 02).

---

### M6. `createMMKV()` API Doesn't Exist

**Affected docs:** 04, 21

Docs 04 and 21 use `createMMKV()` from `react-native-mmkv`. The actual API is `new MMKV()`. The `createMMKV` function doesn't exist in the react-native-mmkv package.

---

### M7. Note Type Defined in Two Places

**Affected docs:** 02, 20

The `Note` interface and `NoteTag` type are defined in:
1. `apps/mobile/src/schema/notes/Note.ts` (Doc 02)
2. Inside `NoteService.ts` (Doc 20)

Having the type in both places violates the architecture rule that schemas are in `schema/` only.

---

### M8. Production Aggregation Could Mix Units

**Affected docs:** 03, 19

Doc 19 warns: "Never mix units in aggregations." But `aggregateProduction()` in Doc 03 uses `logs[0].unit` as the unit for all logs and sums all quantities regardless of unit. If a user logs milk in both gallons and liters, the aggregation would be wrong.

---

### M9. Missing `updateNote`, `updateHealthRecord`, `updateBreedingRecord` CRUD Operations

**Affected docs:** 04, 17, 18, 20

- Doc 04 defines `updateNote` in `INoteService` but Doc 20's NoteService has no `updateNote` method
- Doc 04 defines `updateHealthRecord` but Doc 17's implementation only has `createHealthRecord`
- Doc 04 defines `updateBreedingRecord` but Doc 18's implementation only has `completeBirth` and `failBreeding`

---

### M10. Missing Edit Routes for Customization

**Affected docs:** 10, 22

Doc 22 navigates to `EditAnimalType`, `EditBreed`, `EditCareTemplate` screens, but `RootStackParamList` in Doc 10 doesn't include these routes. It has `CustomizeAnimalType`, `CustomizeBreeds`, `CustomizeCareTemplates` instead — different names.

---

### M11. `SubscriptionService` Import References Non-Existent Path

**Affected docs:** 23

Doc 23 imports: `import { InAppSubscription } from '../../../core/service/purchases/IInAppPurchaseService'`

This `core/service/purchases/` path doesn't exist anywhere in the project structure. The import should come from the RevenueCat library or a type definition.

---

### M12. Missing Weight Feature Screens

**Affected docs:** 10, 04

`CreateWeightLog` is in the navigation (Doc 10) and `WeightService` is defined (Doc 04), but there's no feature doc detailing the weight log screens, controller, or UX. The only mention is in Animal Detail tabs.

---

### M13. `animalTypeLevel` Field — Never Explained

**Affected docs:** 02, 18

The Animal schema has `animalTypeLevel: string` and breeding offspring inherit it, but no document explains what this field represents, what values it takes, or how it's set.

---

### M14. Doc 12 Onboarding Seeding Uses Wrong Collection Structure

**Affected docs:** 12, 22

Doc 12's `AnimalTypeService.seedStarterPlaybooks` creates care templates at:
`firestore().collection('user').doc(userId).collection('careTemplate')`

But the actual schema (Doc 02) and customization doc (22) define care templates as subcollections of animalType:
`firestore().collection('animalType').doc(typeId).collection('careTemplate')`

---

## Questions

### Q1. How should the app handle offline/poor connectivity?

No TDD document addresses offline support. Homesteaders often work in areas with poor signal (barns, fields). Should the app:
- Use Firestore offline persistence (enabled by default)?
- Queue writes for later sync?
- Show any offline indicator?

### Q2. What happens when a user deletes their account?

Doc 04 defines `deleteAccount()` on IAuthService, but there's no specification for what happens to the user's data in Firestore. Should all documents be hard-deleted? Soft-deleted? Left orphaned?

### Q3. What is the `animalTypeLevel` field for?

Used in Animal schema and inherited by offspring, but never explained or set anywhere in the UI.

### Q4. What starter playbooks are needed for Turkey, Goose, Quail, Alpaca, Llama, and Donkey?

Doc 22 shows playbooks for Chicken, Goat, Cattle, Sheep, Pig, Rabbit, Horse, and Duck. The remaining 6 species from the `AVAILABLE_SPECIES` list have a comment "follow similar patterns" but no data.

### Q5. How are FCM tokens registered and refreshed?

Cloud Functions (Doc 08) depend on FCM tokens at `/user/{userId}/device/{deviceId}.tokenId`, but no TDD doc describes when/how the app registers or refreshes FCM tokens.

### Q6. Is there a maximum batch size concern for onboarding seeding?

Firestore batch writes are limited to 500 operations. If a user selects many species during onboarding, and each has many breeds + templates, could the batch exceed 500?

### Q7. How should the app handle the "Farm" tier multi-user access?

The feature gating table mentions "Up to 5 users" for Farm tier, but no document describes the data model for farm membership, invitation flow, or shared data access patterns.
