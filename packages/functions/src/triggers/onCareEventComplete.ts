import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions/v2'
import { Col } from '@template/common'

function addDays(timestamp: Timestamp, days: number): Timestamp {
  const date = timestamp.toDate()
  date.setDate(date.getDate() + days)
  return Timestamp.fromDate(date)
}

export const onCareEventComplete = onDocumentUpdated(
  `${Col.homestead}/{homesteadId}/${Col.careEvent}/{eventId}`,
  async (event) => {
    const before = event.data?.before.data()
    const after = event.data?.after.data()
    if (!before || !after) return

    const wasIncomplete = before.completedDate == null
    const isNowComplete = after.completedDate != null
    const isRecurring = after.type === 'careRecurring'
    const alreadyCreatedNext = after.createdNextRecurringEvent === true

    if (wasIncomplete && isNowComplete && isRecurring && !alreadyCreatedNext) {
      const db = getFirestore()
      const homesteadId = event.params.homesteadId

      const newDueDate = addDays(after.completedDate as Timestamp, after.cycle)

      const homesteadRef = db.collection(Col.homestead).doc(homesteadId)

      try {
        await homesteadRef.collection(Col.careEvent).add({
          ...after,
          id: '',
          dueDate: newDueDate,
          completedDate: null,
          createdNextRecurringEvent: false,
          admin: {
            deleted: false,
            updated_at: Timestamp.now(),
            created_at: Timestamp.now(),
          },
        })

        await event.data?.after.ref.update({
          createdNextRecurringEvent: true,
          'admin.updated_at': Timestamp.now(),
        })
      } catch (error) {
        logger.error(
          `Failed to create next recurring care event for homestead ${homesteadId}`,
          error
        )
      }
    }
  }
)
