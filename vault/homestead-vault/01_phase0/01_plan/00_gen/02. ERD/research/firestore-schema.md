# HomeStead Firestore Schema Reference

Technical schema document for all Firestore collections, fields, relationships, and domain logic.

**Database:** Firebase Cloud Firestore (NoSQL document store)
**Architecture:** Flat root-level collections with `userId` / `animalId` fields for ownership and filtering.
**Soft-delete pattern:** All documents use `admin.deleted` flag -- documents are never hard-deleted.
**Timestamps:** All dates use ISO 8601 strings.

---

## Design Decision: Flat Root-Level Collections

All primary data collections are root-level rather than nested subcollections. This enables:

- **Single-query dashboard** -- "all active withdrawals for this user" is one query, not N+1 queries per animal.
- **Multi-user access (Farm tier)** -- security rules check a `userId` or `farmId` field instead of navigating deeply nested ownership paths.
- **Caretaker handoff** -- a caretaker can read care events and health records across all animals without being the owning user.
- **Simpler indexing** -- composite indexes on `userId` + filter fields cover all common query patterns.
- **Cloud Functions** -- triggers on root-level collections are straightforward without wildcarded subcollection paths.

Customization collections (breeds, care templates, event templates) remain nested under `animalTypes` since they're only accessed in the context of a specific animal type.

---

## Collection Hierarchy

```
/users/{userId}                                          # User profile
  /devices/{deviceId}                                    # Push notification tokens (per-user only)

/animals/{animalId}                                      # Animal profiles
/careEvents/{eventId}                                    # Care reminders & history
/healthRecords/{recordId}                                # Vaccinations, meds, vet visits, etc.
/breedingRecords/{recordId}                              # Breeding events & birth outcomes
/notes/{noteId}                                          # Timestamped observations
/weightLogs/{logId}                                      # Weight & body condition tracking
/productionLogs/{logId}                                  # Eggs, milk, fiber, honey, meat logs

/animalTypes/{typeId}                                    # Animal type definitions
  /breeds/{breedId}                                      # Breed definitions per type
  /careTemplates/{templateId}                            # Recurring/one-time care templates
  /eventTemplates/{templateId}                           # Custom event templates

/feedback/{feedbackId}                                   # Global user feedback
```

---

## Shared Objects

### AdminObject

