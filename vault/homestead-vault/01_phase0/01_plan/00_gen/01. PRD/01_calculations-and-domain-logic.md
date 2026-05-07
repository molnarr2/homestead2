# HomeStead: Calculations & Domain Logic Reference

Non-obvious business logic the app must handle correctly.

---

## 1. Gestation / Incubation Countdown

**What it is:** When a breeding event is recorded, the app auto-calculates the expected due date based on species gestation period.

**Formula:**
```
expectedDueDate = breedingDate + gestationDays
daysRemaining = expectedDueDate - today
progressPercent = (gestationDays - daysRemaining) / gestationDays * 100
```

**Built-in gestation table:**

| Species | Days |
|---|---|
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

**Edge cases:**
- Users can override gestation days per breed via the Customize screen (stored on `BreedType.gestationDays`)
- If a breed-level override exists, use it instead of the species default
- For poultry, the term is "incubation" not "gestation" -- UI label should adapt based on species
- Progress bar should cap at 100% if the animal goes past the due date (overdue state)

---

## 2. Withdrawal Period Calculator

**What it is:** After administering certain medications or dewormers, the animal's meat, milk, or eggs are unsafe for human consumption for a set number of days. This is a food safety requirement.

**Formula:**
```
withdrawalEndDate = dateAdministered + withdrawalPeriodDays
daysRemaining = withdrawalEndDate - today
status = daysRemaining > 0 ? "ACTIVE" : "CLEAR"
```

**Fields involved:**
- `withdrawalPeriodDays` -- number of days (set per medication/dewormer, entered by user)
- `withdrawalType` -- what product is affected: `meat`, `milk`, `eggs`, or `all`
- `dateAdministered` -- when the medication was given

**Display rules:**
- **Active** (red badge): withdrawal is still in effect, show days remaining
- **Clear** (green badge): withdrawal period has passed, safe to consume
- Active withdrawals should surface on: the animal detail screen, the health record detail, and the home dashboard
- If multiple withdrawals are active for the same animal, show all of them -- they may have different end dates and types
- An animal can have overlapping withdrawals (e.g., one for meat, one for milk from different medications)

**Why this matters:** Getting this wrong can cause a food safety incident. This is the single highest-anxiety feature in the app and a primary reason users will pay for Pro.

---

## 3. Recurring Care Cycle Calculation

**What it is:** When a recurring care item is marked complete, the app auto-creates the next occurrence based on the care template's cycle.

**Formula:**
```
nextDueDate = completedDate + cycleDays
```

**Cycle types** (from care templates):
- The `cycle` field on a care template defines the recurrence interval (e.g., 90 days for quarterly deworming, 365 for annual vaccination)
- When a user marks care complete, a new care event is created with `dueDate = today + cycle`
- The completed event moves to history with `completedDate = today`
- Set `createdNextRecurringEvent = true` on the completed event to prevent duplicate creation

**Edge cases:**
- If the user completes a care item late (past due date), the next due date is still calculated from the completion date, not the original due date -- this prevents cascading schedule drift
- One-time care items (`careSingle`) do not create a next event
- If a care template's cycle is updated, existing scheduled events are not retroactively changed -- only new events use the updated cycle

---

## 4. Animal Age Calculation

**What it is:** Display age from the animal's birthday.

**Formula:**
```
age = today - birthday
```

**Display format:**
- Under 1 month: show in days (e.g., "12 days")
- 1-12 months: show in months (e.g., "4 months")
- 12+ months: show in years and months (e.g., "2 years, 3 months")

---

## 5. Production Aggregation

**What it is:** Roll up daily production logs into weekly/monthly summaries.

**Aggregation levels:**
- **Daily total**: sum of all production logs for a given date, per type (eggs, milk, etc.)
- **Weekly total**: sum of daily totals for the calendar week
- **Monthly total**: sum of daily totals for the calendar month
- **Per-animal**: filter logs by `animalId` before aggregating
- **Per-flock/group**: if `groupName` is used instead of `animalId`, aggregate by group

**Units:** Production types have different default units:
- Eggs: count
- Milk: gallons or liters
- Fiber: lbs or oz
- Honey: lbs or oz
- Meat: lbs or kg

Unit is user-selected per log entry. Do not mix units in aggregations -- group by unit.

---

## 6. Care Due Date Status

**What it is:** Color-coded urgency for care items.

**Logic:**
```
if (dueDate < today)         -> OVERDUE (red)
if (dueDate == today)        -> DUE TODAY (amber/yellow)
if (dueDate <= today + 7)    -> UPCOMING (green)
if (dueDate > today + 7)     -> FUTURE (neutral/gray)
```

All date comparisons are date-only (ignore time component).

---

## 7. Breeding Status State Machine

**What it is:** A breeding record progresses through states.

**States:**
```
active     -> The animal is pregnant/incubating, countdown is running
completed  -> Birth/hatch occurred, outcome recorded
failed     -> Pregnancy failed, no live birth, breeding unsuccessful
```

**Transitions:**
- `active` -> `completed`: user records a birth outcome
- `active` -> `failed`: user marks breeding as unsuccessful
- No transition back to `active` once moved to `completed` or `failed`

---

## 8. Medication Dosage Context

**What it is:** Medication dosage fields need context to be useful.

**Fields that travel together:**
- `dosageAmount` (number) -- how much was given
- `dosageUnit` (mL, mg, cc, tablets) -- measurement unit
- `route` (Oral, Injection/Subcutaneous/Intramuscular, Topical, IV, Intranasal) -- how it was administered
- `frequency` (free text, e.g., "2x daily for 5 days") -- how often

These four fields together form a complete dosage record. Displaying dosage without route or unit is meaningless. Always show them together.

---

## 9. Vaccine Next-Due Scheduling

**What it is:** Some vaccines require boosters on a schedule.

**Logic:**
- When logging a vaccination, the user can optionally set a `vaccineNextDueDate`
- If set, this should auto-create a care reminder for that animal on that date
- The care reminder should reference the vaccine name so the user knows what's due
- This bridges the health record system and the care reminder system

---

## 10. Offspring Linking on Birth Outcome

**What it is:** When recording a birth outcome from a breeding record, new animal records are created for offspring.

**Auto-populated fields on offspring:**
- `animalType` -- inherited from dam
- `breed` -- inherited from dam (or cross-breed note if sire is different breed)
- `birthday` -- set to the recorded birth date
- `state` -- set to "own"
- `damId` -- linked to the dam's animal ID
- `sireId` -- linked to the sire's animal ID (if sire is in the system)
- The breeding record stores `offspringIds[]` pointing back to the created animals
