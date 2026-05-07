# HomeStead: Core Features & Subscription Hook

## Core Features Every Homestead App Needs

### 1. Animal Profiles & Dashboard
- CRUD animal records with photo, type, breed, gender, birthday, state (owned/sold/died/processed)
- Grouped dashboard by animal type with search and filtering
- Custom animal types, breeds, and colors

### 2. Care Reminders
- Recurring and one-time care items per animal (deworming, hoof trims, vaccinations)
- Due date tracking with overdue alerts
- Auto-create next occurrence when recurring care is completed
- Cross-animal "all care" view

### 3. Health Records
- Vaccinations, medications, deworming, vet visits, illness/injury logs
- Dosage tracking with route and frequency
- Withdrawal period calculator for meat/milk/eggs (safety-critical)
- Linked to animal timeline

### 4. Breeding Manager
- Sire/dam pairing with breeding date
- Auto-calculated gestation countdown per species
- Birth outcome recording (alive, stillborn, complications)
- Offspring linked back to parents

### 5. Production Tracking
- Daily logging of eggs, milk, fiber, honey
- Per-animal and per-flock totals
- Weekly/monthly trend visibility

### 6. Notes & Observations
- Quick timestamped entries per animal
- Tags (health, behavior, breeding, feed, production)
- Optional photo attachment

### 7. Today Dashboard
- Due care, overdue items, upcoming breeding events, recent activity
- Single screen that drives daily app opens

### 8. Customization Engine
- Custom animal types, breeds, care templates, event templates
- Species-specific starter playbooks on onboarding

---

## The Killer Hook: What Makes People Subscribe

**It's not one feature -- it's the anxiety gap.**

Homesteaders' biggest fear is forgetting something that costs them an animal, a failed inspection, or a food safety incident. The killer behavior is:

> **The app becomes the single source of truth they're afraid to lose.**

### How to create that dependency

1. **Health Records + Withdrawal Calculator (Pro)** -- This is the #1 conversion driver. Withdrawal periods for meat/milk/eggs after medications are safety-critical and currently tracked on paper or memory. Getting this wrong has real consequences. Once a user logs their first vaccination or medication with a withdrawal period, the data is too valuable to abandon.

2. **Breeding Manager + Gestation Tracker (Pro)** -- Breeders obsess over due dates. An automatic countdown per species with notifications creates daily engagement during breeding season. Missing a due date means losing animals.

3. **Caretaker Handoff Mode (Farm)** -- Every homesteader leaves the farm eventually. A simplified checklist view for farm sitters that can be shared without the sitter installing the app solves a universal pain point. It's the most shareable, most marketable feature no competitor does well.

### The subscription trigger pattern

Don't gate on animal count. Gate on **the moment of highest anxiety**:

- User tries to log a vaccination -> show the Pro paywall
- User tries to record a breeding event -> show the Pro paywall
- User tries to generate a caretaker handoff -> show the Farm paywall
- User tries to export a sale-ready animal packet -> show the Farm paywall

Each trigger is tied to a real action the user is already trying to do, not an arbitrary limit they resent.

### The retention loop

The more records a user logs, the harder it is to leave. Health history, breeding lineage, and production data compound over time. After 30 days of logging, the app contains information that doesn't exist anywhere else. That's the lock-in -- not a paywall, but irreplaceable data.

### One "Purple Cow" differentiator to stand out

**QR Code Barn Mode** -- Generate a QR code per animal or pen. Scan it with dirty hands to instantly open the record, log a treatment, or mark a task complete. It's barn-friendly, highly visual in marketing videos, and no competitor offers it. It makes the app feel like it was built by someone who actually works in a barn.

---

## Summary

| Layer | What It Does |
|---|---|
| **Core features** | Profiles, care, health, breeding, production, notes, today dashboard |
| **Subscription trigger** | Gate premium features at the moment of highest user anxiety |
| **Retention engine** | Irreplaceable accumulated data (health history, breeding lineage, production trends) |
| **Purple Cow** | QR barn mode -- scan to log, memorable and marketable |
| **Positioning** | "The daily operating system for your homestead" -- not just an animal database |
