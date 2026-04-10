import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { launchImageLibrary } from 'react-native-image-picker'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import ScreenContainer from '../../../components/layout/ScreenContainer'
import TextInput from '../../../components/input/TextInput'
import PrimaryButton from '../../../components/button/PrimaryButton'
import Icon from '@react-native-vector-icons/material-design-icons'
import { useEditProfileController } from './EditProfileController'

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const c = useEditProfileController(navigation)

  const handlePhotoPick = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 })
    if (result.assets?.[0]?.uri) {
      c.setPhotoUri(result.assets[0].uri)
    }
  }

  return (
    <ScreenContainer>
      <View className="flex-row items-center px-4 pt-4 pb-2">
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Icon name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-primary ml-3">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <TouchableOpacity
          className="self-center mt-4 mb-6 w-24 h-24 rounded-full bg-primary items-center justify-center overflow-hidden border-2 border-border-light"
          onPress={handlePhotoPick}
          activeOpacity={0.7}
        >
          {c.photoUri ? (
            <View className="w-24 h-24 rounded-full bg-primaryLight items-center justify-center">
              <Icon name="check" size={32} color="#FFFFFF" />
            </View>
          ) : (
            <View className="items-center">
              <Icon name="camera-plus" size={28} color="#FFFFFF" />
              <Text className="text-xs text-text-inverse mt-1">Change</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          label="First Name"
          value={c.firstName}
          onChangeText={c.setFirstName}
          autoCapitalize="words"
        />

        <TextInput
          label="Last Name"
          value={c.lastName}
          onChangeText={c.setLastName}
          autoCapitalize="words"
        />

        <View className="mb-4">
          <Text className="text-sm font-medium text-text-primary mb-1">Email</Text>
          <View className="border border-border-light rounded-lg px-4 py-3 bg-backgroundDark">
            <Text className="text-base text-text-secondary">{c.email}</Text>
          </View>
        </View>

        <View className="mt-4">
          <PrimaryButton title="Save" onPress={c.save} loading={c.loading} />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default EditProfileScreen
