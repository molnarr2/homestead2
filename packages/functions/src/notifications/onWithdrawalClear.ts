import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'
import { Col } from '@template/common'
import { collectHomesteadTokens, sendToTokens } from './deviceTokens'

export const onWithdrawalClear = onSchedule('every day 07:00', async () => {
  const db = getFirestore()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const snapshot = await db
    .collectionGroup(Col.healthRecord)
    .where('admin.deleted', '==', false)
    .where('withdrawalPeriodDays', '>', 0)
    .get()

  for (const doc of snapshot.docs) {
    const data = doc.data()
    if (!data.date) continue

    const recordDate = new Date(data.date)
    recordDate.setDate(recordDate.getDate() + data.withdrawalPeriodDays)
    recordDate.setHours(0, 0, 0, 0)

    if (recordDate.getTime() !== today.getTime()) continue

    const homesteadId = doc.ref.parent.parent?.id
    if (!homesteadId) continue

    let animalName = 'Unknown'
    if (data.animalId) {
      const animalSnap = await db
        .collection(Col.homestead)
        .doc(homesteadId)
        .collection(Col.animal)
        .doc(data.animalId)
        .get()
      if (animalSnap.exists) {
        animalName = animalSnap.data()?.name || 'Unknown'
      }
    }

    const entries = await collectHomesteadTokens(db, homesteadId)
    await sendToTokens(
      db,
      entries,
      {
        title: 'Withdrawal Period Cleared',
        body: `Withdrawal period cleared for ${animalName}`,
      },
      `homestead ${homesteadId}`
    )
  }
})
