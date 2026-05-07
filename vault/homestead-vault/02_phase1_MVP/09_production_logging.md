# Production Logging

## Summary

Rework production logging to link to real animal groups (replacing the free-text `groupName`), add a "Production" tab to both the Animal Detail and Group Detail screens showing graphs and summary cards, and allow standalone logs with no animal/group attachment. The Create Production Log screen gains a three-way mode (standalone / per-animal / per-group) and can be launched from the new tab's add button.

## Current Behavior

**Schema** — `ProductionLog` (`apps/mobile/src/schema/production/ProductionLog.ts:5-15`) stores `animalId: string` and `groupName: string`. The group name is free text with no foreign key to `AnimalGroup`. The schema also lacks `userId`.

**Service** — `ProductionService` (`apps/mobile/src/feature/production/service/ProductionService.ts:19-36`) subscribes to all production logs at `homestead_v2/{homesteadId}/productionLog_v2` with a single `onSnapshot` listener filtered by `admin.deleted == false`. No per-animal or per-group filtering is done at the query level; all logs are loaded into `productionStore`.

**Create flow** — `CreateProductionLogController` (`apps/mobile/src/feature/production/screen/CreateProductionLogController.ts:17-82`) accepts optional route params `animalId`, `groupName`, and `type`. The UI forces a binary choice between "Per Animal" (horizontal chip scroll of all animals) and "Per Group" (free-text input). There is no "standalone" option and no link to `AnimalGroup`.

**Navigation** — `CreateProductionLog` route params (`RootNavigation.tsx:69`) are `{ animalId?: string; groupName?: string; type?: ProductionType }`.

**Animal Detail** — The tab list (`AnimalDetailTabs.tsx:4`) defines `AnimalTab = 'timeline' | 'health' | 'breeding' | 'care' | 'notes' | 'weight'`. No production tab exists. The controller (`AnimalDetailController.ts:89-98`) maps each tab to a FAB action but has no production awareness.

**Group Detail** — Tabs are `'members' | 'care' | 'health'` (`GroupDetailController.ts:13`). No production tab. The Group Detail screen (`GroupDetailScreen.tsx:19-23`) hardcodes the TABS array.

**Production List Screen** — `ProductionListScreen.tsx` shows a global view: quick-log buttons, summary card, 30-day bar chart, type filter, recent logs list, and a FAB. The chart component `ProductionTrendChart.tsx` renders a simple bar chart of daily totals using pure React Native views (no charting library).

## Desired Behavior

### 1. Schema — Replace `groupName` with `groupId`, add `userId`

`ProductionLog.groupName` becomes `groupId: string`. When set, it references an `AnimalGroup.id`. Both `animalId` and `groupId` can be empty (standalone log). Add `userId: string`.

### 2. Animal Detail — New "Production" tab

A "Production" tab appears after "Weight" in the animal tab bar. It shows:

- **Summary card** — Today / This Week / This Month totals for logs where `animalId` matches this animal, plus logs from any group this animal belongs to.
- **30-day bar chart** — Same `ProductionTrendChart` component, fed with the merged logs.
- **Production type filter** — Reuse `ProductionTypeSelector` to filter the above.
- **Recent logs list** — Cards showing quantity, unit, date, and a "Group" chip if the log came via a group.
- **FAB (+)** — Navigates to `CreateProductionLog` with `animalId` pre-filled.

This tab is graph-first (summary + chart at top, log list below), unlike the other tabs which are event-list-first.

### 3. Group Detail — New "Production" tab

A "Production" tab appears after "Health" in the group tab bar. Same layout as the animal production tab, but filtered to logs where `groupId` matches this group.

- **FAB (+)** — Navigates to `CreateProductionLog` with `groupId` pre-filled.

### 4. Create Production Log — Three-way mode with real group picker

The "Log Mode" selector becomes three options:

1. **None** (default) — No animal or group. Standalone log.
2. **Animal** — Reuse the existing horizontal animal chip scroll. Pre-selected when navigated from an animal's production tab.
3. **Group** — Show a horizontal chip scroll of `AnimalGroup` items from `groupStore` (replacing the free-text input). Pre-selected when navigated from a group's production tab.

### 5. Navigation params update

`CreateProductionLog` route params change to `{ animalId?: string; groupId?: string; type?: ProductionType }`.

## Schema Changes

### Modified: `ProductionLog` (`apps/mobile/src/schema/production/ProductionLog.ts`)

| Field | Before | After |
|-------|--------|-------|
| groupName | `string` | **removed** |
| groupId | — | `string` (new, default `''`) |
| userId | — | `string` (new, default `''`) |

## Data Access Audit

**N+1 / fan-out queries**: The animal production tab needs logs for this animal AND logs for groups this animal belongs to. All production logs are already loaded in `productionStore` via a single global listener. Group membership is already in `groupStore`. Client-side filtering: `logs.filter(l => l.animalId === animalId || animalGroupIds.includes(l.groupId))`. Zero additional Firestore reads.

