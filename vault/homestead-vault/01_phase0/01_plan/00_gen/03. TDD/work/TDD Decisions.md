# TDD Decisions

Decisions needed before implementation can begin. Each has options to pick from.
See `TDD Issues & Questions.md` for the full analysis behind each decision.

---

## D1. Firestore Collection Names — Singular or Plural?

**Context:** The schema doc (02), services doc (04), and security rules (07) use singular (`animal`, `careEvent`). Every feature doc (15-22) uses plural (`animals`, `careEvents`). Security rules and indexes must match the collection names in code.

Pick one:

- [x] **Singular** — `animal`, `careEvent`, `healthRecord`, `breedingRecord`, `note`, `weightLog`, `productionLog`, `animalType`, `user`, `feedback`. Match schema doc, services doc, and security rules. Update all feature doc code examples.
- [ ] **Plural** — `animals`, `careEvents`, `healthRecords`, `breedingRecords`, `notes`, `weightLogs`, `productionLogs`, `animalTypes`, `users`, `feedback`. Match feature doc implementations. Update schema doc, services doc, security rules, and indexes.

---

## D2. Data Architecture — Flat Collections or Subcollections?

**Context:** Docs 02, 04, 07 define flat root-level collections with `userId` field (e.g., `/animal/{animalId}` with `userId`). Docs 12, 13, 14 show subcollection patterns (e.g., `/user/{userId}/animal/{animalId}`). These are incompatible architectures that affect security rules, queries, indexes, and all service code.

Pick one:

- [ ] **Flat root-level collections** — All entities at root with `userId` field for ownership. Simpler queries across all users (admin), matches security rules doc. Requires composite indexes with `userId` on every query.
- [ ] **Subcollections under user** — All entities nested under `/user/{userId}/`. Ownership implicit by path. Simpler security rules (just check parent path). No `userId` field needed on documents. But cross-user queries (admin dashboard, Cloud Functions) require collection group queries.
- [x] **Subcollections under homestead** — All farm data nested under `/homestead/{homesteadId}/`. A homestead is the central entity — users are members with roles (`owner`, `manager`, `caretaker`, `viewer`). Enables multi-user access (invite someone to care for your homestead). No `userId` field on farm data. Security rules check homestead membership. User profiles and feedback stay at root level.

---

## D3. AuthService Architecture

**Context:** Three different AuthService designs across docs 04, 05, and 12. They differ in location, responsibilities, and how user profile creation works.

Pick one:

- [ ] **Option A: Doc 04 pattern** — `AuthService` at `feature/auth/service/` handles both Firebase Auth operations AND user Firestore document CRUD (`createAccount` takes firstName/lastName and creates user doc). Single service, no `AuthFeatureService` needed.
- [x] **Option B: Doc 05 pattern** — `AuthService` at `core/service/auth/` is a thin wrapper that only delegates to `FirebaseAuth`. User Firestore CRUD lives in a separate `UserService`.
- [ ] **Option C: Doc 12 pattern** — `bsAuthService` is the raw `FirebaseAuth` instance. A separate `AuthFeatureService` handles user profile Firestore creation. Auth operations go direct, user CRUD goes through the feature service.

---

## D4. Service Dependency Injection Pattern

**Context:** Doc 04 says services take no constructor args and call Firebase directly. Doc 05 says all services receive `IAuthService` via constructor for `currentUserId`. Doc 17 has `HealthService` receive `ICareService` for cross-service calls.

Pick one:

- [ ] **No constructor deps** — Services access `bsAuthService.currentUserId` from Bootstrap import when needed. Simple, no wiring. Only `AuthService` and `SubscriptionService` have constructor deps.
- [ ] **All services receive IAuthService** — Every service gets auth injected via constructor. Better testability, explicit dependencies. Bootstrap wiring is more complex.
- [x] **Minimal injection** — Most services take no args. Only services with cross-service side effects (e.g., HealthService needing CareService) receive deps via constructor.

