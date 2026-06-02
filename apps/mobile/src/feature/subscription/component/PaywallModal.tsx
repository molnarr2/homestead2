import React, { useState } from 'react'
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from 'react-native'
import BottomSheet from '../../../components/modal/BottomSheet'
import PrimaryButton from '../../../components/button/PrimaryButton'
import SecondaryButton from '../../../components/button/SecondaryButton'
import { usePaywallStore } from '../../../store/paywallStore'
import { bsSubscriptionService } from '../../../Bootstrap'

const PRODUCT_STANDARD = 'homestead_standard_monthly'
const PRODUCT_PRO = 'homestead_pro_monthly'

const PaywallModal: React.FC = () => {
  const { visible, hide, prices, loading } = usePaywallStore()
  const [purchasing, setPurchasing] = useState(false)

  const handlePurchase = async (productId: string) => {
    if (purchasing) return
    setPurchasing(true)
    const result = await bsSubscriptionService.purchase(productId)
    setPurchasing(false)
    if (result.success) {
      hide()
    } else if (result.error) {
      Alert.alert('Purchase Failed', result.error)
    }
  }

  const handleRestore = async () => {
    setPurchasing(true)
    const result = await bsSubscriptionService.restorePurchases()
    setPurchasing(false)
    if (result.success) {
      hide()
    } else if (result.error) {
      Alert.alert('Restore Failed', result.error)
    }
  }

  return (
    <BottomSheet visible={visible} onDismiss={hide}>
      <Text className="text-xl font-bold text-text-primary text-center mb-2">
        Upgrade Your Plan
      </Text>
      <Text className="text-sm text-text-secondary text-center mb-6">
        Add more animals to your homestead
      </Text>

      {loading ? (
        <ActivityIndicator className="my-8" />
      ) : (
        <View>
          <View className="border border-border-light rounded-xl p-4 mb-3">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-text-primary">Standard</Text>
              <Text className="text-base font-semibold text-primary">
                {prices?.standard ?? 'Unavailable'}
              </Text>
            </View>
            <Text className="text-sm text-text-secondary mb-3">Up to 50 animals</Text>
            <SecondaryButton
              title="Get Standard"
              onPress={() => handlePurchase(PRODUCT_STANDARD)}
              loading={purchasing}
              disabled={!prices?.standard}
            />
          </View>

          <View className="border-2 border-primary rounded-xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-text-primary">Pro</Text>
              <Text className="text-base font-semibold text-primary">
                {prices?.pro ?? 'Unavailable'}
              </Text>
            </View>
            <Text className="text-sm text-text-secondary mb-3">Unlimited animals</Text>
            <PrimaryButton
              title="Get Pro"
              onPress={() => handlePurchase(PRODUCT_PRO)}
              loading={purchasing}
              disabled={!prices?.pro}
            />
          </View>

          <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
            <Text className="text-sm text-primary text-center">
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  )
}

export default PaywallModal
