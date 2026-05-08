# Edit Records

## Summary

Make all record types (health, breeding, care, notes, weight, production) tappable from both the animal detail tabs and the timeline view. Tapping a record navigates to its detail screen (creating one where missing), and each detail screen gets an "Edit" button that opens an edit form. The edit forms reuse the same layout as the corresponding create screens, pre-populated with existing data.

## Current Behavior

- **Health tab** — Records are not tappable (only group records navigate to GroupDetail).
- **Breeding tab** — Records are not tappable.
- **Care tab** — Records are not tappable (only group events navigate to GroupDetail).
- **Notes tab** — Records are already tappable → navigate to `NoteDetail` (read-only with delete).
- **Weight tab** — Records are not tappable. No detail screen exists.
- **Production** — No production tab on the animal detail screen. No detail screen exists.
- **Timeline** — All items are plain `View` elements inside a `FlatList`. Nothing is tappable.

Service-level update methods exist for Care, Weight, and Production. Health, Breeding, and Note services have no update method.

## Desired Behavior

1. **All tabs** — Every record row is wrapped in `TouchableOpacity` and navigates to its detail screen on tap.

2. **Timeline** — Every timeline item is wrapped in `TouchableOpacity` and navigates to the appropriate detail screen based on record type.

3. **Detail screens** — Each detail screen gets a pencil icon button in the header (right side) that navigates to the edit screen. Existing detail screens (Health, Breeding, Care, Note) are modified. New detail screens are created for Weight.

4. **Edit screens** — Each record type gets an edit screen that mirrors its create screen. Fields are pre-populated from the existing record. The submit button says "Save Changes" instead of "Save…". On save, the service update method is called and the screen navigates back.

5. **Production** — Production logs are edited from the production list screen (outside the animal detail), so production edit follows the same pattern but is reached from `ProductionListScreen` rather than a tab.

## Service Changes

### `IHealthService` — add `updateHealthRecord`

Add to interface:
```
updateHealthRecord(record: HealthRecord, photoUri?: string): Promise<IResult>
```

Implementation in `HealthService.ts`: calls `adminObject_updateLastUpdated(record.admin)`, handles optional photo upload (same pattern as create), then calls `.doc(record.id).update(record as any)`. Does NOT recreate the vaccination care event on edit.

### `INoteService` — add `updateNote`

Add to interface:
```
updateNote(note: Note, photoUri?: string): Promise<IResult>
```

Implementation in `NoteService.ts`: calls `adminObject_updateLastUpdated`, handles optional photo re-upload, then calls `.doc(note.id).update(note as any)`.

### `IBreedingService` — add `updateBreedingRecord`

Add to interface:
```
updateBreedingRecord(record: BreedingRecord): Promise<IResult>
```

Implementation in `BreedingService.ts`: calls `adminObject_updateLastUpdated`, then calls `.doc(record.id).update(record as any)`. Only editable when status is `active` (completed/failed records are not editable).

## Navigation Changes

### `RootNavigation.tsx` — add edit routes

Add to `RootStackParamList`:
```
EditHealthRecord: { recordId: string }
EditCareEvent: { eventId: string }
EditBreedingRecord: { recordId: string }
EditNote: { noteId: string; animalId: string }
EditWeightLog: { logId: string; animalId: string }
EditProductionLog: { logId: string }
WeightLogDetail: { logId: string; animalId: string }
```

Register each new screen in the `Stack.Navigator`.

## Touch Points

### Services (modify)
- `apps/mobile/src/feature/health/service/IHealthService.ts` — add `updateHealthRecord`
- `apps/mobile/src/feature/health/service/HealthService.ts` — implement `updateHealthRecord`
- `apps/mobile/src/feature/notes/service/INoteService.ts` — add `updateNote`
- `apps/mobile/src/feature/notes/service/NoteService.ts` — implement `updateNote`
- `apps/mobile/src/feature/breeding/service/IBreedingService.ts` — add `updateBreedingRecord`
- `apps/mobile/src/feature/breeding/service/BreedingService.ts` — implement `updateBreedingRecord`

