# Complete & Expand Starter Playbooks

## Summary

Six species shown on the onboarding screen have no starter playbook data — selecting them creates empty AnimalType documents with no breeds, colors, or care templates. Two new species (Dog, Cat) need to be added. Several icon references point to non-existent MDI glyphs. Existing playbooks need breed/care gaps filled.

## Current Behavior

`SpeciesSelectionController.ts` (line 4-19) defines 14 species displayed on the "What animals do you keep?" screen. When the user taps "Get Started," `AnimalTypeService.seedStarterPlaybooks()` (line 193-235) looks up each selected species in `STARTER_PLAYBOOKS` and creates an AnimalType document. If no playbook exists for a species, the code falls through to empty defaults via `playbook?.colors ?? []`.

**Species with playbooks (8):** Chicken, Duck, Goat, Cattle, Sheep, Pig, Rabbit, Horse
**Species missing playbooks (6):** Turkey, Goose, Quail, Alpaca, Llama, Donkey
**New species to add (2):** Dog, Cat

**Broken icons (3):** `goat`, `llama`, and `alpaca` do not exist in `@react-native-vector-icons/material-design-icons`. Verified against `MaterialDesignIcons.json` glyphmap — these render as blank/missing.

## Desired Behavior

Every species in AVAILABLE_SPECIES has a matching entry in STARTER_PLAYBOOKS with realistic breeds, colors, and care templates. Dog and Cat are added as new species. All icons resolve to valid MDI glyph names.

## Icon Fixes

Current → Fixed mappings in `SpeciesSelectionController.ts`:

- `Goat`: `'goat'` → `'unicode'` — No goat icon exists in MDI. Use `'horse-variant'` as the closest quadruped silhouette, or use `'paw'` as a generic fallback.
- `Alpaca`: `'llama'` → `'horse-variant'` — No llama/alpaca icon in MDI.
- `Llama`: `'llama'` → `'horse-variant'` — Same issue.
- `Dog` (new): `'dog-side'`
- `Cat` (new): `'cat'`

Decision: Use `'paw'` for Goat, Alpaca, and Llama since `horse-variant` would be confusing next to the actual Horse entry. `paw` is a recognizable generic animal icon and MDI confirms it exists.

## New Species Entries

Add Dog and Cat to AVAILABLE_SPECIES (line 4-19 in SpeciesSelectionController.ts) at the end of the list:

- `{ name: 'Dog', icon: 'dog-side' }`
- `{ name: 'Cat', icon: 'cat' }`

## GestationTable Updates

Add to `GESTATION_TABLE` in `GestationTable.ts`:

- `'Dog': 63`
- `'Cat': 65`

POULTRY_TYPES unchanged.

## New Starter Playbooks (6 missing + 2 new)

### Turkey

- colors: White, Bronze, Black, Slate, Bourbon Red
- breeds: Broad Breasted White, Broad Breasted Bronze, Bourbon Red, Narragansett, Royal Palm
- careTemplates:
  - Deworming — careRecurring, cycle 90, healthRecordType 'deworming'
  - Coop Cleaning — careRecurring, cycle 7, healthRecordType ''
  - Blackhead Prevention Check — careRecurring, cycle 30, healthRecordType ''

### Goose

- colors: White, Gray, Brown, Buff
- breeds: Toulouse, Embden, Chinese, African, Pilgrim
- careTemplates:
  - Deworming — careRecurring, cycle 90, healthRecordType 'deworming'
  - Pen Cleaning — careRecurring, cycle 7, healthRecordType ''
  - Mite/Lice Check — careRecurring, cycle 30, healthRecordType ''

### Quail

- colors: Brown, White, Tuxedo, Golden, Silver
- breeds: Coturnix, Bobwhite, California, Gambel, Button
- careTemplates:
  - Cage Cleaning — careRecurring, cycle 3, healthRecordType ''
  - Deworming — careRecurring, cycle 90, healthRecordType 'deworming'

### Alpaca

