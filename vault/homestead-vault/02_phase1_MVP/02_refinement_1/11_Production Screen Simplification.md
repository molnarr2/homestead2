# Production Screen Simplification

## Summary

Remove the production type selector and unit field from the Create/Edit Production Log screens, and remove `other` as a production type everywhere. The production type is determined before the screen opens — either by the QuickLogEntry icons or by the new SpeedDialFab on the production list. The unit is auto-determined from the production type and displayed as a read-only label so the user knows what they're entering. The plus button on the production list becomes a SpeedDialFab (same pattern as the animal list) with five options: Eggs, Milk, Fiber, Honey, Meat.

## Current Behavior

**Production List Screen** (`ProductionListScreen.tsx`) — Has a `QuickLogEntry` row with six icons (Eggs, Milk, Fiber, Honey, Meat, Other) that navigate to `CreateProductionLog` with a pre-selected type. Below that, a `ProductionTypeSelector` filter with seven options (All, Eggs, Milk, Fiber, Honey, Meat, Other). A single `FloatingActionButton` at the bottom-right navigates to `CreateProductionLog` with no pre-selected type.

**Create Production Log Screen** (`CreateProductionLogScreen.tsx`) — Shows five fields: Animal or Group, Production Type selector (horizontal buttons), Quantity + Unit (side-by-side text inputs), Date, and Notes. The `ProductionTypeSelector` lets the user pick or change the type. The Unit field is an editable text input that auto-populates from `getDefaultUnit()` when the type changes but can be overridden.

**Edit Production Log Screen** (`EditProductionLogScreen.tsx`) — Same fields as Create. Production Type selector allows changing the type. Unit field is editable.

**ProductionType** (`ProductionLog.ts`) — Union type: `'eggs' | 'milk' | 'fiber' | 'honey' | 'meat' | 'other'`.

**Unit defaults** (`ProductionUtility.ts:getDefaultUnit`): eggs→count, milk→gallons, fiber→lbs, honey→lbs, meat→lbs, default→count.

## Desired Behavior

### Remove `other` Production Type

Remove `other` from the `ProductionType` union. Remove it from all arrays/maps that reference production types: `QuickLogEntry`, `ProductionTypeSelector`, `ProductionListScreen.TYPE_ICONS`, and `getDefaultUnit`. The `productionLog_default()` function already defaults to `'eggs'`, so no change there.

### Production List: SpeedDialFab

Replace the `FloatingActionButton` in `ProductionListScreen` with a `SpeedDialFab`. The speed dial has five actions:

| Label | Icon | Action |
|---|---|---|
| Eggs | egg | `navigation.navigate('CreateProductionLog', { type: 'eggs' })` |
| Milk | cup | `navigation.navigate('CreateProductionLog', { type: 'milk' })` |
| Fiber | sheep | `navigation.navigate('CreateProductionLog', { type: 'fiber' })` |
| Honey | bee | `navigation.navigate('CreateProductionLog', { type: 'honey' })` |
| Meat | food-steak | `navigation.navigate('CreateProductionLog', { type: 'meat' })` |

The `onCreateLog` function in `ProductionListController` already accepts an optional `type` param and navigates with it. The SpeedDialFab calls `c.onCreateLog('eggs')`, etc. The `QuickLogEntry` component remains — it also passes a type when tapped, so it already works correctly with this flow.

### Create Production Log Screen: Remove Type Selector and Unit Field

The `type` route param is now always provided (from SpeedDialFab, QuickLogEntry, or animal/group context). The screen title changes to include the type name (e.g. "Log Eggs", "Log Milk").

**Remove:** The `ProductionTypeSelector` and its "Production Type" label.

**Remove:** The Unit text input field.

**Add:** A unit label displayed next to the Quantity input so the user knows what unit they're entering. The Quantity field takes the full width. Below or beside it, show the unit as static text (e.g. "count", "gallons", "lbs"). The layout is: full-width Quantity input with the unit text displayed as a suffix label inside or adjacent to the field.

The controller changes:
- `productionType` is initialized from `initialType` (route param) and is no longer settable — remove `setProductionType` from the return.
- `unit` is derived from `getDefaultUnit(productionType)` and is no longer settable — remove `setUnit` from the return.
- Remove the `useEffect` that syncs unit to production type (no longer needed since both are static).

### Edit Production Log Screen: Remove Type Selector and Unit Field

The production type is loaded from the existing log and cannot be changed.

**Remove:** The `ProductionTypeSelector` and its "Production Type" label.

**Remove:** The Unit text input field.

**Add:** The same unit label display as the Create screen — show the unit as static text adjacent to the Quantity input.

The screen title changes to include the type name (e.g. "Edit Eggs Log", "Edit Milk Log").

