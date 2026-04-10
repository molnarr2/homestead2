import React from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useRegisterController } from './RegisterController'
import PrimaryButton from '../../../components/button/PrimaryButton'
import TextInput from '../../../components/input/TextInput'

type RegisterNavigation = NativeStackNavigationProp<RootStackParamList, 'Register'>

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterNavigation>()
  const controller = useRegisterController(navigation)

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center mb-10">
          <Text className="text-3xl font-bold text-primary">Create Account</Text>
          <Text className="text-base text-text-secondary mt-2">Join Homestead today</Text>
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

        <PrimaryButton title="Create Account" onPress={controller.register} loading={controller.loading} />

        <View className="flex-row justify-center mt-8">
          <Text className="text-sm text-text-secondary">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-sm font-semibold text-primary">Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default RegisterScreen