Applied to every document in the system as the `admin` field.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deleted` | `boolean` | Yes | Soft-delete flag. `true` = logically deleted. |
| `createdAt` | `string` | Yes | ISO 8601 timestamp of document creation. |
| `updatedAt` | `string` | Yes | ISO 8601 timestamp of last update. |

### EventExtraDataObject

Flexible key-value structure used by care and event templates.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for this data field. |
| `name` | `string` | Yes | Display name of the field. |
| `description` | `string` | Yes | Help text describing what this field captures. |
| `valueType` | `"string" \| "number" \| "stringArray"` | Yes | Data type for the value. |
| `stringValue` | `string` | No | Value when `valueType` is `"string"`. |
| `numberValue` | `number` | No | Value when `valueType` is `"number"`. |
| `stringArrayValue` | `string[]` | No | Value when `valueType` is `"stringArray"`. |

---

## Collections

### 1. User Profile

**Path:** `/users/{userId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID (matches Firebase Auth UID). |
| `admin` | `AdminObject` | Yes | Metadata. |
| `firstName` | `string` | Yes | User's first name. |
| `lastName` | `string` | Yes | User's last name. |
| `email` | `string` | Yes | Email address. |
| `anonymous` | `boolean` | Yes | Whether the user signed in anonymously. |
| `selectedSpecies` | `string[]` | Yes | Species selected during onboarding. |
| `onboardingComplete` | `boolean` | Yes | Whether onboarding flow has been completed. |
| `subscription` | `string` | Yes | Current subscription tier: `"free"`, `"pro"`, or `"farm"`. |

---

### 2. Animal Profile

**Path:** `/animals/{animalId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `name` | `string` | Yes | Animal's name. |
| `animalType` | `string` | Yes | Species display name (e.g., "Chicken", "Goat"). |
| `animalTypeId` | `string` | Yes | Reference to `/animalTypes/{typeId}`. |
| `animalTypeLevel` | `"system" \| "user"` | Yes | Whether the type is built-in or user-created. |
| `breed` | `string` | Yes | Breed display name. |
| `animalBreedId` | `string` | Yes | Reference to `/animalTypes/{typeId}/breeds/{breedId}`. |
| `birthday` | `string` | Yes | ISO 8601 date string. |
| `gender` | `string` | Yes | Gender of the animal. |
| `color` | `string` | Yes | Color/markings. |
| `register` | `string` | No | Registration or tag number. |
| `state` | `"own" \| "sold" \| "died" \| "processed"` | Yes | Current status of the animal. |
| `notes` | `string` | No | General notes about the animal. |
| `photoStorageRef` | `string` | No | Firebase Storage path to the photo. |
| `photoUrl` | `string` | No | Public download URL for the photo. |
| `purchasePrice` | `number` | No | Purchase price paid for the animal. |
| `weight` | `number` | No | Current weight. |
| `weightUnit` | `string` | No | Unit for weight (`"lbs"`, `"kg"`). |
| `sireId` | `string` | No | Reference to father's `animalId`. |
| `damId` | `string` | No | Reference to mother's `animalId`. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalTypeId` -> `/animalTypes/{typeId}`
- `animalBreedId` -> `/animalTypes/{typeId}/breeds/{breedId}`
- `sireId` -> `/animals/{animalId}` (self-referencing)
- `damId` -> `/animals/{animalId}` (self-referencing)

**Domain Logic -- Age Display:**
```
age = today - birthday
if age < 1 month  -> display in days (e.g., "12 days")
if age < 12 months -> display in months (e.g., "4 months")
if age >= 12 months -> display in years and months (e.g., "2 years, 3 months")
```

---

### 3. Care Events

**Path:** `/careEvents/{eventId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `animalId` | `string` | Yes | Reference to the animal this care is for. |
| `templateId` | `string` | Yes | Reference to the care template used. |
| `name` | `string` | Yes | Display name (e.g., "Hoof Trim", "Deworming"). |
| `type` | `"careRecurring" \| "careSingle"` | Yes | Whether this care event recurs. |
| `cycle` | `string` | No | Recurrence interval in days (e.g., `"90"`). Required if `type` is `"careRecurring"`. |
| `dueDate` | `string` | Yes | ISO 8601 date when care is due. |
| `completedDate` | `string` | No | ISO 8601 date when care was completed. |
| `contactName` | `string` | No | Name of care provider (e.g., vet, farrier). |
| `contactPhone` | `string` | No | Phone number of care provider. |
| `notes` | `string` | No | Additional notes. |
| `photoStorageRef` | `string` | No | Firebase Storage path. |
| `photoUrl` | `string` | No | Public download URL. |
| `createdNextRecurringEvent` | `boolean` | Yes | Flag to prevent duplicate next-event creation. |

**Domain Logic -- Recurring Care Auto-Creation:**
```
On completion of a careRecurring event:
  1. Set completedDate = today
  2. Set createdNextRecurringEvent = true
  3. Create new careEvent with dueDate = completedDate + cycle days
```
- Next due date is calculated from the **completion date**, not the original due date (prevents cascading drift when completed late).
- One-time events (`careSingle`) do not create a next occurrence.
- Updating a template's cycle does not retroactively change existing scheduled events.

**Domain Logic -- Due Date Status:**
```
if (dueDate < today)       -> OVERDUE   (red)
if (dueDate == today)      -> DUE TODAY (amber/yellow)
if (dueDate <= today + 7)  -> UPCOMING  (green)
if (dueDate > today + 7)   -> FUTURE    (gray)
```
All date comparisons are date-only (ignore time component).

**Example Dashboard Query:**
```
db.collection('careEvents')
  .where('userId', '==', uid)
  .where('admin.deleted', '==', false)
  .where('completedDate', '==', null)
  .orderBy('dueDate')
```

---

### 4. Health Records

**Path:** `/healthRecords/{recordId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `animalId` | `string` | Yes | Reference to the animal this record belongs to. |
| `recordType` | `"vaccination" \| "medication" \| "deworming" \| "vetVisit" \| "illness" \| "injury"` | Yes | Type of health record. |
| `name` | `string` | Yes | Name of medication, vaccine, condition, etc. |
| `date` | `string` | Yes | ISO 8601 date when the event occurred. |
| `providerName` | `string` | No | Vet or provider name. |
| `providerPhone` | `string` | No | Provider phone number. |
| `notes` | `string` | No | Additional notes. |
| `photoStorageRef` | `string` | No | Firebase Storage path. |
| `photoUrl` | `string` | No | Public download URL. |
| `cost` | `number` | No | Cost of the visit/treatment. |

**Vaccination-specific fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vaccineLotNumber` | `string` | No | Vaccine lot number. |
| `vaccineNextDueDate` | `string` | No | ISO 8601 date for booster. If set, auto-creates a care reminder. |
| `vaccineRoute` | `string` | No | Administration route. |

**Medication-specific fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `medicationDosage` | `number` | No | Amount administered. |
| `medicationDosageUnit` | `"mL" \| "mg" \| "cc" \| "tablets"` | No | Dosage unit. |
| `medicationRoute` | `"Oral" \| "Injection" \| "Topical" \| "IV" \| "Intranasal" \| "Subcutaneous" \| "Intramuscular"` | No | Route of administration. |
| `medicationFrequency` | `string` | No | Frequency (e.g., "2x daily for 5 days"). |
| `withdrawalPeriodDays` | `number` | No | Number of days for withdrawal. |
| `withdrawalType` | `"meat" \| "milk" \| "eggs" \| "all"` | No | Product type affected by withdrawal. |

**Deworming-specific fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dewormingDosage` | `number` | No | Amount administered. |
| `dewormingDosageUnit` | `"mL" \| "mg" \| "cc" \| "tablets"` | No | Dosage unit. |
| `dewormingWithdrawalDays` | `number` | No | Number of days for withdrawal. |
| `dewormingWithdrawalType` | `"meat" \| "milk" \| "eggs" \| "all"` | No | Product type affected by withdrawal. |

**Vet Visit-specific fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vetClinicName` | `string` | No | Clinic name. |
| `vetDiagnosis` | `string` | No | Diagnosis. |
| `vetTreatmentNotes` | `string` | No | Treatment plan notes. |
| `vetFollowUpDate` | `string` | No | ISO 8601 follow-up date. |

**Illness/Injury-specific fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `symptoms` | `string` | No | Observed symptoms. |
| `treatment` | `string` | No | Treatment administered. |
| `resolvedDate` | `string` | No | ISO 8601 date when resolved. |
| `outcome` | `"recovering" \| "resolved" \| "chronic" \| "deceased"` | No | Final outcome. |

**Domain Logic -- Withdrawal Period Calculator:**
```
withdrawalEndDate = date + withdrawalPeriodDays (or dewormingWithdrawalDays)
daysRemaining = withdrawalEndDate - today
status = daysRemaining > 0 ? "ACTIVE" : "CLEAR"
```
- **ACTIVE** (red badge): Withdrawal in effect, display days remaining.
- **CLEAR** (green badge): Withdrawal period passed, safe to consume.
- One animal can have **multiple overlapping withdrawals** with different types and end dates.
- Surfaces on: Animal Detail screen, Health Record Detail, Home Dashboard.

**Example Dashboard Query -- All Active Withdrawals:**
```
db.collection('healthRecords')
  .where('userId', '==', uid)
  .where('admin.deleted', '==', false)
  .where('withdrawalPeriodDays', '>', 0)
```

**Domain Logic -- Vaccine Next-Due Scheduling:**
- When `vaccineNextDueDate` is set, auto-create a care reminder for that animal on that date.
- The care reminder references the vaccine name so the user knows what's due.
- Bridges the health record system and the care reminder system.

**Domain Logic -- Dosage Context:**
- `medicationDosage` + `medicationDosageUnit` + `medicationRoute` + `medicationFrequency` form a complete dosage record.
- Always display these four fields together. Showing dosage without route or unit is meaningless.

---

### 5. Breeding Records

**Path:** `/breedingRecords/{recordId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `animalId` | `string` | Yes | Reference to the dam/mother animal. |
| `sireId` | `string` | No | Reference to sire's `animalId` (if sire is in the system). |
| `sireName` | `string` | No | External sire name (if sire is not in the system). |
| `breedingDate` | `string` | Yes | ISO 8601 date of breeding event. |
| `expectedDueDate` | `string` | Yes | ISO 8601 date, auto-calculated from breeding date + gestation days. |
| `method` | `"natural" \| "ai" \| "other"` | Yes | Breeding method. |
| `notes` | `string` | No | Additional notes. |
| `status` | `"active" \| "completed" \| "failed"` | Yes | Current breeding status. |

**Birth outcome fields** (populated when recording birth):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | `string` | No | ISO 8601 actual birth/hatch date. |
| `bornAlive` | `number` | No | Count of live offspring. |
| `stillborn` | `number` | No | Count of stillborn. |
| `complications` | `string` | No | Birth complications notes. |
| `damCondition` | `"Good" \| "Fair" \| "Poor"` | No | Dam's condition after birth. |
| `offspringIds` | `string[]` | No | References to created animal documents. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalId` -> `/animals/{animalId}` (the dam)
- `sireId` -> `/animals/{animalId}` (the sire, if in system)
- `offspringIds[]` -> `/animals/{animalId}` (created offspring)

**Example Dashboard Query -- All Active Breedings:**
```
db.collection('breedingRecords')
  .where('userId', '==', uid)
  .where('admin.deleted', '==', false)
  .where('status', '==', 'active')
  .orderBy('expectedDueDate')
```

**Domain Logic -- Gestation/Incubation Countdown:**
```
expectedDueDate = breedingDate + gestationDays
daysRemaining = expectedDueDate - today
progressPercent = (gestationDays - daysRemaining) / gestationDays * 100
```
- Progress bar caps at 100% if the animal goes past the due date (overdue state).
- Use breed-level `gestationDays` override if it exists, otherwise fall back to species default.
- UI label: "gestation" for mammals, "incubation" for poultry.

**Built-in Gestation Table:**

| Species | Days |
|---------|------|
| Chicken (egg) | 21 |
| Duck (egg) | 28 |
| Turkey (egg) | 28 |
| Goose (egg) | 30 |
| Quail (egg) | 17 |
| Rabbit | 31 |
| Pig | 114 |
| Sheep | 147 |
| Goat | 150 |
| Cattle | 283 |
| Horse | 340 |
| Alpaca | 345 |
| Llama | 350 |
| Donkey | 365 |

**Domain Logic -- Breeding Status State Machine:**
```
active    -> The animal is pregnant/incubating, countdown is running.
completed -> Birth/hatch occurred, outcome recorded.
failed    -> Pregnancy failed, no live birth, breeding unsuccessful.

Transitions:
  active -> completed  (user records a birth outcome)
  active -> failed     (user marks breeding as unsuccessful)
  No transition back to active once moved to completed or failed.
```

**Domain Logic -- Offspring Linking:**

When recording a birth outcome, new animal documents are auto-created with:
- `animalType` -> inherited from dam
- `breed` -> inherited from dam
- `birthday` -> set to recorded birth date
- `state` -> `"own"`
- `damId` -> linked to dam's `animalId`
- `sireId` -> linked to sire's `animalId` (if in system)
- The breeding record stores `offspringIds[]` pointing back to the created animals.

---

### 6. Notes / Observations

**Path:** `/notes/{noteId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `animalId` | `string` | Yes | Reference to the animal this note belongs to. |
| `tags` | `string[]` | Yes | Categorization tags. Values: `"Health"`, `"Behavior"`, `"Breeding"`, `"Feed"`, `"Production"`, `"General"`. |
| `text` | `string` | Yes | Note content (multiline). |
| `photoStorageRef` | `string` | No | Firebase Storage path. |
| `photoUrl` | `string` | No | Public download URL. |

---

### 7. Weight / Condition Logs

**Path:** `/weightLogs/{logId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `animalId` | `string` | Yes | Reference to the animal this log belongs to. |
| `date` | `string` | Yes | ISO 8601 date of measurement. |
| `weight` | `number` | Yes | Weight value. |
| `weightUnit` | `"lbs" \| "kg"` | Yes | Unit of measurement. |
| `bodyConditionScore` | `number` | No | 1-5 scale: 1=Emaciated, 2=Thin, 3=Ideal, 4=Overweight, 5=Obese. |
| `notes` | `string` | No | Additional notes. |

---

### 8. Production Logs

**Path:** `/productionLogs/{logId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `animalId` | `string` | No | Reference to animal. Use either `animalId` OR `groupName`, not both. |
| `groupName` | `string` | No | Flock/group name for group-level logging. |
| `productionType` | `"eggs" \| "milk" \| "fiber" \| "honey" \| "meat" \| "other"` | Yes | Type of production. |
| `quantity` | `number` | Yes | Amount produced. |
| `unit` | `string` | Yes | Unit of measurement (count, gallons, liters, lbs, oz, kg). |
| `date` | `string` | Yes | ISO 8601 date of production. |
| `notes` | `string` | No | Additional notes. |

**Domain Logic -- Production Aggregation:**
```
Daily total:   SUM(quantity) WHERE date = targetDate AND productionType = type
Weekly total:  SUM(daily totals) for the calendar week
Monthly total: SUM(daily totals) for the calendar month
```
- Can be filtered by `animalId` (per-animal) or `groupName` (per-flock).
- Do not mix units in aggregations -- group by unit.

**Default units by production type:**

| Type | Default Unit |
|------|-------------|
| Eggs | count |
| Milk | gallons or liters |
| Fiber | lbs or oz |
| Honey | lbs or oz |
| Meat | lbs or kg |

---

### 9. Animal Types

**Path:** `/animalTypes/{typeId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. Indexed for all queries. |
| `name` | `string` | Yes | Species display name (e.g., "Chicken", "Goat"). |
| `colors` | `string[]` | Yes | Available color options for animals of this type. |

---

### 10. Breeds

**Path:** `/animalTypes/{typeId}/breeds/{breedId}`

Remains nested under `animalTypes` -- only accessed in the context of a specific animal type.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `name` | `string` | Yes | Breed name (e.g., "Nubian", "Rhode Island Red"). |
| `gestationDays` | `number` | No | Override species-level gestation period for this breed. |

---

### 11. Care Templates

**Path:** `/animalTypes/{typeId}/careTemplates/{templateId}`

Remains nested under `animalTypes` -- only accessed when configuring care for a specific species.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `name` | `string` | Yes | Template name (e.g., "Quarterly Deworming"). |
| `type` | `"careRecurring" \| "careSingle"` | Yes | Whether the care recurs. |
| `cycle` | `string` | No | Recurrence interval in days. Required if `type` is `"careRecurring"`. |
| `contactName` | `string` | No | Default provider name. |
| `contactPhone` | `string` | No | Default provider phone. |
| `extraData` | `EventExtraDataObject[]` | No | Additional template-defined fields. |

---

### 12. Event Templates

**Path:** `/animalTypes/{typeId}/eventTemplates/{templateId}`

Remains nested under `animalTypes` -- only accessed when configuring events for a specific species.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `name` | `string` | Yes | Template name. |
| `extraData` | `EventExtraDataObject[]` | No | Template-defined fields. |

---

### 13. Devices

**Path:** `/users/{userId}/devices/{deviceId}`

Remains nested under `users` -- only accessed per-user for push notification management.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `tokenId` | `string` | Yes | Firebase Cloud Messaging token. |
| `os` | `string` | Yes | Operating system (`"iOS"`, `"Android"`). |
| `version` | `string` | Yes | OS version string. |

---

### 14. Feedback

**Path:** `/feedback/{feedbackId}`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Reference to the user who submitted feedback. |
| `email` | `string` | Yes | User's email. |
| `rating` | `number` | Yes | Satisfaction rating. |
| `feedback` | `string` | Yes | Feedback text. |
| `os` | `string` | Yes | Operating system. |
| `version` | `string` | Yes | App version string. |

---

## Relationship Map

```
/users/{userId}
 |-- /devices/{deviceId}                       (nested, per-user only)

/animals/{animalId}
 |-- [userId] -----------> /users/{userId}
 |-- [sireId] -----------> /animals/{animalId}  (self-reference: father)
 |-- [damId] ------------> /animals/{animalId}  (self-reference: mother)
 |-- [animalTypeId] -----> /animalTypes/{typeId}
 |-- [animalBreedId] ----> /animalTypes/{typeId}/breeds/{breedId}

/careEvents/{eventId}
 |-- [userId] -----------> /users/{userId}
 |-- [animalId] ---------> /animals/{animalId}
 |-- [templateId] -------> /animalTypes/{typeId}/careTemplates/{templateId}

/healthRecords/{recordId}
 |-- [userId] -----------> /users/{userId}
 |-- [animalId] ---------> /animals/{animalId}
 |-- [vaccineNextDueDate] ~> creates /careEvents/{eventId}  (cross-collection trigger)

/breedingRecords/{recordId}
 |-- [userId] -----------> /users/{userId}
 |-- [animalId] ---------> /animals/{animalId}  (dam)
 |-- [sireId] -----------> /animals/{animalId}  (sire, if in system)
 |-- [offspringIds[]] ---> /animals/{animalId}  (created offspring)

/notes/{noteId}
 |-- [userId] -----------> /users/{userId}
 |-- [animalId] ---------> /animals/{animalId}

/weightLogs/{logId}
 |-- [userId] -----------> /users/{userId}
 |-- [animalId] ---------> /animals/{animalId}

/productionLogs/{logId}
 |-- [userId] -----------> /users/{userId}
 |-- [animalId] ---------> /animals/{animalId}  (optional)

/animalTypes/{typeId}
 |-- [userId] -----------> /users/{userId}
 |-- /breeds/{breedId}                          (nested under type)
 |-- /careTemplates/{templateId}                (nested under type)
 |-- /eventTemplates/{templateId}               (nested under type)

/feedback/{feedbackId}
 |-- [userId] -----------> /users/{userId}
```

---

## Common Query Patterns

The flat structure enables single-query access for all dashboard and cross-animal views.

### Today Dashboard Queries

```javascript
// All overdue + due-today care across all animals
db.collection('careEvents')
  .where('userId', '==', uid)
  .where('admin.deleted', '==', false)
  .where('completedDate', '==', null)
  .where('dueDate', '<=', today)
  .orderBy('dueDate')

// All active withdrawals across all animals
db.collection('healthRecords')
  .where('userId', '==', uid)
  .where('admin.deleted', '==', false)
  .where('withdrawalPeriodDays', '>', 0)

// All active breedings across all animals
db.collection('breedingRecords')
  .where('userId', '==', uid)
  .where('admin.deleted', '==', false)
  .where('status', '==', 'active')
  .orderBy('expectedDueDate')
```

### Animal Detail Queries

```javascript
// All health records for one animal
db.collection('healthRecords')
  .where('userId', '==', uid)
  .where('animalId', '==', animalId)
  .where('admin.deleted', '==', false)
  .orderBy('date', 'desc')

// All care events for one animal
db.collection('careEvents')
  .where('userId', '==', uid)
  .where('animalId', '==', animalId)
  .where('admin.deleted', '==', false)
  .orderBy('dueDate')

// All breeding records for one animal (as dam)
db.collection('breedingRecords')
  .where('userId', '==', uid)
  .where('animalId', '==', animalId)
  .where('admin.deleted', '==', false)
  .orderBy('breedingDate', 'desc')
```

### Production Queries

```javascript
// Daily production totals by type
db.collection('productionLogs')
  .where('userId', '==', uid)
  .where('admin.deleted', '==', false)
  .where('productionType', '==', 'eggs')
  .where('date', '>=', startDate)
  .where('date', '<=', endDate)
  .orderBy('date')
```

---

## Indexing Considerations

Firestore requires composite indexes for queries with multiple `where` clauses or `where` + `orderBy` combinations. Indexes can be added as needed -- Firestore will prompt for missing indexes at runtime.

| Collection | Query Pattern | Fields |
|------------|--------------|--------|
| `animals` | By type and state | `userId`, `admin.deleted`, `animalType`, `state` |
| `careEvents` | Overdue/due care | `userId`, `admin.deleted`, `completedDate`, `dueDate` |
| `careEvents` | Per-animal care | `userId`, `animalId`, `admin.deleted`, `dueDate` |
| `healthRecords` | Records by type | `userId`, `admin.deleted`, `recordType`, `date` |
| `healthRecords` | Active withdrawals | `userId`, `admin.deleted`, `withdrawalPeriodDays` |
| `healthRecords` | Per-animal records | `userId`, `animalId`, `admin.deleted`, `date` |
| `breedingRecords` | Active breedings | `userId`, `admin.deleted`, `status`, `expectedDueDate` |
| `breedingRecords` | Per-animal breedings | `userId`, `animalId`, `admin.deleted`, `breedingDate` |
| `productionLogs` | Date range by type | `userId`, `admin.deleted`, `productionType`, `date` |
| `notes` | Per-animal notes | `userId`, `animalId`, `admin.deleted`, `admin.createdAt` |
| `weightLogs` | Per-animal weight history | `userId`, `animalId`, `admin.deleted`, `date` |

Cloud Functions can be added later to handle cross-collection triggers (e.g., vaccine -> care reminder creation, breeding outcome -> offspring animal creation) without complicating client-side logic.

---

## Security Rules Pattern

With flat collections, security rules follow a consistent pattern:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // User profile -- only the authenticated user
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      // Devices stay nested under user
      match /devices/{deviceId} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // All flat collections -- check userId field
    match /animals/{docId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow create: if request.auth.uid == request.resource.data.userId;
    }

    // Same pattern for careEvents, healthRecords, breedingRecords,
    // notes, weightLogs, productionLogs, animalTypes

    // Farm tier: extend rules to check farmId membership
    // Caretaker: extend rules to check caretaker access tokens
  }
}
```

This pattern scales cleanly to Farm tier multi-user access by adding a `farmId` field and checking membership in a `/farms/{farmId}/members` collection.

---

## Feature Gating by Subscription Tier

| Collection / Feature | Free | Pro | Farm |
|----------------------|------|-----|------|
| Animals (CRUD) | 10 max | Unlimited | Unlimited |
| Care Events | 3 per animal | Unlimited | Unlimited |
| Health Records | -- | All 6 types | All 6 types |
| Breeding Records | -- | Full access | Full access |
| Production Logs | -- | Full access | Full access |
| Notes | -- | Full access | Full access |
| Weight Logs | -- | Full access | Full access |
| Withdrawal Calculator | -- | Full access | Full access |
| Multi-user access | -- | -- | Up to 5 users |
| Caretaker handoff | -- | -- | Full access |
| CSV/PDF export | -- | PDF only | CSV + PDF |
