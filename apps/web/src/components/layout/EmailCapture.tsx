import { useState } from 'react'
import { SITE } from '../../config/site'
import { track } from '../../lib/analytics'
import { Button } from '../ui/Button'

// One-field capture, POSTs to a no-backend form endpoint. Email is a capture
// mechanism only — keeps "no backend" true.
export function EmailCapture({
  source,
  headline = 'Get the free printable pack',
  cta = 'Send it to me',
}: {
  source: string
  headline?: string
  cta?: string
}) {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    try {
      await fetch(SITE.emailEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      track('email_capture', { source })
      setDone(true)
    } catch {
      setError(true)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl bg-meadow/10 p-6 text-bark">
        <p className="font-semibold">Check your inbox 🎉</p>
        <p className="text-sm text-bark-light">We sent your free pack to {email}.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl bg-white/70 p-6">
      <label htmlFor={`email-${source}`} className="text-lg font-semibold">
        {headline}
      </label>
      <p className="mt-1 text-sm text-bark-light">No spam. One email, unsubscribe anytime.</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id={`email-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@homestead.com"
          className="min-h-[48px] flex-1 rounded-xl border border-sand bg-white px-4 py-3 focus:border-terracotta focus:outline-none"
        />
        <Button type="submit">{cta}</Button>
      </div>
      {error && <p className="mt-2 text-sm text-terracotta">Something went wrong — try again.</p>}
    </form>
  )
}
