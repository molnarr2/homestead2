# Automated Healthcare Testing

## Current State

Starting from near-zero testing infrastructure. One smoke test (`__tests__/App.test.tsx`), no E2E framework, no Firebase emulator, no `testID` props on any health screens, no CI/CD pipeline. This means we can pick the right approach without fighting existing choices.

---

## Option 1: Maestro E2E Flows (Recommended Starting Point)

YAML-based mobile E2E testing tool. Flows describe taps, text entry, and assertions — the step-by-step testing guide (`01_testing_guide.md`) translates almost 1:1 to Maestro YAML.

### Example Flow

```yaml
appId: com.homestead.mobile
---
- tapOn: "Health"
- tapOn: ".*FAB.*"
- tapOn: "Vaccination"
- tapOn: "Name"
- inputText: "Rabies Vaccine"
- tapOn: "Save Health Record"
- assertVisible: "Rabies Vaccine"
- assertVisible: "Vaccination"
```

### What's Needed

- Install Maestro CLI (`brew install maestro`)
- Add `testID` props to key elements in health screens (buttons, inputs, type selectors, list items)
- Write `.maestro/` flow files for each test case
- Runs on iOS Simulator or Android Emulator — no code changes beyond testIDs

### Effort

~2-3 days for health screens. Adding testIDs is the main work.

### Claude Integration

Claude can write the Maestro YAML flows, add testIDs to screens, run `maestro test` via Bash, and report pass/fail per flow. Fully automatable from Claude Code.

### Trade-offs

- (+) Tests the real app end-to-end — catches navigation bugs, rendering issues, data not persisting
- (+) YAML is readable and maps directly to the manual testing guide
- (+) No mocking — tests against real Firebase (or emulator)
- (-) Requires a running simulator/emulator
- (-) Slower than unit tests (~30-60s per flow)
- (-) Flaky if animations or network latency aren't handled

---

## Option 2: Jest + React Native Testing Library (Integration Tests)

Render screens in a JS test environment, simulate user interactions (press, type, scroll), assert on what's rendered. No simulator needed.

### Example Test

```typescript
it('shows medication fields when Medication type selected', () => {
  render(<CreateHealthRecordScreen />);
  fireEvent.press(screen.getByText('Medication'));
  expect(screen.getByText('Dosage')).toBeTruthy();
  expect(screen.getByText('Withdrawal Period')).toBeTruthy();
});

it('rejects negative withdrawal days', () => {
  // fill form, set withdrawalDays to -5, tap save
  expect(screen.getByText(/cannot be negative/i)).toBeTruthy();
});
```

### What's Needed

- Install `@testing-library/react-native` and `@testing-library/jest-native`
- Mock Firebase services (tests run in Node, not on device)
- Mock navigation (`@react-navigation/native`)
- Write test files per screen

### Effort

~3-4 days. Mocking Firebase and navigation is the heavy lift.

### Claude Integration

Claude can write the test files, run `yarn test`, and report pass/fail. Fully automatable.

### Trade-offs

- (+) Fast — runs in seconds, no simulator needed
- (+) Good for testing conditional rendering, validation, form logic
- (-) Heavy mocking required (Firebase, navigation, stores)
- (-) Does NOT test actual Firebase persistence, photo uploads, or real navigation
- (-) Controller + Screen pattern uses hooks, which are awkward to test in isolation
- (-) Least bang-for-buck of the three options given the app's architecture

---

## Option 3: Service-Level Tests + Firebase Emulator (Data Layer)

Test HealthService and GroupService directly against a local Firebase emulator. Verifies CRUD operations, withdrawal calculations, and auto-care-event creation without any UI.

### Example Test

```typescript
it('creates a vaccination and auto-generates care event', async () => {
  const record = healthRecord_default();
  record.recordType = 'vaccination';
  record.vaccineNextDueDate = '2026-07-01';
  const result = await healthService.createHealthRecord(record);
  expect(result.success).toBe(true);
  // query care events, assert one exists with matching date
});
```

### What's Needed

- Add emulator config to `firebase.json` (Firestore + Storage)
- Run `firebase emulators:start` before tests
- Write service test files that call real service methods against emulated Firestore
- No UI mocking needed

### Effort

~2 days. Firebase emulator setup is straightforward.

### Claude Integration

Claude can configure the emulator, write service tests, start emulators via Bash, run tests, and report pass/fail.

### Trade-offs

- (+) Tests real business logic — withdrawal calculation, care event auto-creation, soft deletes
- (+) No UI mocking, no simulator needed
- (+) Fast and reliable
- (-) Says nothing about whether the UI works
- (-) Requires Firebase CLI and Java runtime for emulator

---

## Recommended Approach

Layer them, starting with the highest-value option first.

### Phase 1: Maestro E2E (start here)

Maps directly to the testing guide. Tests the real app end-to-end. Catches the most real-world bugs (navigation broken, field not rendering, data not saving) with the least mocking. One `.maestro/` flow per test case in the guide.

### Phase 2: Firebase Emulator + Service Tests

Add service-level tests for the business rules that matter most: withdrawal calculations, auto-care-event creation, soft deletes, group health record propagation. These are the rules where a bug has real consequences (wrong withdrawal date = legal/safety issue).

### Phase 3: RNTL Integration Tests (optional)

Lowest priority given the Controller + Screen architecture. The controllers are hooks (awkward to test in isolation) and the screens need heavy mocking to render. Only worth it if specific validation or conditional rendering logic becomes a recurring source of bugs.

---

## Pass/Fail Reporting with Claude

Regardless of which option is chosen, the workflow with Claude Code looks like:

1. Claude runs the test suite (`maestro test`, `yarn test`, or both)
2. Parses stdout for pass/fail per test case
3. Produces a summary table:

```
| Test Case                        | Status |
|----------------------------------|--------|
| Create Vaccination               | PASS   |
| Vaccination auto-creates care    | PASS   |
| Create Medication + Withdrawal   | PASS   |
| Negative dosage rejected         | FAIL   |
| Group record visible on animals  | PASS   |
```

4. For failures, Claude reads the error output and can investigate/fix the issue directly
