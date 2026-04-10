import React from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useLoginController } from './LoginController'
import PrimaryButton from '../../../components/button/PrimaryButton'
import TextInput from '../../../components/input/TextInput'

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, 'Login'>

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigation>()
  const controller = useLoginController(navigation)

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
          <Text className="text-3xl font-bold text-primary">Homestead</Text>
          <Text className="text-base text-text-secondary mt-2">Manage your farm with ease</Text>
        </View>

        <View className="mb-2">
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
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        {controller.error ? (
          <Text className="text-sm text-status-error mb-4">{controller.error}</Text>
        ) : null}

        <PrimaryButton title="Login" onPress={controller.login} loading={controller.loading} />

        <TouchableOpacity className="mt-4 items-center" onPress={controller.forgotPassword}>
          <Text className="text-sm text-primary">Forgot Password?</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text className="text-sm text-text-secondary">Don't have an account? </Text>
          <TouchableOpacity onPress={controller.goToRegister}>
            <Text className="text-sm font-semibold text-primary">Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen
