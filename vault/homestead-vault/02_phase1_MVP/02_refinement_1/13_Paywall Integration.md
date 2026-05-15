# Paywall Integration

## Summary

Rework the subscription system from the current three-tier model (`free/pro/farm`) to a two-tier paid model (`free/standard/pro`) with new RevenueCat product IDs. Replace all scattered `Alert.alert` upgrade prompts with a single shared paywall bottom-sheet modal. Simplify gating to animal head count only.

## Current Behavior

**Tiers:** `SubscriptionTier = 'free' | 'pro' | 'farm'` defined in `feature/subscription/service/ISubscriptionService.ts:4`.

**Tier resolution:** `effectiveSubscription()` at `ISubscriptionService.ts:6` takes the higher of `homestead.subscriptionOverride` and `homestead.subscriptionRevenuecat`. Override already wins when set higher — this logic is correct but needs updated tier names.

**RevenueCat product IDs:** `tier1`, `tier2`, `tier3` hardcoded in `library/purchases/revenuecat/RevenueCatInAppPurchases.ts:28-36`. The `InAppSubscription` enum at `core/service/purchases/IInAppPurchaseService.ts:1` mirrors these as `free/tier1/tier2/tier3/error`.

**Gating:** Six controllers independently check tiers and show `Alert.alert` with an "Upgrade" button that navigates to a placeholder `Subscription` screen:

| Controller | Gate | Free Limit | Pro Limit |
|---|---|---|---|
| `CreateAnimalController.ts:53` | Animal count | 10 | Unlimited |
| `CreateCareEventController.ts:76` | Care events per animal | 3 | Unlimited |
| `EditGroupController.ts:50` | Group count | 10 | 25 |
| `CreateHealthRecordController.ts:92` | Feature locked | Blocked | Allowed |
| `CreateBreedingRecordController.ts:50` | Feature locked | Blocked | Allowed |
| `CreateNoteController.ts:34` | Feature locked | Blocked | Allowed |
| `CreateProductionLogController.ts:48` | Feature locked | Blocked | Allowed |

**Homestead schema** (`schema/homestead/Homestead.ts`): Already has `subscriptionRevenuecat: SubscriptionTier` and `subscriptionOverride: SubscriptionTier`, both default to `'free'`.

**Subscription screen:** `Subscription` route in `RootNavigation.tsx` points to `PlaceholderScreen`.

## Desired Behavior

**New tiers:** `SubscriptionTier = 'free' | 'standard' | 'pro'`

| Tier | Animal Limit | Monthly Price | RevenueCat Product ID |
|---|---|---|---|
| Free | 12 | $0 | — |
| Standard | 50 | TBD | `homestead_standard_monthly` |
| Pro | Unlimited | TBD | `homestead_pro_monthly` |

**Only gate:** Animal head count. All other feature gates (care events, groups, health, breeding, notes, production) are removed.

**Tier resolution:** `effectiveSubscription()` keeps same logic — take the higher of `subscriptionOverride` and `subscriptionRevenuecat`. Ranking: `free (0) < standard (1) < pro (2)`.

**Paywall modal:** A shared `PaywallModal` component (bottom-sheet style) replaces all `Alert.alert` upgrade prompts. Any controller that hits the animal limit calls `usePaywallStore.getState().show()` instead of showing an alert. The modal displays both paid tiers with prices fetched from RevenueCat, handles purchase flow, and dismisses on success or cancel.

**Animal limit check flow:**
1. Controller calls `effectiveSubscription(homestead)` to get current tier
2. Controller checks animal count against tier limit
3. If over limit, controller calls `usePaywallStore.getState().show()` and returns early
4. `PaywallModal` (rendered once at app root) becomes visible, shows tier options
5. User taps a tier → `bsSubscriptionService.purchase(productId)` → on success, modal dismisses
6. Homestead subscription field updates via `syncSubscription()` → real-time listener propagates new tier to all stores

## Schema Changes

**`SubscriptionTier` type** — change from `'free' | 'pro' | 'farm'` to `'free' | 'standard' | 'pro'`

No Firestore schema changes needed. The `subscriptionRevenuecat` and `subscriptionOverride` fields on Homestead already exist. Existing `'pro'` values in Firestore remain valid. Existing `'farm'` values need to map to `'pro'` (see Data Migration).

## Data Access Audit

**Round trips for paywall display:** 0 extra reads. The homestead is already subscribed via real-time listener in `homesteadStore.ts`. Animal count is already subscribed in `animalStore.ts`. Tier resolution is a pure function over in-memory data.

**Round trips for purchase:** 1 RevenueCat API call (purchase) + 1 Firestore read (getHomestead in syncSubscription) + 1 Firestore write (updateHomesteadSubscription). This is the existing flow and is acceptable for a user-initiated purchase action.

**Price fetching:** 1 RevenueCat API call. Fetch prices when the modal opens, not at app launch. Cache in the paywall store so repeated opens don't re-fetch within the same session.

**No N+1 or fan-out issues.** All data needed for gating is already in memory from existing subscriptions.

