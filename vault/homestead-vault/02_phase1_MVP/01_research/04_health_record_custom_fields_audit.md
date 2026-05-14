# Health Record Custom Fields Audit

> An audit of the health record type system, focusing on how custom data fields are defined, stored, rendered, and maintained -- with options for improving the architecture as the number of record types grows.

---

## Current Architecture

The system uses a **flat union schema** -- one `HealthRecord` interface holds all fields for all 6 record types (vaccination, medication, deworming, vetVisit, illness, injury). Type-specific fields are prefixed (`vaccine*`, `medication*`, `deworming*`, `vet*`). Unused fields default to `''` / `0` / `null` and are always stored in Firestore.

Type-specific UI is handled by 5 dedicated field components (`VaccinationFields`, `MedicationFields`, `DewormingFields`, `VetVisitFields`, `IllnessInjuryFields`) that are conditionally rendered based on `recordType`.

### Current Record Types

| Type | Icon | Custom Fields |
|------|------|---------------|
| Vaccination | needle | lotNumber, nextDueDate, route |
| Medication | pill | dosage, dosageUnit, route, frequency, withdrawalDays, withdrawalType |
| Deworming | bug | dosage, dosageUnit, withdrawalDays, withdrawalType |
| Vet Visit | stethoscope | clinicName, diagnosis, treatmentNotes, followUpDate |
| Illness | thermometer | symptoms, treatment, resolvedDate, outcome |
| Injury | bandage | symptoms, treatment, resolvedDate, outcome |

---

## What Works

- **Clear separation of concerns** -- field components are isolated per record type, making each one easy to understand
- **Withdrawal system is well-implemented** -- `WithdrawalUtility.ts` calculates status correctly, and both medication and deworming wire it up with live date previews
- **Group health records work** -- records can be applied to an entire group, and the animal health tab merges individual + group records for display
- **Consistent controller pattern** -- Create and Edit controllers follow the same hook-based pattern with per-field state

---

## Problems

### Structural

1. **No centralized field-to-type mapping** -- which fields belong to which record type is defined implicitly across ~7 files (schema, 5 field components, detail screen). Adding a new record type or field requires touching all of them.

2. **All fields stored on every record** -- a vaccination record carries `medicationDosage: 0`, `dewormingDosage: ''`, `vetClinicName: ''`, etc. in Firestore. Wastes storage and makes the data model unclear when reading documents directly.

3. **Detail screen is a wall of conditionals** -- `HealthRecordDetailScreen` has 40+ lines of `if (recordType === 'x')` blocks to render the read-only view. Fragile and easy to miss a field.

### Naming and Consistency

4. **Inconsistent field naming** -- prefixes don't follow a pattern:
   - `vaccine` + `LotNumber` / `NextDueDate` / `Route`
   - `medication` + `Dosage` / `Route` / `Frequency`
   - `deworming` + `Dosage` / `WithdrawalDays` (no `dewormingRoute`)
   - Withdrawal fields: `withdrawalPeriodDays` vs `dewormingWithdrawalDays`, `withdrawalType` vs `dewormingWithdrawalType`

5. **Enum duplication** -- `DOSAGE_UNITS`, `ROUTES`, `WITHDRAWAL_TYPES` are hardcoded as local constants in both `MedicationFields.tsx` and `DewormingFields.tsx`. No single source of truth.

6. **Deworming is missing a route field** -- medication has `medicationRoute` (Oral, Injection, Topical, etc.), but deworming has no equivalent, even though dewormers are administered via different routes.

### Validation

7. **Minimal validation** -- controllers only check that `name` is non-empty. No runtime validation for dosage being positive, withdrawal days being reasonable, enum values being valid, dates being in valid ranges, or cost being non-negative.

8. **No field presence rules** -- no concept of "required vs optional" per record type. The UI shows all type-specific fields, but nothing prevents saving a medication record with dosage `0` and route `''`.

### Minor

9. **Cost field has no currency context** -- stored as a number, displayed with `$`, no currency type.

10. **No field-level change tracking** -- only `admin.updated_at` exists. No audit trail if someone changes a dosage from 5mL to 50mL.

---

## How Many Types Could There Be?

Realistically **8-12**, not 20+. The current 6 cover core medical events. Plausible additions:

- **Hoof/Foot Care** -- trimming, treatment (big deal for goats, cattle, horses)
- **Surgery** -- distinct enough from vet visit to warrant its own fields (anesthesia, recovery notes, sutures)
- **Dental** -- floating teeth (horses), inspections
- **Lab/Test Results** -- fecal egg counts, blood panels, pregnancy tests (result values, reference ranges)
- **Quarantine** -- start/end dates, reason, location

That gets to ~11. Beyond that, things like "eye exam" or "skin treatment" fold into illness/injury or vet visit. The only path to 20+ would be letting users define fully custom record types, which is a different architecture entirely.

---

## Options

### Option 1: Keep the Flat Schema (Status Quo+)

Clean up what's there -- fix naming inconsistencies, deduplicate enums, accept that each new type means touching ~7 files.

**When it makes sense:** Staying at 8 or fewer types and not adding/changing fields often.

**Downside:** Firestore documents keep growing with irrelevant null fields. Every new type is a scattershot edit across the codebase.

### Option 2: Field Configuration Map

Create a single config object that defines, per record type, which fields to show, their labels, input types, and validation rules. The field components and detail screen render dynamically from the config instead of hardcoded conditionals.

```
vaccination -> [lotNumber, nextDueDate, route]
medication  -> [dosage, dosageUnit, route, frequency, withdrawalDays, withdrawalType]
hoofCare    -> [hoofCondition, trimType, nextTrimDate]
```

One file to add a new type. The schema stays flat but only populated fields get written to Firestore.

**When it makes sense:** Heading toward 8-12 types and want maintainability without over-engineering.

**Downside:** Upfront refactor work. Withdrawal logic and other "smart" behaviors (like showing a calculated end date) need special handling in the config -- not everything is a simple text/number/date/picker input.

### Option 3: Discriminated Union Schema

Replace the flat schema with a base `HealthRecord` containing shared fields (`name`, `date`, `cost`, `notes`, `photo`, etc.) and a `data` field that holds a typed union:

```
data: VaccinationData | MedicationData | DewormingData | HoofCareData | ...
```

Each union member only contains its own fields. Firestore documents are lean -- no irrelevant nulls.

**When it makes sense:** Data cleanliness matters and TypeScript should enforce which fields belong to which type at compile time.

**Downside:** Bigger refactor. Migration needed for existing records. The `data` field is a nested object in Firestore, which changes how you query (though queries are mostly by `animalId` and `recordType`, so minimal impact).

### Option 4: Config Map + Discriminated Union (2 + 3 Combined)

The config map drives the UI, the discriminated union enforces the data shape. Best of both worlds -- one file to add a type, clean Firestore documents, full type safety.

**When it makes sense:** Building this to last and willing to invest in the refactor.

**Downside:** Most upfront work. Probably overkill if staying under 10 types.

---

## Recommendation

**Option 2 (Field Configuration Map)** -- it gives the biggest maintainability win for the least disruption. The flat schema isn't great but it works, and migrating existing Firestore data is a headache that isn't needed right now. The config map solves the actual pain point: adding/editing types without a 7-file scavenger hunt.

If starting fresh, Option 4 would be the answer. But given there's production data and a working system, the config map alone gets 80% of the benefit at 30% of the cost.
