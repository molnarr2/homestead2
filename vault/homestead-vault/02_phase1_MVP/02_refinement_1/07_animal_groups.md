# Animal Groups

## Summary

Add an "Animal Groups" feature that lets users create named groups (e.g., "Laying Hens", "Breeding Does") with a list of animal IDs. Groups appear as the first section in the animal list, support their own care events and health records (vaccination + deworming only) stored as sub-collections, and surface those group records on individual animal detail screens with a visual "Group" chip.

## Current Behavior

The animal list screen (`apps/mobile/src/feature/animal/screen/AnimalListScreen.tsx`) renders a `SectionList` grouped by `animalType`. The controller (`AnimalListController.ts:41-51`) builds sections from the flat `animals` array by grouping on the `animalType` field.

Care events live at `homestead_v2/{homesteadId}/careEvent_v2/{eventId}` and reference a single animal via `animalId: string`. Health records follow the same pattern at `homestead_v2/{homesteadId}/healthRecord_v2/{recordId}`.

The `AnimalPickerModal` (`apps/mobile/src/feature/care/component/AnimalPickerModal.tsx`) displays a flat list of individual animals filtered by `state === 'own'`. There is no concept of selecting a group.

When viewing an animal's detail (`AnimalDetailController.ts:31-35`), care events and health records are filtered client-side from global stores using `animalId`.

## Desired Behavior

1. **Animal List** — A "Groups" section appears above all animal type sections. Each group card shows the group photo (or first-letter fallback), group name, and member count. Tapping a group navigates to a Group Detail screen.

2. **Group Detail Screen** — Displays group name, photo, member list, and tabs for care events and health records (same layout as animal detail, but limited to group-level records). Tap a member animal to navigate to its individual detail.

3. **Edit Group Screen** — Create/edit group name, photo, and member list. Members are added/removed via a multi-select animal picker.

4. **Animal Picker (Care Events)** — The picker shows a "Groups" section above individual animals. Selecting a group writes the care event to the group's sub-collection instead of the homestead-level collection.

5. **Animal Picker (Health Records)** — Same group section, but only enabled when `recordType` is `vaccination` or `deworming`.

6. **Individual Animal Detail** — Care events and health records from groups the animal belongs to appear in the respective tabs with a "Group" chip (e.g., small pill showing group name). Tapping a group event navigates to the Group Detail screen (not the individual event detail).

## Schema Changes

### New: `AnimalGroup` (`apps/mobile/src/schema/animalGroup/AnimalGroup.ts`)

| Field | Type |
|-------|------|
| id | string |
| admin | AdminObject |
| userId | string |
| name | string |
| animalIds | string[] |
| photoStorageRef | string |
| photoUrl | string |

### New Firestore collection

`homestead_v2/{homesteadId}/animalGroup_v2/{groupId}`

Add `animalGroup: 'animalGroup_v2'` to `packages/common/src/Collections.ts`.

### Group sub-collections

- `homestead_v2/{homesteadId}/animalGroup_v2/{groupId}/careEvent_v2/{eventId}` — reuses existing `CareEvent` schema with `animalId: ''` (empty, since it applies to the group).
- `homestead_v2/{homesteadId}/animalGroup_v2/{groupId}/healthRecord_v2/{recordId}` — reuses existing `HealthRecord` schema with `animalId: ''`. Only `recordType: 'vaccination' | 'deworming'` is permitted for group health records.

### Existing schema changes

**CareEvent** — No field changes. When stored in a group sub-collection, `animalId` is empty string.

**HealthRecord** — No field changes. Same convention.

## Data Access Audit

**N+1 / fan-out queries**: The animal detail screen needs group events for groups containing this animal. The design avoids N+1 by pre-subscribing to all groups and all group events at app startup. Client-side filtering (group → animalIds contains this ID → get events for those groups) requires zero additional Firestore reads.

**Listener count**: The group feature adds `1 + 2N` real-time listeners where N = number of groups. A typical homestead has 3-5 groups → 7-11 extra listeners. Acceptable. The group store subscribes to all group documents (1 listener). The group event store subscribes to each group's care events sub-collection (N listeners). The group health store subscribes to each group's health records sub-collection (N listeners).

**Round trip count for animal list screen**: 0 extra Firestore reads. Groups are pre-loaded in the store via a real-time listener that starts at app login (same as animals, care events, etc.).

**Round trip count for animal detail screen**: 0 extra Firestore reads. Groups and their sub-collection events are already in the store.

**Round trip count for group detail screen**: 0 extra Firestore reads for the group doc and its events (already subscribed). Animal names for the member list come from the existing animal store.

