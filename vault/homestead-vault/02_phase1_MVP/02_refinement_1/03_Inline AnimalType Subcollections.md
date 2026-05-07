# Inline AnimalType Subcollections

## Summary

Move breeds, care templates, and event templates from Firestore subcollections into arrays on the AnimalType document. This reduces onboarding seed from ~10 writes per species to 1, eliminates separate fetch calls, and makes all data available through the existing `onSnapshot` subscription.

## What Already Exists

- **AnimalType schema:** `apps/mobile/src/schema/animalType/AnimalType.ts` — `id`, `admin`, `name`, `colors[]`
- **Breed schema:** `apps/mobile/src/schema/animalType/Breed.ts` — `id`, `admin`, `name`, `gestationDays`
- **CareTemplate schema:** `apps/mobile/src/schema/animalType/CareTemplate.ts` — `id`, `admin`, `name`, `type`, `cycle`, `contactName`, `contactPhone`, `extraData[]`
- **EventTemplate schema:** `apps/mobile/src/schema/animalType/EventTemplate.ts` — `id`, `admin`, `name`, `extraData[]`
- **EventExtraDataObject:** `apps/mobile/src/schema/object/EventExtraDataObject.ts` — used by CareTemplate and EventTemplate
- **AnimalTypeService:** `apps/mobile/src/feature/customization/service/AnimalTypeService.ts` — CRUD for all four entities via subcollections
- **IAnimalTypeService:** `apps/mobile/src/feature/customization/service/IAnimalTypeService.ts` — interface with separate methods for each subcollection
- **AnimalTypeStore:** `apps/mobile/src/store/animalTypeStore.ts` — Zustand store with `animalTypes[]`, `breeds{}`, `careTemplates{}`, separate `fetchBreeds()` / `fetchCareTemplates()` methods
- **StarterPlaybooks:** `apps/mobile/src/feature/customization/data/StarterPlaybooks.ts` — seed data for 8 species
- **Customization screens:** `apps/mobile/src/feature/customization/screen/` — `AnimalTypeDetailController.ts`, `EditBreedController.ts`, `EditBreedScreen.tsx`, `EditCareTemplateController.ts`, `EditCareTemplateScreen.tsx`
- **Consumers of breeds:** `EditAnimalController.ts`, `CreateAnimalController.ts`, `CreateBreedingRecordController.ts`, `BreedingRecordDetailController.ts`, `RecordBirthOutcomeController.ts`, `GestationUtility.ts`
- **Consumers of care templates:** `CreateCareEventController.ts`
- **Firestore path:** `homesteads/{id}/animalType/{id}` with subcollections `breed`, `careTemplate`, `eventTemplate`

## Schema Changes

### AnimalType (update existing file)

Add three arrays to the AnimalType interface. Remove `admin` from the inline item types — only the parent AnimalType document tracks `admin`. Generate `id` values with `uuid` or `firestore().collection('_').doc().id` when adding items.

```
breeds: { id: string; name: string; gestationDays: number }[]
careTemplates: { id: string; name: string; type: 'careRecurring' | 'careSingle'; cycle: number; contactName: string; contactPhone: string }[]
eventTemplates: { id: string; name: string; extraData: EventExtraDataObject[] }[]
```

Update `animalType_default()` to include empty arrays for all three.

### Breed, CareTemplate, EventTemplate schema files

Delete these three files. They are no longer needed as standalone interfaces. If any file imports these types, update imports to reference the inline types from AnimalType instead.

## StarterPlaybooks Changes

Update `StarterPlaybook` interface to match the new inline structure. Each breed/careTemplate/eventTemplate entry should include an `id` field. Generate IDs at seed time in the service, not in the playbook data — the playbook data should omit `id` and the service adds it during seeding.

No other changes to the playbook data itself.

## AnimalTypeService Changes

### Remove subcollection methods

Remove all methods that reference subcollections: `breedCollection()`, `careTemplateCollection()`, `eventTemplateCollection()`, `getBreedsForType()`, `createBreed()`, `updateBreed()`, `deleteBreed()`, `getCareTemplatesForType()`, `createCareTemplate()`, `updateCareTemplate()`, `deleteCareTemplate()`, `getEventTemplatesForType()`, `createEventTemplate()`, `updateEventTemplate()`, `deleteEventTemplate()`.

### Add array mutation methods

Replace them with methods that update the AnimalType document's arrays. Each method reads the current AnimalType doc, mutates the relevant array, and writes back. Use `updateAnimalType()` internally.

- `addBreed(animalTypeId, breed)` — push to `breeds` array
- `updateBreed(animalTypeId, breed)` — find by `id` in array, replace
- `deleteBreed(animalTypeId, breedId)` — filter out by `id`
- Same pattern for `addCareTemplate`, `updateCareTemplate`, `deleteCareTemplate`
- Same pattern for `addEventTemplate`, `updateEventTemplate`, `deleteEventTemplate`

