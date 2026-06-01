import { useState } from 'react'
import { bsAuthService } from '../../../Bootstrap'

export function useLoginController() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [resetModalVisible, setResetModalVisible] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [resetError, setResetError] = useState('')

  const login = async () => {
    setLoading(true)
    setError('')
    const result = await bsAuthService.signin(email, password)
    if (!result.success) {
      setError(result.error)
    }
    setLoading(false)
  }

  const openResetModal = () => {
    setResetEmail(email)
    setResetSent(false)
    setResetError('')
    setResetModalVisible(true)
  }

  const closeResetModal = () => {
    setResetModalVisible(false)
  }

  const sendResetEmail = async () => {
    if (!resetEmail.trim()) {
      setResetError('Please enter your email address')
      return
    }
    setResetLoading(true)
    setResetError('')
    try {
      await bsAuthService.sendPasswordResetEmail(resetEmail.trim())
      setResetSent(true)
    } catch {
      setResetError('Failed to send reset email. Please check your email and try again.')
    }
    setResetLoading(false)
  }

  return {
    email, setEmail, password, setPassword, loading, error, login,
    resetModalVisible, resetEmail, setResetEmail, resetLoading, resetSent, resetError,
    openResetModal, closeResetModal, sendResetEmail,
  }
}
