import React from 'react'
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useLoginController } from './LoginController'
import PrimaryButton from '../../../components/button/PrimaryButton'
import TextInput from '../../../components/input/TextInput'
import AppDialog from '../../../components/dialog/AppDialog'

type LoginNavigation = NativeStackNavigationProp<RootStackParamList, 'Login'>

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNavigation>()
  const controller = useLoginController()

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

        <TouchableOpacity className="mt-4 items-center" onPress={controller.openResetModal}>
          <Text className="text-sm text-primary">Forgot Password?</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text className="text-sm text-text-secondary">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-sm font-semibold text-primary">Create Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <AppDialog
        visible={controller.resetModalVisible}
        onDismiss={controller.closeResetModal}
        title={controller.resetSent ? 'Email Sent' : 'Reset Password'}
        actions={
          controller.resetSent ? (
            <TouchableOpacity
              className="bg-primary rounded-xl py-2.5 px-5"
              onPress={controller.closeResetModal}
            >
              <Text className="text-sm font-semibold text-text-inverse">OK</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                className="py-2.5 px-4"
                onPress={controller.closeResetModal}
              >
                <Text className="text-sm font-semibold text-text-secondary">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-primary rounded-xl py-2.5 px-5"
                onPress={controller.sendResetEmail}
                disabled={controller.resetLoading}
              >
                <Text className="text-sm font-semibold text-text-inverse">
                  {controller.resetLoading ? 'Sending...' : 'Send'}
                </Text>
              </TouchableOpacity>
            </>
          )
        }
      >
        {controller.resetSent ? (
          <Text className="text-sm text-text-secondary">
            Successfully sent the password reset link to your email. Check your inbox and follow the link to reset your password.
          </Text>
        ) : (
          <>
            <Text className="text-sm text-text-secondary mb-3">
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            <TextInput
              label="Email"
              value={controller.resetEmail}
              onChangeText={controller.setResetEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {controller.resetError ? (
              <Text className="text-sm text-status-error mt-1">{controller.resetError}</Text>
            ) : null}
          </>
        )}
      </AppDialog>
    </KeyboardAvoidingView>
  )
}

export default LoginScreen
