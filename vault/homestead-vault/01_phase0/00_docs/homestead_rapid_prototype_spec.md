# HomeStead Animal Management App --- Rapid Prototype Build Spec

*(Optimized for Programming LLM Input)*

------------------------------------------------------------------------

# 0. Project Overview

Build a **React Native (TypeScript)** mobile app for homestead and
small-farm animal management. The app replaces paper notebooks,
spreadsheets, and memory with a single system for animal profiles, care
reminders, health records, breeding management, and production tracking.

### Tech Stack

-   React Native 0.84+ (New Architecture)
-   TypeScript 5.x strict
-   Uniwind (Tailwind CSS for React Native, drop-in NativeWind replacement)
-   TailwindCSS v4 (CSS-based config, no tailwind.config.js)
-   Zustand for state management
-   Firebase Auth
-   Firestore
-   Firebase Cloud Messaging
-   Firebase Analytics
-   Firebase Crashlytics
-   Firebase Storage
-   Firebase Cloud Functions
-   React Navigation v7 (native-stack, bottom-tabs)
-   RevenueCat for subscriptions
-   date-fns for date utilities
-   react-native-mmkv for local storage
-   react-native-image-picker for photos
-   react-native-uuid for ID generation

### Design Principles

-   Modern, clean, warm earth-tone aesthetic
-   Barn-friendly: large tap targets, high contrast, works in sunlight
-   Minimal friction: fewest taps to log anything
-   Offline-aware: graceful degradation when connectivity is poor
-   Fast iteration: AI-gen friendly patterns throughout

Use modern mobile UI patterns similar to: - Health tracking apps (Apple
Health, Clue) - Task managers (Todoist, Things) - Modern dashboard apps

------------------------------------------------------------------------

# 1. Navigation Structure

Use Bottom Tab Navigation with 5 tabs.

Tabs: 1. Home (Today dashboard) 2. Animals 3. Health 4. Breeding 5.
Settings

Each tab must have: - Stack navigation - Header with app logo centered -
Floating action button when applicable

------------------------------------------------------------------------

# 2. Authentication Screens

## Login Screen

Components: - App logo - Email input - Password input - Login button -
Create account link - Anonymous sign-in option

Behavior: - Firebase email/password auth - Anonymous auth for quick
start - Redirect to Onboarding on first login, Home on returning

------------------------------------------------------------------------

## Register Screen

Fields: - First Name - Last Name - Email - Password

Action: - Create user in Firestore `/users` - Navigate to Onboarding

------------------------------------------------------------------------

## Onboarding Screen

Steps: 1. Welcome screen with app value proposition 2. Species selection:
which animals do you have? (multi-select grid: Chickens, Goats, Cattle,
Sheep, Pigs, Rabbits, Horses, Ducks, Turkeys, Bees, Other) 3. Install
starter playbooks for selected species (default care templates,
breed lists, common health records) 4. Quick tour: 3 screens showing
Home, Health Records, and Breeding features

Action: - Save selected species to user profile - Create default
templates for selected species - Mark onboarding complete - Navigate to
Home

------------------------------------------------------------------------

# 3. Home Screen (Today Dashboard)

## Purpose

Daily operating command center. The screen that makes users open the app
every day.

## Layout

Top: - Greeting text with user name - Date display - Quick action bar:
Add Animal, Log Health, Log Production

Sections (scrollable):

### Due Today
FlatList of care items due today and overdue. Each card shows: - Animal
name and photo thumbnail - Care item name - Due date (red if overdue) -
Complete button

### Upcoming Breeding Events
Cards showing: - Animal name - Event type (due date, heat check,
weaning) - Days until event - Tap to view breeding detail

### Recent Activity
Timeline of last 5 logged events across all animals: - Health records
added - Care completed - Production logged - Breeding events

### Production Summary
Compact card showing today/this week totals: - Eggs collected - Milk
volume - Other production logged

------------------------------------------------------------------------

# 4. Animals Tab

## Animals List Screen

Display: SectionList grouped by animal type.

Section Header: - Animal type name (e.g. "Chickens") - Count badge -
Add animal button for that type

Animal Card: - Photo thumbnail (circular) - Name - Breed - Age
(calculated from birthday) - State badge (owned/sold/died/processed) -
Quick action icons: Health, Care, Edit

Search bar at top. Category filter chips below search.

FAB: Add new animal.

------------------------------------------------------------------------

## Animal Detail Screen

Layout: - Hero image (full width, 280px height) - Gradient overlay at
bottom - State banner (top right) - Name, breed, type below image

