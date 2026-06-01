import { create } from 'zustand'

interface CreateAccountPromptState {
  visible: boolean
  threshold: number
  show: (threshold: number) => void
  hide: () => void
}

export const useCreateAccountPromptStore = create<CreateAccountPromptState>(set => ({
  visible: false,
  threshold: 0,
  show: (threshold: number) => set({ visible: true, threshold }),
  hide: () => set({ visible: false }),
}))
