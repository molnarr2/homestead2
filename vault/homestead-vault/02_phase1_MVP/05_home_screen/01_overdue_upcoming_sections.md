# Home Screen: Overdue & Upcoming Section Limits with Full-List Navigation

## Summary

The Overdue and Upcoming sections on the home screen currently render all items inline. Both sections will be capped at 5 visible items. When a section has more than 5, a 6th "View More" row appears. The count badge in each section header becomes tappable. Both the badge and the "View More" row navigate to a new full-list screen that displays every item in that section.

## Current Behavior

**Overdue section** (`OverdueCareSection.tsx`) renders every item from `overdueEvents` with no limit. The section header uses `SectionHeader` with a red count badge, but the badge is not interactive — `SectionHeader` (`components/layout/SectionHeader.tsx`) wraps the count in a plain `View`.

**Upcoming section** (`UpcomingEventsSection.tsx`) already slices to 5 items — `HomeController.ts:187` computes `upcomingEvents = allUpcomingEvents.slice(0, 5)` and exposes `upcomingEventsTotal`. The "View all" `Pressable` at line 43 navigates to the Care tab via `onQuickRecordCare`, which is incorrect: the Care tab shows the full care schedule grouped by status, not just upcoming events mixed with breeding countdowns.

**Due Today section** (`DueTodaySection.tsx`) also renders all items with no limit. This section follows the same pattern as Overdue but with amber styling.

**SectionHeader** (`components/layout/SectionHeader.tsx`) is a static display component. It accepts `title`, `count`, and `variant` but has no `onPress` handler.

## Desired Behavior

### Display limits

- **Overdue**: show max 5 `DashboardCareItem` rows. If `overdueEvents.length > 5`, display a 6th "View More" row showing the remaining count (e.g., "View 3 more").
- **Due Today**: show max 5 `DashboardCareItem` rows. Same "View More" logic.
- **Upcoming**: already limited to 5. Replace "View all" with "View More" for consistency, linking to the new full-list screen instead of the Care tab.

### Tappable count badge

`SectionHeader` gains an optional `onCountPress` callback. When provided, the count badge wraps in a `Pressable` instead of a plain `View`. Tapping the badge navigates to the same full-list screen as "View More".

### Full-list screens

One new screen: `HomeFullListScreen`. It receives a `listType` param (`'overdue' | 'dueToday' | 'upcoming'`) and renders ALL items for that category with no limit. It reuses the same Zustand stores and computed data from `HomeController` logic — no new queries.

The screen uses a `HomeFullListController` hook that:
- Reads from `useCareStore`, `useBreedingStore`, `useAnimalStore` (same stores the home screen uses)
- Recomputes the appropriate filtered list based on `listType`
- Provides `onCareEventPress` and `onBreedingPress` navigation handlers

The screen renders:
- A header with back button and title ("Overdue", "Due Today", or "Upcoming")
- A `FlatList` of all items using the existing `CareEventCard` component (for overdue/dueToday) or the inline row style from `UpcomingEventsSection` extracted into a shared `UpcomingEventRow` component (for upcoming)

### Navigation flow

```
Home Screen
  ├─ Overdue badge tap ──────► HomeFullList (listType: 'overdue')
  ├─ Overdue "View More" ───► HomeFullList (listType: 'overdue')
  ├─ Due Today badge tap ───► HomeFullList (listType: 'dueToday')
  ├─ Due Today "View More" ─► HomeFullList (listType: 'dueToday')
  ├─ Upcoming badge tap ────► HomeFullList (listType: 'upcoming')
  └─ Upcoming "View More" ──► HomeFullList (listType: 'upcoming')
```

Individual item taps within `HomeFullListScreen` navigate to `CareEventDetail` or `BreedingRecordDetail` as they do on the home screen today.

## Schema Changes

None. All data already exists in Firestore and is loaded into Zustand stores via real-time listeners.

## Data Access Audit

- **No new queries**: `HomeFullListScreen` reads from the same Zustand stores (`careStore`, `breedingStore`, `animalStore`) that are already subscribed via `onSnapshot`. The filtering/sorting is done in-memory via `useMemo` — identical to what `HomeController` already does.
- **No N+1**: The animal name lookup uses the same `animalMap` pattern (one pass over the animals array to build a Map, then O(1) lookups per event).
- **Round trip count**: 0 additional Firestore reads. The full-list screen is purely a re-render of data already in memory.

## Touch Points

### Shared components
- `components/layout/SectionHeader.tsx` — add optional `onCountPress?: () => void` prop. When provided, wrap the badge `View` in a `Pressable`.

### Home feature — controller
- `feature/home/HomeController.ts` — add `overdueEventsTotal` (count), `dueTodayEventsTotal` (count). Limit `overdueEvents` and `dueTodayEvents` to first 5 items for display (same pattern as `upcomingEvents` at line 187). Add `onViewOverdue`, `onViewDueToday`, `onViewUpcoming` navigation handlers that navigate to `HomeFullList` with the appropriate `listType`.

### Home feature — screen
- `feature/home/HomeScreen.tsx` — pass new `onCountPress` and `onViewMore` callbacks to `OverdueCareSection`, `DueTodaySection`, and `UpcomingEventsSection`.

### Home feature — section components
- `feature/home/component/OverdueCareSection.tsx` — accept `totalCount` and `onViewMore` props. Render only the first 5 items. Show "View More" row when `totalCount > 5`. Pass `onCountPress` to `SectionHeader`.
- `feature/home/component/DueTodaySection.tsx` — same changes as OverdueCareSection.
- `feature/home/component/UpcomingEventsSection.tsx` — update "View all" to "View More" with remaining count. Wire `onCountPress` to `SectionHeader`.

### New files
- `feature/home/screen/HomeFullListScreen.tsx` — full-list screen (Controller + Screen pattern in one file with inline controller hook, since the logic is a subset of HomeController).
- `feature/home/component/UpcomingEventRow.tsx` — extract the inline row rendering from `UpcomingEventsSection` lines 24–40 into a reusable component shared between `UpcomingEventsSection` and `HomeFullListScreen`.

### Navigation
- `navigation/RootNavigation.tsx` — add `HomeFullList: { listType: 'overdue' | 'dueToday' | 'upcoming' }` to `RootStackParamList` and register `HomeFullListScreen` in the stack.

## Data Migration

None.

## Risk

- **Stale count badge**: The badge count reflects real-time store state, so if a care event is completed while viewing the home screen, the count updates automatically via Zustand reactivity. No risk of stale data.
- **Memory**: The full-list screen reuses the same Zustand store data (no duplication). The `useMemo` recomputation is lightweight — care events and breeding records are already bounded by the user's herd size.
