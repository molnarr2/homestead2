import React from 'react'
import { View, Text, Pressable } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import SectionHeader from '../../../components/layout/SectionHeader'
import { ProductionSnapshotItem } from '../HomeController'

interface Props {
  items: ProductionSnapshotItem[]
  onAddProduction: () => void
}

const ProductionSnapshotSection: React.FC<Props> = ({ items, onAddProduction }) => {
  return (
    <View>
      <View className="flex-row items-center justify-between mt-4 mb-2">
        <Text className="text-lg font-semibold text-text-primary">Production</Text>
        <Pressable onPress={onAddProduction} hitSlop={8}>
          <Icon name="plus-circle-outline" size={22} color="#4A6741" />
        </Pressable>
      </View>
      {items.length === 0 ? (
        <View className="bg-surface rounded-xl p-4 items-center">
          <Text className="text-sm text-text-secondary mb-2">No production logged yet</Text>
          <Pressable
            className="bg-primary rounded-lg px-4 py-2"
            onPress={onAddProduction}
          >
            <Text className="text-sm font-medium text-text-inverse">Log Production</Text>
          </Pressable>
        </View>
      ) : (
        <View className="bg-surface rounded-xl p-3">
          {items.map((item, index) => (
            <View
              key={item.productionType}
              className={`flex-row items-center justify-between py-2 ${index < items.length - 1 ? 'border-b border-border' : ''}`}
            >
              <Text className="text-sm font-medium text-text-primary capitalize">
                {item.productionType}
              </Text>
              <Text className="text-sm text-text-secondary">
                {item.today} today / {item.week} this week
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

export default ProductionSnapshotSection
