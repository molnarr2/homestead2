// Single source of truth for product naming + external links. The app name is
// officially TBD; changing SITE.appName here is the one-line rename the spec
// calls for (drives copy, OG images, JSON-LD, store links).
export const SITE = {
  appName: 'Homestead Animals',
  appTagline: 'The homestead animal record-keeper that remembers for you.',
  domain: 'https://homesteadkeeper.app',
  // Store URLs (placeholders until listings are live).
  appStoreUrl: 'https://apps.apple.com/app/id0000000000',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=app.homesteadkeeper',
  // Apple Search Ads / App Store campaign + Play referrer attribution tokens.
  appStoreCampaignToken: 'pt=000000&ct=web',
  social: {
    instagram: 'https://instagram.com/homesteadkeeper',
    facebook: 'https://facebook.com/homesteadkeeper',
    youtube: 'https://youtube.com/@homesteadkeeper',
  },
  // GA4 / Firebase web measurement id (set in env for production).
  ga4MeasurementId: '',
  // No-backend email capture endpoint (Formspark/Buttondown/ConvertKit form action).
  emailEndpoint: 'https://submit-form.com/REPLACE_ME',
  supportEmail: 'hello@homesteadkeeper.app',
} as const

export type SiteConfig = typeof SITE