**Write-vs-read tradeoff**: Storing `animalIds` as an array on the group document (vs. a sub-collection) is correct here. Groups are read on every animal list render and animal detail render, but membership changes are rare (adding/removing animals). Array-contains queries are efficient in Firestore and avoid a join.

**Potential concern — stale animalIds**: When an animal is deleted (soft-deleted), its ID remains in group `animalIds`. This is harmless — the UI filters the animal store for existing animals when rendering group members. No cleanup required.

## Touch Points

### Schema
- `apps/mobile/src/schema/animalGroup/AnimalGroup.ts` — **new** schema file
- `packages/common/src/Collections.ts` — add `animalGroup` collection name

### Service
- `apps/mobile/src/feature/group/service/IGroupService.ts` — **new** interface
- `apps/mobile/src/feature/group/service/GroupService.ts` — **new** service: CRUD for groups, subscribe to groups, subscribe to group care events/health records per group, photo upload

### Store
- `apps/mobile/src/store/groupStore.ts` — **new** Zustand store: groups[], groupCareEvents (Record<groupId, CareEvent[]>), groupHealthRecords (Record<groupId, HealthRecord[]>), subscribe/teardown

### Bootstrap
- `apps/mobile/src/Bootstrap.ts` — instantiate `bsGroupService`

### Navigation
- `apps/mobile/src/navigation/RootNavigation.tsx` — add `GroupDetail: { groupId: string }`, `EditGroup: { groupId?: string }` routes

### UI — Animal List
- `apps/mobile/src/feature/animal/screen/AnimalListController.ts` — add groups from groupStore, build a "Groups" section as first item in sections array
- `apps/mobile/src/feature/animal/screen/AnimalListScreen.tsx` — render group cards in the Groups section with member count badge

### UI — Group Screens
- `apps/mobile/src/feature/group/screen/GroupDetailScreen.tsx` — **new** screen
- `apps/mobile/src/feature/group/screen/GroupDetailController.ts` — **new** controller
- `apps/mobile/src/feature/group/screen/EditGroupScreen.tsx` — **new** screen (create + edit)
- `apps/mobile/src/feature/group/screen/EditGroupController.ts` — **new** controller
- `apps/mobile/src/feature/group/component/GroupMemberPicker.tsx` — **new** multi-select animal picker for editing group membership

### UI — Care Event Creation
- `apps/mobile/src/feature/care/component/AnimalPickerModal.tsx` — add a "Groups" section above individual animals. When a group is selected, return a `{ type: 'group', groupId }` discriminated union instead of a plain animalId.
- `apps/mobile/src/feature/care/screen/CreateCareEventController.ts` — handle group selection: write to group sub-collection via groupService instead of homestead-level collection.
- `apps/mobile/src/feature/care/screen/CreateCareEventScreen.tsx` — display selected group chip when a group is chosen.

### UI — Health Record Creation
- `apps/mobile/src/feature/health/screen/CreateHealthRecordScreen.tsx` — show group picker only when recordType is `vaccination` or `deworming`
- `apps/mobile/src/feature/health/screen/CreateHealthRecordController.ts` — handle group selection, write to group health sub-collection

### UI — Animal Detail (group events)
- `apps/mobile/src/feature/animal/screen/AnimalDetailController.ts` — derive `groupCareEvents` and `groupHealthRecords` by finding groups containing this animal, then pulling events from the group store
- `apps/mobile/src/feature/animal/component/AnimalCareTab.tsx` — merge group care events into the list, render with a "Group: {name}" chip, navigate to GroupDetail on tap
- `apps/mobile/src/feature/animal/component/AnimalHealthTab.tsx` — merge group health records, render with chip, navigate to GroupDetail on tap

### Store Reset
- `apps/mobile/src/store/resetAllStores.ts` — add groupStore.clear()

## Data Migration

None. This is a new feature with a new collection. No existing data to migrate.

## Risk

1. **Listener proliferation** — Each group adds 2 sub-collection listeners. If a user creates many groups (>20), this becomes expensive. Mitigation: cap group count at 10 for free tier, 25 for pro tier.

2. **Group membership drift** — Deleted/sold animals remain in `animalIds`. The UI must filter these out when rendering. If `animalIds` grows unbounded (hundreds of historical animals), the document size increases. Mitigation: when an animal is soft-deleted, also remove its ID from all groups in a batch write (in the animal delete service method).

3. **Subscription gating and care event limits** — The existing free-tier limit of 3 care events per animal doesn't cleanly apply to groups. Decision: group care events count against a separate "group events" quota (e.g., 5 per group on free tier) rather than per-member.
