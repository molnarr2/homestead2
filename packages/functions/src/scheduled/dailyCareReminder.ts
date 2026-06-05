import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, Timestamp, Firestore } from 'firebase-admin/firestore'
import { Col } from '@template/common'
import { collectHomesteadTokens, sendToTokens } from '../notifications/deviceTokens'

export const dailyCareReminder = onSchedule('every day 07:00', async () => {
  await runDailyCareReminder(getFirestore())
})

export async function runDailyCareReminder(db: Firestore): Promise<void> {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const snapshot = await db
    .collectionGroup(Col.careEvent)
    .where('admin.deleted', '==', false)
    .where('completedDate', '==', null)
    .where('dueDate', '<=', Timestamp.fromDate(today))
    .get()

  const byHomestead: Record<string, number> = {}
  snapshot.docs.forEach((doc) => {
    const homesteadId = doc.ref.parent.parent?.id
    if (homesteadId) {
      byHomestead[homesteadId] = (byHomestead[homesteadId] || 0) + 1
    }
  })

  for (const [homesteadId, count] of Object.entries(byHomestead)) {
    const entries = await collectHomesteadTokens(db, homesteadId)
    await sendToTokens(
      db,
      entries,
      {
        title: 'Care Reminder',
        body: `You have ${count} care item${count > 1 ? 's' : ''} due today`,
      },
      `homestead ${homesteadId}`
    )
  }
}
