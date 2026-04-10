import { useState } from 'react'
import { Platform } from 'react-native'
import { getVersion } from 'react-native-device-info'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsProfileService } from '../../../Bootstrap'
import { useUserStore } from '../../../store/userStore'
import { feedback_default } from '../../../schema/feedback/Feedback'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'SendFeedback'>

export function useSendFeedbackController(navigation: Navigation) {
  const user = useUserStore(s => s.user)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!feedback.trim()) return
    setLoading(true)
    await bsProfileService.submitFeedback({
      ...feedback_default(),
      userId: user?.id ?? '',
      email: user?.email ?? '',
      rating,
      feedback,
      os: Platform.OS === 'ios' ? 'iOS' : 'Android',
      version: getVersion(),
    })
    setLoading(false)
    navigation.goBack()
  }

  return { rating, setRating, feedback, setFeedback, loading, submit }
}
