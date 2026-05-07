# HomeStead Engineering Requirements Document

Derived from PRD documents 00-02. Each feature is a discrete implementation unit.

**Architecture:** Flat root-level Firestore collections with `userId` for ownership.
**Soft-delete:** All documents use `admin.deleted` flag -- never hard-delete.
**Timestamps:** All dates as ISO 8601 strings.

---

## Shared Objects

### AdminObject

Applied to every document as the `admin` field.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deleted` | `boolean` | Yes | Soft-delete flag. |
| `createdAt` | `string` | Yes | ISO 8601 creation timestamp. |
| `updatedAt` | `string` | Yes | ISO 8601 last update timestamp. |

### EventExtraDataObject

Flexible key-value structure for care and event templates.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier. |
| `name` | `string` | Yes | Display name. |
| `description` | `string` | Yes | Help text. |
| `valueType` | `"string" \| "number" \| "stringArray"` | Yes | Data type. |
| `stringValue` | `string` | No | Value when type is string. |
| `numberValue` | `number` | No | Value when type is number. |
| `stringArrayValue` | `string[]` | No | Value when type is string array. |

---

## 1. User Profile

**Path:** `/users/{userId}`

**Requirements:**
- Document ID matches Firebase Auth UID
- Created on first sign-in (supports anonymous auth)
- `selectedSpecies` populated during onboarding to seed starter playbooks
- `subscription` updated by RevenueCat webhook or client-side listener

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID (Firebase Auth UID). |
| `admin` | `AdminObject` | Yes | Metadata. |
| `firstName` | `string` | Yes | First name. |
| `lastName` | `string` | Yes | Last name. |
| `email` | `string` | Yes | Email address. |
| `anonymous` | `boolean` | Yes | Anonymous sign-in flag. |
| `selectedSpecies` | `string[]` | Yes | Species selected during onboarding. |
| `onboardingComplete` | `boolean` | Yes | Onboarding flow completed. |
| `subscription` | `"free" \| "pro" \| "farm"` | Yes | Current subscription tier. |

---

## 2. Animal Profiles

**Path:** `/animals/{animalId}`

**Requirements:**
- CRUD with soft-delete
- Photo upload to Firebase Storage; store `photoStorageRef` and `photoUrl`
- Grouped by `animalType` on list screen with search by name and filter by type, breed, state
- State transitions: `own` -> `sold` / `died` / `processed` (no reversal)
- Parent linking via `sireId` and `damId` (self-referencing within `/animals`)
- Age derived client-side from `birthday`: <1 month in days, 1-12 months in months, 12+ in years and months

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `name` | `string` | Yes | Animal's name. |
| `animalType` | `string` | Yes | Species display name. |
| `animalTypeId` | `string` | Yes | Reference to `/animalTypes/{typeId}`. |
| `animalTypeLevel` | `"system" \| "user"` | Yes | Built-in or user-created type. |
| `breed` | `string` | Yes | Breed display name. |
| `animalBreedId` | `string` | Yes | Reference to `/animalTypes/{typeId}/breeds/{breedId}`. |
| `birthday` | `string` | Yes | ISO 8601 date. |
| `gender` | `string` | Yes | Gender. |
| `color` | `string` | Yes | Color/markings. |
| `register` | `string` | No | Registration or tag number. |
| `state` | `"own" \| "sold" \| "died" \| "processed"` | Yes | Current status. |
| `notes` | `string` | No | General notes. |
| `photoStorageRef` | `string` | No | Firebase Storage path. |
| `photoUrl` | `string` | No | Public download URL. |
| `purchasePrice` | `number` | No | Purchase price. |
| `weight` | `number` | No | Current weight (denormalized from latest weight log). |
| `weightUnit` | `string` | No | Weight unit (`"lbs"`, `"kg"`). |
| `sireId` | `string` | No | Reference to father's animal ID. |
| `damId` | `string` | No | Reference to mother's animal ID. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalTypeId` -> `/animalTypes/{typeId}`
- `animalBreedId` -> `/animalTypes/{typeId}/breeds/{breedId}`
- `sireId`, `damId` -> `/animals/{animalId}` (self-referencing)