- colors: White, Fawn, Brown, Black, Gray, Rose Gray
- breeds: Huacaya (gestationDays 345), Suri (gestationDays 345)
- careTemplates:
  - Shearing — careRecurring, cycle 365, healthRecordType ''
  - Nail Trim — careRecurring, cycle 60, healthRecordType ''
  - Deworming — careRecurring, cycle 90, healthRecordType 'deworming'
  - CDT Vaccination — careRecurring, cycle 365, healthRecordType 'vaccination'
  - Teeth Trim — careRecurring, cycle 365, healthRecordType 'vetVisit'

### Llama

- colors: White, Brown, Black, Gray, Spotted, Roan
- breeds: Classic (gestationDays 350), Silky (gestationDays 350), Medium (gestationDays 350)
- careTemplates:
  - Shearing — careRecurring, cycle 365, healthRecordType ''
  - Nail Trim — careRecurring, cycle 60, healthRecordType ''
  - Deworming — careRecurring, cycle 90, healthRecordType 'deworming'
  - CDT Vaccination — careRecurring, cycle 365, healthRecordType 'vaccination'
  - Teeth Trim — careRecurring, cycle 365, healthRecordType 'vetVisit'

### Donkey

- colors: Gray, Brown, Black, White, Spotted
- breeds: Miniature (gestationDays 365), Standard (gestationDays 365), Mammoth (gestationDays 365), American (gestationDays 365)
- careTemplates:
  - Farrier Visit — careRecurring, cycle 56, healthRecordType ''
  - Deworming — careRecurring, cycle 60, healthRecordType 'deworming'
  - Dental Float — careRecurring, cycle 365, healthRecordType 'vetVisit'
  - Vaccination (4-way) — careRecurring, cycle 365, healthRecordType 'vaccination'

### Dog

- colors: Black, White, Brown, Golden, Red, Brindle, Spotted
- breeds: Labrador Retriever (gestationDays 63), German Shepherd (gestationDays 63), Golden Retriever (gestationDays 63), Australian Shepherd (gestationDays 63), Border Collie (gestationDays 63), Great Pyrenees (gestationDays 63), Blue Heeler (gestationDays 63)
- careTemplates:
  - Rabies Vaccination — careRecurring, cycle 365, healthRecordType 'vaccination'
  - DHPP Vaccination — careRecurring, cycle 365, healthRecordType 'vaccination'
  - Deworming — careRecurring, cycle 90, healthRecordType 'deworming'
  - Flea/Tick Prevention — careRecurring, cycle 30, healthRecordType 'medication'
  - Heartworm Prevention — careRecurring, cycle 30, healthRecordType 'medication'
  - Nail Trim — careRecurring, cycle 30, healthRecordType ''

### Cat

- colors: Black, White, Orange, Gray, Calico, Tabby, Tortoiseshell
- breeds: Domestic Shorthair (gestationDays 65), Domestic Longhair (gestationDays 65), Maine Coon (gestationDays 65), Siamese (gestationDays 65), Persian (gestationDays 65), Barn Cat (gestationDays 65)
- careTemplates:
  - Rabies Vaccination — careRecurring, cycle 365, healthRecordType 'vaccination'
  - FVRCP Vaccination — careRecurring, cycle 365, healthRecordType 'vaccination'
  - Deworming — careRecurring, cycle 90, healthRecordType 'deworming'
  - Flea/Tick Prevention — careRecurring, cycle 30, healthRecordType 'medication'
  - Nail Trim — careRecurring, cycle 30, healthRecordType ''

## Existing Playbook Additions

Review of the 8 existing playbooks — breeds and care items to add:

### Chicken

