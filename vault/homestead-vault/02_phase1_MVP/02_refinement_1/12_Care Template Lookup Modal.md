# Care Template Lookup Modal

## Summary

Add a lookup icon next to the Event Name field on the Create Care Event screen. Tapping it opens a modal that lists all care templates (grouped by animal type). Selecting a template populates Event Name, Contact Name, and Contact Phone. The modal includes a button to navigate to the Customization screen.

## What Already Exists

- **Schema:** `apps/mobile/src/schema/animalType/AnimalType.ts` - `AnimalTypeCareTemplate` with `id`, `name`, `type`, `cycle`, `contactName`, `contactPhone`; templates live as arrays inside `AnimalType`
- **Store:** `apps/mobile/src/store/animalTypeStore.ts` - `useAnimalTypeStore` with `animalTypes` array containing `careTemplates` per type
- **Create Screen:** `apps/mobile/src/feature/care/screen/CreateCareEventScreen.tsx` - Event Name is currently a plain `TextInput`
- **Controller:** `apps/mobile/src/feature/care/screen/CreateCareEventController.ts` - already reads `animalTypes` from store and applies template data via `templateId` route param
- **Modal Pattern:** `apps/mobile/src/feature/care/component/AnimalPickerModal.tsx` - `Modal` with `animationType="slide"`, `presentationStyle="pageSheet"`, `SearchBar`, `SectionList`
- **Navigation:** `Customization` route exists in `RootNavigation.tsx`

## Files to Create

1. `apps/mobile/src/feature/care/component/CareTemplateLookupModal.tsx`

## Files to Modify

1. `apps/mobile/src/feature/care/screen/CreateCareEventScreen.tsx` - add lookup icon next to Event Name, wire up modal
2. `apps/mobile/src/feature/care/screen/CreateCareEventController.ts` - add `applyTemplate` method that sets name, type, cycle, contactName, contactPhone from a selected template

## Modal Spec (`CareTemplateLookupModal.tsx`)

Follow the same structure as `AnimalPickerModal`.

### Props

```ts
interface Props {
  visible: boolean
  onClose: () => void
  onSelect: (template: AnimalTypeCareTemplate) => void
  onGoToCustomization: () => void
}
```

### Layout

- **Header:** close icon (left), title "Care Templates" (center), placeholder spacer (right) - same pattern as `AnimalPickerModal`
- **SearchBar:** filters templates by name (case-insensitive)
- **SectionList:** sections grouped by animal type name (e.g. "Cattle", "Goats"); each item shows the template name and type badge ("Recurring" / "One-time")
- **Footer:** a `TouchableOpacity` row at the bottom of the list (rendered as `ListFooterComponent`) with icon `cog` and text "Manage Templates" - calls `onGoToCustomization`
- **Empty state:** "No care templates found" centered text

### Item Row

- Template name as primary text
- Subtitle showing type label and cycle if recurring (e.g. "Recurring - every 30 days")
- Contact name if present (e.g. "Contact: Dr. Smith")

### Behavior

- `onShow` resets search to empty string
- Tapping a template calls `onSelect(template)` then `onClose()`

## Controller Changes (`CreateCareEventController.ts`)

Add an `applyTemplate` function:

```ts
const applyTemplate = (template: AnimalTypeCareTemplate) => {
  setName(template.name)
  setType(template.type)
  setCycle(template.cycle)
  setContactName(template.contactName)
  setContactPhone(template.contactPhone)
}
```

Return `applyTemplate` from the controller.

## Screen Changes (`CreateCareEventScreen.tsx`)

- Add `templateModalVisible` state (boolean, default `false`)
- Replace the Event Name `TextInput` with a `View` wrapping the `TextInput` and a `TouchableOpacity` icon button:
  - Use a `View className="flex-row items-end gap-2"` wrapper
  - `TextInput` gets `className="flex-1"` (or equivalent wrapper)
  - Icon button: `TouchableOpacity` with `Icon name="text-box-search-outline"` (size 24, color `#4A6741`) positioned to the right of the text input, vertically aligned with the input field
- Render `CareTemplateLookupModal` with:
  - `visible={templateModalVisible}`
  - `onClose={() => setTemplateModalVisible(false)}`
  - `onSelect={controller.applyTemplate}`
  - `onGoToCustomization`: close modal, then `navigation.navigate('Customization')`