Info Grid (4 boxes): - Age - Gender - Color - Registration

Sections: - Description/Notes - Quick Action Buttons: Care, Health
History, Breeding, Production, Event History, Edit

------------------------------------------------------------------------

## Add/Edit Animal Screen

Fields: - Photo picker - Name (required) - Animal Type (select from
system + custom types) - Breed (select, filtered by animal type) -
Birthday (date picker) - Gender (select: Male, Female, Unknown) - Color
(select from system + custom colors) - Registration number - State
(select: Owned, Sold, Died, Processed) - Notes (multiline text) -
Purchase Price (optional, number) - Weight (optional, number)

Save: Create/update document in `/users/{userId}/animals`.

------------------------------------------------------------------------

## Customize Screen

Accessible from Settings. Manage custom data.

Sections: - Animal Types (CRUD list) - Breeds per type (CRUD list) -
Colors per type (CRUD list) - Care Templates per type (CRUD list with
cycle, contact, fields) - Event Templates per type (CRUD list with
custom fields)

Each item: - Name - Edit button - Delete button (soft delete)

FAB per section: Add new item.

------------------------------------------------------------------------

# 5. Care System

## All Care Screen

Display: FlatList of all upcoming care across all animals, sorted by due
date.

Care Card: - Animal name and photo thumbnail - Care name - Due date
(color coded: green = future, yellow = today, red = overdue) - Cycle
label (e.g. "Every 3 months") - Complete button - Tap to view detail

Filter tabs: All, Overdue, Today, This Week

------------------------------------------------------------------------

## Add Care Screen

Fields: - Animal (pre-selected if navigated from animal) - Care
Template (select from templates for this animal type) - Due Date (date
picker) - Contact Name (optional) - Contact Phone (optional) - Notes
(optional)

Save: Create `AnimalWorkingEvent` with type `careRecurring` or
`careSingle`.

------------------------------------------------------------------------

## View Care Screen

Per-animal care list. Shows all active care items for one animal.

Card: - Care name - Due date - Cycle - Contact info - Complete button -
Edit button - Delete button

------------------------------------------------------------------------

## Complete Care Flow

When marking care complete: 1. Set `completedDate` to now 2. If
recurring, auto-create next event based on cycle 3. Move completed event
to history 4. Show success confirmation

------------------------------------------------------------------------

# 6. Health Tab

## Purpose

First-class health record management. This is the primary premium
feature and the biggest gap vs. competitors.

## Health Records List Screen

Display: FlatList of health records across all animals, sorted by date
(newest first).

Health Record Card: - Animal name and photo thumbnail - Record type
badge (Vaccination, Medication, Deworming, Vet Visit, Illness, Injury) -
Title/name - Date - Vet/provider name if applicable - Withdrawal badge
(if withdrawal period active, shows days remaining)

Filter tabs: All, Vaccinations, Medications, Deworming, Vet Visits

FAB: Add health record.

------------------------------------------------------------------------

## Add Health Record Screen

Fields: - Animal (select or pre-selected) - Record Type (select:
Vaccination, Medication, Deworming, Vet Visit, Illness, Injury) - Name
/ Title (text, e.g. "CDT Vaccine", "Ivermectin") - Date Administered
(date picker) - Provider / Vet Name (optional) - Provider Phone
(optional)

Conditional fields based on Record Type:

### Vaccination
- Vaccine name - Lot number (optional) - Next due date (date picker) -
Route (select: Subcutaneous, Intramuscular, Oral, Intranasal)

### Medication
- Medication name - Dosage amount (number) - Dosage unit (select: mL,
mg, cc, tablets) - Route (select: Oral, Injection, Topical, IV) -
Frequency (text, e.g. "2x daily for 5 days") - Withdrawal period in
days (number) - Withdrawal type (select: Meat, Milk, Eggs, All)

### Deworming
- Product name - Dosage amount - Dosage unit - Withdrawal period in days
- Withdrawal type

### Vet Visit
- Clinic name - Vet name - Reason / Diagnosis (text) - Treatment notes
(multiline) - Follow-up date (optional date picker) - Cost (optional
number)

### Illness / Injury
- Description (multiline) - Symptoms (multiline) - Treatment (multiline)
- Resolved date (optional date picker) - Outcome (select: Recovering,
Resolved, Chronic, Deceased)

Common fields (all types): - Notes (multiline) - Photo (image picker) -
Cost (optional number)

Save: Create document in `/users/{userId}/animals/{animalId}/healthRecords`.

