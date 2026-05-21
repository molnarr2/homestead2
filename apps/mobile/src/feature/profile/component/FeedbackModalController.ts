import { useState } from 'react'
import { Platform } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { bsProfileService } from '../../../Bootstrap'
import { useUserStore } from '../../../store/userStore'
import { useFeedbackStore } from '../../../store/feedbackStore'
import { feedback_default } from '../../../schema/feedback/Feedback'

const AREAS = [
  'Animal Management',
  'Care & Scheduling',
  'Health Tracking',
  'Breeding',
  'Production Logging',
]

export function useFeedbackModalController() {
  const user = useUserStore(s => s.user)
  const { source, hide } = useFeedbackStore()
  const [rating, setRating] = useState(0)
  const [bestAreas, setBestAreas] = useState<string[]>([])
  const [improvementAreas, setImprovementAreas] = useState<string[]>([])
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleArea = (area: string, list: string[], setList: (v: string[]) => void) => {
    setList(list.includes(area) ? list.filter(a => a !== area) : [...list, area])
  }

  const toggleBestArea = (area: string) => toggleArea(area, bestAreas, setBestAreas)
  const toggleImprovementArea = (area: string) => toggleArea(area, improvementAreas, setImprovementAreas)

  const reset = () => {
    setRating(0)
    setBestAreas([])
    setImprovementAreas([])
    setFeedback('')
  }

  const dismiss = () => {
    reset()
    hide()
  }

  const submit = async () => {
    setLoading(true)
    await bsProfileService.submitFeedback({
      ...feedback_default(),
      userId: user?.id ?? '',
      email: user?.email ?? '',
      rating,
      feedback,
      bestAreas,
      improvementAreas,
      source,
      os: Platform.OS === 'ios' ? 'iOS' : 'Android',
      version: getVersion(),
    })
    setLoading(false)
    reset()
    hide()
  }

  return {
    areas: AREAS,
    rating,
    setRating,
    bestAreas,
    improvementAreas,
    feedback,
    setFeedback,
    loading,
    toggleBestArea,
    toggleImprovementArea,
    submit,
    dismiss,
  }
}
