# Animal Picker Modal for Care Event Creation

## Summary

Replace the inline horizontal button list for animal selection on the Create Care Event screen with a tappable field that opens a full-screen modal. The modal displays all animals grouped by type with search-by-name. When navigating from the Animal Detail screen, the animal is pre-populated and the field shows the selected animal's name and avatar.

## Current Behavior

**CreateCareEventScreen.tsx (lines 32-49)** renders every animal from `AnimalStore` as a horizontal row of toggle buttons. Users tap a button to select an animal. This works for small herds but does not scale — with many animals the buttons overflow and there is no way to search.

**CreateCareEventController.ts (line 28)** initializes `selectedAnimalId` from the route param `routeAnimalId`. Two entry points exist:

1. **Care List FAB** — navigates with `animalId: ''`, so no animal is pre-selected and the user must scroll through the buttons.
2. **Animal Detail Care Tab FAB** (`AnimalDetailController.ts` line 42) — navigates with the animal's ID, so the animal is pre-selected.

There is no existing animal picker modal in the codebase. `AnimalFilterModal.tsx` filters by type/status but does not select individual animals.

## Desired Behavior

### Care Event Screen — Animal Field

Remove the horizontal button list. Replace it with a single tappable field row:

- **No animal selected**: Show a bordered row with a placeholder icon (e.g. `cow` in muted color), text "Select Animal", and a right chevron. The row should visually match the existing `TextInput` component style (bordered, rounded, same height).
- **Animal selected**: Show the animal's photo (or first-letter avatar fallback, matching `AnimalCard` in `AnimalListScreen.tsx` lines 118-128), the animal's name in primary text, the breed/type as secondary text, and a right chevron.

Tapping the field opens the **AnimalPickerModal**.

### AnimalPickerModal

A new full-screen modal component (`presentationStyle="pageSheet"`, matching `AnimalFilterModal` pattern):

- **Header**: Close button (X icon) on the left, title "Select Animal" centered.
- **Search bar**: Reuse the existing `SearchBar` component. Filters animals by name (case-insensitive substring match).
- **Animal list**: `FlatList` of all animals from `AnimalStore` where `state === 'own'` (active animals only). Each row shows the animal's photo/avatar, name, and breed/type — same layout as `AnimalCard` in `AnimalListScreen.tsx`. Tapping a row selects the animal, closes the modal, and updates the field.
- **Empty state**: If search yields no results, show "No animals found".

### Pre-populated from Animal Detail

When `routeAnimalId` is provided (navigating from Animal Detail), the field renders in the selected state showing that animal. The user can still tap to change the animal via the modal.

## Schema Changes

None. The `CareEvent.animalId` field is unchanged.

## Data Access Audit

- **No new queries**: The modal reads from `AnimalStore` (Zustand), which is already subscribed via `onSnapshot`. Zero additional Firestore reads.
- **Round trip count**: Unchanged — still zero network requests for animal selection.
- **Filtering**: Done client-side on the in-memory store. No fan-out.

## Touch Points

### New Files

- `apps/mobile/src/feature/care/component/AnimalPickerModal.tsx` — Full-screen modal with search and animal list. Props: `visible`, `onClose`, `animals`, `onSelect(animalId: string)`.

### Modified Files

- `apps/mobile/src/feature/care/screen/CreateCareEventScreen.tsx` — Remove the horizontal button list (lines 32-49). Replace with a tappable animal field row and render `AnimalPickerModal`. Add local state for modal visibility.
- `apps/mobile/src/feature/care/screen/CreateCareEventController.ts` — Expose the selected `Animal` object (not just ID) so the screen can render the name and photo. Add a computed `selectedAnimal` derived from `animals.find(a => a.id === selectedAnimalId)`.

## Data Migration

None.

## Risk

- **Animal store empty on first render**: If `AnimalStore` hasn't hydrated yet, the modal would show an empty list. This is the same risk the current button list has and is mitigated by the existing `onSnapshot` subscription which fires before the user can navigate to this screen.