------------------------------------------------------------------------

## Health Record Detail Screen

Display all fields for the record. Show: - Animal info card (name,
photo, breed) - Record type badge - All fields from the record - Photo
if attached - Withdrawal status with countdown if applicable

Actions: - Edit - Delete

------------------------------------------------------------------------

## Withdrawal Calculator

Automatic calculation shown on: - Health record detail (if withdrawal
period set) - Animal detail screen (if any active withdrawals) - Home
dashboard (if any animals have active withdrawals)

Display: - Product name - Withdrawal type (Meat/Milk/Eggs/All) - Start
date - End date (calculated) - Days remaining - Status badge:
Active (red), Clear (green)

------------------------------------------------------------------------

# 7. Breeding Tab

## Purpose

Breeding management with gestation tracking. The second primary premium
feature.

## Breeding Dashboard Screen

Sections:

### Active Pregnancies / Incubations
Cards showing: - Animal name and photo - Breeding date - Expected due
date - Days remaining (with progress bar) - Sire name if recorded

### Upcoming Events
- Heat checks due - Weaning dates approaching - Breeding windows

### Recent Breeding Activity
Timeline of recent breeding events.

FAB: Record breeding event.

------------------------------------------------------------------------

## Record Breeding Event Screen

Fields: - Dam / Mother (select animal, filtered to females) - Sire /
Father (select animal filtered to males, or text input for external
sire) - Breeding Date (date picker) - Method (select: Natural, AI,
Other) - Notes (multiline)

Auto-calculated on save: - Expected due date (based on species gestation
period) - Gestation period is looked up from a built-in species table

Save: Create document in
`/users/{userId}/animals/{animalId}/breedingRecords`.

------------------------------------------------------------------------

## Breeding Record Detail Screen

Display: - Dam info card - Sire info card (or name if external) -
Breeding date - Expected due date - Gestation progress bar (percentage
and days remaining) - Method - Notes

Actions: - Record Birth Outcome - Edit - Delete

------------------------------------------------------------------------

## Record Birth Outcome Screen

Fields: - Birth Date (date picker) - Number Born Alive (number) - Number
Stillborn (number) - Offspring details (repeatable section): - Name
(optional) - Gender (select) - Weight (optional number) - Notes
(optional) - Complications (multiline, optional) - Dam condition
(select: Good, Fair, Poor)

Action: - Create offspring as new Animal records linked to dam and sire -
Mark breeding record as completed

------------------------------------------------------------------------

## Species Gestation Table

Built-in reference data. Used for auto-calculating due dates.

| Species | Gestation (days) |
|---|---|
| Chicken (egg) | 21 |
| Duck (egg) | 28 |
| Turkey (egg) | 28 |
| Goose (egg) | 30 |
| Quail (egg) | 17 |
| Goat | 150 |
| Sheep | 147 |
| Pig | 114 |
| Cattle | 283 |
| Horse | 340 |
| Rabbit | 31 |
| Alpaca | 345 |
| Llama | 350 |
| Donkey | 365 |

Users can customize gestation periods per breed via Customize screen.

------------------------------------------------------------------------

# 8. Production Tracking

## Purpose

Daily logging of eggs, milk, fiber, honey, and other production.
Available on Pro tier.

## Production Log Screen

Accessed from: Animal Detail > Production, or Home Dashboard > Production
Summary.

Display: - Date selector (defaults to today) - Per-animal or per-flock
logging - Running totals for the day

### Quick Log Card
- Animal or group name - Production type (Eggs, Milk, Fiber, Honey,
Meat, Other) - Quantity input (number) - Unit label (count, gallons,
liters, lbs, oz) - Notes (optional) - Save button

### Production History
FlatList of past entries, grouped by date. Tap to edit or delete.

### Production Summary View
- Weekly/monthly totals - Per-animal breakdown - Simple bar chart
(optional, can defer to v1.1)

Save: Create document in
`/users/{userId}/productionLogs`.

------------------------------------------------------------------------

# 9. Settings Tab

## Settings Screen

Sections:

### Account
- User name and email display - Account type badge (Anonymous / Full) -
Create Account (if anonymous) - Edit Profile

### Subscription
- Current plan display (Free / Pro / Farm) - Premium badge if subscribed
- Upgrade button (opens paywall) - Restore Purchases - Manage
Subscription link

### Data
- Customize (animal types, breeds, colors, templates) - Export Data
(Pro+)

### App
- Notifications settings - Provide Feedback - Rate the App - Privacy
Policy - Terms of Use

