import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE } from '../../config/site'
import { PRIMARY_NAV } from './Nav'
import { LinkButton } from '../ui/Button'
import { appStoreLink } from '../../lib/storeLinks'
import { track } from '../../lib/analytics'

export function Header() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-serif text-xl text-bark" onClick={() => setOpen(false)}>
          <img src="/favicon.svg" alt="" width={28} height={28} />
          {SITE.appName}
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `text-sm font-medium hover:text-terracotta ${isActive ? 'text-terracotta' : 'text-bark'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <LinkButton
            to={appStoreLink('nav')}
            external
            className="px-4 py-2"
            onClick={() => track('cta_store_click', { section: 'nav' })}
          >
            Get the App
          </LinkButton>
        </nav>

        <button
          type="button"
          className="md:hidden rounded-lg border border-sand p-2"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="block h-0.5 w-6 bg-bark" />
          <span className="mt-1.5 block h-0.5 w-6 bg-bark" />
          <span className="mt-1.5 block h-0.5 w-6 bg-bark" />
        </button>
      </div>

      {open && (
        <nav className="border-t border-sand px-4 py-3 md:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-2">
            {PRIMARY_NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-2 text-bark hover:bg-sand"
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li>
              <a
                href={appStoreLink('nav')}
                target="_blank"
                rel="noopener"
                className="block rounded-lg bg-terracotta px-2 py-2 font-semibold text-cream"
              >
                Get the App
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
