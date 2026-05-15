# Testing Strategy for Homestead Mobile App

## Context

Solo developer, AI-assisted development. React Native app with Firebase/Firestore, Zustand state management, Controller+Screen pattern, services layer.

The central tension: AI writes both the code and the tests. What's the point?

---

## The Good

### Service-layer tests are the highest ROI

The architecture already isolates Firebase behind services that return `IResult`. These are pure input/output — easy to test, and they guard the stuff that actually breaks: Firestore queries, data transformations, admin object handling. When AI refactors a service, a failing test catches it before the phone does.

### Controller tests catch logic regressions

The Controller+Screen split means controllers are just hooks with logic. Testing that a controller filters deleted records, calculates withdrawal dates correctly, or gates on subscription status — these are the tests that pay off when you say "add feature X" and AI silently breaks feature Y.

### Snapshot/schema tests are cheap insurance

A test that asserts `animal_default()` returns the right shape with `admin.deleted == false` and Timestamps (not ISO strings) catches the exact kind of drift AI introduces. Five minutes to write, saves hours of debugging.

---

## The Bad

### AI-written tests test the implementation, not the intent

When AI writes both code and tests, the tests often just mirror what the code does — not what it *should* do. A bug in the code becomes a bug in the test. You need to at least review the assertions and ask "is this actually what I want?"

### UI/Screen tests are mostly waste for a solo dev

Testing that a button renders or a FlatList has items is low-signal busywork. You're going to eyeball the UI anyway. The Controller+Screen split means the Screen is dumb — if the controller is correct, the screen is just layout.

### Test maintenance is real

Every schema change, every new field, every refactored service — tests break. As the sole maintainer, you'll feel this friction. If you over-test, you'll start skipping them or deleting them when they get annoying.

---

## The Ugly

### The "AI testing AI" circularity is real but not fatal

The value isn't that the test is perfectly correct on day one — it's that the test *locks in behavior*. Once you manually verify a feature works, the test becomes a tripwire. Next time AI touches that code, the test fails if behavior changed. You're not trusting AI to write correct tests; you're using tests as change detection.

### Integration tests against Firebase are painful

Emulator setup, seed data, async listeners, onSnapshot timing — it's a rabbit hole. For a solo dev, the maintenance cost usually exceeds the value. You'll spend more time fixing flaky tests than fixing bugs.

### The honest truth

Without tests, the current workflow is "change code, run on phone, tap around, hope nothing else broke." That works until the app hits ~30 screens, then regressions hide.

---

## Recommendation

1. **Test services and controllers only.** Skip Screen tests entirely.
2. **You write the test assertions, let AI write the boilerplate.** Define *what* to test ("test that getAnimals excludes deleted records and filters by homesteadId"), AI writes *how*.
3. **Add tests after manually verifying a feature works.** The test locks in known-good behavior, not speculative correctness.
4. **Start with ~10 tests on the most critical paths** (animal CRUD, care events, breeding withdrawals) rather than trying to cover everything.

### What to test (priority order)

| Priority | Layer | Why |
|----------|-------|-----|
| 1 | Schema defaults (`_default()` functions) | Catches shape drift, wrong field types, missing admin object |
| 2 | Services (mutations + queries) | Guards data integrity, Firestore query correctness |
| 3 | Controllers (business logic hooks) | Catches regressions when features interact |
| 4 | Utility/helper functions | Pure functions, trivial to test |
| Skip | Screens / UI components | Low signal, manual verification is faster |
| Skip | Firebase integration tests | Maintenance cost exceeds value for solo dev |