### Danger Zone
- Log Out - Delete Account

------------------------------------------------------------------------

## Paywall Screen

Triggered by: - Tapping a premium feature (health records, breeding,
production) - Tapping upgrade in settings - Exceeding free animal limit

Layout: - Close button (top right) - Headline: "Run Your Homestead Like
a Pro" - Feature comparison table:

| Feature | Free | Pro | Farm |
|---|---|---|---|
| Animals | Up to 10 | Unlimited | Unlimited |
| Care Reminders | 3 per animal | Unlimited | Unlimited |
| Health Records | -- | Full | Full |
| Breeding Manager | -- | Full | Full |
| Production Tracking | -- | Full | Full |
| Withdrawal Calculator | -- | Full | Full |
| Notes & Journal | -- | Full | Full |
| Export Records | -- | PDF | PDF + CSV |
| Caretaker Handoff | -- | -- | Full |
| Sale-Ready Packets | -- | -- | Full |
| Multi-User Access | -- | -- | Up to 5 |
| Task Assignment | -- | -- | Full |

Plan cards (selectable): - Pro: $4.99/month or $39.99/year - Farm:
$9.99/month or $79.99/year

Buttons: - Continue (purchase selected plan) - Restore Purchases -
Start 7-Day Free Trial

Footer: - Privacy Policy link - Terms of Use link

------------------------------------------------------------------------

# 10. Notes & Observation Journal

## Purpose

Quick-capture timestamped notes per animal. Low friction, high
stickiness.

## Notes List Screen

Per-animal notes list, accessed from Animal Detail.

Note Card: - Date and time - Tag badges (Health, Behavior, Breeding,
Feed, Production, General) - Preview text (2 lines) - Photo indicator if
attached

FAB: Add note.

------------------------------------------------------------------------

## Add Note Screen

Fields: - Animal (pre-selected) - Tags (multi-select chips: Health,
Behavior, Breeding, Feed, Production, General) - Text (multiline,
required) - Photo (optional image picker)

Save: Create document in
`/users/{userId}/animals/{animalId}/notes`.

------------------------------------------------------------------------

# 11. Weight & Condition Tracking

## Purpose

Track weight and body condition over time per animal.

## Weight Log Screen

Per-animal weight history, accessed from Animal Detail.

Display: - Current weight (large display) - Last recorded date - Weight
history list (date, weight, condition score) - Simple trend indicator
(up/down/stable arrow)

FAB: Add weight entry.

------------------------------------------------------------------------

## Add Weight Entry Screen

Fields: - Date (date picker, defaults to today) - Weight (number,
required) - Weight Unit (select: lbs, kg) - Body Condition Score
(select: 1-5 scale with labels: Emaciated, Thin, Ideal, Overweight,
Obese) - Notes (optional)

Save: Create document in
`/users/{userId}/animals/{animalId}/weightLogs`.

------------------------------------------------------------------------

# 12. Event History

## Purpose

Per-animal timeline of all events: care completions, health records,
breeding events, notes, weight logs, production.

## Event History Screen

Display: FlatList timeline, newest first.

Event Card: - Event type icon and badge - Title - Date - Summary text -
Tap to view detail (navigates to appropriate detail screen)

Filter: All, Care, Health, Breeding, Notes, Weight

------------------------------------------------------------------------

# 13. Firestore Data Model

Collections:

### `/users/{userId}`
```
id
admin: AdminObject
firstName
lastName
email
anonymous: boolean
selectedSpecies: string[]
onboardingComplete: boolean
subscription: string
```

### `/users/{userId}/animals/{animalId}`
```
id
admin: AdminObject
name
animalType
animalTypeId
animalTypeLevel: "system" | "user"
breed
animalBreedId
birthday
gender
color
register
state: "own" | "sold" | "died" | "processed"
notes
photoStorageRef
photoUrl
purchasePrice?: number
weight?: number
weightUnit?: string
sireId?: string
damId?: string
```

### `/users/{userId}/animals/{animalId}/careEvents/{eventId}`
```
id
admin: AdminObject
userId
animalId
templateId
name
type: "careRecurring" | "careSingle"
cycle
dueDate
completedDate
contactName
contactPhone
notes
photoStorageRef
photoUrl
createdNextRecurringEvent: boolean
```

