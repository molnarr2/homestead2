import React from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import { useDeleteAccountController } from './DeleteAccountController'
import PrimaryButton from '../../../components/button/PrimaryButton'
import TextInput from '../../../components/input/TextInput'
import Icon from '@react-native-vector-icons/material-design-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'DeleteAccount'>

const DeleteAccountScreen: React.FC<Props> = ({ navigation }) => {
  const c = useDeleteAccountController(navigation)

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-row items-center px-4 pt-4 pb-2">
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-left" size={24} color="#333333" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-text-primary ml-3">Delete Account</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-status-error">Delete Your Account</Text>
            <Text className="text-base text-text-secondary mt-2 text-center">
              This permanently deletes your account and all of your data. This cannot be undone.
            </Text>
          </View>

          {c.isAnonymous ? (
            <TextInput
              label="Type DELETE to confirm"
              value={c.confirmText}
              onChangeText={c.setConfirmText}
              placeholder="DELETE"
              autoCapitalize="characters"
            />
          ) : (
            <TextInput
              label="Confirm your password"
              value={c.password}
              onChangeText={c.setPassword}
              placeholder="Your password"
              secureTextEntry
            />
          )}

          {c.error ? (
            <Text className="text-sm text-status-error mb-4">{c.error}</Text>
          ) : null}

          <PrimaryButton title="Delete Account" onPress={c.submit} loading={c.loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

export default DeleteAccountScreen
