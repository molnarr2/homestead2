import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import AppDialog from '../../../components/dialog/AppDialog'
import { useCreateAccountPromptStore } from '../../../store/createAccountPromptStore'
import { useUserStore } from '../../../store/userStore'

const CreateAccountPromptModal: React.FC = () => {
  const visible = useCreateAccountPromptStore(s => s.visible)
  const threshold = useCreateAccountPromptStore(s => s.threshold)
  const hide = useCreateAccountPromptStore(s => s.hide)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const onCreateAccount = () => {
    hide()
    navigation.navigate('LinkAccount')
  }

  const onDismiss = async () => {
    hide()
    await useUserStore.getState().updateUser({ anonymousPromptLastSeen: threshold })
  }

  return (
    <AppDialog
      visible={visible}
      onDismiss={onDismiss}
      title="Create an Account"
      actions={
        <>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg"
            onPress={onDismiss}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-text-secondary">Not Now</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg bg-primary"
            onPress={onCreateAccount}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-text-inverse">Create Account</Text>
          </TouchableOpacity>
        </>
      }
    >
      <Text className="text-sm text-text-secondary">
        Your data is only stored on this device session. Create an account to keep your animals, health records, and care schedules safe. Without an account, your data cannot be recovered if you lose your device or uninstall the app.
      </Text>
    </AppDialog>
  )
}

export default CreateAccountPromptModal