### `/users/{userId}/animals/{animalId}/healthRecords/{recordId}`
```
id
admin: AdminObject
userId
animalId
recordType: "vaccination" | "medication" | "deworming" | "vetVisit" | "illness" | "injury"
name
date
providerName
providerPhone
notes
photoStorageRef
photoUrl
cost?: number

// Vaccination fields
vaccineLotNumber?: string
vaccineNextDueDate?: string
vaccineRoute?: string

// Medication fields
medicationDosage?: number
medicationDosageUnit?: string
medicationRoute?: string
medicationFrequency?: string
withdrawalPeriodDays?: number
withdrawalType?: "meat" | "milk" | "eggs" | "all"

// Deworming fields
dewormingDosage?: number
dewormingDosageUnit?: string
dewormingWithdrawalDays?: number
dewormingWithdrawalType?: string

// Vet Visit fields
vetClinicName?: string
vetDiagnosis?: string
vetTreatmentNotes?: string
vetFollowUpDate?: string

// Illness/Injury fields
symptoms?: string
treatment?: string
resolvedDate?: string
outcome?: "recovering" | "resolved" | "chronic" | "deceased"
```

### `/users/{userId}/animals/{animalId}/breedingRecords/{recordId}`
```
id
admin: AdminObject
userId
animalId (dam)
sireId?: string
sireName?: string (for external sires)
breedingDate
expectedDueDate
method: "natural" | "ai" | "other"
notes
status: "active" | "completed" | "failed"

// Birth outcome
birthDate?: string
bornAlive?: number
stillborn?: number
complications?: string
damCondition?: string
offspringIds?: string[]
```

### `/users/{userId}/animals/{animalId}/notes/{noteId}`
```
id
admin: AdminObject
userId
animalId
tags: string[]
text
photoStorageRef
photoUrl
```

### `/users/{userId}/animals/{animalId}/weightLogs/{logId}`
```
id
admin: AdminObject
userId
animalId
date
weight: number
weightUnit: "lbs" | "kg"
bodyConditionScore?: number
notes
```

### `/users/{userId}/productionLogs/{logId}`
```
id
admin: AdminObject
userId
animalId?: string
groupName?: string
productionType: "eggs" | "milk" | "fiber" | "honey" | "meat" | "other"
quantity: number
unit: string
date
notes
```

### `/users/{userId}/animalTypes/{typeId}`
```
id
admin: AdminObject
name
colors: string[]
```

### `/users/{userId}/animalTypes/{typeId}/breeds/{breedId}`
```
id
admin: AdminObject
name
gestationDays?: number
```

### `/users/{userId}/animalTypes/{typeId}/careTemplates/{templateId}`
```
id
admin: AdminObject
name
type: "careRecurring" | "careSingle"
cycle
contactName
contactPhone
extraData: EventExtraDataObject[]
```

### `/users/{userId}/animalTypes/{typeId}/eventTemplates/{templateId}`
```
id
admin: AdminObject
name
extraData: EventExtraDataObject[]
```

### `/users/{userId}/devices/{deviceId}`
```
id
admin: AdminObject
tokenId
os
version
```

### `/feedback/{feedbackId}`
```
id
admin: AdminObject
userId
email
rating: number
feedback
os
version
```

### Shared Objects

#### AdminObject
```
deleted: boolean
createdAt: string (ISO 8601)
updatedAt: string (ISO 8601)
```

#### EventExtraDataObject
```
id
name
description
valueType: "string" | "number" | "stringArray"
stringValue?: string
numberValue?: number
stringArrayValue?: string[]
```

------------------------------------------------------------------------

# 14. Folder Structure

