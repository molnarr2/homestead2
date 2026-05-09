# Animal or Group Field

## Summary

Extract the "Animal or Group" selection UI from the Care Event create screen into a shared component (`AnimalOrGroupField`) and adopt it across all record type create and edit screens. When the user navigates from a specific animal or group context, the field is read-only. When navigating from a general list (no pre-selected animal/group), the field is interactive and opens the `AnimalPickerModal`. The Health Record create screen replaces its current "Apply to Group (optional)" field with this shared component.

## Current Behavior

**Care Events** — `CreateCareEventScreen.tsx` has an inline "Animal or Group \*" field (lines 36-85) that always allows changing the selection, even when pre-populated from animal or group context. `EditCareEventScreen.tsx` omits the field entirely.

**Health Records** — `CreateHealthRecordScreen.tsx` has a separate "Apply to Group (optional)" field (lines 44-78) that only appears for vaccination and deworming record types. It only allows selecting a group — the animal is always implicitly the one from route params. `EditHealthRecordScreen.tsx` omits the field entirely. The `animalId` is always passed via route params and is never user-selectable.

**Production Logs** — `CreateProductionLogScreen.tsx` has a toggle between "Per Animal" and "Per Group" modes (lines 67-128). Per Animal shows horizontal tag buttons; Per Group shows a freeform text field for group name. This is a fundamentally different pattern and is not changed by this spec.

**Breeding, Weight, Notes** — These always receive `animalId` from route params. There is no visible animal indicator on the create or edit screens. The user has no way to see which animal the record is for other than the screen they navigated from.

## Desired Behavior

### New Component: `AnimalOrGroupField`

A reusable display component that shows the selected animal, selected group, or an empty placeholder. It handles three visual states:

1. **Animal selected** — Shows the animal's photo (or first-letter avatar fallback), name, gender, and register number. Same layout as the current care event field.
2. **Group selected** — Shows the group icon, group name, and member count.
3. **Nothing selected** — Shows a placeholder icon and "Select Animal or Group" text with a right chevron.

Props:
- `selectedAnimal: Animal | null`
- `selectedGroup: AnimalGroup | null`
- `onPress: () => void` — opens the picker modal (ignored when `readOnly`)
- `readOnly: boolean` — when true, the field is not tappable, has no chevron, and uses a muted background (`bg-backgroundDark` instead of `bg-surface`)
- `label: string` — the field label (e.g. "Animal or Group \*", "Animal")
- `showGroups: boolean` — controls whether the label says "Animal or Group" vs "Animal" when using the default label. Does not affect the component visually — it only affects the `AnimalPickerModal` usage in the parent screen.

The component does NOT render the `AnimalPickerModal`. Each screen manages its own modal visibility state and renders the modal separately — the same pattern currently used in `CreateCareEventScreen`.

### Read-Only Rules

The field is **read-only** when:
- The user navigated from a specific animal context (`routeAnimalId` is non-empty)
- The user navigated from a specific group context (`routeGroupId` is non-empty)
- The screen is an **edit** screen (animal/group assignment cannot change after creation)

The field is **interactive** when:
- The user navigated from a general list with no pre-selected animal or group (e.g. Care List FAB, Health List, Group Health tab with no specific group)

### Record Type Changes

#### Care Events

**Create** — Replace the inline field UI (lines 36-85 of `CreateCareEventScreen.tsx`) with `AnimalOrGroupField`. Add `readOnly` logic: read-only when `routeAnimalId` or `routeGroupId` is provided. The `AnimalPickerModal` remains, rendered only when not read-only.

**Edit** — Add `AnimalOrGroupField` at the top of the form in `EditCareEventScreen.tsx` with `readOnly={true}`. The controller already has the `animalId` from the existing event — look up the `Animal` object and pass it. For group care events, the controller needs to determine if the event belongs to a group (see Controller Changes below).

#### Health Records

**Create** — Remove the current "Apply to Group (optional)" field (lines 44-78 of `CreateHealthRecordScreen.tsx`) and the conditional `showGroupPicker` logic. Replace with `AnimalOrGroupField` placed at the top of the form (before Record Type selector). The field shows the pre-selected animal from `routeAnimalId` in read-only mode, or the pre-selected group from `routeGroupId` in read-only mode. When neither is provided, the field is interactive and the user can pick an animal or group. Remove the `showGroupPicker` conditional — group application is now available for all health record types, not just vaccination/deworming.

