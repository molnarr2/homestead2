# Feedback System & App Store Review

## Summary

Expand the existing feedback screen into a richer feedback modal with star rating, predefined area selection (best + needs improvement), and freeform text. Trigger it automatically based on total core event count thresholds from the analytics engine. Separately trigger native app store review prompts at different thresholds. Both the feedback modal and app review are driven by the same core event counter in AnalyticsService.

## Current Behavior

The app has a basic feedback flow:

- `apps/mobile/src/schema/feedback/Feedback.ts` — schema with rating, freeform feedback text, os, version
- `apps/mobile/src/feature/profile/screen/SendFeedbackScreen.tsx` — full-screen with 5-star rating + single text input
- `apps/mobile/src/feature/profile/screen/SendFeedbackController.ts` — calls `bsProfileService.submitFeedback()`
- `apps/mobile/src/feature/profile/service/ProfileService.ts:32` — writes to `feedback_v2` collection
- Side menu (`apps/mobile/src/navigation/SideMenu.tsx:73`) has "Send Feedback" that navigates to `SendFeedback`

The analytics engine (`apps/mobile/src/core/service/analytics/AnalyticsService.ts`) tracks per-event counts in MMKV via `logAction()`. There is no total core event counter and no feedback/review triggering.

No app store review library is installed.

## Desired Behavior

### Feedback Modal

When a core event threshold is reached, a feedback modal appears as a bottom-sheet overlay (same pattern as `PaywallModal`). The modal contains four sections in order:

1. **Star Rating** — tap 1-5 stars. "How would you rate your experience?"
2. **Best Areas** — "What do you like best?" — select one or more from 5 predefined areas (multi-select chips)
3. **Improvement Areas** — "What needs improvement?" — select one or more from the same 5 predefined areas (multi-select chips)
4. **Freeform Text** — "Anything else you'd like to share?" — optional multiline text input

The five app areas:
- Animal Management
- Care & Scheduling
- Health Tracking
- Breeding
- Production Logging

Submit writes to `feedback_v2` collection in Firebase. Dismiss (X button or backdrop tap) closes without submitting and does not re-trigger until the next threshold.

The side menu "Send Feedback" item opens the same modal instead of navigating to the screen. The `SendFeedbackScreen` and `SendFeedbackController` are deleted.

### Feedback Trigger Thresholds

Based on **total core event count** (sum of all `logAction()` calls): 10, 25, 50, 100, then every 100 (200, 300, 400, ...).

### App Store Review Trigger Thresholds

Based on the same total core event count: 20, 50, then every 100 (100, 200, 300, ...).

Uses `react-native-in-app-review` to call the native iOS/Android review prompt. Apple and Google both rate-limit how often the prompt actually appears, so calling it at every threshold is safe — the OS decides whether to show it.

### Trigger Flow

1. Any service calls `analyticsService.logAction(event)`
2. `logAction()` increments the per-event counter (existing) AND a new total core event counter
3. After incrementing, `logAction()` checks the new total against feedback thresholds and review thresholds
4. If a feedback threshold is hit and that threshold hasn't been shown before, it calls a callback (or the feedback store) to show the modal
5. If a review threshold is hit and that threshold hasn't been triggered before, it calls `InAppReview.RequestInAppReview()`
6. Shown/triggered thresholds are persisted in MMKV so they survive app restarts

## Schema Changes

### Feedback (modify existing)

`apps/mobile/src/schema/feedback/Feedback.ts`

Add two fields, keep all existing fields:

- `bestAreas: string[]` — selected area labels from the predefined list
- `improvementAreas: string[]` — selected area labels from the predefined list
- `source: 'auto' | 'menu'` — whether the feedback was triggered automatically or opened manually from the side menu

Update `feedback_default()` to include `bestAreas: []`, `improvementAreas: []`, `source: 'menu'`.

### AnalyticsService (MMKV keys, not Firestore)

New MMKV keys in the analytics storage:

- `analytics_total_core_events` (number) — incremented on every `logAction()` call
- `analytics_feedback_shown_thresholds` (JSON string[]) — list of thresholds already triggered, e.g. `["10","25"]`
- `analytics_review_shown_thresholds` (JSON string[]) — list of thresholds already triggered

## Data Access Audit