---

## D5. Service Interfaces — Interface+Implementation or Plain Classes?

**Context:** Doc 04 defines `IAnimalService` + `AnimalService` pairs for every service. Doc 05 says "The indirection of `IAnimalService` is unnecessary — there's only one implementation."

Pick one:

- [x] **Interface + Implementation** — Every service has `I{Domain}Service.ts` + `{Domain}Service.ts`. Bootstrap exports are typed to interfaces. More verbose but enables test doubles and documents the contract.
- [ ] **Plain classes only** — Services are just classes. No separate interface files. Bootstrap exports the class instance directly. Simpler, less boilerplate. If testing needed, mock Firebase calls.

NOTE: Each service should always have an interface.

---

## D6. CareEvent `dueDate` Type — ISO String or Firebase Timestamp?

**Context:** The schema says `dueDate: string // ISO 8601` but Cloud Functions query it as a Timestamp, and the dashboard code uses `tstampToDate()` on it.

Pick one:

- [ ] **ISO 8601 string** — All domain dates (dueDate, birthday, breedingDate, etc.) are strings. Use `date-fns` for all comparisons. Cloud Functions must parse strings for queries. Consistent with the two-date-system design (AdminObject = Tstamp, domain dates = ISO string).
- [x] **Firebase Timestamp** — Make dueDate a Tstamp. Enables native Firestore range queries and ordering. But breaks the two-date-system convention and requires updating the schema doc.

NOTE: Dates for schemas should aways be the Tstamp field.

---

## D7. CareEvent `cycle` Field Type — Number or String?

**Context:** Schema (Doc 02) defines `cycle: number`. Feature docs sometimes treat it as a string and parse it back.

Pick one:

- [x] **Number** — `cycle: number` as defined in schema. No string conversion anywhere. CareTemplate also uses `cycle: number`.
- [ ] **String** — `cycle: string` everywhere for flexibility. Parse to number when calculating dates.

---

## D8. Zustand Store onSnapshot Lifecycle Pattern

**Context:** Three different patterns for how stores manage Firestore listener subscriptions.

Pick one:

- [ ] **Store returns unsubscribe** — `subscribe()` returns the unsubscribe function. The caller (app container or controller) holds it and calls it on cleanup. Store doesn't manage lifecycle.
- [x] **Store holds unsubscribe internally** — Store stores the unsubscribe function in its state. Has `teardown()` and `clear()` methods. Store manages its own lifecycle. `resetAllStores()` calls `clear()` on each.
- [ ] **Store holds + returns** — Store saves the unsubscribe internally AND returns it. Both the store and caller can trigger cleanup. Most flexible but potentially confusing.

---

## D9. Where Should Domain Types Be Defined?

**Context:** Doc 02 defines all types in `schema/`. Doc 20 re-defines `Note` and `NoteTag` inside `NoteService.ts`. Doc 22 re-defines `AnimalType`, `Breed`, `CareTemplate` inside the service file.

Pick one:

- [x] **Schema files only** — All interfaces live in `apps/mobile/src/schema/{domain}/`. Services, stores, and screens import from there. No type duplication.
- [ ] **Allow service-local types** — Services can define their own types when they diverge from the stored schema (e.g., computed fields, view models). Schema files are for Firestore shapes only.

---

## D10. Firebase Storage Path Structure

**Context:** Doc 04 says `users/{userId}/animals/{animalId}/`, but feature docs use `animals/{animalId}/`. Storage rules only allow writes under `users/{userId}/`.

Pick one:

- [ ] **User-scoped paths** — All storage under `users/{userId}/`: `users/{userId}/animals/{animalId}/photo.jpg`, `users/{userId}/notes/{noteId}/photo.jpg`, `users/{userId}/avatar.jpg`. Matches storage rules. Clear ownership.
- [ ] **Entity-scoped paths** — Storage organized by entity: `animals/{animalId}/photo.jpg`, `health/{recordId}/photo.jpg`. Requires updating storage rules to allow entity-based paths with auth checks.
- [x] Homestead storage should always be under the homestead. The only thing under users should be user specific things.



