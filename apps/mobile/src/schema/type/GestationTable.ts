export const GESTATION_TABLE: Record<string, number> = {
  'Chicken': 21,
  'Duck': 28,
  'Turkey': 28,
  'Goose': 30,
  'Quail': 17,
  'Rabbit': 31,
  'Pig': 114,
  'Sheep': 147,
  'Goat': 150,
  'Cattle': 283,
  'Horse': 340,
  'Alpaca': 345,
  'Llama': 350,
  'Donkey': 365,
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
