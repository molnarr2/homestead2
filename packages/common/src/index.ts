export { Col } from './Collections'
export {
  GESTATION_TABLE,
  POULTRY_TYPES,
  getGestationDays,
  isPoultry,
  getGestationLabel,
  SPECIES_GESTATION,
  getSpeciesBySlug,
} from './reference/Gestation'
export type { SpeciesGestationInfo } from './reference/Gestation'
export {
  WITHDRAWAL_SPECIES,
  WITHDRAWAL_PRESETS,
  WITHDRAWAL_CUSTOM_ID,
} from './reference/Withdrawal'
export type {
  WithdrawalSpecies,
  WithdrawalSpeciesInfo,
  WithdrawalPreset,
} from './reference/Withdrawal'
export { CARE_SPECIES, CARE_SCHEDULES } from './reference/CareSchedule'
export type {
  CareSpecies,
  CareSpeciesInfo,
  CareScheduleItem,
} from './reference/CareSchedule'
