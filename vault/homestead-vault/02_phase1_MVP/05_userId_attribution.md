# Tech Spec: Add `userId` Attribution to All v2 Documents (H6)

## Summary
Every v2 entity document (animal, weight, care, health, breeding, note, production) is written without a `userId` field, violating CLAUDE.md rule 10 and blocking the field-level `userId == request.auth.uid` validation recommended in C2. This spec adds `userId: string` to the seven schemas and stamps the authenticated uid on every create — including batch-created offspring in `BreedingService.completeBirth`.

## Current Behavior
Documents live in per-homestead subcollections under `homestead/{homesteadId}/{collection}/{docId}` (e.g. `AnimalService.ts:23`). They are scoped by homestead, not by user. None of the seven schemas declare `userId`, and no create path sets it:

- `schema/animal/Animal.ts` — `createAnimal` (`AnimalService.ts:57`); also `completeBirth` batch-creates offspring inline (`BreedingService.ts:96`).
- `schema/weight/WeightLog.ts` — `createWeightLog` (`WeightService.ts:45`).
- `schema/care/CareEvent.ts` — `createCareEvent` (`CareService.ts:58`) and the auto-created next recurring event (`CareService.ts:115`).
- `schema/health/HealthRecord.ts` — `createHealthRecord` (`HealthService.ts:51`).
- `schema/breeding/BreedingRecord.ts` — `createBreedingRecord` (`BreedingService.ts:64`).
- `schema/notes/Note.ts` — `createNote` (`NoteService.ts:46`).
- `schema/production/ProductionLog.ts` — `createProductionLog` (`ProductionService.ts:54`).

The authenticated uid is already available synchronously via `bsAuthService.currentUserId` (`IAuthService.ts`, used today by `homesteadStore.ts`). The `*_default()` functions set scalar defaults; services stamp `id` and `admin` at create time.

## Desired Behavior
Each schema declares `userId: string`, defaulted to `''`. On every create, the owning service stamps `userId` from the authenticated uid (`this.authService.currentUserId`) immediately before the Firestore write — mirroring how `id` and `admin` are already set in the service, not the default. The value is never set from the UI/Controller (rule 8) and never trusted from the passed-in object.

## Schema Changes
Add one field to each interface and its `*_default()`:

- `userId: string` (default `''`)

Applied to: `Animal`, `WeightLog`, `CareEvent`, `HealthRecord`, `BreedingRecord`, `Note`, `ProductionLog`.

No new collections, subcollections, or indexes.

## Data Access Audit
- **N+1 / fan-out:** None. `currentUserId` is a synchronous in-memory getter on cached auth state — zero reads. No create path gains a query.
- **Data locality:** `userId` is denormalized directly onto each document, co-located with the data it attributes. Readers and security rules get it in the same document fetch they already perform — no extra hop.
- **Write-vs-read tradeoff:** Correct direction. Attribution is written once at create and read on every access (by audit views and the C2 create rule). Stamping at write time is exactly the denormalization the audit prefers.
- **Round-trip count:** Unchanged. Every create still costs its existing writes — `createAnimal` 1 write, `completeBirth` 1 batch (offspring + record), etc. `userId` is added to the in-memory payload before the existing `.set()`/`batch.set()`, adding zero round trips.

## Touch Points

### Schema (interface + `*_default()`)
- `schema/animal/Animal.ts` — add `userId: string`.
- `schema/weight/WeightLog.ts` — add `userId: string`.
- `schema/care/CareEvent.ts` — add `userId: string`.
- `schema/health/HealthRecord.ts` — add `userId: string`.
- `schema/breeding/BreedingRecord.ts` — add `userId: string`.
- `schema/notes/Note.ts` — add `userId: string`.
- `schema/production/ProductionLog.ts` — add `userId: string`.

### Service (inject auth, stamp on create)
Inject `IAuthService` into each service constructor and wire it in `Bootstrap.ts`. `bsAuthService` is constructed at `Bootstrap.ts:47`, before the feature services (`:51+`), so it can be passed in alongside the existing `bsAnalyticsService` — no circular import, same DI pattern already in use.

- `Bootstrap.ts` — pass `bsAuthService` to the seven service constructors below.
- `AnimalService.ts` — `createAnimal`: set `animal.userId = this.authService.currentUserId` before `ref.set`.
- `WeightService.ts` — `createWeightLog`: set `log.userId` before `ref.set`.
- `CareService.ts` — `createCareEvent`: set `event.userId` before `ref.set`; also stamp `userId` on the auto-created next recurring event (`:115`).
- `HealthService.ts` — `createHealthRecord`: set `record.userId` before `docRef.set`. (The auto-created care events route through `careService.createCareEvent`, which now stamps `userId` itself — no extra work.)
- `BreedingService.ts` — `createBreedingRecord`: set `record.userId` before `ref.set`. `completeBirth`: add `userId` to each offspring `batch.set` payload (`:96`), read once into a local before the loop.
- `NoteService.ts` — `createNote`: add `userId` to the `noteData` object (`:48`).
- `ProductionService.ts` — `createProductionLog`: set `log.userId` before `ref.set`.

No UI or Controller changes — they pass `*_default()` objects whose `userId` the service overwrites.

## Data Migration
No migration script. Lazy, write-forward only:

- New documents carry `userId` from this change onward.
- Existing v2 documents keep `userId: ''`. Their original creator cannot be reliably recovered (a homestead may have multiple members), so do not guess — backfilling would manufacture false attribution. This mirrors the established no-backfill stance on `activeHomesteadId`.
- The C2 security rule must enforce `userId == request.auth.uid` **on create only**. On update it must treat `userId` as immutable (`request.resource.data.userId == resource.data.userId`) rather than requiring it to equal the editor — a different homestead member editing a doc has a different uid than the original creator, and legacy docs have an empty `userId`. Forcing equality on update would lock out legitimate co-editors and every legacy document.

## Risk
- **Update rule lockout:** If C2's create-rule (`userId == auth.uid`) is mistakenly applied to updates, multi-member edits and all empty-`userId` legacy docs break. Mitigated by the create-only / immutable-on-update split above — call this out explicitly when C2 rules are authored.
- **Unauthenticated create:** `currentUserId` returns `''` if somehow called while signed out, writing an empty `userId` that the create rule would then reject. Acceptable — creates already require an authenticated session to resolve `homesteadRef`; this surfaces the failure at the rule rather than silently mis-attributing.
- **Missed write path:** `completeBirth` and the recurring-event branch are easy to overlook because they bypass the standard `create*` method. Both are listed above; verify no other inline `batch.set` / `.set` of these entities exists before closing.
