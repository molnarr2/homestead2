// Default care-interval reference data for the deworming / vaccination schedule
// generator. Indicative best-practice cadences — regional vet guidance overrides.

export type CareSpecies = 'goat' | 'sheep' | 'cattle' | 'pig' | 'chicken' | 'rabbit'

export interface CareSpeciesInfo {
  slug: CareSpecies
  name: string
}

export const CARE_SPECIES: CareSpeciesInfo[] = [
  { slug: 'goat', name: 'Goat' },
  { slug: 'sheep', name: 'Sheep' },
  { slug: 'cattle', name: 'Cattle' },
  { slug: 'pig', name: 'Pig' },
  { slug: 'chicken', name: 'Chicken' },
  { slug: 'rabbit', name: 'Rabbit' },
]

export interface CareScheduleItem {
  id: string
  label: string
  category: 'deworming' | 'vaccination' | 'health'
  // Recurring cadence in days from start (0 = at start). Omit for age-based items.
  intervalDays?: number
  // Age-based one-off offset in days from birth date (for age-based vaccines).
  ageDays?: number
  note?: string
}

// Keyed by species. These mirror the default care intervals the mobile care
// feature seeds, so a generated web schedule matches what the app would create.
export const CARE_SCHEDULES: Record<CareSpecies, CareScheduleItem[]> = {
  goat: [
    { id: 'cdt-1', label: 'CDT vaccine (1st dose)', category: 'vaccination', ageDays: 42, note: 'Kids: first dose ~6 weeks.' },
    { id: 'cdt-2', label: 'CDT vaccine (booster)', category: 'vaccination', ageDays: 70, note: 'Booster 3–4 weeks after first dose.' },
    { id: 'cdt-annual', label: 'CDT annual booster', category: 'vaccination', intervalDays: 365 },
    { id: 'deworm', label: 'Deworm (FAMACHA-guided)', category: 'deworming', intervalDays: 90, note: 'Deworm by FAMACHA score, not the calendar — over-deworming breeds resistance.' },
    { id: 'hoof', label: 'Hoof trim', category: 'health', intervalDays: 60 },
  ],
  sheep: [
    { id: 'cdt-1', label: 'CDT vaccine (1st dose)', category: 'vaccination', ageDays: 42 },
    { id: 'cdt-2', label: 'CDT vaccine (booster)', category: 'vaccination', ageDays: 70 },
    { id: 'cdt-annual', label: 'CDT annual booster', category: 'vaccination', intervalDays: 365 },
    { id: 'deworm', label: 'Deworm (FAMACHA-guided)', category: 'deworming', intervalDays: 90 },
    { id: 'hoof', label: 'Hoof trim', category: 'health', intervalDays: 60 },
  ],
  cattle: [
    { id: 'blackleg', label: '7-way (blackleg) vaccine', category: 'vaccination', ageDays: 60 },
    { id: 'blackleg-annual', label: '7-way annual booster', category: 'vaccination', intervalDays: 365 },
    { id: 'deworm', label: 'Deworm', category: 'deworming', intervalDays: 180, note: 'Typically spring and fall.' },
  ],
  pig: [
    { id: 'erysipelas', label: 'Erysipelas vaccine', category: 'vaccination', ageDays: 70 },
    { id: 'deworm', label: 'Deworm', category: 'deworming', intervalDays: 90 },
  ],
  chicken: [
    { id: 'mareks', label: "Marek's vaccine (day-old)", category: 'vaccination', ageDays: 1, note: 'Usually done at the hatchery.' },
    { id: 'deworm', label: 'Deworm (if indicated)', category: 'deworming', intervalDays: 120, note: 'Only with confirmed parasite load; many flocks never need routine worming.' },
    { id: 'mites', label: 'Check for mites/lice', category: 'health', intervalDays: 30 },
  ],
  rabbit: [
    { id: 'rhdv2', label: 'RHDV2 vaccine', category: 'vaccination', intervalDays: 365, note: 'Where available/recommended in your region.' },
    { id: 'nails', label: 'Nail trim', category: 'health', intervalDays: 45 },
  ],
}
