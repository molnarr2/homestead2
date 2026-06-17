// Web-facing re-export of the shared reference tables so route files import from
// one place. The canonical data lives in packages/common.
export {
  SPECIES_GESTATION,
  getSpeciesBySlug,
  WITHDRAWAL_SPECIES,
  WITHDRAWAL_PRESETS,
  WITHDRAWAL_CUSTOM_ID,
  CARE_SPECIES,
  CARE_SCHEDULES,
} from '@template/common'
export type {
  SpeciesGestationInfo,
  WithdrawalSpecies,
  WithdrawalPreset,
  CareSpecies,
} from '@template/common'

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
