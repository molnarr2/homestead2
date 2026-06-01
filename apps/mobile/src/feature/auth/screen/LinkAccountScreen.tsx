import React from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import { useLinkAccountController } from './LinkAccountController'
import PrimaryButton from '../../../components/button/PrimaryButton'
import TextInput from '../../../components/input/TextInput'
import Icon from '@react-native-vector-icons/material-design-icons'

type Props = NativeStackScreenProps<RootStackParamList, 'LinkAccount'>

const LinkAccountScreen: React.FC<Props> = ({ navigation }) => {
  const controller = useLinkAccountController(navigation)

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
          <Text className="text-lg font-bold text-text-primary ml-3">Create Account</Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-primary">Secure Your Farm</Text>
            <Text className="text-base text-text-secondary mt-2">Keep your data safe with a full account</Text>
          </View>

          <View className="mb-2">
            <TextInput
              label="First Name"
              value={controller.firstName}
              onChangeText={controller.setFirstName}
              placeholder="First name"
              autoCapitalize="words"
            />
            <TextInput
              label="Last Name"
              value={controller.lastName}
              onChangeText={controller.setLastName}
              placeholder="Last name"
              autoCapitalize="words"
            />
            <TextInput
              label="Email"
              value={controller.email}
              onChangeText={controller.setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Password"
              value={controller.password}
              onChangeText={controller.setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
            />
          </View>

          {controller.error ? (
            <Text className="text-sm text-status-error mb-4">{controller.error}</Text>
          ) : null}

          <PrimaryButton title="Create Account" onPress={controller.submit} loading={controller.loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  )
}

export default LinkAccountScreen
