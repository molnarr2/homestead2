import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'
import BottomSheet from '../../../components/modal/BottomSheet'
import type Animal from '../../../schema/animal/Animal'
import { useExportAnimalModalController } from './ExportAnimalModalController'

type IconName = React.ComponentProps<typeof Icon>['name']

interface Props {
  visible: boolean
  onDismiss: () => void
  animal: Animal | undefined
}

interface ExportButtonProps {
  icon: IconName
  label: string
  onPress: () => void
  disabled: boolean
}

const ExportButton: React.FC<ExportButtonProps> = ({ icon, label, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    className="flex-row items-center py-3 px-2"
  >
    <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
      <Icon name={icon} size={22} color="#B5653A" />
    </View>
    <Text className="text-base text-text-primary flex-1">{label}</Text>
    <Icon name="chevron-right" size={20} color="#999" />
  </TouchableOpacity>
)

const ExportAnimalModal: React.FC<Props> = ({ visible, onDismiss, animal }) => {
  const controller = useExportAnimalModalController(animal)

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <Text className="text-lg font-bold text-text-primary mb-4">Export Animal Record</Text>

      {controller.loading ? (
        <View className="py-8 items-center">
          <ActivityIndicator size="large" color="#B5653A" />
          <Text className="text-sm text-text-secondary mt-3">Generating PDF...</Text>
        </View>
      ) : (
        <View>
          <ExportButton
            icon="file-document"
            label="Complete Animal Record"
            onPress={controller.onExportComplete}
            disabled={controller.loading}
          />
          <View className="h-px bg-border-light" />
          <ExportButton
            icon="medical-bag"
            label="Health & Care Summary"
            onPress={controller.onExportHealthCare}
            disabled={controller.loading}
          />
          <View className="h-px bg-border-light" />
          <ExportButton
            icon="gender-male-female"
            label="Breeding & Lineage Report"
            onPress={controller.onExportBreedingLineage}
            disabled={controller.loading}
          />
        </View>
      )}
    </BottomSheet>
  )
}

export default ExportAnimalModal