The controller changes: `animalId` is no longer always from route params. It can be user-selected. The controller needs `selectedAnimalId` and `selectedGroupId` state (same pattern as `CreateCareEventController`). The `handleSelectAnimal` and `handleSelectGroup` callbacks clear each other (mutually exclusive). Validation requires at least one to be selected.

**Edit** — Add `AnimalOrGroupField` at the top of the form in `EditHealthRecordScreen.tsx` with `readOnly={true}`. The controller has `animalId` from the existing record — look up the `Animal` object and pass it.

#### Breeding Records

**Create** — Add `AnimalOrGroupField` at the top of `CreateBreedingRecordScreen.tsx` with `readOnly={true}` and `showGroups={false}`. The animal is always from route params. This gives the user a visible indicator of which animal the breeding record is for.

**Edit** — Add `AnimalOrGroupField` at the top of `EditBreedingRecordScreen.tsx` with `readOnly={true}` and `showGroups={false}`.

#### Weight Logs

**Create** — Add `AnimalOrGroupField` at the top of `CreateWeightLogScreen.tsx` with `readOnly={true}` and `showGroups={false}`. The animal is always from route params.

**Edit** — Add `AnimalOrGroupField` at the top of `EditWeightLogScreen.tsx` with `readOnly={true}` and `showGroups={false}`.

#### Notes

**Create** — Add `AnimalOrGroupField` at the top of `CreateNoteScreen.tsx` with `readOnly={true}` and `showGroups={false}`. The animal is always from route params.

**Edit** — Add `AnimalOrGroupField` at the top of `EditNoteScreen.tsx` with `readOnly={true}` and `showGroups={false}`.

#### Production Logs

No change. Production logs use a fundamentally different pattern (toggle mode with freeform group name text) and are not converted to this component.

## Schema Changes

None. No schema changes for any record type.

## Data Access Audit

- **No new queries**: The component reads from `AnimalStore` and `GroupStore` (Zustand), both already subscribed via `onSnapshot`. Zero additional Firestore reads.
- **Health record create**: When navigated from a general context (no pre-selected animal), the `AnimalPickerModal` reads from the same stores. No new queries.

## Touch Points

### New Files

- `apps/mobile/src/components/input/AnimalOrGroupField.tsx` — Shared component. Renders the field label, the touchable row (or non-touchable View when read-only), and the three visual states (animal selected, group selected, empty). Does NOT render the modal.

### Modified Files — Care Events

