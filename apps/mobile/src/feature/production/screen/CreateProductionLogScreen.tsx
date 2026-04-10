import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCreateProductionLogController } from './CreateProductionLogController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import ProductionTypeSelector from '../component/ProductionTypeSelector'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateProductionLog'>
type Route = RouteProp<RootStackParamList, 'CreateProductionLog'>

const CreateProductionLogScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useCreateProductionLogController(navigation, route)

  return (
    <ScreenContainer>
      <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
        <TouchableOpacity onPress={c.onBack} activeOpacity={0.7} className="p-1">
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-text-primary">Log Production</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text className="text-sm font-medium text-text-primary mb-2 mt-4">Production Type</Text>
        <ProductionTypeSelector
          selected={c.productionType}
          onSelect={type => { if (type !== 'all') c.setProductionType(type) }}
          showAll={false}
        />

        <View className="flex-row gap-3 mt-4">
          <View className="flex-1">
            <TextInput
              label="Quantity *"
              value={c.quantity}
              onChangeText={c.setQuantity}
              placeholder="0"
              keyboardType="decimal-pad"
            />
          </View>
          <View className="flex-1">
            <TextInput
              label="Unit"
              value={c.unit}
              onChangeText={c.setUnit}
              placeholder="count"
            />
          </View>
        </View>

        <TextInput
          label="Date"
          value={c.date}
          onChangeText={c.setDate}
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
        />

        <Text className="text-sm font-medium text-text-primary mb-2">Log Mode</Text>
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg border items-center ${
              c.logMode === 'animal' ? 'bg-primary border-primary' : 'bg-surface border-border-light'
            }`}
            onPress={() => c.setLogMode('animal')}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-medium ${
              c.logMode === 'animal' ? 'text-text-inverse' : 'text-text-primary'
            }`}>
              Per Animal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-lg border items-center ${
              c.logMode === 'group' ? 'bg-primary border-primary' : 'bg-surface border-border-light'
            }`}
            onPress={() => c.setLogMode('group')}
            activeOpacity={0.7}
          >
            <Text className={`text-sm font-medium ${
              c.logMode === 'group' ? 'text-text-inverse' : 'text-text-primary'
            }`}>
              Per Group
            </Text>
          </TouchableOpacity>
        </View>

        {c.logMode === 'animal' ? (
          <View className="mb-4">
            <Text className="text-sm font-medium text-text-primary mb-2">Animal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {c.animals.map(animal => (
                  <TouchableOpacity
                    key={animal.id}
                    className={`px-3 py-2 rounded-lg border ${
                      c.animalId === animal.id ? 'bg-primary border-primary' : 'bg-surface border-border-light'
                    }`}
                    onPress={() => c.setAnimalId(animal.id)}
                    activeOpacity={0.7}
                  >
                    <Text className={`text-sm ${
                      c.animalId === animal.id ? 'text-text-inverse' : 'text-text-primary'
                    }`}>
                      {animal.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (
          <TextInput
            label="Group Name"
            value={c.groupName}
            onChangeText={c.setGroupName}
            placeholder="e.g. Laying Hens, Dairy Goats"
          />
        )}

        <TextInput
          label="Notes"
          value={c.notes}
          onChangeText={c.setNotes}
          placeholder="Optional"
          multiline
          numberOfLines={3}
        />

        <View className="mt-4 mb-8">
          <PrimaryButton
            title="Save Production Log"
            onPress={c.submit}
            loading={c.loading}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default CreateProductionLogScreen
