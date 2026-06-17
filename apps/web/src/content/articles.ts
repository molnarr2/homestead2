import type { ComponentType } from 'react'
import GoatGestation from './articles/goat-gestation-explained.mdx'
import MilkWithdrawal from './articles/understanding-milk-withdrawal.mdx'
import EggCost from './articles/backyard-egg-true-cost.mdx'
import Deworming from './articles/goat-deworming-without-resistance.mdx'

export interface Article {
  slug: string
  title: string
  description: string
  datePublished: string
  readMinutes: number
  Component: ComponentType
}

// Hand-authored metadata keeps deps minimal (no frontmatter plugin) while the
// MDX file holds the prose. Order = newest first for the index.
export const ARTICLES: Article[] = [
  {
    slug: 'goat-gestation-explained',
    title: 'How Long Are Goats Pregnant? Gestation Explained',
    description:
      'Goat gestation is about 150 days. Here is how to predict kidding from the breeding date and what to watch for as the due date nears.',
    datePublished: '2026-01-15',
    readMinutes: 3,
    Component: GoatGestation,
  },
  {
    slug: 'understanding-milk-withdrawal',
    title: 'Understanding Milk & Meat Withdrawal Periods',
    description:
      'What withdrawal periods are, why milk and meat differ, and why the product label is always the authority.',
    datePublished: '2026-01-22',
    readMinutes: 3,
    Component: MilkWithdrawal,
  },
  {
    slug: 'backyard-egg-true-cost',
    title: 'Are Backyard Eggs Really Cheaper Than the Store?',
    description:
      'The simple math behind your true cost per dozen — feed cost, lay rate, and the levers that move the number.',
    datePublished: '2026-01-29',
    readMinutes: 3,
    Component: EggCost,
  },
  {
    slug: 'goat-deworming-without-resistance',
    title: 'Deworming Goats Without Breeding Resistance',
    description:
      'Why calendar deworming backfires, how to treat selectively with FAMACHA, and a sensible schedule to check by.',
    datePublished: '2026-02-05',
    readMinutes: 3,
    Component: Deworming,
  },
]

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}
