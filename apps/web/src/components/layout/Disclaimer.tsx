import { Link } from 'react-router-dom'

// Non-dismissable veterinary disclaimer for any tool touching animal health.
export function Disclaimer() {
  return (
    <aside
      role="note"
      className="rounded-xl border-l-4 border-terracotta bg-terracotta/10 px-4 py-3 text-sm text-bark"
    >
      <strong>For planning only — not veterinary advice.</strong> Confirm withdrawal
      and dosing with your veterinarian and the product label. Preset values are
      indicative, not authoritative. See our{' '}
      <Link to="/disclaimer" className="font-semibold text-terracotta underline">
        full disclaimer
      </Link>
      .
    </aside>
  )
}
