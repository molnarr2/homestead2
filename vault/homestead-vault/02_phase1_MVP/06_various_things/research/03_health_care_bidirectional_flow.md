# Health Record & Care Event Bidirectional Flow

This document defines the two-way flow between health records and care events, building on the care event category system from [02_care_event_categories_deep_dive.md](02_care_event_categories_deep_dive.md).

## Two Directions

There are two user journeys that need to be connected:

1. **Health Record -> Care Event**: User creates a health record and wants to schedule the next one
2. **Care Event -> Health Record**: User completes a care event and needs to record the medical details

---

## Direction 1: Health Record -> Care Event

### 1A: Future Date Interception

**When it triggers:** User saves a health record where the `date` field is in the future.

**Flow:**
1. User fills out health record form with a future date
2. User taps Save
3. Modal appears instead of saving:

```
┌─────────────────────────────────────────────┐
│                                         [X] │
│                                             │
│   This date is in the future                │
│                                             │
│   Health records track treatments that      │
│   have already been given. If you're        │
│   planning future care, a care reminder     │
│   will notify you when it's due and let     │
│   you record the details when it's done.    │
│                                             │
│   ┌───────────────────────────────────────┐ │
│   │       Create Care Reminder            │ │
│   └───────────────────────────────────────┘ │
│                                             │
│   ┌───────────────────────────────────────┐ │
│   │          Save Anyway                  │ │
│   └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Three outcomes:**

- **X (close)**: Dismiss modal, return to the edit form. User can change the date or continue editing.
- **"Create Care Reminder"**: Discard the health record form data. Create a care event pre-filled with:
  - `name` = health record's `name`
  - `animalId` = health record's `animalId`
  - `dueDate` = health record's `date` (the future date)
  - `contactName` = health record's `providerName`
  - `contactPhone` = health record's `providerPhone`
  - `healthRecordType` = health record's `recordType` (e.g., `'deworming'`)
  - `type` = `'careSingle'`
  - Medical details (dosage, route, withdrawal days) are **discarded** for MVP. The user hasn't done the procedure yet so these details may change.
  - Navigate to the care event creation screen pre-filled, or save directly and navigate back with a success message.
- **"Save Anyway"**: Save the health record as-is with the future date. No care event created. This is the escape hatch for edge cases.

### 1B: Schedule Next After Saving

**When it triggers:** User saves a health record with a date in the past or today (normal flow).

**Flow:**
1. User saves a health record normally
2. After successful save, a prompt appears:

```
┌─────────────────────────────────────────────┐
│                                         [X] │
│                                             │
│   Schedule next [record type]?              │
│                                             │
│   Create a care reminder to notify you      │
│   when this is due again.                   │
│                                             │
│   ┌───────────────────────────────────────┐ │
│   │     [date picker or input]            │ │
│   └───────────────────────────────────────┘ │
│                                             │
│   ┌───────────────────────────────────────┐ │
│   │       Schedule Reminder               │ │
│   └───────────────────────────────────────┘ │
│                                             │
│   ┌───────────────────────────────────────┐ │
│   │            Skip                       │ │
│   └───────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

**Behavior:**
- User picks a date and taps "Schedule Reminder": creates a care event with `healthRecordType` set from the health record's `recordType`, `name`, `animalId`, and contact info carried over. Navigate back with success.
- User taps "Skip" or X: no care event created, navigate back normally.

**Which health record types show this prompt?**
- `vaccination`: yes (boosters are recurring)
- `deworming`: yes (regularly scheduled)
- `medication`: yes (courses may need follow-up)
- `vetVisit`: yes (follow-ups are common)
- `illness`: no (reactive, not scheduled)
- `injury`: no (reactive, not scheduled)

This replaces the existing `vaccineNextDueDate` and `vetFollowUpDate` fields on HealthRecord. Those fields currently auto-create care events silently in HealthService. The new prompt does the same thing but for all relevant record types and with user visibility into what's happening.

**Note:** The existing `vaccineNextDueDate` and `vetFollowUpDate` fields do not need to be removed in MVP. The new prompt can coexist. Removal can happen in a later cleanup pass.

---

## Direction 2: Care Event -> Health Record

### The `healthRecordType` field on CareEvent

As defined in [02_care_event_categories_deep_dive.md](02_care_event_categories_deep_dive.md), care events and care templates gain a new field:

```
healthRecordType: HealthRecordType | ''
```

Valid values: `'vaccination'`, `'deworming'`, `'medication'`, `'vetVisit'`, `'illness'`, `'injury'`, or `''` (no health record needed).