- **Writes**: One Firestore write per feedback submit — same as today. No new reads. The modal pre-fills userId/email from the Zustand user store (already in memory).
- **Total counter**: Single MMKV integer increment per `logAction()` call. Negligible cost — MMKV is synchronous in-memory.
- **Threshold checks**: Two array lookups in MMKV per `logAction()` call. The arrays are small (max ~10 entries over a user's lifetime). No Firestore involved.
- **N+1 queries**: None. No collection reads anywhere in this flow.
- **Round trip count on trigger**: 0 Firestore reads to show the modal, 1 Firestore write on submit.

## Touch Points

### Schema

- `apps/mobile/src/schema/feedback/Feedback.ts` — add `bestAreas`, `improvementAreas`, `source` fields and update default

### Service

- `apps/mobile/src/core/service/analytics/AnalyticsService.ts` — add total core event counter, threshold checking logic, feedback/review trigger callbacks
- `apps/mobile/src/core/service/analytics/IAnalyticsService.ts` — add `onFeedbackTrigger` callback setter and `getTotalCoreEventCount()` method
- `apps/mobile/src/feature/profile/service/ProfileService.ts` — no changes needed (submitFeedback already works, just receives richer data)

### Store

- `apps/mobile/src/store/feedbackStore.ts` — **new file**. Zustand store with `visible`, `source`, `show(source)`, `hide()`. Same pattern as `paywallStore.ts`. Controls the feedback modal visibility.

### UI

- `apps/mobile/src/feature/profile/component/FeedbackModal.tsx` — **new file**. The feedback modal component with star rating, area chips, freeform text, submit button. Rendered in `RootNavigation.tsx` alongside `PaywallModal`.
- `apps/mobile/src/feature/profile/component/FeedbackModalController.ts` — **new file**. Controller hook for the modal. Manages rating, bestAreas, improvementAreas, feedback text state. Calls `bsProfileService.submitFeedback()` on submit and `feedbackStore.hide()` after.
- `apps/mobile/src/navigation/SideMenu.tsx` — change "Send Feedback" onPress from `navigateTo('SendFeedback')` to `feedbackStore.show('menu')`
- `apps/mobile/src/navigation/RootNavigation.tsx` — add `<FeedbackModal />` next to `<PaywallModal />`. Remove `SendFeedback` route and screen import.

### Delete

- `apps/mobile/src/feature/profile/screen/SendFeedbackScreen.tsx` — replaced by modal
- `apps/mobile/src/feature/profile/screen/SendFeedbackController.ts` — replaced by modal controller

### Bootstrap

- `apps/mobile/src/Bootstrap.ts` — after creating `bsAnalyticsService`, wire up the feedback trigger callback to `feedbackStore.show('auto')` and the review trigger to call `InAppReview.RequestInAppReview()`

### Package

- `apps/mobile/package.json` — add `react-native-in-app-review` dependency

## Trigger Logic Detail

### Feedback thresholds

```
function isFeedbackThreshold(count: number): boolean
  return count === 10 || count === 25 || count === 50 || (count >= 100 && count % 100 === 0)
```

### Review thresholds

```
function isReviewThreshold(count: number): boolean
  return count === 20 || count === 50 || (count >= 100 && count % 100 === 0)
```

### In logAction (after existing logic)

1. Increment `analytics_total_core_events`
2. Read new total
3. If `isFeedbackThreshold(total)` AND total not in `analytics_feedback_shown_thresholds`: add to shown list, call feedback callback
4. If `isReviewThreshold(total)` AND total not in `analytics_review_shown_thresholds`: add to shown list, call review callback

### clearAnalytics()

Also clear the three new MMKV keys (`analytics_total_core_events`, `analytics_feedback_shown_thresholds`, `analytics_review_shown_thresholds`).

## Data Migration

None. The new fields (`bestAreas`, `improvementAreas`, `source`) are additive. Existing feedback documents in `feedback_v2` simply won't have them — no backfill needed. The total core event counter starts from 0 for existing users, which means long-time users won't see the feedback prompt until they accumulate 10 more core events from this point forward. This is acceptable — forcing a backfill count from the action log would only matter for a small window of existing users.

## Risk

- **react-native-in-app-review native linking**: Requires a pod install and potential Gradle config. If it fails to link, the review trigger silently no-ops (the library handles this gracefully). Test on both platforms.
- **Apple review prompt rate limiting**: Apple shows the review dialog at most 3 times per 365-day period regardless of how often we call it. Our thresholds will hit more often than that, which is fine — the OS silently ignores excess calls.
- **Modal timing**: The feedback modal triggers synchronously inside `logAction()`, which runs during a service mutation (e.g., creating an animal). The modal must not block the mutation. Using a Zustand store setter (`feedbackStore.show()`) is non-blocking — it just sets state, and React renders the modal on the next frame.
