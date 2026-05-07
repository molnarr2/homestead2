# Create Weight Log

## Summary

Replace the `PlaceholderScreen` on the `CreateWeightLog` route with a working form that creates a `WeightLog` document. Follows the existing Controller + Screen pattern.

## What Already Exists

- **Schema:** `apps/mobile/src/schema/weight/WeightLog.ts` - `id`, `admin`, `animalId`, `date`, `weight`, `weightUnit` (`lbs` | `kg`), `bodyConditionScore` (default 3), `notes`
- **Service:** `apps/mobile/src/feature/animal/service/WeightService.ts` - `createWeightLog()` already implemented
- **Store:** `apps/mobile/src/store/weightStore.ts` - `createWeightLog` action wired up
- **Navigation:** `CreateWeightLog` route already defined in `RootNavigation.tsx` with `{ animalId: string }` param, currently pointing to `PlaceholderScreen`
- **Tab:** `AnimalWeightTab.tsx` already has the FAB and `AnimalDetailController` already navigates to `CreateWeightLog`

## Files to Create

1. `apps/mobile/src/feature/animal/screen/CreateWeightLogController.ts`
2. `apps/mobile/src/feature/animal/screen/CreateWeightLogScreen.tsx`

## Files to Modify

1. `apps/mobile/src/navigation/RootNavigation.tsx` - Import `CreateWeightLogScreen` and replace `PlaceholderScreen` on the `CreateWeightLog` route

## Controller Spec (`CreateWeightLogController.ts`)

- Receives `navigation` and `route` (same typing pattern as `CreateBreedingRecordController`)
- Reads `animalId` from route params
- Local state: `date` (default `todayIso()`), `weight` (string for text input), `weightUnit` (`lbs` | `kg`, default `lbs`), `bodyConditionScore` (number, default 3), `notes` (string), `loading` (boolean)
- `submit`: validates weight > 0 and date is non-empty, builds `WeightLog` from `weightLog_default()`, calls `bsWeightService.createWeightLog()`, navigates back on success
- No subscription gating (weight logging is a free-tier feature)

## Screen Spec (`CreateWeightLogScreen.tsx`)

- Header: back arrow + title "Add Weight Log"
- Animal info card showing animal name and type (same pattern as breeding screen's dam card)
- Form fields:
  - **Date** - `TextInput`, label "Date *", default today, placeholder "YYYY-MM-DD", keyboard `numbers-and-punctuation`
  - **Weight** - `TextInput`, label "Weight *", numeric keyboard
  - **Unit** - Two-button toggle for `lbs` / `kg` (same toggle pattern as breeding method selector)
  - **Body Condition Score** - Five-button selector (1 through 5), highlight selected
  - **Notes** - `TextInput`, label "Notes", optional, multiline
- Submit button: `PrimaryButton` with title "Save Weight Log"
- Uses `ScreenContainer`, `TextInput`, `PrimaryButton` from existing shared components
