import { create } from 'zustand'
import { bsSubscriptionService } from '../Bootstrap'

interface PaywallState {
  visible: boolean
  prices: { standard: string; pro: string } | null
  loading: boolean
  show: () => void
  hide: () => void
  fetchPrices: () => Promise<void>
}

export const usePaywallStore = create<PaywallState>((set, get) => ({
  visible: false,
  prices: null,
  loading: false,

  show: () => {
    set({ visible: true })
    if (!get().prices) {
      get().fetchPrices()
    }
  },

  hide: () => {
    set({ visible: false })
  },

  fetchPrices: async () => {
    set({ loading: true })
    const prices = await bsSubscriptionService.getPrices()
    set({ prices, loading: false })
  },
}))
