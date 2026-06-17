export interface NavItem {
  label: string
  to: string
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Tools', to: '/tools' },
  { label: 'Printables', to: '/printables' },
  { label: 'Articles', to: '/articles' },
]

export const TOOL_LINKS: NavItem[] = [
  { label: 'Medication Withdrawal Calculator', to: '/tools/medication-withdrawal-calculator' },
  { label: 'Gestation / Due-Date Calculator', to: '/tools/gestation-calculator' },
  { label: 'Deworming & Vaccination Schedule', to: '/tools/deworming-vaccination-schedule' },
  { label: 'Chicken Egg / Feed Cost Calculator', to: '/tools/chicken-egg-feed-cost-calculator' },
]

export const LEGAL_LINKS: NavItem[] = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
  { label: 'Disclaimer', to: '/disclaimer' },
]
