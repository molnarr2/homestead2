import { initializeApp } from 'firebase-admin/app'

initializeApp()

export { dailyCareReminder } from './scheduled/dailyCareReminder'
export { deleteAccount } from './account/deleteAccount'
// Recurring care generation is handled client-side in CareService/GroupService (single source of truth).
export { onBreedingDue } from './notifications/onBreedingDue'
export { onWithdrawalClear } from './notifications/onWithdrawalClear'
