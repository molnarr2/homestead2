
Dev test account:

rob+sandbox1@hrjsoftware.com / `aprob9117XL!`

### iOS - Sandbox

https://developer.apple.com/documentation/storekit/testing-in-app-purchases-with-sandbox

Sandbox accounts
donald@hrjsoftware.com
dT1234567890

To set the App Store Sandbox account on iPhone

iPhone Settings -> App Store (app settings) -> Scroll down to SANDBOX ACCOUNT and log in
* Can opt-out of two-factor sign-in by picking other sign-in.

Can create sandbox accounts here:
https://appstoreconnect.apple.com/access/users/sandbox

# Android

### Google Play Store Setup

https://www.revenuecat.com/docs/getting-started/entitlements/android-products

The following is links to setting up Google Play Store to communicate between it and the RevenueCat services:

https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials

https://www.revenuecat.com/docs/test-and-launch/sandbox/google-play-store

Test account
molnarr2.web@gmail.com


# Paywall Testing

## Prerequisites

- RevenueCat products created: `homestead_standard_monthly`, `homestead_pro_monthly`
- RevenueCat entitlements created and linked to products
- API keys set in `.env.development` (`PUBLIC_APPLE_API_KEY`, `PUBLIC_GOOGLE_API_KEY`)
- App rebuilt after env changes (`yarn ios` / `yarn android`)

## iOS (Sandbox)

1. Create a **Sandbox Tester** in App Store Connect > Users and Access > Sandbox Testers
2. On the test device: Settings > App Store > Sandbox Account — sign in with the sandbox tester
3. On simulator: sandbox purchases work automatically, no account needed
4. Add 12+ animals to hit the free tier limit
5. Tap "New Animal" — paywall modal should appear
6. Verify both prices load (not "Unavailable")
7. Tap "Get Standard" or "Get Pro" — App Store sandbox payment sheet should appear
8. Complete purchase — modal should dismiss
9. Verify you can now add animals past the previous limit
10. Kill and reopen the app — tier should persist (check Profile or Side Menu)
11. Test "Restore Purchases" on a fresh install with the same sandbox account

## Android (Test Tracks)

1. Add your Google account as a **License Tester** in Google Play Console > Settings > License Testing
2. Upload a signed build to an internal test track (purchases won't work on debug builds without this)
3. Add 12+ animals to hit the free tier limit
4. Tap "New Animal" — paywall modal should appear
5. Verify both prices load
6. Tap "Get Standard" or "Get Pro" — Google Play purchase dialog should appear
7. Use the "test card, always approves" option
8. Complete purchase — modal should dismiss
9. Verify animal creation works past the limit
10. Test "Restore Purchases" on a fresh install with the same account

## Quick Checks

- **Prices show "Unavailable"**: API key wrong, products not created in RevenueCat, or store products not approved yet
- **Purchase fails immediately**: Sandbox/license tester not configured, or entitlements not linked to products
- **Tier doesn't persist after restart**: `syncSubscription()` not writing to Firestore, or homestead listener not picking up the change
- **Paywall doesn't appear**: Check animal count vs tier limit (free: 12, standard: 50)
