export enum InAppSubscription {
  free = 'free',
  tier1 = 'tier1',
  tier2 = 'tier2',
  tier3 = 'tier3',
  error = 'error',
}

export interface InAppPrices {
  success: boolean
  priceTier1: string
  priceTier2: string
  priceTier3: string
}
