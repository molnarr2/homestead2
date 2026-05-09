import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCreateProductionLogController } from './CreateProductionLogController'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import DatePickerInput from '../../../components/input/DatePickerInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import AnimalOrGroupField from '../../../components/input/AnimalOrGroupField'
import AnimalPickerModal from '../../care/component/AnimalPickerModal'
import ProductionTypeSelector from '../component/ProductionTypeSelector'
import Icon from '@react-native-vector-icons/material-design-icons'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateProductionLog'>
type Route = RouteProp<RootStackParamList, 'CreateProductionLog'>

const CreateProductionLogScreen: React.FC = () => {
  const navigation = useNavigation<Navigation>()
  const route = useRoute<Route>()
  const c = useCreateProductionLogController(navigation, route)
  const [pickerVisible, setPickerVisible] = useState(false)

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
        <AnimalOrGroupField
          selectedAnimal={c.selectedAnimal}
          selectedGroup={c.selectedGroup}
          onPress={() => setPickerVisible(true)}
          readOnly={c.isReadOnly}
          label="Animal or Group"
          showGroups={true}
        />

        <Text className="text-sm font-medium text-text-primary mb-2">Production Type</Text>
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

        <DatePickerInput
          label="Date"
          value={c.date}
          onChange={c.setDate}
        />

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

      {!c.isReadOnly && (
        <AnimalPickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          animals={c.animals}
          onSelect={c.handleSelectAnimal}
          onSelectGroup={c.handleSelectGroup}
          showGroups={true}
        />
      )}
    </ScreenContainer>
  )
}

export default CreateProductionLogScreen
