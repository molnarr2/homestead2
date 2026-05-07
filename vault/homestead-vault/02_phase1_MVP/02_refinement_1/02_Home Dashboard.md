# Home Dashboard

## Summary

Expand the HomeScreen from an alerts-only view into a full dashboard. The page should always have useful content regardless of herd size. Keep existing alert sections (overdue care, due today, withdrawals, breeding countdowns) at the top and add four new sections below them: Farm Summary, Production Snapshot, Upcoming Events, and Quick Actions.

## What Already Exists

- **HomeScreen:** `apps/mobile/src/feature/home/HomeScreen.tsx` - greeting + 4 conditional alert sections, shows `EmptyState` when no alerts
- **HomeController:** `apps/mobile/src/feature/home/HomeController.ts` - computes `overdueEvents`, `dueTodayEvents`, `activeWithdrawals`, `breedingCountdowns` from Zustand stores
- **Alert components:** `apps/mobile/src/feature/home/component/` - `OverdueCareSection`, `DueTodaySection`, `WithdrawalAlertSection`, `BreedingCountdownSection`
- **Stores:** `animalStore` (animals array, `getAnimalsByType`), `productionStore` (productionLogs array), `careStore` (`getUpcomingEvents()`), `breedingStore`, `healthStore`
- **Schemas:** `Animal` has `animalType`, `state` (`own`|`sold`|`died`|`processed`). `ProductionLog` has `productionType`, `quantity`, `unit`, `date`. `CareEvent` has `dueDate`, `name`, `animalId`.
- **Utilities:** `CareUtility.getCareStatus()` returns `UPCOMING` for events within 7 days. `CareStore.getUpcomingEvents()` returns incomplete events in the future.
- **Navigation routes:** `CreateProductionLog`, `CreateWeightLog`, `CreateCareEvent`, `CreateAnimal`, `AnimalDetail`

## Sections (top to bottom)

### 1. Greeting (existing, no changes)

Keep the current `Good morning/afternoon/evening, {firstName}` header.

### 2. Alert Sections (existing, minor change)

Keep `OverdueCareSection`, `DueTodaySection`, `WithdrawalAlertSection`, `BreedingCountdownSection` exactly as they are. Remove the `EmptyState` fallback when no alerts exist -- the new sections below will fill the space instead.

### 3. Farm Summary Section (new)

- **Purpose:** Always-visible snapshot of the user's herd
- **Data source:** `animalStore.animals` filtered to `state === 'own'`
- **Display:** Horizontal row of compact cards, one per `animalType`. Each card shows the animal type name and count (e.g., "Chickens 12"). Tapping a card navigates to the Animals tab filtered by that type (or just the Animals tab if filtering isn't trivial).
- **Empty state:** If no animals exist, show a single card: "Add your first animal" that navigates to `CreateAnimal`
- **Sorting:** By count descending

### 4. Production Snapshot Section (new)

- **Purpose:** Show today's and this week's production totals
- **Data source:** `productionStore.productionLogs` filtered by date (today and last 7 days)
- **Display:** Section header "Production". Show one row per `productionType` that has logs, with today's total and 7-day total side by side (e.g., "Eggs: 6 today / 38 this week"). Use `quantity` and `unit` from the logs.
- **Empty state:** If no production logs exist at all, show text: "No production logged yet" with a button to navigate to `CreateProductionLog`
- **Quick add:** Small "+" button in the section header that navigates to `CreateProductionLog`

### 5. Upcoming Events Section (new)

- **Purpose:** Forward-looking view of what's coming in the next 7 days
- **Data source:** `careStore.careEvents` filtered to `UPCOMING` status via `getCareStatus()`, plus active breedings where `gestation.daysRemaining <= 7`
- **Display:** Section header "Upcoming (Next 7 Days)". List items showing event name, animal name, and days until due. Care events and near-due breedings are mixed and sorted by days remaining ascending. Cap at 5 items with a "View all" link to the Care tab if more exist.
- **Empty state:** "Nothing scheduled this week"

### 6. Quick Actions Section (new)

- **Purpose:** One-tap access to common daily tasks
- **Display:** Row of icon buttons at the bottom of the scroll view. Four actions:
  - "Log Production" -> navigates to `CreateProductionLog`
  - "Add Weight" -> navigates to `CreateWeightLog` (needs an animal picker or navigates to Animals tab)
  - "Record Care" -> navigates to `CreateCareEvent`
  - "Add Animal" -> navigates to `CreateAnimal`
- **Note:** `CreateWeightLog` and `CreateCareEvent` require an `animalId` param. For these, navigate to the Animals tab and let the user select an animal, OR show a simple animal picker modal. Simplest approach: navigate to Animals tab.

## Files to Create

1. `apps/mobile/src/feature/home/component/FarmSummarySection.tsx`
2. `apps/mobile/src/feature/home/component/ProductionSnapshotSection.tsx`
3. `apps/mobile/src/feature/home/component/UpcomingEventsSection.tsx`
4. `apps/mobile/src/feature/home/component/QuickActionsSection.tsx`

## Files to Modify

1. `apps/mobile/src/feature/home/HomeController.ts` - Add computed properties: `farmSummary` (animal counts by type), `productionSnapshot` (today/week totals by type), `upcomingEvents` (merged care + breeding items for next 7 days). Add navigation handlers for quick actions.
2. `apps/mobile/src/feature/home/HomeScreen.tsx` - Remove `EmptyState` fallback. Add the four new section components below the existing alert sections. All sections render unconditionally (they handle their own empty states).

## Controller Additions

### farmSummary
- Type: `{ animalType: string; count: number }[]`
- Logic: Group `animals` where `state === 'own'` by `animalType`, count each group, sort descending by count

### productionSnapshot
- Type: `{ productionType: ProductionType; unit: string; today: number; week: number }[]`
- Logic: Filter `productionLogs` to last 7 days. Group by `productionType`. Sum `quantity` for today and for the full 7-day window. Only include types that have at least one log in the 7-day window.

### upcomingEvents
- Type: `{ label: string; animalName: string; daysUntil: number; type: 'care' | 'breeding' }[]`
- Logic: Take care events with `UPCOMING` status, plus active breedings with `daysRemaining <= 7`. Merge, sort by `daysUntil` ascending, cap at 5.

### Quick action navigation handlers
- `onQuickLogProduction`: navigate to `CreateProductionLog`
- `onQuickAddAnimal`: navigate to `CreateAnimal`
- `onQuickRecordCare`: navigate to the Care tab (since `CreateCareEvent` requires `animalId`)
- `onQuickAddWeight`: navigate to the Animals tab (since `CreateWeightLog` requires `animalId`)
