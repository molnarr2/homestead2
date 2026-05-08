import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuthStore } from '../store/authStore'
import { useHomesteadStore } from '../store/homesteadStore'
import { DrawerNavigator } from './DrawerNavigator'
import type { HealthRecordType } from '../schema/health/HealthRecord'
import LoadingScreen from '../feature/loading/LoadingScreen'
import LoginScreen from '../feature/auth/screen/LoginScreen'
import RegisterScreen from '../feature/auth/screen/RegisterScreen'
import SpeciesSelectionScreen from '../feature/auth/screen/SpeciesSelectionScreen'
import DebugScreen from '../feature/debug/DebugScreen'
import PlaceholderScreen from './PlaceholderScreen'
import CustomizationHomeScreen from '../feature/customization/screen/CustomizationHomeScreen'
import AnimalTypeDetailScreen from '../feature/customization/screen/AnimalTypeDetailScreen'
import EditAnimalTypeScreen from '../feature/customization/screen/EditAnimalTypeScreen'
import EditBreedScreen from '../feature/customization/screen/EditBreedScreen'
import EditCareTemplateScreen from '../feature/customization/screen/EditCareTemplateScreen'
import ProfileScreen from '../feature/profile/screen/ProfileScreen'
import EditProfileScreen from '../feature/profile/screen/EditProfileScreen'
import SettingsScreen from '../feature/profile/screen/SettingsScreen'
import SendFeedbackScreen from '../feature/profile/screen/SendFeedbackScreen'
import AnimalDetailScreen from '../feature/animal/screen/AnimalDetailScreen'
import CreateAnimalScreen from '../feature/animal/screen/CreateAnimalScreen'
import EditAnimalScreen from '../feature/animal/screen/EditAnimalScreen'
import CareEventDetailScreen from '../feature/care/screen/CareEventDetailScreen'
import CreateCareEventScreen from '../feature/care/screen/CreateCareEventScreen'
import HealthRecordDetailScreen from '../feature/health/screen/HealthRecordDetailScreen'
import CreateHealthRecordScreen from '../feature/health/screen/CreateHealthRecordScreen'
import BreedingRecordDetailScreen from '../feature/breeding/screen/BreedingRecordDetailScreen'
import CreateBreedingRecordScreen from '../feature/breeding/screen/CreateBreedingRecordScreen'
import RecordBirthOutcomeScreen from '../feature/breeding/screen/RecordBirthOutcomeScreen'
import CreateProductionLogScreen from '../feature/production/screen/CreateProductionLogScreen'
import CreateNoteScreen from '../feature/notes/screen/CreateNoteScreen'
import NoteDetailScreen from '../feature/notes/screen/NoteDetailScreen'
import CreateWeightLogScreen from '../feature/animal/screen/CreateWeightLogScreen'
import WeightLogDetailScreen from '../feature/animal/screen/WeightLogDetailScreen'
import EditWeightLogScreen from '../feature/animal/screen/EditWeightLogScreen'
import EditHealthRecordScreen from '../feature/health/screen/EditHealthRecordScreen'
import EditCareEventScreen from '../feature/care/screen/EditCareEventScreen'
import EditBreedingRecordScreen from '../feature/breeding/screen/EditBreedingRecordScreen'
import EditNoteScreen from '../feature/notes/screen/EditNoteScreen'
import EditProductionLogScreen from '../feature/production/screen/EditProductionLogScreen'
import GroupDetailScreen from '../feature/group/screen/GroupDetailScreen'
import EditGroupScreen from '../feature/group/screen/EditGroupScreen'

