import { initializeApp } from 'firebase-admin/app'

initializeApp()

export { dailyCareReminder } from './scheduled/dailyCareReminder'
export { onCareEventComplete } from './triggers/onCareEventComplete'
// Notification functions exported as they're built:
// export { onCareEventDue } from './notifications/onCareEventDue'
// export { onBreedingDue } from './notifications/onBreedingDue'
// export { onWithdrawalClear } from './notifications/onWithdrawalClear'
