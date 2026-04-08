import React from 'react'
import { ScrollView, View, Text } from 'react-native'
import PrimaryButton from '../../components/button/PrimaryButton'
import SecondaryButton from '../../components/button/SecondaryButton'
import IconButton from '../../components/button/IconButton'
import ThemeButton from '../../components/button/ThemeButton'
import FloatingActionButton from '../../components/button/FloatingActionButton'
import TextInput from '../../components/input/TextInput'
import SearchBar from '../../components/input/SearchBar'
import AppDialog from '../../components/dialog/AppDialog'
import ConfirmDialog from '../../components/dialog/ConfirmDialog'
import SelectDialog from '../../components/dialog/SelectDialog'
import BottomSheet from '../../components/modal/BottomSheet'
import useDebugController from './DebugController'

const selectItems = [
  { label: 'Option One', value: 'option1' },
  { label: 'Option Two', value: 'option2' },
  { label: 'Option Three', value: 'option3' },
]

const noop = () => {}

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text className="text-lg font-bold text-text-primary mt-6 mb-3">{title}</Text>
)

const textColorLabels: { key: string; label: string; className: string }[] = [
  { key: 'primary', label: 'Primary Text', className: 'text-text-primary' },
  { key: 'secondary', label: 'Secondary Text', className: 'text-text-secondary' },
  { key: 'disabled', label: 'Disabled Text', className: 'text-text-disabled' },
]

const bgSwatches: { key: string; label: string; bg: string }[] = [
  { key: 'primary', label: 'Primary Background', bg: 'bg-primary' },
  { key: 'secondary', label: 'Secondary Background', bg: 'bg-secondary' },
  { key: 'accent', label: 'Accent Background', bg: 'bg-accent' },
]

