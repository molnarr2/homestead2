#!/usr/bin/env bash
set -euo pipefail

# ─── Configuration ───────────────────────────────────────────────────────────
PROJECT_ROOT="/Users/molnarr2/Projects/homestead2"
TDD_ROOT="$PROJECT_ROOT/vault/homestead-vault/01_research/01_plan/00_gen/03. TDD"
LOGDIR="$PROJECT_ROOT/scripts/tdd-logs"
START_STEP="${1:-2.1}"  # Pass step as arg to resume, e.g.: ./run-tdd-steps.sh 7.3

mkdir -p "$LOGDIR"

# ─── Helpers ─────────────────────────────────────────────────────────────────
commit_step() {
  local step="$1"
  local msg="$2"
  cd "$PROJECT_ROOT"
  git add -A
  if ! git diff --cached --quiet; then
    git commit -m "Layer $step: $msg

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
    echo "✅ Committed: Layer $step"
  else
    echo "⚠️  No changes to commit for Layer $step"
  fi
}

run_step() {
  local step="$1"
  local commit_msg="$2"
  local prompt="$3"
  shift 3
  local docs=("$@")

  echo ""
  echo "════════════════════════════════════════════════════════════════"
  echo "  Step $step — $commit_msg"
  echo "════════════════════════════════════════════════════════════════"

  # Build the file inclusion flags
  local file_args=()
  for doc in "${docs[@]}"; do
    file_args+=(--file "$doc")
  done

  # Run Claude in headless mode
  cd "$PROJECT_ROOT"
  claude -p \
    "${file_args[@]}" \
    "$prompt" \
    2>&1 | tee "$LOGDIR/step-${step}.log"

  local exit_code=${PIPESTATUS[0]}
  if [ $exit_code -ne 0 ]; then
    echo "❌ Step $step failed (exit $exit_code). Check $LOGDIR/step-${step}.log"
    echo "   Resume with: ./scripts/run-tdd-steps.sh $step"
    exit 1
  fi

  commit_step "$step" "$commit_msg"
}

should_run() {
  local step="$1"
  # Compare steps numerically (2.1 -> 21, 7.3 -> 73, etc.)
  local step_num="${step//./}"
  local start_num="${START_STEP//./}"
  [ "$step_num" -ge "$start_num" ]
}

# ─── Step Definitions ────────────────────────────────────────────────────────

# Step 2.1 — Shared Schema & Utilities
if should_run "2.1"; then
  run_step "2.1" "Shared Schema & Utilities" \
    "Implement the shared schema definitions and foundation utility layer. Create all TypeScript interfaces and default factory functions as specified. Each schema file contains only the interface + {entity}_default() function. Services handle Firestore access directly. Split models into separate files per entity. Also create DateUtility.ts, StringUtility.ts, and domain logic utilities (GestationUtility.ts, WithdrawalUtility.ts, CareUtility.ts, AnimalUtility.ts, ProductionUtility.ts) in apps/mobile/src/util/. Ensure TypeScript compiles with no errors." \
    "$TDD_ROOT/02. Shared Schema Definitions.md" \
    "$TDD_ROOT/03. Utility & Foundation Layer.md"
fi

# Step 3.1 — Feature Services
if should_run "3.1"; then
  run_step "3.1" "Feature Services" \
    "Implement the feature domain services. Each service lives at apps/mobile/src/feature/{domain}/service/ with an interface I{Domain}Service.ts and implementation {Domain}Service.ts. Services call @react-native-firebase/firestore and @react-native-firebase/storage directly. Use onSnapshot for real-time collections (animals, care events, active breedings, active withdrawals). Services return Promise<IResult> for mutations. Create Bootstrap.ts to instantiate and export all services. Ensure TypeScript compiles with no errors." \
    "$TDD_ROOT/04. Services Layer.md"
fi

# Step 4.1 — Zustand Stores
if should_run "4.1"; then
  run_step "4.1" "Zustand Stores" \
    "Implement all Zustand stores as specified. Each store should have state, actions that call services (from Bootstrap), and a clear() function. Create the resetAllStores utility. Stores: authStore, userStore, animalStore, careStore, healthStore, breedingStore, productionStore, noteStore, weightStore, animalTypeStore. Stores call services from Bootstrap (not Firebase directly). Ensure TypeScript compiles with no errors." \
    "$TDD_ROOT/13. Foundation Context Reference.md" \
    "$TDD_ROOT/06. State Management with Zustand.md"
fi

# Step 5.1 — Firestore Schema & Rules
if should_run "5.1"; then
  run_step "5.1" "Firestore Schema & Rules" \
    "Create the Firestore security rules, storage rules, and indexes file in the firebase-rule/ directory. All collections use flat root-level design with userId for ownership. AnimalType has breed, careTemplate, and eventTemplate subcollections." \
    "$TDD_ROOT/07. Firestore Schema & Security Rules.md"
fi

