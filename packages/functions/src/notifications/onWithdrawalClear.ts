import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { logger } from 'firebase-functions/v2'

export const onWithdrawalClear = onSchedule('every day 07:00', async () => {
  const db = getFirestore()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const snapshot = await db
    .collectionGroup('healthRecord')
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
        .collection('homestead')
        .doc(homesteadId)
        .collection('animal')
        .doc(data.animalId)
        .get()
      if (animalSnap.exists) {
        animalName = animalSnap.data()?.name || 'Unknown'
      }
    }

    const membersSnap = await db
      .collection('homestead')
      .doc(homesteadId)
      .collection('member')
      .get()
    const memberUserIds = membersSnap.docs.map((d) => d.id)

    const tokens: string[] = []
    for (const userId of memberUserIds) {
      const devicesSnap = await db
        .collection('user')
        .doc(userId)
        .collection('device')
        .get()
      devicesSnap.docs.forEach((d) => {
        const token = d.data().tokenId
        if (token) tokens.push(token)
      })
    }

    if (tokens.length > 0) {
      try {
        await getMessaging().sendEachForMulticast({
          tokens,
          notification: {
            title: 'Withdrawal Period Cleared',
            body: `Withdrawal period cleared for ${animalName}`,
          },
        })
      } catch (error) {
        logger.error(
          `Failed to send withdrawal clear notification for homestead ${homesteadId}`,
          error
        )
      }
    }
  }
})
