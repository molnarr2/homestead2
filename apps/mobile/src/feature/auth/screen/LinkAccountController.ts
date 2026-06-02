import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAuthService } from '../../../Bootstrap'
import { useUserStore } from '../../../store/userStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'LinkAccount'>

export function useLinkAccountController(navigation: Navigation) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
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

    const result = await bsAuthService.linkUsernamePassword(email, password)
    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    try {
      await useUserStore.getState().updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        anonymous: false,
        anonymousPromptLastSeen: 0,
      })
    } catch {
      Alert.alert('Note', 'Your account was linked but profile update failed. You can update your name in Settings.')
    }

    setLoading(false)
    navigation.goBack()
  }

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    loading, error, submit,
  }
}