---

## 3. Care Reminders

**Path:** `/careEvents/{eventId}`

**Requirements:**
- Each event references an `animalId` and a `templateId`
- Two types: `careRecurring` (has `cycle` in days) and `careSingle` (no recurrence)
- Due date status derived client-side: overdue (red), due today (amber), upcoming 7 days (green), future (gray) -- date-only comparisons, no time component
- Cross-animal care view: single query on `userId` + `completedDate == null` ordered by `dueDate`
- On completion of `careRecurring`: set `completedDate`, set `createdNextRecurringEvent = true`, create new event with `dueDate = completedDate + cycle` -- always from completion date, not original due date
- `careSingle` events do not generate a next occurrence
- Template cycle updates do not retroactively change existing scheduled events

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `animalId` | `string` | Yes | Reference to animal. |
| `templateId` | `string` | Yes | Reference to care template. |
| `name` | `string` | Yes | Display name (e.g., "Hoof Trim"). |
| `type` | `"careRecurring" \| "careSingle"` | Yes | Recurrence type. |
| `cycle` | `string` | No | Interval in days. Required if `careRecurring`. |
| `dueDate` | `string` | Yes | ISO 8601 due date. |
| `completedDate` | `string` | No | ISO 8601 completion date. |
| `contactName` | `string` | No | Care provider name. |
| `contactPhone` | `string` | No | Care provider phone. |
| `notes` | `string` | No | Additional notes. |
| `photoStorageRef` | `string` | No | Firebase Storage path. |
| `photoUrl` | `string` | No | Public download URL. |
| `createdNextRecurringEvent` | `boolean` | Yes | Duplicate prevention flag. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalId` -> `/animals/{animalId}`
- `templateId` -> `/animalTypes/{typeId}/careTemplates/{templateId}`

---

## 4. Health Records

**Path:** `/healthRecords/{recordId}`

**Requirements:**
- Six record types in a single collection: `vaccination`, `medication`, `deworming`, `vetVisit`, `illness`, `injury`
- `recordType` determines which conditional fields are present
- Medication and deworming records support withdrawal tracking
- Dosage context: dosage + unit + route + frequency must always display together
- Vaccination records support optional `vaccineNextDueDate` -- when set, auto-create a `/careEvents` document for that animal referencing the vaccine name
- Per-animal view: query by `userId` + `animalId` ordered by `date` descending

**Schema -- Base fields (all record types):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `animalId` | `string` | Yes | Reference to animal. |
| `recordType` | `"vaccination" \| "medication" \| "deworming" \| "vetVisit" \| "illness" \| "injury"` | Yes | Record type. |
| `name` | `string` | Yes | Medication, vaccine, or condition name. |
| `date` | `string` | Yes | ISO 8601 date of event. |
| `providerName` | `string` | No | Vet or provider name. |
| `providerPhone` | `string` | No | Provider phone. |
| `notes` | `string` | No | Additional notes. |
| `photoStorageRef` | `string` | No | Firebase Storage path. |
| `photoUrl` | `string` | No | Public download URL. |
| `cost` | `number` | No | Cost of treatment. |

**Schema -- Vaccination fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vaccineLotNumber` | `string` | No | Lot number. |
| `vaccineNextDueDate` | `string` | No | ISO 8601 booster date. Triggers care event creation. |
| `vaccineRoute` | `string` | No | Administration route. |

**Schema -- Medication fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `medicationDosage` | `number` | No | Amount administered. |
| `medicationDosageUnit` | `"mL" \| "mg" \| "cc" \| "tablets"` | No | Dosage unit. |
| `medicationRoute` | `"Oral" \| "Injection" \| "Topical" \| "IV" \| "Intranasal" \| "Subcutaneous" \| "Intramuscular"` | No | Route. |
| `medicationFrequency` | `string` | No | Frequency (e.g., "2x daily for 5 days"). |
| `withdrawalPeriodDays` | `number` | No | Withdrawal period in days. |
| `withdrawalType` | `"meat" \| "milk" \| "eggs" \| "all"` | No | Affected product type. |

