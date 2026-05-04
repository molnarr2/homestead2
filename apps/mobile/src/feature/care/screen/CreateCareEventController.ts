import { useState, useEffect } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useAnimalStore } from '../../../store/animalStore'
import { useCareStore } from '../../../store/careStore'
import { useAnimalTypeStore } from '../../../store/animalTypeStore'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { effectiveSubscription } from '../../subscription/service/ISubscriptionService'
import { bsCareService } from '../../../Bootstrap'
import { CareEventType, careEvent_default } from '../../../schema/care/CareEvent'
import { adminObject_default } from '../../../schema/object/AdminObject'
import { dateToTstamp } from '../../../schema/type/Tstamp'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'CreateCareEvent'>
type Route = RouteProp<RootStackParamList, 'CreateCareEvent'>

const FREE_TIER_CARE_LIMIT = 3

export function useCreateCareEventController(navigation: Navigation, route: Route) {
  const { animalId: routeAnimalId, templateId } = route.params
  const { animals } = useAnimalStore()
  const { careEvents } = useCareStore()
  const { animalTypes } = useAnimalTypeStore()
  const homestead = useHomesteadStore(s => s.homestead)

  const [selectedAnimalId, setSelectedAnimalId] = useState(routeAnimalId ?? '')
  const [name, setName] = useState('')
  const [type, setType] = useState<CareEventType>('careSingle')
  const [cycle, setCycle] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (templateId) {
      const allTemplates = animalTypes.flatMap(t => t.careTemplates)
      const template = allTemplates.find(t => t.id === templateId)
      if (template) {
        setName(template.name)
        setType(template.type)
        setCycle(template.cycle)
        setContactName(template.contactName)
        setContactPhone(template.contactPhone)
      }
    }
  }, [templateId])

  const submit = async () => {
    if (!name.trim() || !selectedAnimalId) {
      Alert.alert('Required', 'Please enter a name and select an animal.')
      return
    }

    const tier = effectiveSubscription(homestead)
    const eventsForAnimal = careEvents.filter(e => e.animalId === selectedAnimalId)
    if (tier === 'free' && eventsForAnimal.length >= FREE_TIER_CARE_LIMIT) {
      Alert.alert(
        'Care Event Limit Reached',
        `Free accounts can add up to ${FREE_TIER_CARE_LIMIT} care events per animal. Upgrade to Pro for unlimited care events.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => navigation.navigate('Subscription') },
        ]
      )
      return
    }

    setLoading(true)
    const event = {
      ...careEvent_default(),
      animalId: selectedAnimalId,
      templateId: templateId ?? '',
      name: name.trim(),
      type,
      cycle: type === 'careRecurring' ? cycle : 0,
      dueDate: dateToTstamp(dueDate ? new Date(dueDate) : new Date()),
      contactName,
      contactPhone,
      notes,
      admin: adminObject_default(),
    }
    const result = await bsCareService.createCareEvent(event)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  return {
    selectedAnimalId, setSelectedAnimalId,
    name, setName,
    type, setType,
    cycle, setCycle,
    dueDate, setDueDate,
    contactName, setContactName,
    contactPhone, setContactPhone,
    notes, setNotes,
    loading,
    animals,
    submit,
    onBack,
  }
}