```
src/
  Bootstrap.ts
  components/
    button/
      PrimaryButton.tsx
      SecondaryButton.tsx
      IconButton.tsx
      FloatingActionButton.tsx
      ThemeButton.tsx
    card/
      AnimalCard.tsx
      CareCard.tsx
      HealthRecordCard.tsx
      BreedingCard.tsx
      ProductionCard.tsx
      NoteCard.tsx
      WeightCard.tsx
      TimelineEventCard.tsx
    input/
      TextInput.tsx
      SearchBar.tsx
      NumberInput.tsx
    dialog/
      AppDialog.tsx
      ConfirmDialog.tsx
      SelectDialog.tsx
    modal/
      BottomSheet.tsx
    layout/
      ScreenContainer.tsx
      SectionHeader.tsx
      EmptyState.tsx
      LoadingIndicator.tsx
      Avatar.tsx
      Badge.tsx
      Divider.tsx
      InfoGrid.tsx
      FilterTabs.tsx
      QuickActionBar.tsx
    image/
      ImageCached.tsx
    paywall/
      PaywallModal.tsx
  core/
    plugin/
      ICloudPlatform.ts
      ICloudPlatformAuth.ts
      ICloudPlatformAnalytics.ts
      ICloudPlatformCrashlytics.ts
      ICloudPlatformMessage.ts
      ICloudPlatformStorage.ts
      IInAppPurchases.ts
      ILocalStorage.ts
    service/
      auth/
        IAuthService.ts
        AuthService.ts
      animal/
        IAnimalService.ts
        AnimalService.ts
      care/
        ICareService.ts
        CareService.ts
      health/
        IHealthService.ts
        HealthService.ts
      breeding/
        IBreedingService.ts
        BreedingService.ts
      production/
        IProductionService.ts
        ProductionService.ts
      note/
        INoteService.ts
        NoteService.ts
      weight/
        IWeightService.ts
        WeightService.ts
      account/
        IAccountService.ts
        AccountService.ts
      cache/
        ICacheService.ts
        CacheService.ts
      notification/
        INotificationService.ts
        NotificationService.ts
      feedback/
        IFeedbackService.ts
        FeedbackService.ts
      analytics/
        IAnalyticsService.ts
        AnalyticsService.ts
      repository/
        IRepositoryService.ts
        RepositoryService.ts
      storage/
        IStorageService.ts
        StorageService.ts
      upgrade/
        IUpgradeService.ts
        UpgradeService.ts
  feature/
    auth/
      LoginScreen.tsx
      LoginController.ts
      RegisterScreen.tsx
      RegisterController.ts
    onboarding/
      OnboardingScreen.tsx
      OnboardingController.ts
    home/
      HomeScreen.tsx
      HomeController.ts
    animals/
      AnimalsListScreen.tsx
      AnimalsListController.ts
      AnimalDetailScreen.tsx
      AnimalDetailController.ts
      EditAnimalScreen.tsx
      EditAnimalController.ts
    care/
      AllCareScreen.tsx
      AllCareController.ts
      ViewCareScreen.tsx
      ViewCareController.ts
      AddCareScreen.tsx
      AddCareController.ts
      EditCareScreen.tsx
      EditCareController.ts
    health/
      HealthListScreen.tsx
      HealthListController.ts
      AddHealthRecordScreen.tsx
      AddHealthRecordController.ts
      HealthRecordDetailScreen.tsx
      HealthRecordDetailController.ts
    breeding/
      BreedingDashboardScreen.tsx
      BreedingDashboardController.ts
      RecordBreedingScreen.tsx
      RecordBreedingController.ts
      BreedingDetailScreen.tsx
      BreedingDetailController.ts
      BirthOutcomeScreen.tsx
      BirthOutcomeController.ts
    production/
      ProductionLogScreen.tsx
      ProductionLogController.ts
    notes/
      NotesListScreen.tsx
      NotesListController.ts
      AddNoteScreen.tsx
      AddNoteController.ts
    weight/
      WeightLogScreen.tsx
      WeightLogController.ts
      AddWeightScreen.tsx
      AddWeightController.ts
    eventHistory/
      EventHistoryScreen.tsx
      EventHistoryController.ts
    customize/
      CustomizeScreen.tsx
      CustomizeController.ts
      EditTemplateScreen.tsx
      EditTemplateController.ts
    settings/
      SettingsScreen.tsx
      SettingsController.ts
      EditProfileScreen.tsx
      EditProfileController.ts
      DeleteAccountScreen.tsx
      DeleteAccountController.ts
    debug/
      DebugScreen.tsx
      DebugController.ts
  library/
    cloudplatform/
      firebase/
        Firebase.ts
        FirebaseAuth.ts
        FirebaseAnalytics.ts
        FirebaseCrashlytics.ts
        FirebaseMessage.ts
        FirebaseStorage.ts
    storage/
      mmkv/
        Mmkv.ts
    purchases/
      revenuecat/
        RevenueCatInAppPurchases.ts
  navigation/
    RootNavigation.tsx
    MainTabs.tsx
    types.ts
  schema/
    object/
      AdminObject.ts
      EventExtraDataObject.ts
    type/
      SchemaDefinition.ts
    user/
      User.ts
    animal/
      Animal.ts
      AnimalType.ts
      BreedType.ts
      CareEvent.ts
      CareTemplate.ts
      EventTemplate.ts
      HealthRecord.ts
      BreedingRecord.ts
      Note.ts
      WeightLog.ts
    production/
      ProductionLog.ts
    device/
      UserDevice.ts
    feedback/
      Feedback.ts
    gestation/
      GestationTable.ts
  store/
    authStore.ts
    animalStore.ts
    careStore.ts
    healthStore.ts
    breedingStore.ts
    productionStore.ts
    subscriptionStore.ts
    resetAllStores.ts
  theme/
    colors.ts
    spacing.ts
    typography.ts
    index.ts
  util/
    DateUtility.ts
    StringUtility.ts
    WithdrawalCalculator.ts
    GestationCalculator.ts
```