### Navigation (modify)
- `apps/mobile/src/navigation/RootNavigation.tsx` — add edit routes and new screen imports

### Animal Detail Tabs (modify)
- `apps/mobile/src/feature/animal/component/AnimalHealthTab.tsx` — wrap non-group records in `TouchableOpacity`, navigate to `HealthRecordDetail`
- `apps/mobile/src/feature/animal/component/AnimalBreedingTab.tsx` — wrap records in `TouchableOpacity`, navigate to `BreedingRecordDetail`
- `apps/mobile/src/feature/animal/component/AnimalCareTab.tsx` — wrap non-group events in `TouchableOpacity`, navigate to `CareEventDetail`
- `apps/mobile/src/feature/animal/component/AnimalWeightTab.tsx` — wrap rows in `TouchableOpacity`, navigate to `WeightLogDetail`

### Timeline (modify)
- `apps/mobile/src/feature/animal/component/AnimalTimelineTab.tsx` — add `type` and `recordId` fields to `TimelineItem`, wrap items in `TouchableOpacity`, add `onItemPress` prop, navigate to appropriate detail screen
- `apps/mobile/src/feature/animal/screen/AnimalDetailController.ts` — add `onTimelineItemPress` callback that routes to the correct detail screen based on record type
- `apps/mobile/src/feature/animal/screen/AnimalDetailScreen.tsx` — pass `onItemPress` to `AnimalTimelineTab`

### Detail Screens (modify) — add Edit button
- `apps/mobile/src/feature/health/screen/HealthRecordDetailScreen.tsx` — add pencil icon in header, navigate to `EditHealthRecord`
- `apps/mobile/src/feature/health/screen/HealthRecordDetailController.ts` — add `onEdit` callback
- `apps/mobile/src/feature/care/screen/CareEventDetailScreen.tsx` — add pencil icon in header, navigate to `EditCareEvent`
- `apps/mobile/src/feature/care/screen/CareEventDetailController.ts` — add `onEdit` callback
- `apps/mobile/src/feature/breeding/screen/BreedingRecordDetailScreen.tsx` — add pencil icon in header (only when status is `active`), navigate to `EditBreedingRecord`
- `apps/mobile/src/feature/breeding/screen/BreedingRecordDetailController.ts` — add `onEdit` callback
- `apps/mobile/src/feature/notes/screen/NoteDetailScreen.tsx` — add pencil icon in header, navigate to `EditNote`
- `apps/mobile/src/feature/notes/screen/NoteDetailController.ts` — add `onEdit` callback

### New: Weight Log Detail Screen
- `apps/mobile/src/feature/animal/screen/WeightLogDetailScreen.tsx` — **new** screen showing weight, unit, BCS, date, notes. Header with back arrow, title, and pencil edit icon. Same detail layout pattern as other detail screens.
- `apps/mobile/src/feature/animal/screen/WeightLogDetailController.ts` — **new** controller. Reads `logId` and `animalId` from route params, finds log in `weightStore`, finds animal in `animalStore`. Returns `log`, `animal`, `onBack`, `onEdit`.

### New: Edit Screens
- `apps/mobile/src/feature/health/screen/EditHealthRecordScreen.tsx` — **new** screen, mirrors `CreateHealthRecordScreen` layout
- `apps/mobile/src/feature/health/screen/EditHealthRecordController.ts` — **new** controller
- `apps/mobile/src/feature/care/screen/EditCareEventScreen.tsx` — **new** screen, mirrors `CreateCareEventScreen` layout
- `apps/mobile/src/feature/care/screen/EditCareEventController.ts` — **new** controller
- `apps/mobile/src/feature/breeding/screen/EditBreedingRecordScreen.tsx` — **new** screen, mirrors `CreateBreedingRecordScreen` layout
- `apps/mobile/src/feature/breeding/screen/EditBreedingRecordController.ts` — **new** controller
- `apps/mobile/src/feature/notes/screen/EditNoteScreen.tsx` — **new** screen, mirrors `CreateNoteScreen` layout
- `apps/mobile/src/feature/notes/screen/EditNoteController.ts` — **new** controller
- `apps/mobile/src/feature/animal/screen/EditWeightLogScreen.tsx` — **new** screen, mirrors `CreateWeightLogScreen` layout
- `apps/mobile/src/feature/animal/screen/EditWeightLogController.ts` — **new** controller
- `apps/mobile/src/feature/production/screen/EditProductionLogScreen.tsx` — **new** screen, mirrors `CreateProductionLogScreen` layout
- `apps/mobile/src/feature/production/screen/EditProductionLogController.ts` — **new** controller

