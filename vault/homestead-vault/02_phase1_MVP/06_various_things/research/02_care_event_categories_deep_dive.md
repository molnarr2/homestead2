# Care Event Categories - Deep Dive

Following from [01_care_event_health_record_relationship.md](01_care_event_health_record_relationship.md), this explores the idea of care event categories — where the template drives whether completing a care event requires a health record.

## The Core Insight

Not all care events are the same. There are two distinct patterns:

| Category | Examples | Recurring? | Medical detail? | Withdrawal? |
|---|---|---|---|---|
| **Husbandry** | Hoof trimming, shearing, pen cleaning, weighing | Often | No | No |
| **Medical** | Vaccination, deworming, medication | Often | Yes | Yes |

Husbandry care events are simple: schedule, complete, done. Medical care events need to produce a health record because that's where dosage, route, withdrawal periods, and cost live.

## How Templates Drive This

Currently `AnimalTypeCareTemplate` has:
```
id, name, type (recurring/single), cycle, contactName, contactPhone
```

The template already determines what *kind* of care event this is. A template named "Quarterly Deworming" is always medical. A template named "Hoof Trimming" is always husbandry. The system just doesn't know that yet.

### Proposed: Add `healthRecordType` to the template

```
AnimalTypeCareTemplate {
  id: string
  name: string
  type: 'careRecurring' | 'careSingle'
  cycle: number
  contactName: string
  contactPhone: string
  healthRecordType: HealthRecordType | ''   // <-- new field
}
```

When `healthRecordType` is set (e.g., `'deworming'`, `'vaccination'`, `'medication'`), the template is a **medical** care event. When it's empty, it's **husbandry**.

This field flows down to `CareEvent` as well:
```
CareEvent {
  ...existing fields...
  healthRecordType: HealthRecordType | ''   // <-- new field, set from template
}
```

## Completion Flow

### Husbandry care event (healthRecordType is empty)
1. User taps "Mark Complete"
2. Care event gets `completedDate` set (same as today)
3. If recurring, next care event is created
4. Done

### Medical care event (healthRecordType is set)
1. User taps "Mark Complete"
2. App navigates to health record creation screen, pre-filled with:
   - `recordType` = the care event's `healthRecordType`
   - `animalId` = the care event's `animalId`
   - `name` = the care event's `name`
   - `date` = today
   - `providerName` = the care event's `contactName`
   - `providerPhone` = the care event's `contactPhone`
3. User fills in medical details (dosage, route, withdrawal days, etc.)
4. User saves the health record
5. Care event gets marked complete automatically
6. If recurring, next care event is created
7. Withdrawal tracking works because a real health record now exists

### What if the user skips the health record?
Options:
- **Option A**: Don't allow it. "Mark Complete" always opens the health record form for medical events. Back/cancel does not complete the care event.
- **Option B**: Allow it with a confirmation. "Skip health record? Withdrawal periods won't be tracked." This is more flexible but risks incomplete data.
- **Option C**: Allow a quick-complete that creates a minimal health record automatically (just name + date + type, no dosage/withdrawal). The user can edit it later.

Recommendation: **Option A** for MVP. If the care event is medical, the health record is the completion step. This is the whole point — ensuring medical events always produce a record.

## What About Non-Template Care Events?

Users can create care events without a template (freeform name). For these:
- The create care event screen would add an optional "Health Record Type" picker
- If the user names it "Deworming" and picks `deworming` as the type, it behaves as medical
- If they leave it blank, it behaves as husbandry
- Default is blank (husbandry) for backwards compatibility with existing care events

## What Happens to HealthRecord's Future-Date Fields?

With this model in place, the future-date fields on HealthRecord become redundant:

- `vaccineNextDueDate`: after saving a vaccination health record, the app could prompt "Schedule next vaccination?" and create a care event. Or if the vaccination *was* a care event completion, the recurring care event already handles this.
- `vetFollowUpDate`: after saving a vet visit health record, the app could prompt "Schedule follow-up?" and create a care event.

These fields could be removed from the schema and replaced with a post-save "Schedule follow-up care event?" prompt. But this is a separate change that doesn't need to happen at the same time. The category system works regardless.

## Impact on Existing Code

### Schema changes
- `AnimalTypeCareTemplate`: add `healthRecordType: HealthRecordType | ''`
- `CareEvent`: add `healthRecordType: HealthRecordType | ''`

### Template UI (EditCareTemplateScreen)
- Add a picker for health record type (vaccination, deworming, medication, or none)

### Care event creation (CreateCareEventScreen)
- When a template is applied, `healthRecordType` flows from the template
- For freeform events, add an optional health record type picker

### Care event completion (CareEventDetailController + CareService)
- If `healthRecordType` is set: navigate to CreateHealthRecord screen with pre-filled data and a `careEventId` param
- CreateHealthRecord detects the `careEventId` param and marks the care event complete after saving the health record
- If `healthRecordType` is empty: complete normally as today

### HealthService.createHealthRecord
- Accept an optional `careEventId` parameter
- After saving the health record, call `CareService.completeCareEvent` for that ID
- The existing auto-create-care-event logic for `vaccineNextDueDate` and `vetFollowUpDate` continues to work (can be removed later)

### Home screen / dashboard
- No changes needed. Overdue/due-today care events display the same. Withdrawal tracking already reads from health records, which now get created properly.

### Existing data
- Existing care events would have `healthRecordType: ''` (husbandry behavior). No migration needed, they continue to work exactly as before.
- Existing templates would have `healthRecordType: ''`. Users can edit them to add the health record type if they want.

## Open Questions

1. **Group care events**: When a group care event (e.g., "deworm the whole flock") is completed as medical, does it create one health record per animal in the group? That could be many records. Maybe it creates one health record and links it to the group instead?

2. **Pre-filled medical defaults on templates**: Should the template also store default dosage, product name, withdrawal days? That way when the health record form opens it's mostly pre-filled and the user just confirms. This would reduce friction but adds complexity to the template schema.

3. **Linking**: Should the health record store a reference back to the care event that spawned it (`careEventId`)? This would let you show the full lifecycle on the timeline: "Scheduled -> Completed -> Health Record." But it adds a cross-reference to maintain.
