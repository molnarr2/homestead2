import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { logger } from 'firebase-functions/v2'

export const onBreedingDue = onSchedule('every day 07:00', async () => {
  const db = getFirestore()
  const today = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(today.getDate() + 3)

  const todayStr = today.toISOString().split('T')[0]
  const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0]

  const snapshot = await db
    .collectionGroup('breedingRecord')
    .where('admin.deleted', '==', false)
    .where('status', '==', 'active')
    .where('expectedDueDate', '>=', todayStr)
    .where('expectedDueDate', '<=', threeDaysStr)
    .get()

  for (const doc of snapshot.docs) {
    const data = doc.data()
    const homesteadId = doc.ref.parent.parent?.id
    if (!homesteadId) continue

    const expectedDueDate = new Date(data.expectedDueDate)
    const diffTime = expectedDueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

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
            title: 'Breeding Due Soon',
            body: `${animalName} is due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
          },
        })
      } catch (error) {
        logger.error(`Failed to send breeding due notification for homestead ${homesteadId}`, error)
      }
    }
  }
})
