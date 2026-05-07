# HomeStead Navigation Structure

## Bottom Navigation (4 Tabs)

The bottom nav contains the daily-driver screens -- the surfaces users interact with on every app open.

### 1. Home (Today Dashboard)

The single screen that drives daily app opens. Shows what needs attention right now.

- Overdue care items (red)
- Due-today care items (amber)
- Active withdrawal alerts with days remaining (red badge)
- Active breeding countdowns with expected due dates
- Recent activity feed

### 2. Animals

Animal list grouped by type with search and filtering. This is the gateway to all animal-specific data.

- Grouped by animal type (Chickens, Goats, Cattle, etc.)
- Search and filter by name, type, breed, state
- Tapping an animal opens **Animal Detail**, which contains:
  - Profile info (photo, breed, age, state, weight)
  - Health Records (vaccinations, medications, deworming, vet visits, illness/injury)
  - Breeding Records (gestation countdown, birth outcomes, offspring)
  - Care History (completed and upcoming care for this animal)
  - Notes & Observations (timestamped, tagged entries)
  - Weight / Condition Logs (weight history with body condition scores)
  - Active withdrawal status (if applicable)

### 3. Production

Daily logging for eggs, milk, fiber, honey, meat. This is a frequent daily action (morning egg count, evening milk weight) that benefits from one-tap access rather than being buried inside an animal detail.

- Quick-log entry (type, quantity, unit, date)
- Per-animal or per-group (flock) logging
- Daily / weekly / monthly totals
- Trend visibility over time

### 4. Care

Cross-animal care schedule -- all due, overdue, and upcoming care in one unified list. Different from Home because it shows the full schedule, not just today's snapshot.

- Overdue items (red)
- Due today (amber)
- Upcoming within 7 days (green)
- Future scheduled care (gray)
- Filter by animal, care type
- Mark care complete (triggers next recurring event auto-creation)

---

## Side Menu (Avatar Tap)

Accessed by tapping the user's avatar in the top bar. Contains less-frequent, settings, and account-level features.

- **Profile / Account** -- Name, email, account management
- **Subscription** -- Current tier, upgrade to Pro/Farm, manage billing (RevenueCat)
- **Customization** -- Animal types, breeds, colors, care templates, event templates
- **Caretaker Handoff** -- Simplified checklist view for farm sitters (Farm tier)
- **Export** -- PDF (Pro), CSV (Farm) export of animal records and production data
- **Settings** -- Notifications, units preferences, app preferences
- **Send Feedback** -- In-app feedback form
- **Help / About** -- App info, support

---

## Navigation Flow

```
Bottom Nav
 |
 +-- Home (Today Dashboard)
 |    |-- Tap care item ---------> Animal Detail > Care History
 |    |-- Tap withdrawal alert --> Animal Detail > Health Records
 |    |-- Tap breeding event ----> Animal Detail > Breeding Records
 |    |-- Tap activity item -----> Animal Detail
 |
 +-- Animals
 |    |-- Tap animal ------------> Animal Detail
 |    |    |-- Health Records
 |    |    |-- Breeding Records
 |    |    |-- Care History
 |    |    |-- Notes
 |    |    |-- Weight Logs
 |    |    +-- Active Withdrawals
 |    |-- Add Animal (FAB / +)
 |
 +-- Production
 |    |-- Quick Log Entry
 |    |-- Daily / Weekly / Monthly Views
 |    |-- Per-Animal or Per-Group Toggle
 |
 +-- Care
      |-- Tap care item ---------> Animal Detail > Care History
      |-- Mark Complete (inline)
      |-- Filter by animal / type

Side Menu (Avatar)
 |-- Profile / Account
 |-- Subscription
 |-- Customization
 |-- Caretaker Handoff (Farm)
 |-- Export (Pro / Farm)
 |-- Settings
 |-- Send Feedback
 |-- Help / About
```

---

## Design Rationale

- **4 tabs, not 5** -- Keeps the bottom bar clean. More than 4 starts to feel cramped on smaller devices and dilutes focus.
- **Animal Detail is the hub** -- Health Records, Breeding, Notes, Weight Logs are not top-level destinations. They live inside the animal they belong to. This keeps the top-level navigation simple while allowing deep feature depth per animal.
- **Production gets its own tab** -- It's a daily ritual (morning egg count, evening milking) that should be one tap away, not 3 taps deep inside an animal.
- **Care gets its own tab** -- The cross-animal care view is the second most important daily screen after Home. Users need to see everything that's due across all animals in one place.
- **Side menu for setup and settings** -- Customization, export, caretaker handoff are use-occasionally features. They don't need bottom nav real estate.
- **QR Barn Mode** -- Triggered from a scan action on the Home screen or a floating action button, not a dedicated tab. Opens directly to the scanned animal's detail.