**Schema -- Deworming fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `dewormingDosage` | `number` | No | Amount administered. |
| `dewormingDosageUnit` | `"mL" \| "mg" \| "cc" \| "tablets"` | No | Dosage unit. |
| `dewormingWithdrawalDays` | `number` | No | Withdrawal period in days. |
| `dewormingWithdrawalType` | `"meat" \| "milk" \| "eggs" \| "all"` | No | Affected product type. |

**Schema -- Vet Visit fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vetClinicName` | `string` | No | Clinic name. |
| `vetDiagnosis` | `string` | No | Diagnosis. |
| `vetTreatmentNotes` | `string` | No | Treatment plan. |
| `vetFollowUpDate` | `string` | No | ISO 8601 follow-up date. |

**Schema -- Illness/Injury fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `symptoms` | `string` | No | Observed symptoms. |
| `treatment` | `string` | No | Treatment administered. |
| `resolvedDate` | `string` | No | ISO 8601 resolution date. |
| `outcome` | `"recovering" \| "resolved" \| "chronic" \| "deceased"` | No | Final outcome. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalId` -> `/animals/{animalId}`
- `vaccineNextDueDate` ~> creates `/careEvents/{eventId}` (cross-collection trigger)

---

## 5. Withdrawal Period Calculator

Derived from health record data. Not a separate collection.

**Requirements:**
- Withdrawal end date = `date` + `withdrawalPeriodDays` (medication) or `date` + `dewormingWithdrawalDays` (deworming)
- Status: ACTIVE (days remaining > 0, red badge) or CLEAR (green badge)
- `withdrawalType` determines affected product: `meat`, `milk`, `eggs`, or `all`
- One animal can have multiple overlapping active withdrawals with different types and end dates
- Surfaces on three screens: Home Dashboard, Animal Detail, Health Record Detail
- Dashboard query: `/healthRecords` where `userId` matches and `withdrawalPeriodDays > 0`, filter client-side for still-active
- No hardcoded medication database -- withdrawal days and type are user-entered

**Schema:** Uses `/healthRecords` fields: `date`, `withdrawalPeriodDays`, `withdrawalType`, `dewormingWithdrawalDays`, `dewormingWithdrawalType`

---

## 6. Breeding Manager

**Path:** `/breedingRecords/{recordId}`

**Requirements:**
- Links dam (`animalId`) and optionally sire (`sireId` if in system, `sireName` for external)
- `expectedDueDate` auto-calculated on creation: `breedingDate` + species gestation days
- Gestation days resolved: breed-level override -> species default from built-in gestation table
- UI label: "gestation" for mammals, "incubation" for poultry
- Progress percentage derived client-side, capped at 100% when overdue
- State machine: `active` -> `completed` (birth recorded) or `active` -> `failed` (marked unsuccessful) -- no transitions back
- Dashboard query: `/breedingRecords` where `status == "active"` ordered by `expectedDueDate`

**Schema -- Base fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `animalId` | `string` | Yes | Reference to dam/mother. |
| `sireId` | `string` | No | Reference to sire (if in system). |
| `sireName` | `string` | No | External sire name. |
| `breedingDate` | `string` | Yes | ISO 8601 breeding date. |
| `expectedDueDate` | `string` | Yes | ISO 8601 auto-calculated due date. |
| `method` | `"natural" \| "ai" \| "other"` | Yes | Breeding method. |
| `notes` | `string` | No | Additional notes. |
| `status` | `"active" \| "completed" \| "failed"` | Yes | Current status. |