**Round trip count for Animal Detail production tab**: 0 extra reads. Production logs and groups are pre-subscribed at app startup.

**Round trip count for Group Detail production tab**: 0 extra reads. Same reasoning — filter `productionStore` by `groupId`.

**Write-vs-read tradeoff**: Keeping production logs in a single flat collection (not group sub-collections) is the right call here. Unlike care events and health records which need group-scoped listeners for the group store pattern, production logs are already globally subscribed. A flat collection with a `groupId` field avoids adding N extra listeners per group and simplifies the global production list screen.

**Data locality**: The `ProductionTrendChart` and `ProductionSummaryCard` components already accept a `logs: ProductionLog[]` array — the caller filters. No change to data fetching.

## Touch Points

### Schema
- `apps/mobile/src/schema/production/ProductionLog.ts` — remove `groupName`, add `groupId: string` and `userId: string`, update default function

### Navigation
- `apps/mobile/src/navigation/RootNavigation.tsx` — change `CreateProductionLog` params: replace `groupName` with `groupId`

### Service
- `apps/mobile/src/feature/production/service/ProductionService.ts` — no structural changes, but `createProductionLog` should set `userId` from auth store
- `apps/mobile/src/feature/production/service/IProductionService.ts` — no changes

### UI — Create Production Log
- `apps/mobile/src/feature/production/screen/CreateProductionLogController.ts` — replace `groupName` state with `groupId`, add three-way `logMode` (`'none' | 'animal' | 'group'`), default to `'none'`, accept `groupId` from route params, pull groups from `groupStore`
- `apps/mobile/src/feature/production/screen/CreateProductionLogScreen.tsx` — replace binary toggle with three-way selector (None / Animal / Group), replace free-text group input with horizontal group chip scroll

### UI — Animal Detail (new production tab)
- `apps/mobile/src/feature/animal/component/AnimalDetailTabs.tsx` — add `'production'` to `AnimalTab` type and TABS array
- `apps/mobile/src/feature/animal/component/AnimalProductionTab.tsx` — **new** component: accepts `logs: ProductionLog[]`, `onAddProduction: () => void`. Renders `ProductionSummaryCard`, `ProductionTrendChart`, `ProductionTypeSelector` filter, recent log list, and FAB
- `apps/mobile/src/feature/animal/screen/AnimalDetailController.ts` — import `useProductionStore`, filter logs for this animal + its groups, add `onAddProduction` navigation action, add `'production'` to `getFabAction`
- `apps/mobile/src/feature/animal/screen/AnimalDetailScreen.tsx` — add `case 'production'` rendering `AnimalProductionTab`

### UI — Group Detail (new production tab)
- `apps/mobile/src/feature/group/screen/GroupDetailController.ts` — add `'production'` to `GroupTab`, import `useProductionStore`, filter logs by `groupId`, add `onAddProduction` navigation action
- `apps/mobile/src/feature/group/screen/GroupDetailScreen.tsx` — add "Production" to TABS array, add `case 'production'` rendering `AnimalProductionTab` (reused component)

### UI — Production List Screen
- `apps/mobile/src/feature/production/screen/ProductionListScreen.tsx` — update `ProductionCard` to show group name instead of `groupName` string (look up group from store by `groupId`)
- `apps/mobile/src/feature/production/screen/ProductionListController.ts` — no changes needed (already works with global logs)

### Store
- `apps/mobile/src/store/productionStore.ts` — no structural changes

## Data Migration

Lazy backfill. Existing production logs have `groupName` (free text) but no `groupId`. Since the free-text group name was never linked to an `AnimalGroup`, there is no reliable way to auto-map old `groupName` values to `groupId`. Strategy:

1. Old logs with `groupName` set but no `groupId` render the `groupName` as plain text (no chip, no link).
2. New logs always use `groupId`.
3. No migration script needed. Old logs remain readable but unlinked.

The `AnimalProductionTab` and `GroupDetailScreen` production tab only query by `groupId`, so old free-text-only logs won't appear on group/animal detail tabs. This is acceptable — the feature is new and most users have zero or minimal production data.

## Risk

1. **Old logs orphaned from group/animal tabs** — Production logs created before this change have `groupName` but no `groupId`, so they won't appear on the new group production tab. Acceptable since production logging is a Pro feature with low adoption so far. The global production list screen still shows all logs.

2. **Tab bar overflow on Animal Detail** — Adding "Production" makes 7 tabs. The tab bar already uses horizontal `ScrollView`, so this is handled. However, discoverability of rightmost tabs decreases. Monitor whether users find the production tab.

3. **Chart performance with large datasets** — `ProductionTrendChart` iterates all logs × 30 days in a `useMemo`. For a typical homestead (<1000 logs) this is fine. If a user logs multiple production types daily for years, this could slow down. The `useMemo` dependency on the filtered logs array prevents unnecessary recalculation.