## Touch Points

### Schema / Types

- `feature/subscription/service/ISubscriptionService.ts` — Change `SubscriptionTier` to `'free' | 'standard' | 'pro'`. Update `effectiveSubscription()` tier ranking.
- `core/service/purchases/IInAppPurchaseService.ts` — Replace `InAppSubscription` enum: `free`, `standard`, `pro`, `error`. Remove `tier1/tier2/tier3`. Update `InAppPrices` to `{ success, priceStandard, pricePro }`.

### Service

- `feature/subscription/service/ISubscriptionService.ts` — Update interface: `getPrices()` returns `{ standard: string, pro: string } | null`.
- `feature/subscription/service/SubscriptionService.ts` — Update `revenueCatTierToSubscription()` mapping. Update `getPrices()` to return standard/pro prices.
- `library/purchases/revenuecat/RevenueCatInAppPurchases.ts` — Replace product/entitlement IDs with `homestead_standard_monthly` and `homestead_pro_monthly`. Remove tier3 references. Update `getSubscription()` entitlement checks. Update `prices()` and `purchaseProduct()`.
- `core/plugin/IInAppPurchases.ts` — Update `prices()` return type to match new `InAppPrices`.

### Store

- New file: `store/paywallStore.ts` — Zustand store with `{ visible, show(), hide(), prices, fetchPrices() }`. Manages modal visibility and caches RevenueCat prices.

### UI

- New file: `feature/subscription/component/PaywallModal.tsx` — Bottom-sheet modal rendered at app root. Shows two tier cards (Standard and Pro) with prices, feature descriptions, and purchase buttons. Uses `BottomSheet` component from `components/modal/BottomSheet.tsx`. Calls `bsSubscriptionService.purchase()` on tap, dismisses on success.
- `navigation/RootNavigation.tsx` — Render `PaywallModal` at the root level (outside navigator). Remove the placeholder `Subscription` screen route.

### Gating (Controllers)

- `feature/animal/screen/CreateAnimalController.ts` — Change `FREE_TIER_ANIMAL_LIMIT` from 10 to 12. Add `STANDARD_TIER_ANIMAL_LIMIT = 50`. Replace `Alert.alert` with `usePaywallStore.getState().show()`. Check all tiers (free ≥ 12, standard ≥ 50, pro = no limit).
- `feature/care/screen/CreateCareEventController.ts` — Remove tier check and `FREE_TIER_CARE_LIMIT`. Remove effectiveSubscription import if unused.
- `feature/group/screen/EditGroupController.ts` — Remove tier check and limit constants. Remove effectiveSubscription import if unused.
- `feature/health/screen/CreateHealthRecordController.ts` — Remove tier check. Remove effectiveSubscription import.
- `feature/breeding/screen/CreateBreedingRecordController.ts` — Remove tier check. Remove effectiveSubscription import.
- `feature/notes/screen/CreateNoteController.ts` — Remove tier check. Remove effectiveSubscription import.
- `feature/production/screen/CreateProductionLogController.ts` — Remove tier check. Remove effectiveSubscription import.

### Navigation / Side Menu

- `navigation/SideMenu.tsx` — Update tier display label if shown (map `'standard'` → "Standard", `'pro'` → "Pro"). Remove "Subscription" menu item that navigated to the placeholder screen (paywall is now triggered contextually).
- `feature/profile/screen/ProfileScreen.tsx` — Update tier display to show new tier names.
- `feature/profile/screen/ProfileController.ts` — Remove `onSubscription` navigation to placeholder screen, or change to `usePaywallStore.getState().show()`.

## Data Migration

**Lazy migration only.** Existing Firestore documents with `subscriptionRevenuecat: 'farm'` or `subscriptionOverride: 'farm'` need to map to `'pro'`. Handle this in `effectiveSubscription()` by treating `'farm'` as equivalent to `'pro'` in the tier ranking. No migration script needed.

Add a fallback in `effectiveSubscription()`:

- If the stored value is `'farm'`, treat it as rank 2 (same as `'pro'`).
- The next time `syncSubscription()` runs for that homestead, it writes the new tier name, naturally replacing `'farm'`.

For `subscriptionOverride: 'farm'` set manually in Firestore by an admin — these will persist until manually updated. The fallback handles them indefinitely at no cost.

## Risk

**Existing `'farm'` values in Firestore.** If `effectiveSubscription()` doesn't handle the `'farm'` fallback, those users drop to free tier. Mitigated by the lazy mapping described above.

**RevenueCat product ID mismatch.** The new product IDs (`homestead_standard_monthly`, `homestead_pro_monthly`) must be created in RevenueCat dashboard and App Store Connect / Google Play Console before deployment. If they don't exist, `getPrices()` returns null and purchases fail. The modal should handle the null-prices state gracefully (show "Unavailable" or hide price).

**Removing feature gates.** Care, health, breeding, notes, production, and group limits are being removed for all tiers. This is intentional — animal count is the only gate. No data loss risk since gates only blocked creation, never deleted data.
