import { storeLinks, type StoreSection } from '../../lib/storeLinks'
import { track } from '../../lib/analytics'

// Inline SVG badges (self-hosted, no third-party request). Both links carry UTM
// + native campaign tokens via storeLinks().
export function StoreBadges({ section, className = '' }: { section: StoreSection; className?: string }) {
  const links = storeLinks(section)
  const onClick = (store: 'app_store' | 'play') => () => {
    track('cta_store_click', { section, store })
    track('outbound_app_store', { section, store })
  }
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a href={links.appStore} target="_blank" rel="noopener" onClick={onClick('app_store')} aria-label="Download on the App Store">
        <Badge top="Download on the" bottom="App Store" />
      </a>
      <a href={links.playStore} target="_blank" rel="noopener" onClick={onClick('play')} aria-label="Get it on Google Play">
        <Badge top="Get it on" bottom="Google Play" />
      </a>
    </div>
  )
}

function Badge({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-bark px-4 py-2 text-cream">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.3L18.5 8 12 11.7 5.5 8 12 4.3z" />
      </svg>
      <span className="leading-tight">
        <span className="block text-[10px] uppercase tracking-wide opacity-80">{top}</span>
        <span className="block text-sm font-semibold">{bottom}</span>
      </span>
    </span>
  )
}