# Step 5.2 — Cloud Functions
if should_run "5.2"; then
  run_step "5.2" "Cloud Functions" \
    "Implement the Firebase Cloud Functions for care reminder notifications and subscription webhook handling. All function files in functions/src/. Ensure functions compile with: cd functions && npm run build." \
    "$TDD_ROOT/08. Firebase Cloud Functions.md"
fi

# Step 6.1 — Navigation Architecture
if should_run "6.1"; then
  run_step "6.1" "Navigation Architecture" \
    "Implement the full navigation structure in RootNavigation.tsx: auth state switching, DrawerNavigator (side menu), MainScreen (4 bottom tabs: Home, Animals, Production, Care), and SideMenu. Root navigation switches between Loading/Auth/Main based on auth state." \
    "$TDD_ROOT/10. Navigation Architecture.md"
fi

# Step 6.2 — Auth & Onboarding
if should_run "6.2"; then
  run_step "6.2" "Auth & Onboarding" \
    "Implement the authentication flow using the FirebaseAuth library. Create Login, Register, Loading screens, and Species Selection onboarding. The AuthService wraps FirebaseAuth and is accessed through Bootstrap. Logout clears stores and returns to login." \
    "$TDD_ROOT/12. Auth & Onboarding Screens.md"
fi

# Step 7.1 — Today Dashboard
if should_run "7.1"; then
  run_step "7.1" "Today Dashboard" \
    "Implement the Today Dashboard feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind). Ensure real-time updates via onSnapshot where applicable and subscription gating enforced." \
    "$TDD_ROOT/14. Feature - Today Dashboard.md"
fi

# Step 7.2 — Animal Profiles
if should_run "7.2"; then
  run_step "7.2" "Animal Profiles" \
    "Implement the Animal Profiles feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind). Ensure real-time updates via onSnapshot where applicable and subscription gating enforced." \
    "$TDD_ROOT/15. Feature - Animal Profiles.md"
fi

# Step 7.3 — Care Reminders
if should_run "7.3"; then
  run_step "7.3" "Care Reminders" \
    "Implement the Care Reminders feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind). Ensure real-time updates via onSnapshot where applicable and subscription gating enforced." \
    "$TDD_ROOT/16. Feature - Care Reminders.md"
fi

# Step 7.4 — Health Records & Withdrawal Calculator
if should_run "7.4"; then
  run_step "7.4" "Health Records & Withdrawal Calculator" \
    "Implement the Health Records & Withdrawal Calculator feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind). Ensure real-time updates via onSnapshot where applicable and subscription gating enforced." \
    "$TDD_ROOT/17. Feature - Health Records & Withdrawal Calculator.md"
fi

# Step 7.5 — Breeding Manager
if should_run "7.5"; then
  run_step "7.5" "Breeding Manager" \
    "Implement the Breeding Manager feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind). Ensure real-time updates via onSnapshot where applicable and subscription gating enforced." \
    "$TDD_ROOT/18. Feature - Breeding Manager.md"
fi

# Step 7.6 — Production Tracking
if should_run "7.6"; then
  run_step "7.6" "Production Tracking" \
    "Implement the Production Tracking feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind). Ensure real-time updates via onSnapshot where applicable and subscription gating enforced." \
    "$TDD_ROOT/19. Feature - Production Tracking.md"
fi

# Step 7.7 — Notes & Observations
if should_run "7.7"; then
  run_step "7.7" "Notes & Observations" \
    "Implement the Notes & Observations feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind). Ensure real-time updates via onSnapshot where applicable and subscription gating enforced." \
    "$TDD_ROOT/20. Feature - Notes & Observations.md"
fi

# Step 8.1 — Profile & Settings
if should_run "8.1"; then
  run_step "8.1" "Profile & Settings" \
    "Implement the Profile & Settings feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind)." \
    "$TDD_ROOT/21. Feature - Profile & Settings.md"
fi

# Step 8.2 — Customization Engine
if should_run "8.2"; then
  run_step "8.2" "Customization Engine" \
    "Implement the Customization Engine feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind)." \
    "$TDD_ROOT/22. Feature - Customization Engine.md"
fi

# Step 8.3 — Subscription & Paywall
if should_run "8.3"; then
  run_step "8.3" "Subscription & Paywall" \
    "Implement the Subscription & Paywall feature. Follow the pattern: Service (calls Firebase directly), Store (Zustand, calls service), Controller (custom hook wiring store + service), Screen (UI with Uniwind)." \
    "$TDD_ROOT/23. Feature - Subscription & Paywall.md"
fi

# Step 9.1 — Scripts & Tooling
if should_run "9.1"; then
  run_step "9.1" "Scripts & Build Tooling" \
    "Implement the scripts and build tooling as specified." \
    "$TDD_ROOT/24. Scripts & Build Tooling.md"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  🎉 All steps complete!"
echo "════════════════════════════════════════════════════════════════"
