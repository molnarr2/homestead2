- [ ] If someone subscribes and adds animals and then cancels they can continue to use it for those animals. We need to do a read-only overflow. The first 12 become full usage. And the rest become view-only on downgrade.
- [ ] Notes when tapping on the picture you can't choose the camera
- [ ] 4. Unbounded Queries -- All real-time listeners load entire collections without pagination or date filtering. [[02_phase1_MVP/07_code_review/02_research_and_options]]
- [ ] 6. Orphaned References Degrade Silently -- [[02_phase1_MVP/07_code_review/01_code_analysis]]
- [ ] 5. Cloud Functions Don't Scale with User Base -- [[02_phase1_MVP/07_code_review/01_code_analysis]]
- [ ] C1 — Storage rules grant every authenticated user read/write to every homestead's files
- [ ] C2 — Firestore rules perform no field validation; client-trusted subscription tier is client-writable → free paywall bypass + cross-field tampering
- [ ] Can't add more customization animals from the list after onboarding
- [ ] Health care should have templates and there should always be contacts saved
- [ ] Perform an analysis I want to know how we can look at the health of the app once we release it in terms of bugs happening in the app and we can make use of Firebase to help out with that.


/Users/molnarr2/src/homestead2/vault/homestead-vault/02_phase1_MVP/07_code_review/06_rn-firebase-audit.md


---

  Gaps That Matter for Post-Release Health

  1. No Global Error Boundaries

  Right now, if a React component throws or an unhandled promise rejects, Crashlytics won't capture it with good context. You're missing:
  - React Error Boundary — catches component render crashes
  - Global JS exception handler — catches uncaught JS errors
  - Unhandled promise rejection handler — catches forgotten .catch() calls

  2. iOS Analytics Disabled

  Your GoogleService-Info.plist has IS_ANALYTICS_ENABLED = false, so you're flying blind on iOS usage patterns.

  3. No Performance Monitoring

  @react-native-firebase/perf isn't installed — you won't see slow screen loads, slow network calls, or ANRs.

  4. Limited Crashlytics Context

  You're recording errors but not setting breadcrumbs or custom keys (like which screen the user was on, which homestead was active, subscription tier) that make crashes actually debuggable.

  Recommendation

  The highest-impact, lowest-effort move is adding global error catchers + enriching Crashlytics context. Performance monitoring is a nice-to-have but less urgent. Would you like me to implement the error
  boundary, global exception handlers, and Crashlytics enrichment? I can also flip on iOS analytics if you want.