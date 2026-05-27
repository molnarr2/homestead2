# Group Detail — Tap to Edit Members, Care, and Health

## Summary

When viewing a group's detail screen, items in the Members, Care, and Health tabs can be added but not tapped to edit. Care and health events are completely non-interactive because the press handlers are not wired up, and even if they were, the detail and edit screens only search animal-level stores — they cannot find records stored under a group's Firestore subcollection. Members already navigate to AnimalDetail on tap, so no change is needed there.

## Current Behavior

**GroupDetailScreen.tsx** renders three tabs:

- **Members tab** (line 48–56): Renders `MemberRow` with `onPress={() => controller.onMemberPress(item.id)}`, which navigates to `AnimalDetail`. This works correctly — tapping a member opens the animal's detail view where the user can edit it.

- **Care tab** (line 59): Passes `careEvents` and `onAddCare` to `AnimalCareTab`, but does NOT pass `onCareEventPress`. Without that prop, `AnimalCareTab` (lines 96–104) renders care event rows as plain `View` — not tappable.

- **Health tab** (line 60): Same problem. Passes `healthRecords` and `onAddHealth` to `AnimalHealthTab`, but does NOT pass `onHealthRecordPress`. Health rows are not tappable.

Even if press handlers were added, the downstream screens would fail:

- **CareEventDetailController.ts** (line 14–16): Looks up the event via `useCareStore().careEvents.find(...)`. Group care events live in `useGroupStore().groupCareEvents`, not `useCareStore()`. The event would not be found.

- **HealthRecordDetailController.ts** (line 13–15): Same problem — searches `useHealthStore().healthRecords` only.

- **EditCareEventController.ts** (line 19): Same lookup failure. Additionally, submit (line 53) calls `bsCareService.updateCareEvent(updated)`, which writes to the animal's careEvent subcollection — the wrong Firestore path for a group event.

- **EditHealthRecordController.ts** (line 18): Same lookup failure. Submit (line 111) calls `bsHealthService.updateHealthRecord(updated, ...)` — wrong path.

- **GroupService.ts**: Has `createGroupCareEvent` and `createGroupHealthRecord` but no update methods.

## Desired Behavior

**Members tab**: No changes. Already navigates to AnimalDetail on tap.

**Care tab**: Tapping a care event navigates to `CareEventDetail`, which shows the event and has an edit pencil button navigating to `EditCareEvent`. The edit screen loads the event, allows modifications, and saves it back to the group's careEvent subcollection.

**Health tab**: Same flow — tap navigates to `HealthRecordDetail` → edit pencil → `EditHealthRecord` → saves to group's healthRecord subcollection.

The detail and edit screens must find records from both the animal store and the group store, and the edit screens must call the correct service (animal vs group) when saving.

## Schema Changes

None. The CareEvent and HealthRecord schemas are identical whether stored under an animal or a group.

## Data Access Audit

- **N+1 / fan-out**: No new queries introduced. The group store already subscribes to group care events and health records via `onSnapshot`. The detail/edit screens add a second lookup path (groupStore) that is a local in-memory search — zero additional Firestore reads.

- **Round trip count**: Unchanged. All data is already loaded by existing subscriptions. The change is purely in-memory lookup logic.

- **Write path**: Update methods write to a single document by its known path (`animalGroup/{groupId}/careEvent/{eventId}` or `animalGroup/{groupId}/healthRecord/{recordId}`). One Firestore write per save — same as the animal path.

## Touch Points

### Service Layer

**IGroupService.ts** — Add two method signatures:
- `updateGroupCareEvent(groupId: string, event: CareEvent): Promise<IResult>`
- `updateGroupHealthRecord(groupId: string, record: HealthRecord, photoUri?: string): Promise<IResult>`

**GroupService.ts** — Implement the two methods. Pattern matches `updateGroup`: call `adminObject_updateLastUpdated`, handle optional photo upload for health records, then `doc.update(...)` on the group's subcollection document.

### Navigation

**RootNavigation.tsx** — Add optional `groupId` to two route param types:
- `CareEventDetail: { eventId: string; groupId?: string }`
- `EditCareEvent: { eventId: string; groupId?: string }`
- `HealthRecordDetail: { recordId: string; groupId?: string }`
- `EditHealthRecord: { recordId: string; groupId?: string }`

### Controllers

**GroupDetailController.ts** — Add two callbacks:
- `onCareEventPress(eventId: string)` → navigates to `CareEventDetail` with `{ eventId, groupId }`
- `onHealthRecordPress(recordId: string)` → navigates to `HealthRecordDetail` with `{ recordId, groupId }`

**CareEventDetailController.ts** — Read `groupId` from route params. When present, find the event in `useGroupStore().groupCareEvents[groupId]` instead of `useCareStore()`. Pass `groupId` through to `EditCareEvent` navigation.

**HealthRecordDetailController.ts** — Same pattern: read `groupId` from route params, find record in `useGroupStore().groupHealthRecords[groupId]`, pass `groupId` through to `EditHealthRecord`.

**EditCareEventController.ts** — Read `groupId` from route params. When present:
- Find event in `useGroupStore().groupCareEvents[groupId]` instead of `useCareStore()`
- On submit, call `bsGroupService.updateGroupCareEvent(groupId, updated)` instead of `bsCareService.updateCareEvent(updated)`
- The `selectedGroup` resolution (lines 65–73) can use `groupId` directly instead of iterating all groups

**EditHealthRecordController.ts** — Same pattern:
- Find record in `useGroupStore().groupHealthRecords[groupId]` instead of `useHealthStore()`
- On submit, call `bsGroupService.updateGroupHealthRecord(groupId, updated, newPhotoUri)` instead of `bsHealthService.updateHealthRecord(...)`
- `selectedGroup` resolution uses `groupId` directly

### Screen (UI)

**GroupDetailScreen.tsx** — Pass new handlers to tab components:
- Line 59: Add `onCareEventPress={controller.onCareEventPress}` to `AnimalCareTab`
- Line 60: Add `onHealthRecordPress={controller.onHealthRecordPress}` to `AnimalHealthTab`

## Data Migration

None. No schema changes. Existing group care events and health records are already stored correctly — they just need update methods and UI wiring.

## Risk

**Incorrect service dispatch**: If `groupId` is lost during navigation (e.g., navigating to CareEventDetail from a context that doesn't pass it), the edit screen would fail to find the record or would silently write to the wrong Firestore path. Mitigated by making `groupId` required in the GroupDetail flow and by falling back to the existing animal store lookup when `groupId` is absent.

**Complete care event on group**: `CareEventDetailController.onComplete` calls `bsCareService.completeCareEvent(event)`, which writes to the animal careEvent path. This same bug applies to completing group care events from the detail screen. The complete method also needs a group-aware path — add `completeGroupCareEvent(groupId, event)` to GroupService, or pass groupId to the existing complete flow.
