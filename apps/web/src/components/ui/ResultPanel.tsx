import { useState } from 'react'
import type { ReactNode } from 'react'

export function ResultPanel({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'safe' | 'warn'
  children: ReactNode
}) {
  const tones = {
    neutral: 'border-sand bg-white',
    safe: 'border-meadow/40 bg-meadow/10',
    warn: 'border-terracotta/40 bg-terracotta/10',
  }
  return (
    <div className={`rounded-2xl border-2 p-6 ${tones[tone]}`} aria-live="polite">
      {children}
    </div>
  )
}

export function CopyButton({ text, label = 'Copy summary' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <button
      type="button"
      onClick={onCopy}
      className="rounded-lg border border-sand px-3 py-2 text-sm font-medium text-bark hover:bg-sand"
    >
      {copied ? 'Copied ✓' : label}
    </button>
  )
}

export function PrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => typeof window !== 'undefined' && window.print()}
      className="rounded-lg border border-sand px-3 py-2 text-sm font-medium text-bark hover:bg-sand"
    >
      {label}
    </button>
  )
}
