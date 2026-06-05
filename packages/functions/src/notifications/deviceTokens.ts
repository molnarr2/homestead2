import { Firestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { logger } from 'firebase-functions/v2'
import { Col } from '@template/common'

interface TokenEntry {
  token: string
  userId: string
}

export async function collectHomesteadTokens(
  db: Firestore,
  homesteadId: string
): Promise<TokenEntry[]> {
  const membersSnap = await db
    .collection(Col.homestead)
    .doc(homesteadId)
    .collection(Col.member)
    .get()
  const memberUserIds = membersSnap.docs.map((d) => d.id)

  const perMember = await Promise.all(
    memberUserIds.map(async (userId) => {
      const devicesSnap = await db
        .collection(Col.user)
        .doc(userId)
        .collection(Col.device)
        .get()
      return devicesSnap.docs
        .map((d) => ({ token: d.data().tokenId as string, userId }))
        .filter((entry) => !!entry.token)
    })
  )

  return perMember.flat()
}

export async function sendToTokens(
  db: Firestore,
  entries: TokenEntry[],
  notification: { title: string; body: string },
  context: string
): Promise<void> {
  if (entries.length === 0) {
    logger.info(`No device tokens for ${context}, nothing to send`)
    return
  }

  try {
    logger.info(`Sending to ${entries.length} token(s) for ${context}`)
    const response = await getMessaging().sendEachForMulticast({
      tokens: entries.map((entry) => entry.token),
      notification,
    })
    logger.info(
      `Send result for ${context}: ${response.successCount} ok, ${response.failureCount} failed`
    )

    const stale: TokenEntry[] = []
    response.responses.forEach((result, index) => {
      if (!result.success) {
        logger.warn(
          `Token send failed for ${context}: code=${result.error?.code} message=${result.error?.message}`
        )
      }
      if (
        !result.success &&
        result.error?.code === 'messaging/registration-token-not-registered'
      ) {
        stale.push(entries[index])
      }
    })

    await Promise.all(
      stale.map((entry) =>
        db
          .collection(Col.user)
          .doc(entry.userId)
          .collection(Col.device)
          .doc(entry.token)
          .delete()
      )
    )
  } catch (error) {
    logger.error(`Failed to send notification for ${context}`, error)
  }
}
