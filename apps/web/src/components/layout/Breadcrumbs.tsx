import { Link } from 'react-router-dom'
import type { BreadcrumbItem } from '../../lib/seo'

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-bark-light">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => {
          const last = i === items.length - 1
          return (
            <li key={it.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="font-medium text-bark">
                  {it.name}
                </span>
              ) : (
                <>
                  <Link to={it.path} className="hover:text-terracotta hover:underline">
                    {it.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