------------------------------------------------------------------------

# 15. Theme & Styling

### `global.css` (TailwindCSS v4)
```css
@import 'tailwindcss';
@import 'uniwind';

@source "./App.tsx";
@source "./src/**/*.{js,jsx,ts,tsx}";

@theme {
  --color-primary: #8B4513;
  --color-primary-light: #A0522D;
  --color-primary-dark: #6B3410;
  --color-secondary: #4A6741;
  --color-secondary-light: #6B8F61;
  --color-secondary-dark: #2D4228;
  --color-accent: #D4A847;
  --color-accent-light: #E8C56A;
  --color-accent-dark: #B08A2E;
  --color-barn-red: #BA1A20;
  --color-barn-red-light: #D43F45;
  --color-barn-red-dark: #8A1218;
  --color-warm-50: #FFF8F0;
  --color-warm-100: #FFEFD6;
  --color-warm-200: #FFE0B2;
  --color-surface: #FFFFFF;
  --color-surface-elevated: #FAFAFA;
  --color-background: #F5F2ED;
  --color-background-dark: #E8E3DC;
  --color-withdrawal-active: #E53935;
  --color-withdrawal-clear: #4CAF50;
  --color-overdue: #E53935;
  --color-due-today: #FF9800;
  --color-upcoming: #4CAF50;
}
```

### Theme Constants (`src/theme/colors.ts`)
```typescript
export const colors = {
  primary: '#8B4513',
  primaryLight: '#A0522D',
  primaryDark: '#6B3410',
  secondary: '#4A6741',
  secondaryLight: '#6B8F61',
  secondaryDark: '#2D4228',
  accent: '#D4A847',
  barnRed: '#BA1A20',
  background: '#F5F2ED',
  surface: '#FFFFFF',
  surfaceElevated: '#FAFAFA',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B6B6B',
    disabled: '#BDBDBD',
    inverse: '#FFFFFF',
  },
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#E53935',
    info: '#2196F3',
  },
  care: {
    overdue: '#E53935',
    dueToday: '#FF9800',
    upcoming: '#4CAF50',
  },
  withdrawal: {
    active: '#E53935',
    clear: '#4CAF50',
  },
} as const
```

### Uniwind Styling Conventions
- Use `className` prop on all RN components
- Avoid inline `style` objects unless dynamic values needed
- Cards: `className="bg-surface rounded-xl p-4 mb-3 shadow-sm"`
- Text primary: `className="text-base text-gray-900"`
- Text secondary: `className="text-sm text-gray-500"`
- Overdue: `className="text-overdue font-bold"`
- Badges: `className="px-2 py-1 rounded-full bg-primary"`

------------------------------------------------------------------------

# 16. UI Guidelines

Use: - SafeAreaView - FlatList and SectionList for lists - Pressable
buttons with haptic feedback - Card-based layout - Soft shadows -
Rounded corners (12-16px) - Large tap targets (minimum 44x44) - High
contrast text for outdoor readability

Avoid: - Complex animations - Heavy theming - Small text (minimum 14px)
- Deeply nested navigation (max 3 levels)

Goal: Working prototype quickly. Barn-friendly.

------------------------------------------------------------------------

# 17. Subscription & Feature Gating

### Free Tier
- Up to 10 animals
- Basic care reminders (3 per animal)
- Basic animal profiles
- Onboarding starter playbooks

### Pro Tier ($4.99/month or $39.99/year)
- Unlimited animals
- Unlimited care reminders
- Health records (all types)
- Breeding manager with gestation tracking
- Production tracking
- Withdrawal calculator
- Notes & journal
- Weight tracking
- Export as PDF

### Farm Tier ($9.99/month or $79.99/year)
- Everything in Pro
- Multi-user access (up to 5)
- Caretaker handoff mode
- Sale-ready animal packets
- Task assignment
- CSV export
- Priority support

### Feature Gating Logic

When a free user taps a gated feature: 1. Show a brief explanation of
the feature 2. Display the paywall with feature comparison 3. Offer
7-day free trial for Pro

Gated features: - Health Records (any action) - Breeding (any action) -
Production (any action) - Export - Notes (after 3 free notes per animal)
- Weight tracking (after 3 free entries per animal)

