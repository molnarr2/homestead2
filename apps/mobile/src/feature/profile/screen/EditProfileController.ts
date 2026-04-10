import { useState } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { bsProfileService } from '../../../Bootstrap'
import { useUserStore } from '../../../store/userStore'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>

export function useEditProfileController(navigation: Navigation) {
  const { user, updateUser } = useUserStore()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [email] = useState(user?.email ?? '')
  const [photoUri, setPhotoUri] = useState('')
  const [loading, setLoading] = useState(false)

  const save = async () => {
    if (!user) return
    setLoading(true)

    await updateUser({ firstName, lastName })

    if (photoUri) {
      await bsProfileService.updateAvatar(user.id, photoUri)
    }

    setLoading(false)
    navigation.goBack()
  }

  return {
    firstName, setFirstName, lastName, setLastName, email,
    photoUri, setPhotoUri, user, loading, save,
  }
}