## Edit Controller Pattern

Each edit controller follows the same pattern (using Health as example):

1. Receives `navigation` and `route` with `{ recordId: string }` params
2. Reads the record from the store (e.g., `useHealthStore().healthRecords.find(r => r.id === recordId)`)
3. Initializes all `useState` hooks with the existing record's values (NOT defaults)
4. `submit` validates the same way as create, builds the updated record by spreading the original record and overriding changed fields, calls the service update method, navigates back on success
5. Returns the same shape as the create controller

The screen component is identical to the create screen except:
- Header title says "Edit {Record Type}" instead of "Add {Record Type}"
- Submit button says "Save Changes"
- No subscription gating check (the record already exists, so the user already had access)

## Timeline Item Press Routing

Add `type` and `recordId` to the `TimelineItem` interface:
```
type: 'care' | 'health' | 'breeding' | 'note' | 'weight'
recordId: string
```

The `onItemPress` callback in `AnimalDetailController` routes based on type:
- `care` → `CareEventDetail: { eventId: recordId }`
- `health` → `HealthRecordDetail: { recordId }`
- `breeding` → `BreedingRecordDetail: { recordId }`
- `note` → `NoteDetail: { noteId: recordId, animalId }`
- `weight` → `WeightLogDetail: { logId: recordId, animalId }`

## Tab Press Routing

Each tab wraps record items in `TouchableOpacity` and navigates to the detail screen. Tabs that need `navigation` but don't currently have it (Health, Breeding, Care, Weight) receive an `onRecordPress` callback prop from `AnimalDetailController` instead of importing `useNavigation` directly (keeps tabs as pure UI).

### New props per tab:
- `AnimalHealthTab` — add `onHealthRecordPress: (recordId: string) => void`
- `AnimalBreedingTab` — add `onBreedingRecordPress: (recordId: string) => void`
- `AnimalCareTab` — add `onCareEventPress: (eventId: string) => void`
- `AnimalWeightTab` — add `onWeightLogPress: (logId: string) => void`

### New callbacks in `AnimalDetailController`:
```
onHealthRecordPress: (recordId: string) => navigation.navigate('HealthRecordDetail', { recordId })
onBreedingRecordPress: (recordId: string) => navigation.navigate('BreedingRecordDetail', { recordId })
onCareEventPress: (eventId: string) => navigation.navigate('CareEventDetail', { eventId })
onWeightLogPress: (logId: string) => navigation.navigate('WeightLogDetail', { logId, animalId })
```

### `AnimalDetailScreen` passes these callbacks to each tab component.

## Breeding Edit Restriction

Only breeding records with `status === 'active'` are editable. The edit button is hidden on the detail screen when status is `completed` or `failed`. The editable fields for an active breeding are: `sireName`, `sireId`, `breedingDate`, `expectedDueDate`, `method`, `notes`. Birth outcome fields are not editable via this screen (they use the existing `RecordBirthOutcome` flow).

## Data Migration

None. No schema changes.

## Risk

1. **Photo re-upload** — Editing a health record or note that already has a photo requires care. If the user doesn't change the photo, the existing `photoUrl` and `photoStorageRef` are preserved (the edit controller only calls the photo upload path when `photoUri` differs from the existing `photoUrl`). If the user picks a new photo, the old storage object is overwritten at the same path.

2. **Stale data on edit screen** — If another device updates the record while the user is editing, the save will overwrite those changes. This is acceptable for a single-user app. The real-time listener will update the store, but the edit screen's local state is initialized once on mount and does not re-sync.
