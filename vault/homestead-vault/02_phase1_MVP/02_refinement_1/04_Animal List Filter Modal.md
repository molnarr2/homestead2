# Animal List Filter Modal

## Summary

Replace the inline state filter chips and the animal count badge on the Animal List screen with a single filter icon in the top-right corner. Tapping the icon opens a bottom-sheet modal with two filter dimensions: animal grouping (derived from the user's animal types) and status (owned, sold, deceased, processed). The "died" label is renamed to "deceased" throughout.

## Current Behavior

- `AnimalListScreen.tsx:44-46` — top-right shows a pill badge with `controller.animalCount`.
- `AnimalListScreen.tsx:53-69` — inline row of filter chips (All, Owned, Sold, Died, Processed) that set `filterState` in the controller.
- `AnimalListController.ts:19` — state `filterState` is a single `AnimalStateFilter` value (`'all' | AnimalState`).
- Controller groups animals by `animalType` into sections but offers no way to filter by type.
- `Animal.ts:3` — `AnimalState = 'own' | 'sold' | 'died' | 'processed'`.

## Desired Behavior

1. The animal count badge is removed.
2. The inline filter chip row is removed.
3. A filter icon (e.g. `Ionicons/filter`) replaces the badge in the top-right. When any filter is active (not default), the icon shows a small dot indicator.
4. Tapping the icon opens a bottom-sheet modal with:
   - **Animal Type** — multi-select list of the user's animal types from `useAnimalTypeStore`. "All" is the default. Selecting specific types filters to only those.
   - **Status** — multi-select chips: Owned, Sold, Deceased, Processed. "All" is the default.
   - A "Reset" button to clear filters back to defaults.
   - An "Apply" button that closes the modal and applies the filters.
5. The `AnimalState` type and `animal_default()` rename `'died'` to `'deceased'`.
6. The `AnimalCard` badge color map updates accordingly.

## Schema Changes

- `Animal.ts` — `AnimalState` changes `'died'` to `'deceased'`.
- No Firestore migration needed immediately; existing documents with `state: 'died'` are handled with a lazy rename (see Data Migration).

## Data Access Audit

- **No new queries.** Filtering happens client-side on the already-subscribed `animals` array and the already-subscribed `animalTypes` array. Zero additional Firestore reads.
- **Round trip count:** unchanged (0 on-demand reads; data arrives via existing `onSnapshot` listeners).

## Touch Points

### Schema
- `apps/mobile/src/schema/animal/Animal.ts` — rename `'died'` to `'deceased'` in `AnimalState` union.

### Store
- No store changes needed. `animalStore` and `animalTypeStore` already expose the data the controller needs.

### UI — Controller
- `apps/mobile/src/feature/animal/screen/AnimalListController.ts`
  - Replace `filterState: AnimalStateFilter` with `filterStates: AnimalState[]` (empty = all) and `filterTypes: string[]` (empty = all).
  - Add `isFilterActive: boolean` computed from whether either filter array is non-empty.
  - Update `filteredAnimals` to intersect both filters.
  - Add `setFilterStates`, `setFilterTypes`, `resetFilters`.

### UI — Screen
- `apps/mobile/src/feature/animal/screen/AnimalListScreen.tsx`
  - Remove the `STATE_FILTERS` array and the inline chip row (lines 16-69 restructured).
  - Replace the count badge with a `TouchableOpacity` filter icon + active dot.
  - Add state `filterModalVisible` to toggle the modal.
  - Render a new `AnimalFilterModal` component.

### UI — New Component
- `apps/mobile/src/feature/animal/component/AnimalFilterModal.tsx`
  - Props: `visible`, `onClose`, `animalTypes: AnimalType[]`, `selectedTypes: string[]`, `onTypesChange`, `selectedStates: AnimalState[]`, `onStatesChange`, `onReset`.
  - Uses React Native `Modal` with a slide-up presentation.
  - Two sections with multi-select chips.
  - Reset and Apply buttons.

### UI — AnimalCard badge
- `AnimalListScreen.tsx` — rename `died` key to `deceased` in `STATE_BADGE_COLORS`.

## Data Migration

None. All current data is debug data — rename `'died'` to `'deceased'` directly with no backfill or mapping layer needed.

## Risk

- **Filter state lost on navigation.** If the user navigates away and back, Zustand controller state resets. This is acceptable for MVP — filters are lightweight to re-apply. If needed later, persist to MMKV.
