// Indicative medication withdrawal presets, shared by apps/mobile and apps/web.
//
// IMPORTANT: These are CONSERVATIVE, INDICATIVE values for planning convenience
// only. Withdrawal periods vary by product, dose, route, country, and species.
// They are NOT veterinary authority. The web tool must always show the "confirm
// with the product label and your vet" disclaimer alongside any value derived here.

export type WithdrawalSpecies =
  | 'goat'
  | 'sheep'
  | 'cattle'
  | 'pig'
  | 'chicken'
  | 'rabbit'

export interface WithdrawalSpeciesInfo {
  slug: WithdrawalSpecies
  name: string
  producesMilk: boolean
  producesEggs: boolean
}

export const WITHDRAWAL_SPECIES: WithdrawalSpeciesInfo[] = [
  { slug: 'goat', name: 'Goat', producesMilk: true, producesEggs: false },
  { slug: 'sheep', name: 'Sheep', producesMilk: true, producesEggs: false },
  { slug: 'cattle', name: 'Cattle', producesMilk: true, producesEggs: false },
  { slug: 'pig', name: 'Pig', producesMilk: false, producesEggs: false },
  { slug: 'chicken', name: 'Chicken', producesMilk: false, producesEggs: true },
  { slug: 'rabbit', name: 'Rabbit', producesMilk: false, producesEggs: false },
]

export interface WithdrawalPreset {
  id: string
  name: string
  category: 'antibiotic' | 'dewormer' | 'nsaid' | 'other'
  // Withdrawal in days, keyed by species slug. Use the most conservative figure
  // from common label ranges. A missing entry means "not labeled / unknown".
  meatDays: Partial<Record<WithdrawalSpecies, number>>
  milkDays: Partial<Record<WithdrawalSpecies, number>>
  eggDays: Partial<Record<WithdrawalSpecies, number>>
  note?: string
}

// Conservative, widely-cited US/EU extralabel-era figures. Always "verify on label".
export const WITHDRAWAL_PRESETS: WithdrawalPreset[] = [
  {
    id: 'penicillin',
    name: 'Penicillin G (procaine)',
    category: 'antibiotic',
    meatDays: { cattle: 14, sheep: 14, goat: 14, pig: 14 },
    milkDays: { cattle: 4, sheep: 4, goat: 4 },
    eggDays: {},
  },
  {
    id: 'oxytetracycline',
    name: 'Oxytetracycline (LA-200 type)',
    category: 'antibiotic',
    meatDays: { cattle: 28, sheep: 28, goat: 28, pig: 28 },
    milkDays: { cattle: 4, sheep: 4, goat: 4 },
    eggDays: {},
  },
  {
    id: 'sulfadimethoxine',
    name: 'Sulfadimethoxine',
    category: 'antibiotic',
    meatDays: { cattle: 7, chicken: 10 },
    milkDays: { cattle: 3 },
    eggDays: { chicken: 10 },
  },
  {
    id: 'tylosin',
    name: 'Tylosin',
    category: 'antibiotic',
    meatDays: { cattle: 21, pig: 14 },
    milkDays: { cattle: 4 },
    eggDays: {},
  },
  {
    id: 'ivermectin',
    name: 'Ivermectin (injectable)',
    category: 'dewormer',
    meatDays: { cattle: 35, sheep: 35, goat: 35, pig: 18 },
    milkDays: { cattle: 0, sheep: 0, goat: 0 },
    eggDays: {},
    note: 'Not for use in lactating dairy animals on most labels — confirm before use.',
  },
  {
    id: 'fenbendazole',
    name: 'Fenbendazole (Safe-Guard)',
    category: 'dewormer',
    meatDays: { cattle: 8, goat: 6, pig: 0 },
    milkDays: { cattle: 0, goat: 0 },
    eggDays: { chicken: 0 },
  },
  {
    id: 'albendazole',
    name: 'Albendazole',
    category: 'dewormer',
    meatDays: { cattle: 27, sheep: 7, goat: 7 },
    milkDays: { cattle: 4 },
    eggDays: {},
  },
  {
    id: 'meloxicam',
    name: 'Meloxicam',
    category: 'nsaid',
    meatDays: { cattle: 21, pig: 5 },
    milkDays: { cattle: 5 },
    eggDays: {},
  },
  {
    id: 'flunixin',
    name: 'Flunixin meglumine (Banamine)',
    category: 'nsaid',
    meatDays: { cattle: 4, pig: 12 },
    milkDays: { cattle: 2 },
    eggDays: {},
    note: 'Label milk withdrawal is ~36h (rounded up to 2 days here). Residue violations are common — IV-only route in cattle matters.',
  },
]

export const WITHDRAWAL_CUSTOM_ID = 'custom'
