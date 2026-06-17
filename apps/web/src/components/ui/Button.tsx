import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-terracotta text-cream hover:bg-terracotta-dark',
  secondary: 'bg-bark text-cream hover:bg-bark-light',
  ghost: 'bg-transparent text-terracotta border border-terracotta hover:bg-sand',
}

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-semibold transition-colors min-h-[48px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta'

interface CommonProps {
  variant?: Variant
  className?: string
  children: ReactNode
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  onClick,
  type = 'button',
}: CommonProps & { onClick?: () => void; type?: 'button' | 'submit' }) {
  return (
    <button type={type} onClick={onClick} className={`${BASE} ${VARIANTS[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function LinkButton({
  to,
  variant = 'primary',
  className = '',
  children,
  external,
  onClick,
}: CommonProps & { to: string; external?: boolean; onClick?: () => void }) {
  const cls = `${BASE} ${VARIANTS[variant]} ${className}`
  if (external) {
    return (
      <a href={to} className={cls} onClick={onClick} rel="noopener" target="_blank">
        {children}
      </a>
    )
  }
  return (
    <Link to={to} className={cls} onClick={onClick}>
      {children}
    </Link>
  )
}
