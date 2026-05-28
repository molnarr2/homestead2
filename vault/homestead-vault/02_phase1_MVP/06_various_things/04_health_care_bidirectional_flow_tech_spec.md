# Health Record & Care Event Bidirectional Flow — Tech Spec

## Summary

Health records and care events are currently disconnected except for two auto-create paths (`vaccineNextDueDate`, `vetFollowUpDate`). This change creates a general bidirectional link: health records can spawn care reminders (future date interception + "schedule next" prompt), and medical care events can produce health records on completion. A new `healthRecordType` field on `CareEvent` and `AnimalTypeCareTemplate` is the join point.

## Current Behavior

**Health record creation** (`CreateHealthRecordController.ts:82-125`): User fills form, taps Save, record is written to Firestore. On success, `navigation.goBack()` fires immediately — no post-save prompts exist. The controller has no awareness of whether the date is in the future.

**Auto-created care events** (`HealthService.ts:68-104`): After writing the health record, `HealthService.createHealthRecord` checks two conditions:
- `recordType === 'vaccination' && vaccineNextDueDate` → creates a `careSingle` event named "Vaccination: {name}"
- `recordType === 'vetVisit' && vetFollowUpDate` → creates a `careSingle` event named "Vet Follow-Up: {name}"

These auto-creates are invisible to the user — no confirmation, no feedback.

**Care event completion** (`CareEventDetailController.ts:28-36`): User taps "Mark Complete", `bsCareService.completeCareEvent(event)` runs, and `navigation.goBack()` fires. No awareness of medical vs. husbandry.

**`CareService.completeCareEvent`** (`CareService.ts:82-124`): Batch write sets `completedDate` on current event. If recurring, creates next event copying all fields with a new `dueDate`. No link to health records.

**Care templates** (`AnimalType.ts:9-16`): `AnimalTypeCareTemplate` has: `id`, `name`, `type`, `cycle`, `contactName`, `contactPhone`. No health record type concept.

**Navigation params** (`RootNavigation.tsx:66-70`):
- `CreateCareEvent: { animalId: string; templateId?: string; groupId?: string }`
- `CreateHealthRecord: { animalId: string; recordType?: HealthRecordType; groupId?: string }`
- `CareEventDetail: { eventId: string; groupId?: string }`

## Desired Behavior

### Direction 1: Health Record → Care Event

**1A — Future date interception.** When the user taps Save on a health record form and `date` is after today, a modal appears instead of saving. Three outcomes:

- **Close (X):** Dismiss modal, return to the form. Nothing saved.
- **Create Care Reminder:** Discard the health record form data. Navigate to `CreateCareEvent` with pre-filled params: `name`, `animalId`, `dueDate` (from the future date), `contactName`/`contactPhone` (from provider fields), `healthRecordType` (from `recordType`), `type = 'careSingle'`. Medical details (dosage, route, withdrawal) are discarded — the procedure hasn't happened yet.
- **Save Anyway:** Save the health record as-is with the future date. No care event.

This applies to all record types.

**1B — Schedule next prompt.** When the user saves a health record with a date of today or earlier (normal path), and the `recordType` is one of `vaccination`, `deworming`, `medication`, or `vetVisit`, a "Schedule next?" modal appears after successful save. The modal contains a date picker and two buttons:

- **Schedule Reminder:** Creates a `careSingle` care event with `healthRecordType` set from the record's `recordType`, carrying over `name`, `animalId`, `contactName`/`contactPhone`, and the user-selected due date.
- **Skip:** No care event. Navigate back normally.

Reactive types (`illness`, `injury`) skip this prompt entirely — immediate `goBack()` as today.

**1B does NOT appear** when the health record was created from a care event completion (Direction 2). The `careEventId` route param signals this — the recurring care system already handles scheduling.

The existing `vaccineNextDueDate` and `vetFollowUpDate` auto-create paths in `HealthService.createHealthRecord` remain for MVP. They coexist with the new prompt. Removal is a future cleanup.

### Direction 2: Care Event → Health Record

**Husbandry completion (healthRecordType is empty):** Same as today. `completeCareEvent` runs, `goBack()`.