In practice, the common medical ones are `'vaccination'`, `'deworming'`, and `'medication'`. A care event for a vet visit is less typical but possible (e.g., "Annual checkup").

### Where does `healthRecordType` get set?

**From a template:** The `AnimalTypeCareTemplate` has the `healthRecordType` field. When a user creates a care event from a template, the field carries over. Templates like "Quarterly Deworming" would have `healthRecordType: 'deworming'` set by the user when they configure the template.

**Manual entry:** The create care event screen adds an optional "Health Record Type" picker. If the user is creating a freeform care event (no template), they can optionally set it. Default is `''` (husbandry, no health record needed).

### Completion Flow

**Husbandry care event (healthRecordType is empty):**
1. User taps "Mark Complete"
2. Care event gets `completedDate` set
3. If recurring, next care event is created
4. Done — same as today

**Medical care event (healthRecordType is set):**
1. User taps "Mark Complete"
2. App navigates to the health record creation screen, pre-filled with:
   - `recordType` = care event's `healthRecordType`
   - `animalId` = care event's `animalId`
   - `name` = care event's `name`
   - `date` = today
   - `providerName` = care event's `contactName`
   - `providerPhone` = care event's `contactPhone`
3. User fills in medical details (dosage, route, withdrawal days, etc.)
4. User saves the health record
5. On successful save, the originating care event is automatically marked complete
6. If recurring, next care event is created
7. Withdrawal tracking works because a health record now exists

**What if the user backs out of the health record form?**
- The care event is NOT marked complete. They return to the care event detail screen where "Mark Complete" is still available.
- This enforces that medical care events always produce a health record to be considered complete.

**The "Schedule next" prompt (1B) should NOT appear in this flow.** When completing a medical care event, the recurring care event system already handles scheduling the next one. Showing the "Schedule next?" prompt would be redundant and confusing.

### Care Event Detail Screen Changes

When a care event has `healthRecordType` set, the detail screen should show:
- A label or badge indicating the health record type (e.g., "Deworming" with a medical icon)
- The "Mark Complete" button label could change to "Complete & Record" to hint that a health record form will follow

---

## Full Lifecycle Example

A farmer sets up "Quarterly Deworming" for their goat Daisy:

1. **Template**: They create a care template "Quarterly Deworming" with `type: 'careRecurring'`, `cycle: 90`, `healthRecordType: 'deworming'`
2. **Care event created**: From the template, a care event is created for Daisy with due date June 15
3. **Due date arrives**: Home screen shows "Deworming - Daisy" in the due today section
4. **User completes it**: Taps the event, taps "Complete & Record"
5. **Health record form**: Opens pre-filled with recordType: deworming, animalId: Daisy, date: today. User enters: SafeGuard, 2.5mL, Oral, 14-day meat withdrawal
6. **Health record saved**: Deworming record is created. Withdrawal tracking kicks in — home screen shows "SafeGuard - meat (14 days remaining)"
7. **Care event marked complete**: The original care event gets completedDate set
8. **Next care event created**: A new care event "Quarterly Deworming" is created for Daisy with due date September 13 (90 days later). It inherits `healthRecordType: 'deworming'`
9. **Cycle repeats**

If at any point the user goes to the Health tab and tries to add a deworming record with a future date, the modal intercepts and offers to create a care reminder instead.

---

## Summary of Changes

| Area | Change |
|---|---|
| `AnimalTypeCareTemplate` schema | Add `healthRecordType: HealthRecordType \| ''` |
| `CareEvent` schema | Add `healthRecordType: HealthRecordType \| ''` |
| EditCareTemplateScreen | Add health record type picker |
| CreateCareEventScreen | Add optional health record type picker (auto-set from template) |
| CareEventDetailScreen | Show health record type badge, change button label to "Complete & Record" for medical events |
| CareEventDetailController | On complete: if medical, navigate to CreateHealthRecord with pre-fill params and `careEventId` |
| CreateHealthRecordScreen/Controller | Accept `careEventId` param. On save, mark originating care event complete. Suppress "Schedule next" prompt when completing a care event |
| CreateHealthRecordScreen/Controller | On save with future date, show interception modal |
| CreateHealthRecordScreen/Controller | On save with past/today date (non-care-event flow), show "Schedule next?" prompt for applicable record types |
| HealthService | Accept optional `careEventId`, call completeCareEvent after save |
| Existing data | No migration. Missing `healthRecordType` defaults to `''` (husbandry behavior) |
