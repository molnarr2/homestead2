import { useState } from 'react'
import { bsAuthService, bsUserService, bsHomesteadService } from '../../../Bootstrap'
import { user_default } from '../../../schema/user/User'
import { useAuthStore } from '../../../store/authStore'
import { initializeApp } from '../../../store/appInitializer'

export function useV1TransitionController() {
  const userId = useAuthStore(s => s.userId)
  const clearMigration = useAuthStore(s => s.clearMigration)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onContinue = async () => {
    if (!firstName.trim()) {
      setError('First name is required')
      return
    }

    setLoading(true)
    setError('')

    const email = bsAuthService.currentUserEmail
    const isAnonymous = bsAuthService.isAnonymous

    const createResult = await bsUserService.createUser({
      ...user_default(),
      id: userId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email,
      anonymous: isAnonymous,
    })
    if (!createResult.success) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const displayName = `${firstName.trim()} ${lastName.trim()}`.trim()
    const homesteadId = await bsHomesteadService.createHomestead('My Homestead', userId, displayName, email)
    if (!homesteadId) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }
    await bsUserService.setActiveHomestead(userId, homesteadId)
    initializeApp(userId, homesteadId)
    clearMigration()

    setLoading(false)
  }

  return { firstName, setFirstName, lastName, setLastName, loading, error, onContinue }
}