**Medical completion (healthRecordType is set):** When the user taps "Complete & Record" (renamed button), the app navigates to `CreateHealthRecord` with pre-filled params instead of completing immediately:
- `recordType` = care event's `healthRecordType`
- `animalId` = care event's `animalId`
- `name` = care event's `name`
- `date` = today
- `providerName` = care event's `contactName`
- `providerPhone` = care event's `contactPhone`
- `careEventId` = care event's `id`
- `groupId` = care event's `groupId` (if group context)

The user fills in medical details and saves. On successful save, the originating care event is automatically marked complete (including recurring next-event creation). If the user backs out without saving, the care event remains incomplete.

### Care template and create care event changes

`AnimalTypeCareTemplate` and `CareEvent` both gain a `healthRecordType` field. Templates carry this to events on creation. The create care event screen gains an optional picker. The edit care template screen gains the same picker.

## Schema Changes

### CareEvent (`schema/care/CareEvent.ts`)

Add field: `healthRecordType: HealthRecordType | ''` — default `''`

### AnimalTypeCareTemplate (`schema/animalType/AnimalType.ts`)

Add field: `healthRecordType: HealthRecordType | ''` — default `''`

### RootStackParamList (`navigation/RootNavigation.tsx`)

Modify `CreateHealthRecord` params:
- Add `name?: string`
- Add `providerName?: string`
- Add `providerPhone?: string`
- Add `date?: string`
- Add `careEventId?: string`
- Add `careEventGroupId?: string`

Modify `CreateCareEvent` params:
- Add `name?: string`
- Add `dueDate?: string`
- Add `contactName?: string`
- Add `contactPhone?: string`
- Add `healthRecordType?: HealthRecordType | ''`

No new collections or documents. No HealthRecord schema changes.

## Data Access Audit

**Direction 1A (future date interception):** Zero database reads. The modal is purely UI — it inspects the form's `date` field client-side before deciding whether to save. If the user picks "Create Care Reminder," a single `createCareEvent` write occurs. If "Save Anyway," a single `createHealthRecord` write occurs. No fan-out.

**Direction 1B (schedule next prompt):** The health record save is one write (already happens today). If the user taps "Schedule Reminder," one additional `createCareEvent` write. Two sequential writes total, same as the current `vaccineNextDueDate` auto-create path. No reads beyond what the form already has in state.

**Direction 2 (care event → health record):** The completion flow is: navigate to CreateHealthRecord (0 reads — all data passed via route params), user saves health record (1 write), then mark care event complete (1 batch write that may also create next recurring event). Two writes total. The `careEventId` is passed as a route param, so there is no need to re-fetch the care event. The `completeCareEvent` call needs the full `CareEvent` object — the `CareEventDetailController` already has it in state from the store subscription, so it can be serialized into the route params or the health record controller can call `bsCareService.getCareEvent(careEventId)` once after save. One read is acceptable since it happens post-save, not on the critical render path.

**Decision on passing care event data:** Pass `careEventId` and `careEventGroupId` as route params to CreateHealthRecord. After the health record save succeeds, the controller calls `bsCareService.getCareEvent(careEventId)` to get the full event object, then calls `bsCareService.completeCareEvent(event)`. This is one extra read but avoids serializing the entire CareEvent through navigation params. Acceptable because it's post-save and non-blocking for the UI.

**Recurring next-event creation:** `completeCareEvent` already copies all fields to the next event (`CareService.ts:97-113`). The new `healthRecordType` field must be included in this copy. Currently the code manually lists every field. Adding `healthRecordType` to that list ensures the next recurring event also links to health records.

**No N+1 issues.** All flows are single-document writes. No collection scans or loops.

## Touch Points

### Schema

- `apps/mobile/src/schema/care/CareEvent.ts` — Add `healthRecordType: HealthRecordType | ''` to interface and default function. Add import of `HealthRecordType`.
- `apps/mobile/src/schema/animalType/AnimalType.ts` — Add `healthRecordType: HealthRecordType | ''` to `AnimalTypeCareTemplate` interface.

### Navigation

- `apps/mobile/src/navigation/RootNavigation.tsx` — Expand `CreateHealthRecord` params with `name`, `providerName`, `providerPhone`, `date`, `careEventId`, `careEventGroupId`. Expand `CreateCareEvent` params with `name`, `dueDate`, `contactName`, `contactPhone`, `healthRecordType`.

### Service

