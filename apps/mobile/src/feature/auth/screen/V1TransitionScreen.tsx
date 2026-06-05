import React from 'react'
import { View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useV1TransitionController } from './V1TransitionController'
import PrimaryButton from '../../../components/button/PrimaryButton'
import TextInput from '../../../components/input/TextInput'

const V1TransitionScreen: React.FC = () => {
  const { firstName, setFirstName, lastName, setLastName, loading, error, onContinue } = useV1TransitionController()

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
          <Text className="text-3xl font-bold text-primary text-center">Welcome to the New Homestead</Text>
        </View>

        <Text className="text-base text-text-secondary text-center mb-10 leading-6">
          We've rebuilt Homestead from the ground up to give you a more complete experience.
          Your animals will need to be re-entered — we're sorry for the inconvenience, but we
          think you'll love what's new. Give it a try!
        </Text>

        <View className="mb-2">
          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="First name"
            autoCapitalize="words"
          />
          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Last name"
            autoCapitalize="words"
          />
        </View>

        {error ? (
          <Text className="text-sm text-status-error text-center mb-4">{error}</Text>
        ) : null}

        <PrimaryButton title="Continue" onPress={onContinue} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default V1TransitionScreen
