# Cascade Soft-Delete Animal

## Summary

Deleting an animal currently soft-deletes only the animal document and removes it from groups in two separate, non-atomic operations. Related records (care events, health, breeding, notes, weight, production) are orphaned — they remain active in the store but render with blank animal names on the home screen and detail screens. This spec moves all cascade logic into a single Firestore batched write inside `AnimalService.deleteAnimal()`.

## Current Behavior

`EditAnimalController.onDelete()` (lines 104–128) performs two sequential calls:

1. `bsAnimalService.deleteAnimal(animalId)` — sets `admin.deleted = true` on the animal document only.
2. `bsGroupService.removeAnimalFromAllGroups(animalId)` — queries all groups, removes the animalId via `arrayRemove`.

These are not atomic. If step 1 succeeds and step 2 fails, the animal disappears from the animal list but remains in groups. More critically, neither step touches related records in these collections:

| Collection | Field | Effect of current delete |
|---|---|---|
| `careEvent_v2` | `animalId` | Orphaned. Shows blank animal name on home screen overdue/due-today lists. |
| `healthRecord_v2` | `animalId` | Orphaned. Withdrawal alerts on home screen show blank animal name. |
| `breedingRecord_v2` | `animalId` | Orphaned. Breeding countdown shows blank dam name. |
| `note_v2` | `animalId` | Orphaned. Hidden only because the animal detail screen is unreachable. |
| `weightLog_v2` | `animalId` | Orphaned. Same as notes. |
| `productionLog_v2` | `animalId` | Orphaned. Same as notes. |
| `animalGroup_v2` | `animalIds[]` | Handled, but non-atomically. |

## Desired Behavior

`AnimalService.deleteAnimal(animalId)` becomes the single entry point for all cascade logic. It:

1. Queries all 6 related collections for documents where `animalId == id` and `admin.deleted == false`.
2. Queries `animalGroup_v2` for groups containing the animalId.
3. Builds a single Firestore `WriteBatch` that:
   - Sets `admin.deleted = true` and `admin.updated_at = serverTimestamp()` on the animal document.
   - Sets `admin.deleted = true` and `admin.updated_at = serverTimestamp()` on every related document found in step 1.
   - Calls `arrayRemove(animalId)` and updates `admin.updated_at` on every group found in step 2.
4. Commits the batch atomically.

`EditAnimalController.onDelete()` calls only `bsAnimalService.deleteAnimal(animalId)`. The separate `bsGroupService.removeAnimalFromAllGroups()` call is removed.

### Breeding records — scope of cascade

Only soft-delete breeding records where `animalId` (the dam) matches. Breeding records where `sireId` matches are NOT deleted — they belong to another animal's reproductive history. The sire name will display as blank on those records, which is acceptable since the sire was removed from the herd.

### Firestore batch limit

Firestore limits a `WriteBatch` to 500 operations. A typical hobby-farm animal has under 50 related records. If the count exceeds 500 (extreme edge case), split into multiple batches committed sequentially. The operation is no longer fully atomic in this case, but partial failure still leaves the system in a consistent state since each batch only sets `admin.deleted = true`.

## Schema Changes

None. All collections already have `admin: AdminObject` with the `deleted` flag.

## Data Access Audit

**Reads at delete time (one-time, not on screen load):**

7 parallel Firestore queries, one per related collection + groups. Each query uses a `where('animalId', '==', id)` filter (or `where('admin.deleted', '==', false)` for groups). These are simple equality filters on indexed fields — no composite index required for the 6 entity collections since `animalId` is the only filter. The group query filters on `admin.deleted` and then checks `animalIds.includes()` client-side (same as today).

**N+1 concern:** None. All 7 queries run in parallel via `Promise.all()`, not in a loop. Total round trips: 7 reads + 1 batch write = 8 Firestore operations per delete.

**Write count:** 1 (animal) + N (related records) + M (groups) operations in a single batch commit. One network round trip.

**Impact on screen load:** Zero. This logic runs only on user-initiated delete, not on any subscription or screen render path.

## Touch Points

### Service layer

- `AnimalService.ts` — Rewrite `deleteAnimal()` to query all 6 related collections + groups, build a single batch, and commit. Add `Col` imports for all collection names. Add `firestore.FieldValue.arrayRemove` for group cleanup. This is the only file with meaningful logic changes.

### Controller layer

- `EditAnimalController.ts` — Remove the `bsGroupService.removeAnimalFromAllGroups(animalId)` call (line 117). Remove `bsGroupService` from the import (line 8). The controller calls only `bsAnimalService.deleteAnimal(animalId)`.

### Interface layer

- `IAnimalService.ts` — No change. The `deleteAnimal(id: string): Promise<IResult>` signature is unchanged.

### Bootstrap

- `Bootstrap.ts` — No change. `AnimalService` already has access to `homesteadRef` and `Col`. It does not need injected references to other services since it queries Firestore directly.

## Data Migration

None. Existing orphaned records from past deletions will continue to exist in Firestore with `admin.deleted = false`, but they are harmless — their parent animal is already `admin.deleted = true`, so the animal won't appear in the store, and the related records won't surface on the home screen because the `animalMap` lookup returns `undefined`, rendering a blank name. This is cosmetically ugly but does not corrupt data.

Optional future cleanup: a one-time script could query for records whose `animalId` references a deleted animal and set `admin.deleted = true` on them. This is not required for launch.

## Risk

**Partial query failure.** If one of the 7 parallel queries fails (e.g., network drop), the batch is never built and `deleteAnimal()` returns an error. The animal is not deleted. The user sees the error alert and can retry. No data is modified.

**Batch commit failure.** If the batch commit fails, Firestore guarantees no operations in the batch are applied. The animal and all related records remain unchanged. The user sees the error and can retry.

**Race condition on concurrent writes.** If a new care event is created for this animal between the query and the batch commit, that care event will not be included in the batch and will be orphaned. This is an extremely narrow window (milliseconds) and the user would have to be creating a care event for an animal they are simultaneously deleting. Acceptable risk at this scale.
