import { create } from 'zustand'

interface FeedbackState {
  visible: boolean
  source: 'auto' | 'menu'
  show: (source: 'auto' | 'menu') => void
  hide: () => void
}

export const useFeedbackStore = create<FeedbackState>(set => ({
  visible: false,
  source: 'menu',

  show: (source: 'auto' | 'menu') => {
    set({ visible: true, source })
  },

  hide: () => {
    set({ visible: false })
  },
}))
