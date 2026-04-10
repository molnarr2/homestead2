import { useState } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAuthService, bsUserService, bsHomesteadService } from '../../../Bootstrap'
import { user_default } from '../../../schema/user/User'

type RegisterNavigation = NativeStackNavigationProp<RootStackParamList, 'Register'>

export function useRegisterController(navigation: RegisterNavigation) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const register = async () => {
    if (!firstName.trim()) {
      setError('First name is required')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Valid email is required')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')

    const result = await bsAuthService.createAccount(email, password)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    const userId = bsAuthService.currentUserId
    await bsUserService.createUser({ ...user_default(), id: userId, firstName, lastName, email })

    const homesteadId = await bsHomesteadService.createHomestead('My Homestead', userId, `${firstName} ${lastName}`, email)
    await bsUserService.setActiveHomestead(userId, homesteadId)

    navigation.navigate('SpeciesSelection')
    setLoading(false)
  }

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    loading, error, register,
  }
}
