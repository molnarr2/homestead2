import { Link } from 'react-router-dom'
import { SITE } from '../../config/site'
import { PRIMARY_NAV, TOOL_LINKS, LEGAL_LINKS } from './Nav'
import { StoreBadges } from './StoreBadges'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 border-t border-sand bg-sand/40">
      <div className="mx-auto grid max-w-content gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="font-serif text-lg text-bark">{SITE.appName}</p>
          <p className="mt-2 text-sm text-bark-light">{SITE.appTagline}</p>
          <StoreBadges section="footer" className="mt-4" />
        </div>

        <FooterCol title="Explore" links={PRIMARY_NAV} />
        <FooterCol title="Free Tools" links={TOOL_LINKS} />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-bark">Legal & Social</p>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-bark-light hover:text-terracotta">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={SITE.social.instagram} className="text-bark-light hover:text-terracotta" rel="noopener" target="_blank">
                Instagram
              </a>
            </li>
            <li>
              <a href={SITE.social.youtube} className="text-bark-light hover:text-terracotta" rel="noopener" target="_blank">
                YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-sand py-4 text-center text-xs text-bark-light">
        © {year} {SITE.appName}. Tools are for planning only — not veterinary advice.
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-wide text-bark">{title}</p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-bark-light hover:text-terracotta">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