**Schema -- Birth outcome fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `birthDate` | `string` | No | ISO 8601 actual birth/hatch date. |
| `bornAlive` | `number` | No | Live offspring count. |
| `stillborn` | `number` | No | Stillborn count. |
| `complications` | `string` | No | Birth complications. |
| `damCondition` | `"Good" \| "Fair" \| "Poor"` | No | Dam's condition post-birth. |
| `offspringIds` | `string[]` | No | References to created animal documents. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalId` -> `/animals/{animalId}` (dam)
- `sireId` -> `/animals/{animalId}` (sire)
- `offspringIds[]` -> `/animals/{animalId}` (offspring)

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

---

## 7. Offspring Linking

Triggered from breeding record birth outcome. Writes to `/animals`.

**Requirements:**
- On birth outcome, create new animal documents for each live offspring
- Auto-populated: `animalType` and `breed` from dam, `birthday` from birth date, `state` = `"own"`, `damId` from dam, `sireId` from sire (if in system)
- Breeding record stores `offspringIds[]` pointing to created animals
- Batch write: update breeding record + create animal documents atomically

**Schema:** Uses `/breedingRecords` birth outcome fields + creates `/animals` documents.

---

## 8. Production Tracking

**Path:** `/productionLogs/{logId}`

**Requirements:**
- Each log captures `productionType`, `quantity`, `unit`, and `date`
- Per-animal (`animalId`) or per-group (`groupName`) -- mutually exclusive
- Aggregation client-side: daily, weekly, monthly totals per production type
- Never mix units in aggregations -- group by unit
- Default units: eggs = count, milk = gallons/liters, fiber = lbs/oz, honey = lbs/oz, meat = lbs/kg

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `animalId` | `string` | No | Reference to animal. Mutually exclusive with `groupName`. |
| `groupName` | `string` | No | Flock/group name. Mutually exclusive with `animalId`. |
| `productionType` | `"eggs" \| "milk" \| "fiber" \| "honey" \| "meat" \| "other"` | Yes | Production type. |
| `quantity` | `number` | Yes | Amount produced. |
| `unit` | `string` | Yes | Unit (count, gallons, liters, lbs, oz, kg). |
| `date` | `string` | Yes | ISO 8601 date. |
| `notes` | `string` | No | Additional notes. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalId` -> `/animals/{animalId}` (optional)

---

## 9. Notes & Observations

**Path:** `/notes/{noteId}`