RevenueCat entitlements: - `pro` - `farm`

------------------------------------------------------------------------

# 18. Analytics Events

Track from day one:

### Onboarding
- `onboarding_started` - `onboarding_species_selected` (with species
list) - `onboarding_completed` - `first_animal_added` -
`first_care_added`

### Engagement
- `dashboard_viewed` - `animal_detail_viewed` - `care_completed` -
`health_record_created` (with record type) - `breeding_event_created` -
`production_logged` - `note_created` - `weight_logged`

### Monetization
- `paywall_opened` (with source: which feature triggered it) -
`plan_selected` (with plan name) - `purchase_completed` -
`restore_attempted` - `trial_started`

------------------------------------------------------------------------

# 19. Phase 1 Prototype Scope

MUST WORK: - Auth (email/password + anonymous) - Onboarding with species
selection - Home dashboard (today view) - Animal CRUD with photos -
Animal detail with info grid - Care system (add, view, complete,
recurring) - Health records (all 6 types with full fields) - Breeding
manager (record, gestation tracking, birth outcomes) - Production
logging - Notes per animal - Weight tracking - Event history timeline -
Customize (animal types, breeds, colors, templates) - Settings with
subscription management - Paywall with feature comparison - Analytics
instrumentation

DEFER TO v1.1: - Caretaker handoff mode - Sale-ready animal packets -
Multi-user / household sharing - Task assignment - Feed / inventory
tracking - Financial reporting - Offline-first sync - Push notification
scheduling - Cloud Functions

------------------------------------------------------------------------

# 20. Controller + Screen Pattern

Every feature follows this pattern:

### Controller (custom hook)
- Named `use{Feature}Controller`
- Contains all business logic, state, and navigation
- Calls services from Bootstrap.ts
- Returns state and action functions
- No JSX

### Screen (pure UI)
- Named `{Feature}Screen`
- Calls the controller hook
- Renders UI with Uniwind classes
- No direct service calls
- No business logic

Example:
```typescript
// HealthListController.ts
const useHealthListController = (
  animalId: string,
  healthService: IHealthService = bsHealthService,
) => {
  const nav = useNavigation<StackNavigation>()
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  // ... fetch, filter, navigate logic

  return { records, loading, filter, setFilter, onAddRecord, onViewRecord }
}
```

```typescript
// HealthListScreen.tsx
export default function HealthListScreen({ route }: Props) {
  const { records, loading, filter, setFilter, onAddRecord, onViewRecord }
    = useHealthListController(route.params.animalId)

  return (
    <ScreenContainer>
      <FilterTabs ... />
      <FlatList ... />
      <FloatingActionButton onPress={onAddRecord} />
    </ScreenContainer>
  )
}
```

------------------------------------------------------------------------

# 21. Rules for the LLM

```
1. Follow document instructions exactly. Do not invent features not described.
2. Use exact file paths and naming conventions specified.
3. Every schema must include admin: AdminObject.
4. Use Uniwind className for all styling. Do NOT use react-native-paper.
5. Use Zustand for state. Do NOT use rxjs, Redux, or Context for global state.
6. Follow Controller + Screen pattern: Controller is a custom hook, Screen is pure UI.
7. Services go through Bootstrap.ts — never import Firebase/MMKV directly in features.
8. All Firestore queries filter admin.deleted == false unless explicitly stated otherwise.
9. TypeScript strict mode. No any types unless absolutely necessary.
10. Use date-fns for all date operations. Do NOT use moment.js.
11. Do not add comments unless the document specifies it.
12. Import statements at top of every file.
13. All lists use FlatList or SectionList, never ScrollView with mapped children.
14. Feature gating checks subscription state before allowing access to premium features.
15. Analytics events fire on every significant user action from day one.
```

------------------------------------------------------------------------

# 22. Expected LLM Output

Programming LLM should generate: - Folder structure matching section 14 -
Navigation setup with 5 bottom tabs and stack navigators - Screen
components for all features - Controller hooks for all screens -
Firestore service layer with interface + implementation pairs -
Bootstrap.ts wiring all services - Zustand stores for reactive state -
Reusable UI components in src/components/ - TypeScript schema types with
AdminObject and factory defaults - Theme configuration with Uniwind -
Paywall with feature comparison table - Analytics instrumentation -
Species gestation reference table - Withdrawal calculator utility

Target: Production-quality prototype ready for real homesteader testing
with enough premium features to validate the paywall.
