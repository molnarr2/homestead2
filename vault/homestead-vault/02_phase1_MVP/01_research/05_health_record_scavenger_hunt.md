# Health Record: The 7-File Scavenger Hunt

> What it takes to add a new health record type today, what we actually do with health record data beyond storing it, and how a field configuration map would change the picture.

---

## The Problem: Adding a New Record Type

To add a single new record type (e.g. "Hoof Care"), you currently touch these files:

| # | File | What You Do |
|---|------|-------------|
| 1 | `schema/health/HealthRecord.ts` | Add prefixed fields (`hoofCondition`, `hoofTrimType`, `hoofNextTrimDate`) to the flat interface. Add `'hoofCare'` to the `HealthRecordType` union. Update `healthRecord_default()` with defaults. |
| 2 | `feature/health/component/HoofCareFields.tsx` | Create a new field component with inputs for each type-specific field. Wire up labels, keyboard types, pickers. |
| 3 | `feature/health/component/HealthRecordTypeSelector.tsx` | Add `{ type: 'hoofCare', label: 'Hoof Care', icon: 'shoe-print' }` to the `TYPES` array. |
| 4 | `feature/health/screen/CreateHealthRecordScreen.tsx` | Add conditional rendering for the new field component. Add the new fields to the submit spread. |
| 5 | `feature/health/screen/EditHealthRecordScreen.tsx` | Same as create -- conditional rendering and field population from existing record. |
| 6 | `feature/health/screen/HealthRecordDetailScreen.tsx` | Add a new conditional block to render the read-only view of hoof care fields. |
| 7 | `feature/animal/component/AnimalHealthTab.tsx` | Add the icon mapping for the new type in the list view. |

If the new type has withdrawal tracking or auto-reminder behavior, add two more:

| 8 | `util/WithdrawalUtility.ts` | Add withdrawal extraction logic for the new fields. |
| 9 | `feature/health/service/HealthService.ts` | Add auto-creation of CareEvent (like vaccination does for `vaccineNextDueDate`). |

**The issue isn't complexity -- each edit is small.** The issue is that the knowledge of "what fields belong to hoof care" is scattered across 7-9 files with no single source of truth. Miss one file and you get a silent bug: a field that saves but doesn't display, or displays on create but not on edit.

---

## What We Actually Do With Health Record Data

Health records aren't just stored and displayed back. The data flows into 5 distinct downstream uses:

### 1. Withdrawal Tracking (Safety-Critical)

Medication and deworming records with `withdrawalPeriodDays > 0` or `dewormingWithdrawalDays > 0` feed into `WithdrawalUtility.ts`, which calculates whether meat/milk/eggs are safe to consume.

**Where it surfaces:**
- **Home dashboard** -- "Active Withdrawals" section with countdown per animal
- **Animal health tab** -- expandable withdrawal banner at top of list
- **Health record detail** -- `WithdrawalStatusCard` showing ACTIVE/CLEAR status with end date

**Fields consumed:** `date`, `name`, `withdrawalPeriodDays`, `withdrawalType`, `dewormingWithdrawalDays`, `dewormingWithdrawalType`

This is the most important downstream use. Getting withdrawal math wrong has real consequences (consuming contaminated food).

### 2. Auto-Created Care Reminders

Vaccination records with a `vaccineNextDueDate` automatically create a CareEvent so the vaccination appears in the care dashboard as an upcoming task.

**Fields consumed:** `vaccineNextDueDate`, `name`, `providerName`, `providerPhone`

**Gap:** Vet visit records have a `vetFollowUpDate` field but it does NOT auto-create a reminder. Inconsistent behavior -- if you record a vet visit with a follow-up date, nothing reminds you.

### 3. Animal Timeline

Health records appear as red timeline items on the animal detail screen, interleaved with care events, breeding records, notes, and weight logs.

**Fields consumed:** `recordType`, `name`, `date` (for display and sorting)

The timeline only shows a one-line summary (`"vaccination: Rabies"`). No type-specific fields are rendered here.

### 4. Animal Health Tab List

The primary list view on the animal detail screen. Merges individual records with group health records, sorted by date descending.

**Fields consumed:** `name`, `recordType` (for icon and badge), `date`, `notes` (first line preview), plus group name if applicable.

