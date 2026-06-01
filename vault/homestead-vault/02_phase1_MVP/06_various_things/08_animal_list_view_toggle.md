# Animal List View Toggle (List / Grid)

## Summary

Add a view mode toggle to the animal list screen header that switches between the existing single-column list view and a two-column photo grid view. The grid view shows large square photo cards with the animal name overlaid, plus a red withdrawal banner on animals with active withdrawal periods. View preference persists across sessions via MMKV.

## Current Behavior

`AnimalListScreen.tsx` renders a `SectionList` with sections grouped by animal type. Each section contains `AnimalCard` components (circular avatar, name, breed/year, state badge) and optionally `GroupCard` components. The header area has a title ("Animals") on the left and a filter icon (`filter-variant`) on the right. `AnimalListController.ts` manages search, filtering, and section building using `useAnimalStore`, `useAnimalTypeStore`, `useGroupStore`.

The health store (`healthStore.ts`) already subscribes to all health records for the active homestead. `WithdrawalUtility.ts` provides `getActiveWithdrawals(healthRecords)` which returns active withdrawals from a list of health records. Each `HealthRecord` has an `animalId` field.

## Desired Behavior

A new toggle icon appears in the header to the left of the filter icon. Tapping it switches between list and grid mode.

**List mode** — unchanged from current behavior.

**Grid mode** — a two-column layout of square photo cards. Each card shows the animal's photo filling the card with the name overlaid in white text at the bottom-left with a dark text shadow. Animals with active withdrawals show a semi-transparent red banner across the top of the card with an alert icon and "Withdrawal" text. Groups are hidden in grid mode. Section headers (animal type groupings) still appear above their respective grid rows. Tapping a grid card navigates to `AnimalDetail` (same as list mode). Animals without a photo show a placeholder with the first letter initial on a `bg-backgroundDark` background, matching the existing fallback pattern.

**Toggle icon** — shows `view-grid-outline` when in list mode (tap to switch to grid), `view-list` when in grid mode (tap to switch to list).

**Persistence** — the selected view mode (`list` | `grid`) is stored in MMKV under key `animal-list-view-mode`, following the existing pattern in `SettingsController.ts` which uses `createMMKV()` directly in the controller.

## Schema Changes

None.

## Data Access Audit

**No new Firestore queries.** The health records needed for withdrawal detection are already loaded by `useHealthStore`. The controller builds a `Set<string>` of animal IDs with active withdrawals by filtering the existing `healthRecords` array client-side using `getActiveWithdrawals()`. This is O(n) over health records, computed once per render via `useMemo`.

**Round trip count:** unchanged — zero additional reads beyond what the screen already performs.

**No N+1 risk.** Withdrawal status is derived from the already-subscribed health records collection, not fetched per-animal.

## Touch Points

### Controller

- `apps/mobile/src/feature/animal/screen/AnimalListController.ts`
  - Add `viewMode` state (`list` | `grid`) initialized from MMKV, with `toggleViewMode` function that flips and persists to MMKV.
  - Import `useHealthStore` and `getActiveWithdrawals` from `WithdrawalUtility`.
  - Add `withdrawalAnimalIds: Set<string>` — a `useMemo` that filters `healthRecords` by each unique `animalId`, calls `getActiveWithdrawals()` on each group, and collects IDs with at least one active result. Optimization: iterate health records once, grouping by `animalId` into a `Map`, then check each group.
  - Add `gridSections` — a `useMemo` that builds sections identical to `sections` but excludes group sections (filters out `isGroupSection: true` entries). Reuses `filteredAnimals` grouping logic.
  - Return `viewMode`, `toggleViewMode`, `withdrawalAnimalIds`, and `gridSections`.

### Screen

- `apps/mobile/src/feature/animal/screen/AnimalListScreen.tsx`
  - Add toggle icon button in the header row, to the left of the filter icon. Uses `view-grid-outline` / `view-list` icon from Material Design Icons based on current `viewMode`.
  - When `viewMode === 'grid'`: render a `FlatList` instead of `SectionList`. Data is a flat array interleaving section header markers and animal pairs (rows of 2). Each section header renders full-width. Each animal pair renders as a `flex-row` with two `AnimalGridCard` components.
  - Add `AnimalGridCard` component (inline in the file, matching `AnimalCard` / `GroupCard` pattern):
    - Square card using `aspectRatio: 1`, `flex: 1` within a two-column row, `rounded-lg`, `overflow-hidden`.
    - `TurboImage` fills the card with `resizeMode="cover"`, `cachePolicy="dataCache"`.
    - Fallback: `bg-backgroundDark` with centered first-letter text in white, matching existing avatar fallback style but larger.
    - Name overlay: absolutely positioned at the bottom, `px-2 pb-2`, white `text-sm font-bold` text with `textShadowColor/textShadowOffset/textShadowRadius` for readability over photos.
    - Withdrawal banner: conditionally rendered when `withdrawalAnimalIds.has(animal.id)`. Absolutely positioned at top, full width, `bg-status-error/80` with `py-1 px-2`, containing an `alert-circle` icon (size 12, white) and "Withdrawal" text in `text-xs font-bold text-text-inverse`.
    - Gap between cards: 8px horizontal gap via `gap-2` on the row container, 8px vertical gap via `mb-2` on each row.
  - When `viewMode === 'list'`: unchanged, renders the existing `SectionList`.

### Grid Data Transformation (in Controller)

The controller prepares grid data as a flat array for `FlatList`:

- `gridFlatData` — a `useMemo` that iterates `gridSections`, emitting a header item (`{ type: 'header', title, count }`) followed by paired animal items (`{ type: 'row', animals: [Animal, Animal?] }`) for each section. Animals are chunked into pairs. This avoids using `numColumns` on `FlatList` (which doesn't support full-width section headers) and instead manages the two-column layout manually via `flex-row` containers.

## Data Migration

None. No schema changes.

## Risk

**Performance with large herds and many health records.** The `withdrawalAnimalIds` computation groups health records by `animalId` and checks withdrawals. For a user with 200 animals and 1000 health records, this is negligible. The `useMemo` dependency on `healthRecords` means it recomputes on any health record change — acceptable since health record writes are infrequent.

**MMKV direct import in controller.** This follows the existing pattern in `SettingsController.ts` (line 2) which imports `createMMKV` directly. While `CLAUDE.md` states controllers shouldn't import MMKV directly, the established precedent is to use it for simple local preferences. If this rule is enforced strictly in the future, the MMKV calls can be extracted to a `PreferencesService` in a single pass.
