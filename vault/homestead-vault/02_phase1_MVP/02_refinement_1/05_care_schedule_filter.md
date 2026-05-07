### Care Schedule Filter Modal — Animal Type

### Summary

Replace the horizontal per-animal chip filter on the Care Schedule screen with the same filter-icon + modal pattern used on the Animal List screen. The modal filters care events by Animal Type (species) using multi-select chips, matching the existing UX exactly.

### Current Behavior

`CareListScreen.tsx` renders a `CareFilterBar` component (horizontal ScrollView of chips) that lists "All Animals" followed by every individual animal by name. Selecting a chip sets `filterAnimalId` in `CareListController.ts`, which filters `incompleteEvents` to a single animal.

- `CareFilterBar.tsx` — horizontal chip list, one chip per animal
- `CareListController.ts:15` — `filterAnimalId: string | null` state
- `CareListController.ts:22-26` — filters events by `animalId === filterAnimalId`

This doesn't scale. A farm with 30+ animals produces an unusable scrolling row.

### Desired Behavior

The Care Schedule header gains a `filter-variant` icon (same as `AnimalListScreen.tsx:45`) beside the title. Tapping it opens a `CareFilterModal` presented as a page sheet. The modal contains:

1. **Animal Type** section — multi-select chips for each species the user has configured (from `animalTypeStore`). Selecting "Cattle" filters care events to only animals whose `animalTypeId` matches.

The filter logic: for each care event, look up its `animalId` in the animal list, check if that animal's `animalTypeId` is in the selected set. If no types are selected, show all events.

A green dot badge appears on the filter icon when any filter is active (same as `AnimalListScreen.tsx:48`).

The `CareFilterBar.tsx` component is removed entirely.

### Schema Changes

None. All data needed (`CareEvent.animalId`, `Animal.animalTypeId`) already exists.

### Data Access Audit

- **N+1 / fan-out**: No new queries. Both `careEvents` and `animals` are already loaded in-memory via Zustand stores with real-time listeners. The filter is a client-side array operation.
- **Data locality**: `animalTypeId` lives on the Animal document. The controller already has access to `useAnimalStore().animals` (added in this change) and `useAnimalTypeStore().animalTypes`. No additional reads.
- **Round trip count**: Zero additional Firestore reads. All filtering is in-memory against existing store data.

### Touch Points

**Remove:**
- `apps/mobile/src/feature/care/component/CareFilterBar.tsx` — delete entirely

**New:**
- `apps/mobile/src/feature/care/component/CareFilterModal.tsx` — modal with Animal Type multi-select chips. Follows the exact structure of `AnimalFilterModal.tsx` but with only the Animal Type section (no Status section).

**Modify:**
- `apps/mobile/src/feature/care/screen/CareListController.ts` — replace `filterAnimalId: string | null` with `filterTypes: string[]`. Add `useAnimalStore` and `useAnimalTypeStore` imports. Filter logic: build a Set of animalIds whose `animalTypeId` is in `filterTypes`, then filter events against that Set. Expose `isFilterActive`, `resetFilters`, `animalTypes`, `filterTypes`, `setFilterTypes`.
- `apps/mobile/src/feature/care/screen/CareListScreen.tsx` — remove `CareFilterBar` import/usage. Add filter icon in the header row (same placement as Animal List). Add `CareFilterModal` with visibility state. Remove the `CareFilterBar` from the `px-4 pt-4 pb-2` header section.

### Data Migration

None required.

### Risk

- If a care event references an `animalId` for a deleted/archived animal not in the store, it won't match any type filter and will only appear when no filter is active. This is acceptable — deleted animals' care events are already filtered out by `admin.deleted == false` on the care listener.
