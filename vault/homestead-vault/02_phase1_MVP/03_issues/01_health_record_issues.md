# Health Record Issues

> Issues identified from the health record custom fields audit. Select an option per issue to fix, or skip.

---

## Critical

### 1. Vet Visit Follow-Up Date Does Not Create a Reminder

Vaccination records with `vaccineNextDueDate` auto-create a CareEvent so the user gets reminded. Vet visit records collect `vetFollowUpDate` but do nothing with it. The user enters a follow-up date and it just sits there -- no reminder, no dashboard visibility.

**Files:** `HealthService.ts` (lines 64-81 handle vaccination only)

- [x] **A. Add auto-reminder for vetFollowUpDate** -- Mirror the vaccination logic in `HealthService.ts`. When creating/updating a vet visit with a `vetFollowUpDate`, auto-create a CareEvent with name `"Vet Follow-Up: ${record.name}"`.
- [ ] **B. Remove vetFollowUpDate field** -- If we don't want to support it, remove it from the schema, default, and VetVisitFields component so users don't enter data that goes nowhere.

---

### 2. No Validation on Health Record Fields

Controllers only check that `name` is non-empty and an animal/group is selected. No field-level validation exists. A user can save a medication record with dosage `0`, route empty, and withdrawal days negative.

**Files:** `CreateHealthRecordController.ts` (lines 64-68), `EditHealthRecordController.ts` (lines 59-64)

- [ ] **A. Add basic validation on submit** -- Before saving, validate: dosage > 0 when provided, withdrawal days >= 0, dates are valid ISO strings, cost >= 0. Show an Alert with the first failing field.
- [x] **B. Add field-level inline validation** -- Same checks as A but show errors inline under each field instead of an Alert. More polished UX but more work.

---

## High

### 3. Deworming Has No Route Field

Medication has `medicationRoute` (Oral, Injection, Topical, IV, Intranasal, Subcutaneous, Intramuscular) but deworming has no equivalent. Dewormers are administered via different routes (oral paste, injectable, pour-on) and users have no way to record this.

**Files:** `HealthRecord.ts` (schema, lines 30-33), `DewormingFields.tsx` (no route input)

- [ ] **A. Add dewormingRoute field** -- Add `dewormingRoute: MedicationRoute` to the schema and a route picker to `DewormingFields.tsx`. Reuse the existing `MedicationRoute` type.
- [x] **B. Add dewormingRoute with deworming-specific options** -- Same as A but with a different set of routes tailored to dewormers: `'Oral' | 'Injectable' | 'Pour-On' | 'Feed Additive'`.

---

### 4. Withdrawal Field Naming Is Inconsistent

Medication uses `withdrawalPeriodDays` and `withdrawalType`. Deworming uses `dewormingWithdrawalDays` and `dewormingWithdrawalType`. The pattern breaks -- medication doesn't prefix with `medication` but deworming prefixes everything with `deworming`.

**Files:** `HealthRecord.ts` (lines 28-29, 32-33), `WithdrawalUtility.ts`, `HomeController.ts`, `HealthRecordDetailScreen.tsx`, `HealthRecordDetailController.ts`

- [ ] **A. Rename medication fields to match deworming pattern** -- Rename `withdrawalPeriodDays` to `medicationWithdrawalDays` and `withdrawalType` to `medicationWithdrawalType`. Update all references. Requires a Firestore migration or handling both old/new field names during reads.
- [ ] **B. Rename deworming fields to match medication pattern** -- Rename `dewormingWithdrawalDays` to `withdrawalPeriodDays2` ... this doesn't work well. The medication names are the oddball (no prefix). Skip this direction.
- [ ] **C. Leave as-is, document the inconsistency** -- Add a comment in the schema explaining the naming difference. Accept the tech debt.
- [x] **D. Make all fields consistent** -- Analyze the fields and make sure they are all consistent. Don't worry about Firestore migration since we are in development mode. Rename fields so they match a consistent pattern.

---

## Medium

### 5. Enum Constants Duplicated Across Components

`DOSAGE_UNITS` is defined identically in both `MedicationFields.tsx` (line 8) and `DewormingFields.tsx` (line 8). `WITHDRAWAL_TYPES` is duplicated the same way (lines 10 and 9 respectively). Changes to one won't automatically apply to the other.

**Files:** `MedicationFields.tsx` (lines 8-10), `DewormingFields.tsx` (lines 8-9)

- [ ] **A. Move to schema file** -- Export `DOSAGE_UNITS` and `WITHDRAWAL_TYPES` arrays from `HealthRecord.ts` alongside their type definitions. Both components import from there.
- [x] **B. Create a shared constants file** -- Create `feature/health/constants/healthConstants.ts` with all enum arrays. Keep schema file types-only.

---

### 6. Icon Mapping Duplicated in 3 Files

The record-type-to-icon mapping is defined identically in `AnimalHealthTab.tsx` (lines 19-26), `HealthRecordDetailScreen.tsx` (lines 18-25), and `HealthRecordTypeSelector.tsx` (lines 13-20). A new type requires updating all three.

**Files:** `AnimalHealthTab.tsx`, `HealthRecordDetailScreen.tsx`, `HealthRecordTypeSelector.tsx`

- [x] **A. Extract to shared constant** -- Create a single `HEALTH_RECORD_TYPE_CONFIG` array with `{ type, label, icon }` in a shared location. All three files import from it.
- [ ] **B. Add to schema file** -- Put the config alongside the type definitions in `HealthRecord.ts` since that's already the source of truth for record types.

---

### 7. Cost Field Has No Currency Context

Cost is stored as a plain number and displayed as `$${cost.toFixed(2)}`. No currency type is stored. International users see a dollar sign regardless of locale.

**Files:** `HealthRecordDetailScreen.tsx` (line 159)

- [ ] **A. Use locale-aware formatting** -- Replace `$${cost.toFixed(2)}` with `Intl.NumberFormat` using the device locale and currency. Store currency preference on the homestead or user profile.
- [x] **B. Keep dollar sign** -- Accept USD-only for now. This is a v2 concern and not worth the complexity today. This is a DO NOTHING at the moment.
- [ ] **C. Remove currency symbol** -- Display as `cost.toFixed(2)` with no symbol. Neutral but less clear.
