import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useSendFeedbackController } from './SendFeedbackController'

type Props = NativeStackScreenProps<RootStackParamList, 'SendFeedback'>

const SendFeedbackScreen: React.FC<Props> = ({ navigation }) => {
  const c = useSendFeedbackController(navigation)

  return (
    <ScreenContainer>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary ml-3">Send Feedback</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-sm font-medium text-text-primary mb-2">How would you rate your experience?</Text>
        <View className="flex-row justify-center mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => c.setRating(star)}
              activeOpacity={0.7}
              className="mx-1"
            >
              <Icon
                name={star <= c.rating ? 'star' : 'star-outline'}
                size={36}
                color={star <= c.rating ? '#F9A825' : '#BDBDBD'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          label="Your Feedback"
          value={c.feedback}
          onChangeText={c.setFeedback}
          placeholder="Tell us what you think..."
          multiline
          numberOfLines={6}
        />

        <View className="mt-4">
          <PrimaryButton
            title="Submit"
            onPress={c.submit}
            loading={c.loading}
            disabled={!c.feedback.trim()}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default SendFeedbackScreen