- `apps/mobile/src/feature/care/service/CareService.ts` — Add `healthRecordType` to the next-event copy in `completeCareEvent` (line 97-113).
- `apps/mobile/src/feature/care/service/ICareService.ts` — No change needed (interface uses `CareEvent` type which will pick up the new field).

### Health Record (Direction 1)

- `apps/mobile/src/feature/health/screen/CreateHealthRecordController.ts` — Accept new route params and use them as initial state. Add future date check in `submit()`. Add state for modal visibility and "schedule next" modal. After save success: check `careEventId` (if set, complete originating care event, suppress schedule-next); check record type eligibility for schedule-next prompt; navigate accordingly.
- `apps/mobile/src/feature/health/screen/CreateHealthRecordScreen.tsx` — Add future date interception modal (three buttons: Close, Create Care Reminder, Save Anyway). Add "Schedule next?" modal with date picker (Schedule Reminder, Skip).

### Care Event (Direction 2)

- `apps/mobile/src/feature/care/screen/CareEventDetailController.ts` — Change `onComplete`: if `event.healthRecordType` is set, navigate to `CreateHealthRecord` with pre-filled params and `careEventId` instead of calling `completeCareEvent`.
- `apps/mobile/src/feature/care/screen/CareEventDetailScreen.tsx` — Show health record type badge when `event.healthRecordType` is set. Change button label from "Mark Complete" to "Complete & Record" for medical events.

### Care Templates

- `apps/mobile/src/feature/customization/screen/EditCareTemplateScreen.tsx` — Add `healthRecordType` picker (same selector style as the recurring/one-time toggle).
- `apps/mobile/src/feature/customization/screen/EditCareTemplateController.ts` — Add `healthRecordType` state, include in save payload.

### Create Care Event

- `apps/mobile/src/feature/care/screen/CreateCareEventController.ts` — Accept new route params (`name`, `dueDate`, `contactName`, `contactPhone`, `healthRecordType`) as initial state. Include `healthRecordType` in template application (`applyTemplate`). Include `healthRecordType` in submit payload.
- `apps/mobile/src/feature/care/screen/CreateCareEventScreen.tsx` — Add optional health record type picker. Auto-populate from route params or template.

### Edit Care Event

- `apps/mobile/src/feature/care/screen/EditCareEventScreen.tsx` — Add health record type picker (same as create screen).
- `apps/mobile/src/feature/care/screen/EditCareEventController.ts` — Add `healthRecordType` state, initialize from existing event, include in update payload.

## Data Migration

No migration required. Missing `healthRecordType` on existing `CareEvent` documents defaults to `''` at read time via `careEvent_default()` spread or falsy check. Existing `AnimalTypeCareTemplate` objects embedded in `AnimalType` documents will be missing the field — read code treats `undefined` as `''` (husbandry behavior). The existing `vaccineNextDueDate` and `vetFollowUpDate` auto-create paths continue to work unchanged.

## Risk

**Double care event creation.** If a user saves a vaccination with `vaccineNextDueDate` set AND taps "Schedule Reminder" in the 1B prompt, two care events could be created — one from the auto-create path in `HealthService` and one from the prompt. Mitigation: when the 1B prompt is shown and the user taps "Schedule Reminder," skip the auto-create path. The controller should strip `vaccineNextDueDate` and `vetFollowUpDate` from the record before calling `createHealthRecord` when a schedule-next care event is about to be created via the prompt. Alternatively, the 1B prompt can detect that `vaccineNextDueDate`/`vetFollowUpDate` is already set and suppress itself for that specific record. Either approach works — the first is cleaner because it consolidates scheduling into the prompt.

**Back-out consistency in Direction 2.** If the user navigates to CreateHealthRecord from a medical care event completion but backs out, the care event remains incomplete. This is intentional — it enforces that medical care events produce a health record. However, the user may be confused if they expected "Mark Complete" to complete the event directly. The renamed button "Complete & Record" mitigates this by setting the expectation that a health record form follows.

**Group care events.** The completion flow for group care events (`bsGroupService.completeGroupCareEvent`) must follow the same branching logic as individual events. The `CareEventDetailController` already handles group context via `groupId` — the new navigation to `CreateHealthRecord` must also pass `groupId` so the health record is created at the group level and the group care event gets completed after save.
