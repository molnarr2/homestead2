import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-sand bg-white/70 p-6 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function LinkCard({
  to,
  title,
  children,
  cta,
}: {
  to: string
  title: string
  children: ReactNode
  cta?: string
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col rounded-2xl border border-sand bg-white/70 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-terracotta hover:shadow-md"
    >
      <h3 className="text-xl">{title}</h3>
      <p className="mt-2 flex-1 text-bark-light">{children}</p>
      {cta && (
        <span className="mt-4 font-semibold text-terracotta group-hover:underline">{cta} →</span>
      )}
    </Link>
  )
}