- `apps/mobile/src/feature/care/screen/CreateCareEventScreen.tsx` — Replace inline animal/group field UI (lines 36-85) with `AnimalOrGroupField`. Conditionally render `AnimalPickerModal` only when not read-only. Compute `readOnly` from whether `routeAnimalId` or `routeGroupId` was provided.
- `apps/mobile/src/feature/care/screen/CreateCareEventController.ts` — Add `isReadOnly` computed value: `!!(routeAnimalId || routeGroupId)`. Expose it in the return object.
- `apps/mobile/src/feature/care/screen/EditCareEventScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` at top of form, before "Event Name" field.
- `apps/mobile/src/feature/care/screen/EditCareEventController.ts` — Expose `selectedAnimal` (look up from `animalStore` using event's `animalId`) and `selectedGroup` (see Group Lookup below).

### Modified Files — Health Records

- `apps/mobile/src/feature/health/screen/CreateHealthRecordScreen.tsx` — Remove "Apply to Group (optional)" field and its conditional rendering. Add `AnimalOrGroupField` at top of form (before Record Type selector). Render `AnimalPickerModal` only when not read-only.
- `apps/mobile/src/feature/health/screen/CreateHealthRecordController.ts` — Add `selectedAnimalId` state (initialized from `routeAnimalId` or `''`). Add `handleSelectAnimal` / `handleSelectGroup` with mutual exclusion (same pattern as `CreateCareEventController`). Add `isReadOnly` computed from `!!(routeAnimalId || routeGroupId)`. Replace hardcoded `animalId` in record construction with `selectedAnimalId`. Remove `showGroupPicker` conditional. Expose `selectedAnimal` and `selectedGroup` objects.
- `apps/mobile/src/feature/health/screen/EditHealthRecordScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` at top of form, before Record Type selector.
- `apps/mobile/src/feature/health/screen/EditHealthRecordController.ts` — Expose `selectedAnimal` (look up from `animalStore` using record's `animalId`).

### Modified Files — Breeding

- `apps/mobile/src/feature/breeding/screen/CreateBreedingRecordScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` and `showGroups={false}` at top of form.
- `apps/mobile/src/feature/breeding/screen/CreateBreedingRecordController.ts` — Expose `selectedAnimal` (look up from `animalStore` using `animalId` from route params).
- `apps/mobile/src/feature/breeding/screen/EditBreedingRecordScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` and `showGroups={false}` at top of form.
- `apps/mobile/src/feature/breeding/screen/EditBreedingRecordController.ts` — Expose `selectedAnimal`.

### Modified Files — Weight

- `apps/mobile/src/feature/animal/screen/CreateWeightLogScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` and `showGroups={false}` at top of form.
- `apps/mobile/src/feature/animal/screen/CreateWeightLogController.ts` — Expose `selectedAnimal`.
- `apps/mobile/src/feature/animal/screen/EditWeightLogScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` and `showGroups={false}` at top of form.
- `apps/mobile/src/feature/animal/screen/EditWeightLogController.ts` — Expose `selectedAnimal`.

### Modified Files — Notes

- `apps/mobile/src/feature/notes/screen/CreateNoteScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` and `showGroups={false}` at top of form.
- `apps/mobile/src/feature/notes/screen/CreateNoteController.ts` — Expose `selectedAnimal`.
- `apps/mobile/src/feature/notes/screen/EditNoteScreen.tsx` — Add `AnimalOrGroupField` with `readOnly={true}` and `showGroups={false}` at top of form.
- `apps/mobile/src/feature/notes/screen/EditNoteController.ts` — Expose `selectedAnimal`.

### Unmodified

- `apps/mobile/src/feature/care/component/AnimalPickerModal.tsx` — No changes. Reused as-is.
- `apps/mobile/src/feature/production/screen/CreateProductionLogScreen.tsx` — No changes.
- `apps/mobile/src/feature/production/screen/EditProductionLogScreen.tsx` — No changes.

## Group Lookup for Edit Screens

Care event and health record edit screens need to determine if a record belongs to a group (to show the group in read-only mode). The record schemas store `animalId` but not `groupId`. Two approaches:

**Approach: Check `groupStore` for the record ID.** The `groupStore` has `groupCareEvents` and `groupHealthRecords` keyed by `groupId`. The edit controller iterates the group store entries to find which group (if any) contains the record ID. If found, the controller sets `selectedGroup` to that group. If not found, the record belongs to an individual animal and `selectedAnimal` is set instead.

This is a client-side lookup on in-memory data — no additional Firestore queries.

## Navigation Changes

### Health Record Create Route

`CreateHealthRecord` route params need to support the case where no `animalId` is provided (user navigates from a general health list to add a record without a pre-selected animal). Update `RootStackParamList`:

```
CreateHealthRecord: { animalId: string; recordType?: HealthRecordType; groupId?: string }
```

The `animalId` param remains required in the type but can be an empty string `''` when no animal is pre-selected. This matches the existing pattern used by `CreateCareEvent`.

No other navigation changes required.

## Data Migration

None.

## Risk

1. **Health record validation** — Currently `CreateHealthRecordController` always has an `animalId` from route params, so it never validates that an animal is selected. With the new interactive mode, the controller must validate that either `selectedAnimalId` or `selectedGroupId` is non-empty before submission. The save button should be disabled when neither is selected (same pattern as Care Events).

2. **Group health records for all types** — Currently group application is limited to vaccination and deworming. This spec removes that restriction. The `GroupService.createGroupHealthRecord` method already accepts any `HealthRecord` regardless of type, so no service changes are needed. However, if there was a product reason to limit group health records to vaccination/deworming only, that restriction should be re-added as a conditional on the `showGroups` prop of the `AnimalPickerModal`.