export type RootStackParamList = {
  // Auth
  Loading: undefined
  Login: undefined
  Register: undefined
  SpeciesSelection: undefined

  // Main
  DrawerMain: undefined

  // Animal screens
  AnimalDetail: { animalId: string }
  CreateAnimal: { animalTypeId?: string }
  EditAnimal: { animalId: string }

  // Care screens
  CareEventDetail: { eventId: string }
  CreateCareEvent: { animalId: string; templateId?: string; groupId?: string }

  // Health screens
  HealthRecordDetail: { recordId: string }
  CreateHealthRecord: { animalId: string; recordType?: HealthRecordType; groupId?: string }

  // Breeding screens
  BreedingRecordDetail: { recordId: string }
  CreateBreedingRecord: { animalId: string }
  RecordBirthOutcome: { recordId: string }

  // Production screens
  CreateProductionLog: { animalId?: string; groupName?: string; type?: import('../schema/production/ProductionLog').ProductionType }

  // Notes screens
  CreateNote: { animalId: string }
  NoteDetail: { noteId: string; animalId: string }

  // Group screens
  GroupDetail: { groupId: string }
  EditGroup: { groupId?: string }

  // Weight screens
  CreateWeightLog: { animalId: string }
  WeightLogDetail: { logId: string; animalId: string }
  EditWeightLog: { logId: string; animalId: string }

  // Edit screens
  EditHealthRecord: { recordId: string }
  EditCareEvent: { eventId: string }
  EditBreedingRecord: { recordId: string }
  EditNote: { noteId: string; animalId: string }
  EditProductionLog: { logId: string }

  // Settings screens
  Profile: undefined
  EditProfile: undefined
  Subscription: undefined
  Customization: undefined
  CustomizeAnimalType: { animalTypeId: string }
  EditAnimalType: { animalTypeId?: string }
  EditBreed: { animalTypeId: string; breedId?: string }
  EditCareTemplate: { animalTypeId: string; templateId?: string }
  EditEventTemplate: { animalTypeId: string; templateId?: string }
  CustomizeBreeds: { animalTypeId: string }
  CustomizeCareTemplates: { animalTypeId: string }
  SendFeedback: undefined
  Settings: undefined
  Debug: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const RootNavigation: React.FC = () => {
  const isLoggedIn = useAuthStore(s => s.isLoggedIn)
  const homesteadId = useHomesteadStore(s => s.homesteadId)
  const homestead = useHomesteadStore(s => s.homestead)
  const showLoading = isLoggedIn === null || (isLoggedIn === true && (homesteadId === '' || homestead === null))

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {showLoading ? (
          <Stack.Screen name="Loading" component={LoadingScreen} />
        ) : isLoggedIn === false ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : homestead?.onboardingComplete === false ? (
          <Stack.Screen name="SpeciesSelection" component={SpeciesSelectionScreen} />
        ) : (
          <>
            <Stack.Screen name="DrawerMain" component={DrawerNavigator} />
            <Stack.Screen name="AnimalDetail" component={AnimalDetailScreen} />
            <Stack.Screen name="CreateAnimal" component={CreateAnimalScreen} />
            <Stack.Screen name="EditAnimal" component={EditAnimalScreen} />
            <Stack.Screen name="CareEventDetail" component={CareEventDetailScreen} />
            <Stack.Screen name="CreateCareEvent" component={CreateCareEventScreen} />
            <Stack.Screen name="HealthRecordDetail" component={HealthRecordDetailScreen} />
            <Stack.Screen name="CreateHealthRecord" component={CreateHealthRecordScreen} />
            <Stack.Screen name="BreedingRecordDetail" component={BreedingRecordDetailScreen} />
            <Stack.Screen name="CreateBreedingRecord" component={CreateBreedingRecordScreen} />
            <Stack.Screen name="RecordBirthOutcome" component={RecordBirthOutcomeScreen} />
            <Stack.Screen name="CreateProductionLog" component={CreateProductionLogScreen} />
            <Stack.Screen name="CreateNote" component={CreateNoteScreen} />
            <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
            <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
            <Stack.Screen name="EditGroup" component={EditGroupScreen} />
            <Stack.Screen name="CreateWeightLog" component={CreateWeightLogScreen} />
            <Stack.Screen name="WeightLogDetail" component={WeightLogDetailScreen} />
            <Stack.Screen name="EditWeightLog" component={EditWeightLogScreen} />
            <Stack.Screen name="EditHealthRecord" component={EditHealthRecordScreen} />
            <Stack.Screen name="EditCareEvent" component={EditCareEventScreen} />
            <Stack.Screen name="EditBreedingRecord" component={EditBreedingRecordScreen} />
            <Stack.Screen name="EditNote" component={EditNoteScreen} />
            <Stack.Screen name="EditProductionLog" component={EditProductionLogScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Subscription" component={PlaceholderScreen} />
            <Stack.Screen name="Customization" component={CustomizationHomeScreen} />
            <Stack.Screen name="CustomizeAnimalType" component={AnimalTypeDetailScreen} />
            <Stack.Screen name="EditAnimalType" component={EditAnimalTypeScreen} />
            <Stack.Screen name="EditBreed" component={EditBreedScreen} />
            <Stack.Screen name="EditCareTemplate" component={EditCareTemplateScreen} />
            <Stack.Screen name="EditEventTemplate" component={PlaceholderScreen} />
            <Stack.Screen name="CustomizeBreeds" component={PlaceholderScreen} />
            <Stack.Screen name="CustomizeCareTemplates" component={PlaceholderScreen} />
            <Stack.Screen name="SendFeedback" component={SendFeedbackScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Debug" component={DebugScreen} options={{ headerShown: true, title: 'Debug Theme' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default RootNavigation