const DebugScreen: React.FC = () => {
  const controller = useDebugController()

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold text-text-primary mt-4 mb-2">Component Showcase</Text>
        <Text className="text-sm text-text-secondary mb-2">
          Theme preview for colors, typography, and components.
        </Text>

        <SectionHeader title="Text Sizes & Colors" />
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-2xl font-bold text-text-primary">Primary Heading 2xl Bold</Text>
          <Text className="text-xl font-semibold text-text-primary">Primary XL Semibold</Text>
          <Text className="text-lg font-bold text-text-primary">Primary Large Bold</Text>
          <Text className="text-base text-text-primary">Primary Medium Normal</Text>
          <Text className="text-sm text-text-primary">Primary Small Normal</Text>
          <Text className="text-xs text-text-primary">Primary XS Normal</Text>
          <View className="h-px bg-border-light my-2" />
          <Text className="text-lg font-bold text-text-secondary">Secondary Large Bold</Text>
          <Text className="text-base text-text-secondary">Secondary Medium Normal</Text>
          <Text className="text-sm text-text-secondary">Secondary Small Normal</Text>
          <View className="h-px bg-border-light my-2" />
          <Text className="text-lg font-bold text-text-disabled">Disabled Large Bold</Text>
          <Text className="text-base text-text-disabled">Disabled Medium Normal</Text>
          <Text className="text-sm text-text-disabled">Disabled Small Normal</Text>
        </View>

        <SectionHeader title="Text Colors on Theme Backgrounds" />
        {bgSwatches.map((swatch) => (
          <View key={swatch.key} className={`${swatch.bg} rounded-lg p-4 mb-3`}>
            <Text className="text-xs text-text-inverse mb-2 opacity-80">{swatch.label}</Text>
            {textColorLabels.map((t) => (
              <Text key={t.key} className={`text-base ${t.className} mb-1`}>
                {t.label} on {swatch.key}
              </Text>
            ))}
          </View>
        ))}

        <SectionHeader title="Text Colors on White" />
        <View className="bg-white rounded-lg p-4 mb-3 border border-border-light">
          {textColorLabels.map((t) => (
            <View key={t.key} className="mb-2">
              <Text className={`text-lg font-bold ${t.className}`}>{t.label} Large Bold</Text>
              <Text className={`text-base ${t.className}`}>{t.label} Medium</Text>
              <Text className={`text-sm ${t.className}`}>{t.label} Small</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Text Colors on Black" />
        <View className="bg-black rounded-lg p-4 mb-4">
          {textColorLabels.map((t) => (
            <View key={t.key} className="mb-2">
              <Text className={`text-lg font-bold ${t.className}`}>{t.label} Large Bold</Text>
              <Text className={`text-base ${t.className}`}>{t.label} Medium</Text>
              <Text className={`text-sm ${t.className}`}>{t.label} Small</Text>
            </View>
          ))}
        </View>

        <SectionHeader title="Background Swatches" />
        <View className="mb-4">
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 h-16 bg-primary rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">primary</Text>
            </View>
            <View className="flex-1 h-16 bg-primary-light rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">primary-light</Text>
            </View>
            <View className="flex-1 h-16 bg-primary-dark rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">primary-dark</Text>
            </View>
          </View>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 h-16 bg-secondary rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">secondary</Text>
            </View>
            <View className="flex-1 h-16 bg-secondary-light rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">secondary-light</Text>
            </View>
            <View className="flex-1 h-16 bg-secondary-dark rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">secondary-dark</Text>
            </View>
          </View>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 h-16 bg-accent rounded-lg items-center justify-center">
              <Text className="text-xs text-primary-dark">accent</Text>
            </View>
            <View className="flex-1 h-16 bg-accent-light rounded-lg items-center justify-center">
              <Text className="text-xs text-primary-dark">accent-light</Text>
            </View>
            <View className="flex-1 h-16 bg-accent-dark rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">accent-dark</Text>
            </View>
          </View>
          <View className="flex-row gap-2 mb-2">
            <View className="flex-1 h-16 bg-background rounded-lg items-center justify-center border border-border-light">
              <Text className="text-xs text-text-primary">background</Text>
            </View>
            <View className="flex-1 h-16 bg-background-dark rounded-lg items-center justify-center">
              <Text className="text-xs text-text-primary">background-dark</Text>
            </View>
            <View className="flex-1 h-16 bg-surface rounded-lg items-center justify-center border border-border-light">
              <Text className="text-xs text-text-primary">surface</Text>
            </View>
          </View>
          <View className="flex-row gap-2">
            <View className="flex-1 h-16 bg-status-success rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">success</Text>
            </View>
            <View className="flex-1 h-16 bg-status-warning rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">warning</Text>
            </View>
            <View className="flex-1 h-16 bg-status-error rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">error</Text>
            </View>
            <View className="flex-1 h-16 bg-status-info rounded-lg items-center justify-center">
              <Text className="text-xs text-text-inverse">info</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="Primary / Secondary Buttons" />
        <View className="mb-4 gap-3">
          <PrimaryButton title="Primary Button" onPress={noop} />
          <PrimaryButton title="Primary Loading" onPress={noop} loading />
          <PrimaryButton title="Primary Disabled" onPress={noop} disabled />
          <SecondaryButton title="Secondary Button" onPress={noop} />
          <SecondaryButton title="Secondary Loading" onPress={noop} loading />
          <SecondaryButton title="Secondary Disabled" onPress={noop} disabled />
        </View>

        <SectionHeader title="Icon Buttons" />
        <View className="flex-row gap-2 mb-4">
          <IconButton icon="❤️" onPress={noop} />
          <IconButton icon="💬" onPress={noop} />
          <IconButton icon="🙏" onPress={noop} />
          <IconButton icon="⭐" onPress={noop} />
          <IconButton icon="🔔" onPress={noop} disabled />
        </View>

        <SectionHeader title="Theme Buttons" />
        <View className="mb-4 gap-3">
          <ThemeButton variant="primary" buttonStyle="solid" title="Primary Solid" onPress={noop} />
          <ThemeButton variant="primary" buttonStyle="outline" title="Primary Outline" onPress={noop} />
          <ThemeButton variant="secondary" buttonStyle="solid" title="Secondary Solid" onPress={noop} />
          <ThemeButton variant="secondary" buttonStyle="outline" title="Secondary Outline" onPress={noop} />
          <ThemeButton variant="tertiary" buttonStyle="solid" title="Tertiary Solid" onPress={noop} />
          <ThemeButton variant="tertiary" buttonStyle="outline" title="Tertiary Outline" onPress={noop} />
        </View>

        <SectionHeader title="Inputs" />
        <View className="mb-4">
          <TextInput
            label="Normal Input"
            value={controller.textInputValue}
            onChangeText={controller.onTextInputChange}
            placeholder="Type something..."
          />
          <TextInput
            label="Input with Error"
            value={controller.textInputValue}
            onChangeText={controller.onTextInputChange}
            error={controller.textInputError}
            placeholder="Type less than 3 chars..."
          />
          <SearchBar
            value={controller.searchValue}
            onChangeText={controller.onSearchChange}
            placeholder="Search..."
          />
        </View>

        <SectionHeader title="Dialogs & Modals" />
        <View className="mb-12 gap-3">
          <PrimaryButton title="Show AppDialog" onPress={controller.showAppDialog} />
          <PrimaryButton title="Show ConfirmDialog" onPress={controller.showConfirmDialog} />
          <PrimaryButton title="Show SelectDialog" onPress={controller.showSelectDialog} />
          <PrimaryButton title="Show BottomSheet" onPress={controller.showBottomSheet} />
        </View>
      </ScrollView>

      <FloatingActionButton onPress={noop} />

      <AppDialog
        visible={controller.appDialogVisible}
        onDismiss={controller.hideAppDialog}
        title="App Dialog"
        actions={<PrimaryButton title="Close" onPress={controller.hideAppDialog} />}
      >
        <Text className="text-sm text-text-secondary">
          This is a custom dialog built on React Native Modal. Tap outside or press Close to dismiss.
        </Text>
      </AppDialog>

      <ConfirmDialog
        visible={controller.confirmDialogVisible}
        onConfirm={controller.onConfirm}
        onCancel={controller.hideConfirmDialog}
        title="Delete Item?"
        message="This action cannot be undone. Are you sure you want to continue?"
        confirmLabel="Delete"
        destructive
      />

      <SelectDialog
        visible={controller.selectDialogVisible}
        onDismiss={controller.hideSelectDialog}
        title="Select an Option"
        items={selectItems}
        onSelect={controller.onSelectItem}
        selectedValue={controller.selectedSelectValue}
      />

      <BottomSheet visible={controller.bottomSheetVisible} onDismiss={controller.hideBottomSheet}>
        <Text className="text-lg font-semibold text-text-primary mb-2">Bottom Sheet</Text>
        <Text className="text-sm text-text-secondary mb-4">
          This is a bottom sheet modal. Tap outside to dismiss.
        </Text>
        <PrimaryButton title="Close" onPress={controller.hideBottomSheet} />
      </BottomSheet>
    </View>
  )
}

export default DebugScreen
