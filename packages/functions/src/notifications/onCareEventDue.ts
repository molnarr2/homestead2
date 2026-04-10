import { onSchedule } from 'firebase-functions/v2/scheduler'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { logger } from 'firebase-functions/v2'

export const onCareEventDue = onSchedule('every day 07:00', async () => {
  const db = getFirestore()
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const snapshot = await db
    .collectionGroup('careEvent')
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
            title: 'Care Reminder',
            body: `You have ${count} care item${count > 1 ? 's' : ''} due today`,
          },
        })
      } catch (error) {
        logger.error(`Failed to send care due notification for homestead ${homesteadId}`, error)
      }
    }
  }
})