**Requirements:**
- Each note references `userId` and `animalId`
- `tags` array for categorization
- Optional photo attachment
- Displayed on Animal Detail as timeline, ordered by `admin.createdAt` descending

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `animalId` | `string` | Yes | Reference to animal. |
| `tags` | `string[]` | Yes | Tags: `"Health"`, `"Behavior"`, `"Breeding"`, `"Feed"`, `"Production"`, `"General"`. |
| `text` | `string` | Yes | Note content (multiline). |
| `photoStorageRef` | `string` | No | Firebase Storage path. |
| `photoUrl` | `string` | No | Public download URL. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalId` -> `/animals/{animalId}`

---

## 10. Weight / Condition Tracking

**Path:** `/weightLogs/{logId}`

**Requirements:**
- Each log references `userId` and `animalId` with `date`, `weight`, `weightUnit`
- Optional `bodyConditionScore` (1-5 scale)
- Displayed on Animal Detail as history, ordered by `date` descending
- Latest weight optionally denormalized onto the animal document

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `animalId` | `string` | Yes | Reference to animal. |
| `date` | `string` | Yes | ISO 8601 measurement date. |
| `weight` | `number` | Yes | Weight value. |
| `weightUnit` | `"lbs" \| "kg"` | Yes | Unit. |
| `bodyConditionScore` | `number` | No | 1=Emaciated, 2=Thin, 3=Ideal, 4=Overweight, 5=Obese. |
| `notes` | `string` | No | Additional notes. |

**Relationships:**
- `userId` -> `/users/{userId}`
- `animalId` -> `/animals/{animalId}`

---

## 11. Today Dashboard (Home)

Read-only aggregation screen. No dedicated collection.

**Requirements:**
- Overdue care: `/careEvents` where `completedDate == null` and `dueDate < today`
- Due-today care: `/careEvents` where `completedDate == null` and `dueDate == today`
- Active withdrawals: `/healthRecords` where `withdrawalPeriodDays > 0`, filter client-side for still-active
- Active breedings: `/breedingRecords` where `status == "active"`, ordered by `expectedDueDate`
- Recent activity: query across collections by `admin.createdAt` descending (Cloud Function if cross-collection ordering becomes expensive)
- All queries filter by `userId` and `admin.deleted == false`

**Schema:** Reads from `/careEvents`, `/healthRecords`, `/breedingRecords`.

---

## 12. Customization Engine

**Path:** `/animalTypes/{typeId}` with nested subcollections.

**Requirements:**
- Custom animal types with name and colors array
- Breeds nested: `/animalTypes/{typeId}/breeds/{breedId}` with optional `gestationDays` override
- Care templates nested: `/animalTypes/{typeId}/careTemplates/{templateId}`
- Event templates nested: `/animalTypes/{typeId}/eventTemplates/{templateId}`
- Starter playbooks seeded during onboarding based on `selectedSpecies`
- `animalTypeLevel` on animal documents distinguishes `system` vs `user` types

**Schema -- Animal Types (`/animalTypes/{typeId}`):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Owning user ID. |
| `name` | `string` | Yes | Species display name. |
| `colors` | `string[]` | Yes | Available color options. |

**Schema -- Breeds (`/animalTypes/{typeId}/breeds/{breedId}`):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `name` | `string` | Yes | Breed name. |
| `gestationDays` | `number` | No | Override species gestation period. |

**Schema -- Care Templates (`/animalTypes/{typeId}/careTemplates/{templateId}`):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `name` | `string` | Yes | Template name. |
| `type` | `"careRecurring" \| "careSingle"` | Yes | Recurrence type. |
| `cycle` | `string` | No | Interval in days. Required if `careRecurring`. |
| `contactName` | `string` | No | Default provider name. |
| `contactPhone` | `string` | No | Default provider phone. |
| `extraData` | `EventExtraDataObject[]` | No | Template-defined fields. |

**Schema -- Event Templates (`/animalTypes/{typeId}/eventTemplates/{templateId}`):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `name` | `string` | Yes | Template name. |
| `extraData` | `EventExtraDataObject[]` | No | Template-defined fields. |

---

## 13. Devices

**Path:** `/users/{userId}/devices/{deviceId}`

Nested under users -- only accessed per-user for push notifications.

**Requirements:**
- Register FCM token on app launch
- Update on token refresh
- Remove on sign-out

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `tokenId` | `string` | Yes | Firebase Cloud Messaging token. |
| `os` | `string` | Yes | Operating system (`"iOS"`, `"Android"`). |
| `version` | `string` | Yes | OS version. |

---

## 14. Feedback

**Path:** `/feedback/{feedbackId}`

Root-level collection.

**Requirements:**
- In-app feedback form accessible from side menu
- Captures user context (OS, app version) automatically

**Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | Yes | Document ID. |
| `admin` | `AdminObject` | Yes | Metadata. |
| `userId` | `string` | Yes | Submitting user ID. |
| `email` | `string` | Yes | User's email. |
| `rating` | `number` | Yes | Satisfaction rating. |
| `feedback` | `string` | Yes | Feedback text. |
| `os` | `string` | Yes | Operating system. |
| `version` | `string` | Yes | App version. |

---

## 15. Subscription Gating

Enforced client-side with RevenueCat entitlements. Stored on `/users/{userId}`.

**Requirements:**
- Three tiers: `free`, `pro`, `farm`
- Paywall triggered at the moment of action:
  - Logging a health record -> Pro paywall
  - Recording a breeding event -> Pro paywall
  - Generating a caretaker handoff -> Farm paywall
  - Exporting a sale-ready packet -> Farm paywall
- Free: 10 animals, 3 care events per animal, no health/breeding/production/notes/weight
- Pro: unlimited animals and care, all health/breeding/production/notes/weight, withdrawal calculator, PDF export
- Farm: everything in Pro + multi-user (up to 5), caretaker handoff, CSV export

**Schema:** Uses `subscription` field on `/users/{userId}`.

---

## Collection Hierarchy Summary

```
/users/{userId}                                          # User profile
  /devices/{deviceId}                                    # Push notification tokens

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
