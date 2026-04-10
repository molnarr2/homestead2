import { useState } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsAuthService } from '../../../Bootstrap'

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, 'Login'>

export function useLoginController(navigation: LoginNavigation) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    setLoading(true)
    setError('')
    const result = await bsAuthService.signin(email, password)
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  const goToRegister = () => navigation.navigate('Register')

  const forgotPassword = async () => {
    if (!email) {
      setError('Enter your email first')
      return
    }
    await bsAuthService.sendPasswordResetEmail(email)
  }

  return { email, setEmail, password, setPassword, loading, error, login, goToRegister, forgotPassword }
}