- Add breeds: Wyandotte, Sussex, Silkie, Easter Egger, Marans, Ameraucana, Cochin
- Add colors: Blue, Splash, Lavender, Gray
- Add care: Vaccination (Marek's) — careSingle, cycle 0, healthRecordType 'vaccination'

### Duck

- Add breeds: Rouen, Welsh Harlequin, Cayuga, Buff Orpington, Saxony
- Add colors: Buff, Fawn
- Add care: Mite/Lice Check — careRecurring, cycle 30, healthRecordType ''

### Goat

- Add breeds: Pygmy (gestationDays 145), Saanen (gestationDays 150), Kiko (gestationDays 150), Toggenburg (gestationDays 150), Oberhasli (gestationDays 150)
- Add colors: Tan, Gray, Red
- Care is comprehensive — no additions.

### Cattle

- Add breeds: Simmental (gestationDays 283), Charolais (gestationDays 285), Limousin (gestationDays 283), Brahman (gestationDays 292), Red Angus (gestationDays 283)
- Add colors: Tan, Brindle
- Add care: Fly Control — careRecurring, cycle 14, healthRecordType ''

### Sheep

- Add breeds: Hampshire (gestationDays 147), Cheviot (gestationDays 147), Jacob (gestationDays 147), Icelandic (gestationDays 147), Romney (gestationDays 150)
- Add colors: Spotted
- Add care: Selenium/Vitamin E — careRecurring, cycle 90, healthRecordType 'medication'

### Pig

- Add breeds: Spotted (gestationDays 114), Large Black (gestationDays 114), Tamworth (gestationDays 114), Mangalitsa (gestationDays 115)
- Add colors: White
- Add care: Hoof Trim — careRecurring, cycle 90, healthRecordType ''
- Add care: Vaccination (Erysipelas) — careRecurring, cycle 180, healthRecordType 'vaccination'

### Rabbit

- Add breeds: Holland Lop (gestationDays 31), Mini Rex (gestationDays 31), Lionhead (gestationDays 31), Dutch (gestationDays 31), English Angora (gestationDays 31)
- Add colors: Orange, Blue, Broken
- Add care: Ear Mite Check — careRecurring, cycle 30, healthRecordType ''

### Horse

- Add breeds: Appaloosa (gestationDays 340), Tennessee Walker (gestationDays 340), Paint (gestationDays 340), Miniature (gestationDays 330), Clydesdale (gestationDays 340)
- Add colors: Buckskin, Roan, Dun
- Add care: Sheath Cleaning — careRecurring, cycle 180, healthRecordType ''

## seedStarterPlaybooks Bug

`AnimalTypeService.seedStarterPlaybooks()` line 212-218 does not copy `healthRecordType` from the playbook careTemplate to the AnimalType document. The current code maps:

- name, type, cycle, contactName (hardcoded ''), contactPhone (hardcoded '')

Missing: `healthRecordType: t.healthRecordType` — this means all seeded care templates lose their health record type linkage. Fix this during implementation.

## Touch Points

**Schema layer:**
- `apps/mobile/src/schema/type/GestationTable.ts` — add Dog (63) and Cat (65) to GESTATION_TABLE

**Data layer:**
- `apps/mobile/src/feature/customization/data/StarterPlaybooks.ts` — add 8 new playbook entries, expand 8 existing entries

**Service layer:**
- `apps/mobile/src/feature/customization/service/AnimalTypeService.ts` — fix seedStarterPlaybooks to include healthRecordType in careTemplate mapping (line 217)

**UI layer:**
- `apps/mobile/src/feature/auth/screen/SpeciesSelectionController.ts` — add Dog/Cat to AVAILABLE_SPECIES, fix Goat/Alpaca/Llama icons to 'paw'

## Data Migration

No migration needed. Playbooks are only used at onboarding time via `seedStarterPlaybooks`. Existing users already have their AnimalType documents and are unaffected. New users (or users who haven't completed onboarding) get the updated playbooks automatically.

## Risk

**healthRecordType bug** — existing users who already onboarded have care templates with missing healthRecordType. This is a data gap but fixing it retroactively would require a migration script to match template names to expected health record types, which is fragile. Accept this for existing users; new users will get correct data once the seeding bug is fixed.

**Batch size** — if a user selects all 16 species, the batch will create 16 AnimalType documents. Firestore batch limit is 500 operations, so this is well within bounds (16 sets + 1 user update = 17 operations).
