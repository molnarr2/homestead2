import { useState } from 'react'
import { Alert } from 'react-native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import type { RootStackParamList } from '../../../navigation/RootNavigation'
import { useCareStore } from '../../../store/careStore'
import { useAnimalStore } from '../../../store/animalStore'
import { useGroupStore } from '../../../store/groupStore'
import { bsCareService } from '../../../Bootstrap'
import { CareEventType } from '../../../schema/care/CareEvent'
import { dateToTstamp, tstampToDateOrNow } from '../../../schema/type/Tstamp'
import { format } from 'date-fns'

type Navigation = NativeStackNavigationProp<RootStackParamList, 'EditCareEvent'>
type Route = RouteProp<RootStackParamList, 'EditCareEvent'>

export function useEditCareEventController(navigation: Navigation, route: Route) {
  const { eventId } = route.params
  const event = useCareStore(s => s.careEvents.find(e => e.id === eventId))
  const { animals } = useAnimalStore()
  const { groups, groupCareEvents } = useGroupStore()

  const dueDateStr = event ? format(tstampToDateOrNow(event.dueDate), 'yyyy-MM-dd') : ''

  const [name, setName] = useState(event?.name ?? '')
  const [type, setType] = useState<CareEventType>(event?.type ?? 'careSingle')
  const [cycle, setCycle] = useState(event?.cycle ?? 0)
  const [dueDate, setDueDate] = useState(dueDateStr)
  const [contactName, setContactName] = useState(event?.contactName ?? '')
  const [contactPhone, setContactPhone] = useState(event?.contactPhone ?? '')
  const [notes, setNotes] = useState(event?.notes ?? '')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!event) return
    if (!name.trim() || !dueDate) {
      Alert.alert('Required', 'Please enter an event name and set a due date.')
      return
    }

    setLoading(true)
    const updated = {
      ...event,
      name: name.trim(),
      type,
      cycle: type === 'careRecurring' ? cycle : 0,
      dueDate: dateToTstamp(dueDate ? new Date(dueDate) : new Date()),
      contactName,
      contactPhone,
      notes,
    }

    const result = await bsCareService.updateCareEvent(updated)
    setLoading(false)
    if (result.success) {
      navigation.goBack()
    } else {
      Alert.alert('Error', result.error)
    }
  }

  const onBack = () => navigation.goBack()

  const selectedAnimal = animals.find(a => a.id === event?.animalId) ?? null
  const selectedGroup = (() => {
    if (!event) return null
    for (const [groupId, events] of Object.entries(groupCareEvents)) {
      if (events.some(e => e.id === event.id)) {
        return groups.find(g => g.id === groupId) ?? null
      }
    }
    return null
  })()

  return {
    event,
    selectedAnimal,
    selectedGroup,
    name, setName,
    type, setType,
    cycle, setCycle,
    dueDate, setDueDate,
    contactName, setContactName,
    contactPhone, setContactPhone,
    notes, setNotes,
    loading,
    submit,
    onBack,
  }
}
