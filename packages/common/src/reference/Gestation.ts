// Canonical gestation / incubation reference data, shared by apps/mobile and apps/web.
// Plain data + pure helpers only — no platform imports.

export const GESTATION_TABLE: Record<string, number> = {
  Chicken: 21,
  Duck: 28,
  Turkey: 28,
  Goose: 30,
  Quail: 17,
  Rabbit: 31,
  Pig: 114,
  Sheep: 147,
  Goat: 150,
  Cattle: 283,
  Horse: 340,
  Alpaca: 345,
  Llama: 350,
  Donkey: 365,
  Dog: 63,
  Cat: 65,
}

export const POULTRY_TYPES = ['Chicken', 'Duck', 'Turkey', 'Goose', 'Quail']

export function getGestationDays(animalType: string): number {
  return GESTATION_TABLE[animalType] ?? 0
}

export function isPoultry(animalType: string): boolean {
  return POULTRY_TYPES.includes(animalType)
}

export function getGestationLabel(animalType: string): string {
  return isPoultry(animalType) ? 'incubation' : 'gestation'
}

// Richer per-species metadata used by the web gestation tool for programmatic
// SEO (one page per species) and the "watch window" / prep-checklist content.
export interface SpeciesGestationInfo {
  slug: string
  name: string
  gestationDays: number
  // +/- days around the expected date where birth realistically occurs.
  watchWindowDays: number
  isPoultry: boolean
  // Common search-query aliases for the per-species H1 / keyword targeting.
  aliases: string[]
  birthVerb: string
}

export const SPECIES_GESTATION: SpeciesGestationInfo[] = [
  { slug: 'goat', name: 'Goat', gestationDays: 150, watchWindowDays: 5, isPoultry: false, aliases: ['goat gestation calculator', 'doe due date', 'goat kidding calculator'], birthVerb: 'kid' },
  { slug: 'sheep', name: 'Sheep', gestationDays: 147, watchWindowDays: 5, isPoultry: false, aliases: ['sheep gestation calculator', 'ewe lambing calculator'], birthVerb: 'lamb' },
  { slug: 'cattle', name: 'Cattle', gestationDays: 283, watchWindowDays: 7, isPoultry: false, aliases: ['cow gestation calculator', 'cattle calving calculator'], birthVerb: 'calve' },
  { slug: 'pig', name: 'Pig', gestationDays: 114, watchWindowDays: 3, isPoultry: false, aliases: ['pig gestation calculator', 'sow farrowing calculator'], birthVerb: 'farrow' },
  { slug: 'rabbit', name: 'Rabbit', gestationDays: 31, watchWindowDays: 2, isPoultry: false, aliases: ['rabbit gestation calculator', 'doe kindling calculator'], birthVerb: 'kindle' },
  { slug: 'horse', name: 'Horse', gestationDays: 340, watchWindowDays: 14, isPoultry: false, aliases: ['horse gestation calculator', 'mare foaling calculator'], birthVerb: 'foal' },
  { slug: 'alpaca', name: 'Alpaca', gestationDays: 345, watchWindowDays: 14, isPoultry: false, aliases: ['alpaca gestation calculator', 'cria due date'], birthVerb: 'birth a cria' },
  { slug: 'llama', name: 'Llama', gestationDays: 350, watchWindowDays: 14, isPoultry: false, aliases: ['llama gestation calculator', 'cria due date'], birthVerb: 'birth a cria' },
  { slug: 'donkey', name: 'Donkey', gestationDays: 365, watchWindowDays: 14, isPoultry: false, aliases: ['donkey gestation calculator', 'jenny foaling calculator'], birthVerb: 'foal' },
  { slug: 'chicken', name: 'Chicken', gestationDays: 21, watchWindowDays: 2, isPoultry: true, aliases: ['chicken egg incubation calculator', 'chicken hatch date calculator'], birthVerb: 'hatch' },
  { slug: 'duck', name: 'Duck', gestationDays: 28, watchWindowDays: 2, isPoultry: true, aliases: ['duck egg incubation calculator', 'duck hatch date calculator'], birthVerb: 'hatch' },
  { slug: 'turkey', name: 'Turkey', gestationDays: 28, watchWindowDays: 2, isPoultry: true, aliases: ['turkey egg incubation calculator'], birthVerb: 'hatch' },
  { slug: 'goose', name: 'Goose', gestationDays: 30, watchWindowDays: 3, isPoultry: true, aliases: ['goose egg incubation calculator'], birthVerb: 'hatch' },
  { slug: 'quail', name: 'Quail', gestationDays: 17, watchWindowDays: 1, isPoultry: true, aliases: ['quail egg incubation calculator'], birthVerb: 'hatch' },
]

export function getSpeciesBySlug(slug: string): SpeciesGestationInfo | undefined {
  return SPECIES_GESTATION.find((s) => s.slug === slug)
}