All methods return `Promise<IResult>`.

### Simplify seedStarterPlaybooks

Instead of batch-writing subcollection documents, build a single AnimalType object per species with `breeds`, `careTemplates`, and `eventTemplates` arrays populated inline. Generate IDs for each array item using `firestore().collection('_').doc().id`. One `set()` per species.

### Update IAnimalTypeService interface

Mirror the method signature changes above.

## AnimalTypeStore Changes

### Remove separate state

Remove `breeds: Record<string, Breed[]>` and `careTemplates: Record<string, CareTemplate[]>` from state. Remove `fetchBreeds()` and `fetchCareTemplates()`. Breeds and care templates are now accessed directly from `animalTypes[].breeds` and `animalTypes[].careTemplates`.

### Add mutation actions

Add store actions that call the new service methods: `addBreed`, `updateBreed`, `deleteBreed`, `addCareTemplate`, `updateCareTemplate`, `deleteCareTemplate`, `addEventTemplate`, `updateEventTemplate`, `deleteEventTemplate`. After each mutation succeeds, the existing `onSnapshot` listener will automatically update `animalTypes` in state — no manual state update needed.

### Update getGestationDays

Change from looking up `breeds[animalTypeId]` to looking up `animalTypes.find(t => t.id === animalTypeId)?.breeds`.

## Consumer Updates

### CreateAnimalController / EditAnimalController

- Remove `fetchBreeds()` calls and the `useEffect` that triggers them
- Compute `availableBreeds` directly: `animalTypes.find(t => t.id === animalTypeId)?.breeds ?? []`
- Remove `breeds` from destructured store state

### CreateCareEventController

- Change template lookup from `Object.values(careTemplates).flat()` to `animalTypes.flatMap(t => t.careTemplates)`
- Remove `careTemplates` from destructured store state

### AnimalTypeDetailController

- Remove separate `getBreedsForType`, `getCareTemplatesForType`, `getEventTemplatesForType` calls in `loadData()`
- Get all data from the single `fetchAnimalType()` result: `type.breeds`, `type.careTemplates`, `type.eventTemplates`

### CustomizationHomeScreen

- Remove the `useEffect` that calls `getBreedsForType` / `getCareTemplatesForType` for each type to get counts
- Read counts directly from `animalTypes[].breeds.length` and `animalTypes[].careTemplates.length`

### EditBreedController / EditBreedScreen

- Update to read/write breeds from the AnimalType document's `breeds` array instead of a subcollection
- On save, call `animalTypeStore.addBreed()` or `animalTypeStore.updateBreed()` instead of `createBreed()` / `updateBreed()`

### EditCareTemplateController / EditCareTemplateScreen

- Same pattern as EditBreedController — read/write from the AnimalType's `careTemplates` array

### GestationUtility

- No changes needed. It receives `breedGestationOverride` as a parameter — callers are responsible for looking up the breed's `gestationDays`.

### BreedingRecordDetailController / CreateBreedingRecordController / RecordBirthOutcomeController

- Update any `fetchBreeds()` calls to read from `animalTypes[].breeds` directly

## Files to Delete

- `apps/mobile/src/schema/animalType/Breed.ts`
- `apps/mobile/src/schema/animalType/CareTemplate.ts`
- `apps/mobile/src/schema/animalType/EventTemplate.ts`

## Files to Modify

- `apps/mobile/src/schema/animalType/AnimalType.ts`
- `apps/mobile/src/feature/customization/data/StarterPlaybooks.ts`
- `apps/mobile/src/feature/customization/service/AnimalTypeService.ts`
- `apps/mobile/src/feature/customization/service/IAnimalTypeService.ts`
- `apps/mobile/src/store/animalTypeStore.ts`
- `apps/mobile/src/feature/animal/screen/CreateAnimalController.ts`
- `apps/mobile/src/feature/animal/screen/EditAnimalController.ts`
- `apps/mobile/src/feature/care/screen/CreateCareEventController.ts`
- `apps/mobile/src/feature/customization/screen/AnimalTypeDetailController.ts`
- `apps/mobile/src/feature/customization/screen/CustomizationHomeScreen.tsx`
- `apps/mobile/src/feature/customization/screen/EditBreedController.ts`
- `apps/mobile/src/feature/customization/screen/EditCareTemplateController.ts`
- `apps/mobile/src/feature/breeding/screen/CreateBreedingRecordController.ts`
- `apps/mobile/src/feature/breeding/screen/BreedingRecordDetailController.ts`
- `apps/mobile/src/feature/breeding/screen/RecordBirthOutcomeController.ts`
- `apps/mobile/src/store/resetAllStores.ts`
