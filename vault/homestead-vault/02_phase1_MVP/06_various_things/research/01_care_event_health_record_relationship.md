# Care Event & Health Record Relationship

## Current Design

**CareEvent** is task/schedule-oriented. It tracks recurring or one-off chores for an animal (e.g., hoof trimming every 8 weeks, deworming). Key traits:
- Can be `careRecurring` or `careSingle`
- Has a `cycle` (days between occurrences) and `dueDate`/`completedDate` for scheduling
- Links to a `templateId` (predefined care templates)
- Tracks `createdNextRecurringEvent` to chain recurring tasks
- No medical detail fields - just a name, contact info, notes, and a photo

**HealthRecord** is medical-record-oriented. It logs specific medical events (vaccinations, medications, deworming, vet visits, illness, injury). Key traits:
- Six specialized `recordType` values, each with type-specific fields (dosage, route, lot number, withdrawal periods, diagnosis, symptoms, etc.)
- Tracks `cost` and withdrawal periods (`medicationWithdrawalDays`, `dewormingWithdrawalDays`) for food-safety compliance
- Has vet-specific fields (clinic, diagnosis, treatment notes, follow-up date)
- No scheduling/recurrence - it is a historical record of what happened

**In short:** CareEvent = "what needs to be done and when." HealthRecord = "what medical treatment was given and the clinical details."

---

## Issues Found

### 1. HealthRecord has future-facing fields that violate its own purpose

HealthRecord is a record of something that **happened** - its `date` field is "when was this administered." But it contains two future-pointing fields:

- `vaccineNextDueDate` - a future scheduling date
- `vetFollowUpDate` - a future scheduling date

These are scheduling concerns, not medical record concerns. The health record is acting as both a historical record and a scheduling input, which muddies the separation.

### 2. HealthService already knows about CareService - bridges the gap one-way

HealthService takes ICareService as a constructor dependency. When you create a vaccination or vet visit health record, it auto-creates a care event from `vaccineNextDueDate` or `vetFollowUpDate`. So the system already partially understands that "a health event should spawn a future care event."

But this only works in one direction: **Health -> Care**. The reverse - completing a care event creating a health record - does not exist.

### 3. Completing a care event is a dead end

When you mark a care event complete (CareService.completeCareEvent), it:
- Sets `completedDate`
- If recurring, creates the next care event

That is it. No health record is created. No withdrawal is tracked. So if someone completes a "Deworming" care event, nothing gets recorded medically. The withdrawal system (WithdrawalUtility, home screen dashboard) only reads from HealthRecord[] - that deworming is invisible to withdrawal tracking.

### 4. Care events have no concept of "what kind of medical event this is"

A care event is just a name string. There is no `careCategory` or link to a `HealthRecordType`. The system cannot know that a care event named "Deworming" should trigger withdrawal tracking, or that "Vaccination" needs dosage info. The care template system gives it a name but no medical semantics.

---

## Ideas

### Idea A: "Complete care event" prompts user to create a health record

Keep the clean separation. Care = scheduling, Health = medical record. But when the user taps "Mark Complete" on a care event, the app navigates them to a pre-filled health record creation screen instead of just silently completing it.

- The care event would need a new field like `healthRecordType?: HealthRecordType` (set via templates or manually) so the app knows which health record form to pre-fill.
- After the health record is saved, the care event gets marked complete automatically.
- Withdrawal tracking works because a real health record now exists.
- If the care event does not map to a health type (e.g., "Hoof Trimming"), it completes normally as it does today.

**Tradeoff:** More taps for the user on every completion. But it captures the medical data that is otherwise lost.

### Idea B: Remove future-date fields from HealthRecord, let Care own all scheduling

Strip `vaccineNextDueDate` and `vetFollowUpDate` from HealthRecord. Instead, after creating a health record, present an optional "Schedule follow-up?" step that creates a care event. This makes the data flow always:

```
Care Event (schedule) -> complete -> Health Record (history)
Health Record (history) -> optionally -> new Care Event (schedule)
```

A clean cycle. Health records become purely historical. Care events own all future dates. `vaccineNextDueDate` stops being a field on a medical record where it does not belong.

**Tradeoff:** Loses the current auto-create behavior (which is convenient), replaces it with an explicit user step. But the data model is cleaner.

### Idea C: Combine A + B into a unified lifecycle

The full version:
1. Remove `vaccineNextDueDate` and `vetFollowUpDate` from HealthRecord
2. Add an optional `healthRecordType` field to CareEvent (linking care events to health categories)
3. On health record creation: offer "Schedule a care reminder?" which creates a care event
4. On care event completion: if it has a `healthRecordType`, navigate to health record creation pre-filled with that type. After save, mark care event complete
5. If care event has no `healthRecordType` (e.g., hoof trimming), just complete normally

This creates a proper bidirectional lifecycle: health records can spawn care events, and care events can spawn health records. Withdrawals always work because the medical event always produces a health record.

---

## Recommendation

**Idea C** is the cleanest long-term, but it is a significant refactor (schema changes, new UI flows, template updates). **Idea A** alone gets 80% of the value - it closes the withdrawal gap without removing existing fields. A could be done first and evolved toward C later.
