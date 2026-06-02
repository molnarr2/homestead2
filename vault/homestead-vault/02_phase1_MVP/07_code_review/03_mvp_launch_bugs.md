# MVP Launch Bugs

## Pre-Ship Bugs (data loss or broken flows)

### 1. Three create controllers ignore failure and navigate away

| Controller | Line | What happens |
|---|---|---|
| `CreateBreedingRecordController.ts` | 58 | `await bsBreedingService.createBreedingRecord(record)` — result never checked, navigates back |
| `CreateNoteController.ts` | 38 | `await bsNoteService.createNote(...)` — result never checked, navigates back |
| `CreateProductionLogController.ts` | 58 | `await bsProductionService.createProductionLog(log)` — result never checked, navigates back |

User taps "Save," gets navigated back, thinks their data is saved. If Firestore write failed, data is gone with no indication.

### 2. RecordBirthOutcome doesn't check result

`RecordBirthOutcomeController.ts:28-37` — `completeBirth()` creates offspring animals and updates the breeding record in a batch. If it fails, the user navigates away thinking birth was recorded. Orphaned animal documents may exist from a partial batch.

### 3. Care event completion has no error handling in list view

`CareListController.ts:59-61` — `onComplete` calls `bsCareService.completeCareEvent(event)` without checking the result or setting a loading state. User can rapid-tap "complete" on multiple events with no feedback on failure. The recurring event chain could break silently.

### 4. Photo upload fails silently

`CreateAnimalController.ts:70-81` — Animal is created first, then photo uploads. If upload fails, animal exists without photo and user is navigated away with a "success" experience. No error shown.

---

## UX Issues (user confusion, not data loss)

### 5. No confirmation on animal state changes

`EditAnimalScreen.tsx:181-198` — Marking an animal as "Deceased" or "Processed" is a single tap with no confirmation dialog. Animal deletion has a confirmation; state changes don't. And state changes are not reversible in the current UI — user would need to go back into edit and manually switch state back to "Own."

### 6. Paywall "Restore Purchases" may not be tappable

`PaywallModal.tsx:84-89` — "Restore Purchases" is a bare `<Text onPress={...}>` without a `TouchableOpacity` wrapper. On some React Native configurations, `Text` `onPress` is unreliable. Users who reinstall can't restore their subscription.

### 7. Onboarding skip has no error handling

`SpeciesSelectionController.ts:51-58` — `skip()` calls `setOnboardingComplete()` without checking the result or showing loading state. If it fails, user is stuck on species selection with no back button and no way forward.

### 8. ~~Placeholder screens are navigable~~ — FALSE, dead code

`RootNavigation.tsx:176-177` — "CustomizeBreeds" and "CustomizeCareTemplates" are registered in the nav stack but nothing navigates to them. The actual flows use `EditBreed` and `EditCareTemplate` instead. These are dead code and can be removed at any time.

### 9. Empty animal list has no inline CTA

`AnimalListScreen.tsx:74-79` — Shows "No animals yet" text but the only create action is the FAB at the bottom. First-time users may not notice it. An inline "Add your first animal" button in the empty state would help.

---

## Edge Cases (won't affect most users, but will affect some)

### 10. Production log quantity validation is silent

`CreateProductionLogController.ts:44-45` — If user enters "0" or non-numeric text, `parseFloat` returns 0/NaN, the `if (!qty || qty <= 0) return` silently does nothing. No error message shown. User wonders why the button doesn't work.

### 11. Care event date/time handling

`CreateCareEventController.ts:85` — Due date is set via `dateToTstamp(new Date(dueDate))`. The ISO string from the date picker includes time. A care event created at 11pm for "tomorrow" stores a timestamp with time component. The overdue check in `dailyCareReminder` uses `today.setHours(23, 59, 59, 999)` which handles this correctly, but the local UI's `isToday()` check could be off-by-one near midnight depending on timezone.

### 12. Export filename not sanitized

`ExportService.ts:61` — PDF export uses animal name in filename: `${data.animal.name}-complete-record`. If the name contains `/`, `\`, `:` etc., export could fail on some devices.

### 13. Account linking partial failure

`LinkAccountController.ts:34-39` — If `linkUsernamePassword` succeeds but the subsequent `updateUser` (setting `anonymous: false`) fails, the Firebase auth is linked but the user doc still says `anonymous: true`. The CreateAccountPromptModal will keep showing.

---

## Fix Priority

**Must fix (30 min each):**
- Items 1-3: Add `IResult` checks and `Alert.alert()` on failure (same pattern as `CreateAnimalController`)
- Item 7: Add error check and loading state to onboarding skip

**Should fix (1-2 hours total):**
- Item 5: Add confirmation dialog for Deceased/Processed state changes
- Item 6: Wrap "Restore Purchases" in `TouchableOpacity`
- ~~Item 8: Dead code, not reachable~~
- Item 10: Show validation error on invalid production quantity

**Can ship without:**
- Items 4, 9, 11, 12, 13 — real but low-probability or cosmetic