The controller changes:
- `productionType` is loaded from the existing log and is no longer settable — remove `setProductionType` from the return.
- `unit` is derived from `getDefaultUnit(productionType)` and is no longer settable — remove `setUnit` from the return.
- Remove the `useEffect` that syncs unit to production type.

### Unit Display Format

The unit defaults are:
- eggs → count
- milk → gallons
- fiber → pounds
- honey → pounds
- meat → pounds

Note: `getDefaultUnit` currently returns `'lbs'` for fiber, honey, and meat. Update it to return `'pounds'` for all three to match the spec.

The unit text is displayed as a read-only label to the right of the Quantity input, inside the same row. Example layout:

```
Quantity *
[ 12        ]  count
```

Use a `Text` component with `text-base text-text-secondary` styling, placed to the right of the Quantity `TextInput` in the existing `flex-row` container. Remove the second `View className="flex-1"` that held the Unit input and replace it with the static `Text`.

## Schema Changes

Update `ProductionType` in `ProductionLog.ts`:
```
export type ProductionType = 'eggs' | 'milk' | 'fiber' | 'honey' | 'meat'
```

Remove `'other'` from the union. The `productionLog_default()` function needs no change (already defaults to `'eggs'`).

## Navigation Changes

The `type` param on `CreateProductionLog` remains optional in the route type definition since the QuickLogEntry and SpeedDialFab always provide it, but the screen assumes it is always present. No change to `RootStackParamList` needed.

## Touch Points

### Modified Files

- `apps/mobile/src/schema/production/ProductionLog.ts` — Remove `'other'` from `ProductionType` union.
- `apps/mobile/src/util/ProductionUtility.ts` — Remove `other` case from `getDefaultUnit`. Change `'lbs'` to `'pounds'` for fiber, honey, meat.
- `apps/mobile/src/feature/production/screen/ProductionListScreen.tsx` — Remove `other` from `TYPE_ICONS`. Replace `FloatingActionButton` with `SpeedDialFab` passing five actions. Remove `FloatingActionButton` import, add `SpeedDialFab` import.
- `apps/mobile/src/feature/production/screen/ProductionListController.ts` — No changes needed. `onCreateLog` already accepts optional type.
- `apps/mobile/src/feature/production/screen/CreateProductionLogScreen.tsx` — Remove `ProductionTypeSelector` import and usage. Remove Unit `TextInput`. Replace with static unit label `Text` next to Quantity. Update screen title to include type name.
- `apps/mobile/src/feature/production/screen/CreateProductionLogController.ts` — Remove `setProductionType` and `setUnit` from return. Remove `useEffect` for unit sync. Make `unit` a derived const from `getDefaultUnit`.
- `apps/mobile/src/feature/production/screen/EditProductionLogScreen.tsx` — Remove `ProductionTypeSelector` import and usage. Remove Unit `TextInput`. Replace with static unit label `Text` next to Quantity. Update screen title to include type name.
- `apps/mobile/src/feature/production/screen/EditProductionLogController.ts` — Remove `setProductionType` and `setUnit` from return. Remove `useEffect` for unit sync. Make `unit` a derived const from `getDefaultUnit`.
- `apps/mobile/src/feature/production/component/QuickLogEntry.tsx` — Remove the `other` entry from `QUICK_TYPES`.
- `apps/mobile/src/feature/production/component/ProductionTypeSelector.tsx` — Remove the `other` entry from `TYPES`.

### Unmodified Files

- `apps/mobile/src/components/button/SpeedDialFab.tsx` — Reused as-is.
- `apps/mobile/src/components/input/AnimalOrGroupField.tsx` — No changes.
- `apps/mobile/src/feature/production/component/ProductionSummaryCard.tsx` — No changes.
- `apps/mobile/src/feature/production/component/ProductionTrendChart.tsx` — No changes.
- `apps/mobile/src/navigation/RootNavigation.tsx` — No changes.

## Data Migration

None. Existing production logs with `productionType: 'other'` remain in Firestore. They will still display in the list (the `ProductionCard` falls back to the `package-variant` icon for unknown types). They can still be edited — the edit screen loads the type from the log. They just cannot be created going forward.

## Risk

1. **Existing `other` logs** — Users who previously logged `other` production can still view and edit those logs. The edit screen will show the type from the log and the unit from `getDefaultUnit` (which falls back to `'count'` for unknown types). The `ProductionTypeSelector` on the edit screen is removed, so the type cannot be changed — which is the desired behavior.

2. **QuickLogEntry + SpeedDialFab overlap** — The production list now has two ways to create a log: QuickLogEntry icons at the top and the SpeedDialFab at the bottom-right. Both navigate to `CreateProductionLog` with a pre-selected type. This is intentional — QuickLogEntry provides fast access when scrolled to the top, while SpeedDialFab is always visible.
