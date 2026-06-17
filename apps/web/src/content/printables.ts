export interface Printable {
  slug: string
  title: string
  description: string
  keywords: string
  pairsWith?: { label: string; to: string }
  // Path under public/printables/ (committed, CDN-served). May not exist until
  // the generate:printables script has run.
  file: string
}

export const PRINTABLES: Printable[] = [
  {
    slug: 'herd-inventory-log',
    title: 'Flock / Herd Inventory Log',
    description: 'Track every animal: ID, breed, sex, birth date, and notes — one row per animal.',
    keywords: 'free livestock record template printable, herd inventory sheet',
    file: '/printables/herd-inventory-log.pdf',
  },
  {
    slug: 'breeding-log',
    title: 'Breeding & Kidding / Lambing / Farrowing Log',
    description: 'Record cover dates, expected due dates, and birth outcomes for each dam.',
    keywords: 'breeding record template, kidding lambing log printable',
    pairsWith: { label: 'Gestation calculator', to: '/tools/gestation-calculator' },
    file: '/printables/breeding-log.pdf',
  },
  {
    slug: 'health-medication-record',
    title: 'Health & Medication Record',
    description: 'Log treatments with dose, route, and withdrawal columns for milk and meat/eggs.',
    keywords: 'livestock medication record printable, withdrawal log',
    pairsWith: { label: 'Withdrawal calculator', to: '/tools/medication-withdrawal-calculator' },
    file: '/printables/health-medication-record.pdf',
  },
  {
    slug: 'production-log',
    title: 'Production Log (Eggs / Milk / Honey)',
    description: 'Daily tallies for eggs, milk, and honey to track output over the season.',
    keywords: 'egg production log printable, milk record sheet',
    file: '/printables/production-log.pdf',
  },
  {
    slug: 'deworming-vaccination-schedule',
    title: 'Deworming & Vaccination Schedule',
    description: 'Blank schedule sheet to plan the year — or generate a dated one with our tool.',
    keywords: 'deworming schedule printable, vaccination record template',
    pairsWith: { label: 'Schedule generator', to: '/tools/deworming-vaccination-schedule' },
    file: '/printables/deworming-vaccination-schedule.pdf',
  },
  {
    slug: 'feed-cost-log',
    title: 'Feed & Cost Log',
    description: 'Record feed purchases and costs to know your true cost per dozen or per gallon.',
    keywords: 'feed cost log printable, chicken feed tracker',
    pairsWith: { label: 'Egg & feed cost calculator', to: '/tools/chicken-egg-feed-cost-calculator' },
    file: '/printables/feed-cost-log.pdf',
  },
]
