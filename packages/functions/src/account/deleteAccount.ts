import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'
import { Col } from '@template/common'

export const deleteAccount = onCall(
  { timeoutSeconds: 300, memory: '512MiB' },
  async (request) => {
    const uid = request.auth?.uid
    if (!uid) {
      throw new HttpsError('unauthenticated', 'You must be signed in to delete your account.')
    }

    const db = getFirestore()
    const bucket = getStorage().bucket()

    const memberSnap = await db
      .collectionGroup(Col.member)
      .where('userId', '==', uid)
      .get()

    for (const memberDoc of memberSnap.docs) {
      const homesteadRef = memberDoc.ref.parent.parent
      if (!homesteadRef) continue

      const membersSnap = await homesteadRef.collection(Col.member).get()
      const others = membersSnap.docs.filter((d) => d.id !== uid)

      if (others.length === 0) {
        await db.recursiveDelete(homesteadRef)
        await bucket.deleteFiles({ prefix: `homestead/${homesteadRef.id}/` })
      } else {
        if (memberDoc.data().role === 'owner') {
          const earliest = others.reduce((a, b) =>
            a.data().admin.created_at.toMillis() <= b.data().admin.created_at.toMillis() ? a : b
          )
          await earliest.ref.update({ role: 'owner' })
        }
        await memberDoc.ref.delete()
      }
    }

    await db.recursiveDelete(db.collection(Col.user).doc(uid))
    await bucket.deleteFiles({ prefix: `user/${uid}/` })

    await getAuth().deleteUser(uid)

    return { success: true }
  }
)
