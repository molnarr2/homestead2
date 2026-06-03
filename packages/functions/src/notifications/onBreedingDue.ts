import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore } from 'firebase-admin/firestore'
import { Col } from '@template/common'
import { collectHomesteadTokens, sendToTokens } from './deviceTokens'

export const onBreedingDue = onSchedule('every day 07:00', async () => {
  const db = getFirestore()
  const today = new Date()
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(today.getDate() + 3)

  const todayStr = today.toISOString().split('T')[0]
  const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0]

  const snapshot = await db
    .collectionGroup(Col.breedingRecord)
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
        title: 'Breeding Due Soon',
        body: `${animalName} is due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`,
      },
      `homestead ${homesteadId}`
    )
  }
})
