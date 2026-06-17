import { useEffect, useState } from 'react'
import { consentDecisionMade, grantConsent, denyConsent, loadAnalytics } from '../../lib/analytics'

// Lightweight GDPR/CCPA consent gate. Analytics only loads after "Accept".
export function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!consentDecisionMade()) setVisible(true)
    else loadAnalytics()
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-sand bg-cream/95 px-4 py-4 shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-content flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p className="text-sm text-bark-light">
          We use privacy-friendly analytics to see which tools help most. No ads, no selling data.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              denyConsent()
              setVisible(false)
            }}
            className="rounded-lg border border-sand px-4 py-2 text-sm font-medium text-bark hover:bg-sand"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => {
              grantConsent()
              setVisible(false)
            }}
            className="rounded-lg bg-terracotta px-4 py-2 text-sm font-semibold text-cream hover:bg-terracotta-dark"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