---

## D11. AnimalType Subcollection Names — Singular or Plural?

**Context:** Schema (Doc 02) and security rules (Doc 07) use singular: `breed`, `careTemplate`, `eventTemplate`. Customization doc (22) service code uses plural: `breeds`, `careTemplates`, `eventTemplates`.

Pick one:

- [x] **Singular** — `breed`, `careTemplate`, `eventTemplate`. Match schema doc and security rules.
- [ ] **Plural** — `breeds`, `careTemplates`, `eventTemplates`. Match customization doc. Update security rules.

*Note: This should match whatever convention is chosen in D1.*

---

## D12. User Profile CRUD — Who Owns It?

**Context:** Three different services reference user profile operations: `AuthService` (Doc 04), `AuthFeatureService` (Doc 12), `ProfileService` (Doc 21). Doc 06 and Doc 13 reference a `UserService` that is never defined.

Pick one:

- [x] **Single `UserService`** — Create a dedicated `UserService` at `feature/user/service/`. Handles all user document CRUD. Auth flow calls it for initial creation. Profile screen calls it for updates. Exported as `bsUserService`.
- [ ] **Split responsibility** — `AuthFeatureService` handles user creation during registration. `ProfileService` handles profile updates, avatar, feedback. No `UserService` — two services split by context.
- [ ] **AuthService does it all** — `AuthService` handles both Firebase Auth AND user Firestore CRUD (Doc 04 pattern). `ProfileService` only handles avatar upload and feedback.

---

## D13. Subcollection Security Rules — `isAuth()` or Ownership Check?

**Context:** Security rules for `breed`, `careTemplate`, `eventTemplate` subcollections only check `isAuth()` — any authenticated user can read/write any user's subcollection data.

Pick one:

- [ ] **Keep `isAuth()` only** — Accept the risk. The parent `animalType` requires ownership to read, so discovering subcollection IDs requires access to the parent. Simpler rules.
- [ ] **Add parent ownership check** — Verify the parent `animalType` document's `userId` matches the requester. More secure but requires an additional document read per rule evaluation (Firestore charges for this).
- [ ] **Add `userId` to subcollection docs** — Add a `userId` field to `Breed`, `CareTemplate`, `EventTemplate` and use `isOwner(resource.data.userId)`. Redundant but cheap and secure.
- [x] These will be under the homestead so the person should be in the role schema. We need the concept of role under homestead. Add that. Keep it simple, if anyone is in the role under homestead they have access.

---

## D14. Cloud Function `dueDate` Query Strategy

**Context:** If dueDate is an ISO string (D6), Cloud Functions can't use native Timestamp range queries. If dueDate is a Timestamp, the client needs to handle Timestamp conversion.

Pick one (contingent on D6):

- [ ] **If ISO string chosen:** Cloud Functions parse ISO strings for comparison. Use `admin.created_at` (Timestamp) for date-based ordering. Accept that range queries on string dates are less efficient.
- [x] **If Timestamp chosen:** Cloud Functions use native Timestamp queries. Client code uses `tstampToDate()` for display. More efficient queries but breaks the two-date-system convention.
- [ ] **Hybrid: Store both** — Store `dueDate` as ISO string AND `dueDateTimestamp` as Tstamp. Client uses string, queries use Timestamp. Redundant but gives best of both worlds.

---

## D15. Missing Starter Playbook Data

**Context:** Playbooks exist for 8 of 14 species. Missing: Turkey, Goose, Quail, Alpaca, Llama, Donkey.

Pick one:

- [ ] **Create playbooks for all 14 species** before implementation
- [x] **Ship with 8 species** and add remaining later — the missing ones are less common
- [ ] **Ship with basic defaults** for the 6 missing — just a name and empty breeds/templates, user customizes
