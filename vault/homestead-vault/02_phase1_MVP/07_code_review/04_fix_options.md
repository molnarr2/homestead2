# Fix Options

Options for each issue from 03_mvp_launch_bugs.md.

---

## 1. Three create controllers ignore failure and navigate away

`CreateBreedingRecordController.ts`, `CreateNoteController.ts`, `CreateProductionLogController.ts`

- [x] **A. Add IResult check + Alert (Recommended)** — Store the result of the await call, check `result.success`, show `Alert.alert('Error', result.error)` on failure, only call `navigation.goBack()` on success. Matches existing pattern in `CreateAnimalController` and `CreateCareEventController`. ~10 min per file.
- [ ] **B. Add IResult check + toast** — Same as A but use a non-blocking toast instead of a modal Alert. Better UX (user can immediately retry) but requires adding a toast library or component.

---

## 2. RecordBirthOutcome doesn't check result

`RecordBirthOutcomeController.ts:28-37`

- [x] **A. Add IResult check + Alert (Recommended)** — `completeBirth()` already returns `IResult`. Store the result, check `result.success`, show Alert on failure, only navigate back on success. ~10 min.
- [ ] **B. Add IResult check + Alert + disable button while loading** — Same as A but also disable the submit button while `loading` is true to prevent double-tap. The controller already has `setLoading` but the screen may not be checking it on the button.

---

## 3. Care event completion has no error handling in list view

`CareListController.ts:59-61`

- [x] **A. Add IResult check + Alert** — Make `onComplete` async, check the result from `completeCareEvent()`, show Alert on failure. ~10 min.
- [ ] **B. Add IResult check + Alert + per-event loading state** — Same as A but track which event ID is currently completing so the UI can show a spinner on that specific row and prevent double-tap. Requires passing a `completingEventId` state to the screen. ~30 min.
- [ ] **C. Add IResult check + Alert + optimistic UI** — Mark the event as complete in the store immediately, revert if the service call fails. Best UX (instant feedback) but adds rollback complexity. ~1 hr.

---

## 4. Photo upload fails silently

`CreateAnimalController.ts:70-81`

- [x] **A. Show Alert on photo failure (Recommended)** — After `uploadAnimalPhoto` returns null, show `Alert.alert('Photo Error', 'Animal was saved but the photo failed to upload. You can add it later from the edit screen.')`. Animal is still created successfully. ~10 min.
- [ ] **B. Retry photo upload** — On failure, prompt user with "Photo failed to upload. Retry?" with retry/skip options. More complex, requires retry loop. ~30 min.
- [ ] **C. Upload photo first, then create animal** — Reverse the order so if photo fails, no animal is created. Requires a temporary storage path since the animal ID doesn't exist yet. Architectural change. ~1 hr.

---

## 5. No confirmation on animal state changes

`EditAnimalScreen.tsx:181-198`

- [x] **A. Add confirmation dialog for destructive states (Recommended)** — When user selects "Deceased" or "Processed," show `Alert.alert('Mark as Deceased?', 'This will move the animal out of your active herd.', [Cancel, Confirm])`. Only update state on confirm. Allow "Sold" without confirmation since it's less destructive. ~20 min.
- [ ] **B. Add confirmation for all non-Own states** — Same as A but also confirm "Sold." More conservative. ~20 min.
- [ ] **C. Add confirmation + undo period** — Show confirmation, then after state change show a 5-second "Undo" snackbar at the bottom. Best UX but requires a snackbar component and delayed Firestore write. ~1 hr.

---

## 6. Paywall "Restore Purchases" may not be tappable

`PaywallModal.tsx:84-89`

- [x] **A. Wrap in TouchableOpacity (Recommended)** — Replace bare `<Text onPress={...}>` with `<TouchableOpacity onPress={...}><Text>...</Text></TouchableOpacity>`. 2 min fix.
- [ ] **B. Wrap in Pressable** — Use React Native's `Pressable` instead of `TouchableOpacity`. Newer API, same result. 2 min fix.

---

## 7. Onboarding skip has no error handling

`SpeciesSelectionController.ts:51-58`

- [x] **A. Add loading state + IResult check + Alert (Recommended)** — Set loading true, await `setOnboardingComplete()`, check result, show Alert on failure with a retry option. ~15 min.
- [ ] **B. Add loading state + IResult check + automatic retry** — Same as A but on failure, retry once automatically before showing Alert. Handles transient network issues. ~20 min.

---

## 8. Dead code — no fix needed

`RootNavigation.tsx:176-177` — CustomizeBreeds and CustomizeCareTemplates are unreachable.

- [x] **A. Remove the dead screen registrations** — Delete the two `Stack.Screen` entries and their type definitions from `RootStackParamList`. Also remove the `PlaceholderScreen` import if nothing else uses it. ~5 min.
- [ ] **B. Leave as-is** — No user impact. Clean up later.

---

## 9. Empty animal list has no inline CTA

`AnimalListScreen.tsx:74-79`

- [x] **A. Add inline button in empty state (Recommended)** — Below the "No animals yet" text, add a button "Add Your First Animal" that triggers the same action as the FAB. ~15 min.
- [ ] **B. Leave as-is** — The FAB is visible. Most users will find it. Low risk.

---

## 10. Production log quantity validation is silent

`CreateProductionLogController.ts:44-45`

- [x] **A. Add Alert on invalid quantity (Recommended)** — Replace the silent `return` with `Alert.alert('Invalid Quantity', 'Please enter a number greater than 0.')`. ~5 min.
- [ ] **B. Add inline field validation** — Show a red error message below the quantity input field instead of a modal Alert. Better UX but requires wiring an error state to the screen. ~20 min.

---

## 11. Care event date/time handling

`CreateCareEventController.ts:85`

- [ ] **A. Strip time from due date (Recommended)** — When creating the Tstamp, normalize to start-of-day: `dateToTstamp(startOfDay(new Date(dueDate)))` using date-fns `startOfDay`. Ensures consistent behavior regardless of when the user creates the event. ~5 min.
- [x] **B. Leave as-is** — The server-side check in `dailyCareReminder` uses end-of-day (23:59:59), so overdue detection works correctly. The local UI edge case only affects users creating events near midnight. Very low probability.

---

## 12. Export filename not sanitized

`ExportService.ts:61`

- [x] **A. Sanitize filename (Recommended)** — Replace invalid characters: `data.animal.name.replace(/[\/\\:*?"<>|]/g, '_')`. ~5 min.
- [ ] **B. Use animal ID instead of name** — Use `${data.animal.id}-complete-record` for the filename. Guaranteed safe but less readable for the user. ~2 min.

---

## 13. Account linking partial failure

`LinkAccountController.ts:34-39`

- [x] **A. Check updateUser result + Alert (Recommended)** — Wrap `updateUser` in try/catch. On failure, show Alert explaining the account was linked but profile update failed. The user can update their name later from settings. Auth linking is the critical step and it succeeded. ~10 min.
- [ ] **B. Retry updateUser on failure** — If updateUser fails, retry once automatically. If still fails, show Alert. Handles transient issues. ~15 min.
- [ ] **C. Wrap both operations in sequence with rollback** — If updateUser fails, unlink the credential. Full rollback. Complex because Firebase `unlink` requires knowing the provider ID. ~45 min. Overkill for this case.
