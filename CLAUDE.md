## Rules
1. Follow the document instructions exactly. Do not invent features not described.
2. Use the exact file paths and naming conventions specified. All paths start with apps/mobile/src/.
3. Every schema must include `admin: AdminObject` with Tstamp timestamps (Firebase Timestamps, NOT ISO strings).
4. Use Uniwind (Tailwind CSS for React Native) className for all styling. Do NOT use react-native-paper.
5. Use Zustand for state. Do NOT use Redux or Context for state management.
6. Follow the Controller + Screen pattern: Controller is a custom hook, Screen is pure UI.
7. Services are the ONLY files that import @react-native-firebase/* (except FirebaseAuth.ts).
8. UI and Controllers NEVER import Firebase, MMKV, or other 3rd-party data libraries directly.
9. All Firestore queries filter `admin.deleted == false` unless explicitly stated otherwise.
10. Include userId on all documents (animal, care, health, breeding, production, note, weight).
11. Do not add comments or documentation unless the document specifies it.
12. TypeScript strict mode. No `any` types unless absolutely necessary.
13. AdminObject dates use Firebase Timestamps (Tstamp type). Domain dates (dueDate, birthday, etc.) use ISO 8601 strings with date-fns.
14. Subscription gating enforced client-side with RevenueCat entitlements.
15. Use onSnapshot for real-time listeners on: animals, care events, active breedings, active withdrawals.
16. Services return Promise<IResult> for all mutations.
17. Services are instantiated in Bootstrap.ts and exported as bs{ServiceName}.
18. Schema files contain ONLY interface + {entity}_default() function. No _get(), _set(), _collection() helpers.
