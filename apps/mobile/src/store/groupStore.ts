import { create } from 'zustand'
import AnimalGroup from '../schema/animalGroup/AnimalGroup'
import CareEvent from '../schema/care/CareEvent'
import HealthRecord from '../schema/health/HealthRecord'
import { bsGroupService } from '../Bootstrap'

interface GroupState {
  groups: AnimalGroup[]
  groupCareEvents: Record<string, CareEvent[]>
  groupHealthRecords: Record<string, HealthRecord[]>
  loading: boolean
  unsubscribeGroups: (() => void) | null
  eventUnsubscribers: Record<string, () => void>
  healthUnsubscribers: Record<string, () => void>
  subscribe: () => void
  teardown: () => void
  clear: () => void
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  groupCareEvents: {},
  groupHealthRecords: {},
  loading: true,
  unsubscribeGroups: null,
  eventUnsubscribers: {},
  healthUnsubscribers: {},

  subscribe: () => {
    get().teardown()
    set({ loading: true })

    const unsub = bsGroupService.subscribeGroups((groups) => {
      const prevGroups = get().groups
      set({ groups, loading: false })

      const prevIds = new Set(prevGroups.map(g => g.id))
      const currentIds = new Set(groups.map(g => g.id))

      const eventUnsubs = { ...get().eventUnsubscribers }
      const healthUnsubs = { ...get().healthUnsubscribers }

      for (const id of prevIds) {
        if (!currentIds.has(id)) {
          eventUnsubs[id]?.()
          delete eventUnsubs[id]
          healthUnsubs[id]?.()
          delete healthUnsubs[id]
          set(state => {
            const newCare = { ...state.groupCareEvents }
            delete newCare[id]
            const newHealth = { ...state.groupHealthRecords }
            delete newHealth[id]
            return { groupCareEvents: newCare, groupHealthRecords: newHealth }
          })
        }
      }

      for (const group of groups) {
        if (!eventUnsubs[group.id]) {
          eventUnsubs[group.id] = bsGroupService.subscribeGroupCareEvents(group.id, (events) => {
            set(state => ({
              groupCareEvents: { ...state.groupCareEvents, [group.id]: events },
            }))
          })
        }
        if (!healthUnsubs[group.id]) {
          healthUnsubs[group.id] = bsGroupService.subscribeGroupHealthRecords(group.id, (records) => {
            set(state => ({
              groupHealthRecords: { ...state.groupHealthRecords, [group.id]: records },
            }))
          })
        }
      }

      set({ eventUnsubscribers: eventUnsubs, healthUnsubscribers: healthUnsubs })
    })

    set({ unsubscribeGroups: unsub })
  },

  teardown: () => {
    const { unsubscribeGroups, eventUnsubscribers, healthUnsubscribers } = get()
    if (unsubscribeGroups) unsubscribeGroups()
    Object.values(eventUnsubscribers).forEach(fn => fn())
    Object.values(healthUnsubscribers).forEach(fn => fn())
    set({ unsubscribeGroups: null, eventUnsubscribers: {}, healthUnsubscribers: {} })
  },

  clear: () => {
    get().teardown()
    set({
      groups: [],
      groupCareEvents: {},
      groupHealthRecords: {},
      loading: true,
      unsubscribeGroups: null,
      eventUnsubscribers: {},
      healthUnsubscribers: {},
    })
  },
}))
