export enum InAppSubscription {
  free = 'free',
  standard = 'standard',
  pro = 'pro',
  error = 'error',
}

export interface InAppPrices {
  success: boolean
  priceStandard: string
  pricePro: string
}
