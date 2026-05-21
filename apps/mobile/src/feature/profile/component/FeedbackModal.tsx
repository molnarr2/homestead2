import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import BottomSheet from '../../../components/modal/BottomSheet'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useFeedbackStore } from '../../../store/feedbackStore'
import { useFeedbackModalController } from './FeedbackModalController'

const FeedbackModal: React.FC = () => {
  const visible = useFeedbackStore(s => s.visible)
  const c = useFeedbackModalController()

  return (
    <BottomSheet visible={visible} onDismiss={c.dismiss}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-xl font-bold text-text-primary text-center mb-2">
          Send Feedback
        </Text>

        <Text className="text-sm font-medium text-text-primary mb-2">
          How would you rate your experience?
        </Text>
        <View className="flex-row justify-center mb-4">
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

        <Text className="text-sm font-medium text-text-primary mb-2">
          What do you like best?
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {c.areas.map(area => {
            const selected = c.bestAreas.includes(area)
            return (
              <TouchableOpacity
                key={area}
                onPress={() => c.toggleBestArea(area)}
                activeOpacity={0.7}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${selected ? 'bg-primary border-primary' : 'border-border-medium'}`}
              >
                <Text className={`text-sm ${selected ? 'text-text-inverse font-semibold' : 'text-text-primary'}`}>
                  {area}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <Text className="text-sm font-medium text-text-primary mb-2">
          What needs improvement?
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {c.areas.map(area => {
            const selected = c.improvementAreas.includes(area)
            return (
              <TouchableOpacity
                key={area}
                onPress={() => c.toggleImprovementArea(area)}
                activeOpacity={0.7}
                className={`mr-2 mb-2 px-3 py-1.5 rounded-full border ${selected ? 'bg-primary border-primary' : 'border-border-medium'}`}
              >
                <Text className={`text-sm ${selected ? 'text-text-inverse font-semibold' : 'text-text-primary'}`}>
                  {area}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>

        <TextInput
          label="Anything else you'd like to share?"
          value={c.feedback}
          onChangeText={c.setFeedback}
          placeholder="Optional"
          multiline
          numberOfLines={4}
        />

        <View className="mt-4">
          <PrimaryButton
            title="Submit"
            onPress={c.submit}
            loading={c.loading}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  )
}

export default FeedbackModal