No type-specific fields are shown in the list -- just the common fields. Type-specific data only appears when you tap into the detail view.

### 5. Group Record Merging

When a health record is created at the group level (e.g. deworming an entire flock), every animal in that group sees it in their health tab with a group badge. The record lives in the group's subcollection, not on each animal.

**Fields consumed:** Same as individual records, plus `groupId` and `groupName` for attribution.

---

## What a Field Configuration Map Would Change

### The Config

A single file that defines every record type and its fields:

```
hoofCare: {
  label: 'Hoof Care',
  icon: 'shoe-print',
  fields: [
    { key: 'hoofCondition', label: 'Condition', inputType: 'text' },
    { key: 'hoofTrimType', label: 'Trim Type', inputType: 'picker', options: ['Maintenance', 'Corrective', 'Therapeutic'] },
    { key: 'hoofNextTrimDate', label: 'Next Trim Date', inputType: 'date' },
  ],
  behaviors: {
    withdrawal: false,
    autoReminder: { dateField: 'hoofNextTrimDate', namePrefix: 'Hoof Trim' },
  },
}
```

### What It Replaces

| Current File | What Changes |
|---|---|
| `HealthRecordTypeSelector.tsx` | Reads types from config. No manual array. |
| `HoofCareFields.tsx` (new component) | **Eliminated.** A generic `DynamicFields` component renders from config. |
| `CreateHealthRecordScreen.tsx` | No conditionals. Renders `DynamicFields` for the selected type. Submit collects only the fields defined in config. |
| `EditHealthRecordScreen.tsx` | Same -- no conditionals. Populates `DynamicFields` from existing record. |
| `HealthRecordDetailScreen.tsx` | No conditional blocks. Iterates config fields and renders label/value pairs. |
| `AnimalHealthTab.tsx` | Icon comes from config instead of a hardcoded map. |

### What It Doesn't Replace

The config handles simple fields (text, number, date, picker). But two behaviors need special handling:

**Withdrawal tracking** -- The withdrawal calculation consumes specific fields and feeds results into the dashboard and status cards. The config can declare `withdrawal: true` and point to the relevant field keys (`withdrawalDays`, `withdrawalType`), but `WithdrawalUtility.ts` still needs to know how to find those fields. A small adapter, not a big deal.

**Auto-reminders** -- The config can declare `autoReminder: { dateField: 'hoofNextTrimDate', namePrefix: 'Hoof Trim' }` and the service reads that to create CareEvents. This actually becomes cleaner than today -- currently only vaccination does this, and vet visit's `vetFollowUpDate` is silently ignored. With the config, any type can opt in.

### Adding a New Type With the Config

One file edit. Add the type definition to the config. Done.

If it needs withdrawal tracking: add `withdrawal: true` and field keys to the config. If it needs auto-reminders: add the `autoReminder` declaration. No new components, no conditional blocks, no icon mapping updates.

---

## Tradeoffs

### What You Gain

- **One file to add a type** instead of 7-9
- **Impossible to have create/edit/detail drift** -- all three render from the same config
- **Auto-reminders become declarative** -- any type can opt in, fixing the vet visit follow-up gap for free
- **Validation rules live with field definitions** -- can enforce required fields, numeric ranges, etc. per type

### What You Pay

- **Upfront refactor** -- rewriting create/edit/detail screens to be config-driven. The withdrawal and auto-reminder adapters need thought.
- **Less flexibility per field** -- a config-driven system handles standard inputs well (text, number, date, picker). If a future type needs a truly custom UI element (e.g. a body diagram for injury location), it won't fit the config and you'd need an escape hatch.
- **Debugging shift** -- instead of reading a straightforward component, you're reading a config + a generic renderer. Slightly more indirection.

### What Stays the Same

- Schema file still needs the fields (flat or discriminated -- separate decision)
- `WithdrawalUtility.ts` still does the math
- Store and service layer unchanged
- Timeline and list views unchanged (they only use common fields)

---

## Recommendation

The refactor is worth it if you're adding 2+ more record types. The current system works but it's a "know which 7 files to touch" kind of works. The config map turns that into "add an entry to the config" and eliminates an entire class of bugs (field appears on create but not detail, icon missing for new type, etc.).

The vet visit follow-up gap is a nice bonus -- it falls out naturally from making auto-reminders declarative instead of hardcoded to vaccination only.
