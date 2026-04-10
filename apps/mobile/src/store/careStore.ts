import { create } from 'zustand'
import { IResult } from '../util/Result'
import CareEvent from '../schema/care/CareEvent'
import { bsCareService } from '../Bootstrap'
import { tstampToDateOrNow } from '../schema/type/Tstamp'
import { isBefore, isToday, startOfToday } from 'date-fns'

interface CareState {
  careEvents: CareEvent[]
  loading: boolean
  unsubscribe: (() => void) | null
  subscribe: () => void
  teardown: () => void
  createCareEvent: (event: CareEvent) => Promise<IResult>
  completeCareEvent: (eventId: string) => Promise<IResult>
  getOverdueEvents: () => CareEvent[]
  getDueTodayEvents: () => CareEvent[]
  getUpcomingEvents: () => CareEvent[]
  clear: () => void
}

export const useCareStore = create<CareState>((set, get) => ({
  careEvents: [],
  loading: true,
  unsubscribe: null,

  subscribe: () => {
    get().teardown()
    set({ loading: true })
    const unsub = bsCareService.subscribeCareEvents((careEvents) => {
      set({ careEvents, loading: false })
    })
    set({ unsubscribe: unsub })
  },

  teardown: () => {
    const unsub = get().unsubscribe
    if (unsub) unsub()
    set({ unsubscribe: null })
  },

  createCareEvent: (event: CareEvent) => bsCareService.createCareEvent(event),

  completeCareEvent: async (eventId: string) => {
    const event = get().careEvents.find(e => e.id === eventId)
    if (!event) return { success: false, error: 'Care event not found' }
    return bsCareService.completeCareEvent(event)
  },

  getOverdueEvents: () => {
    const today = startOfToday()
    return get().careEvents.filter(e => {
      if (e.completedDate !== null) return false
      const dueDate = tstampToDateOrNow(e.dueDate)
      return isBefore(dueDate, today)
    })
  },

  getDueTodayEvents: () => {
    return get().careEvents.filter(e => {
      if (e.completedDate !== null) return false
      const dueDate = tstampToDateOrNow(e.dueDate)
      return isToday(dueDate)
    })
  },

  getUpcomingEvents: () => {
    const today = startOfToday()
    return get().careEvents.filter(e => {
      if (e.completedDate !== null) return false
      const dueDate = tstampToDateOrNow(e.dueDate)
      return !isBefore(dueDate, today) && !isToday(dueDate)
    })
  },

  clear: () => {
    get().teardown()
    set({ careEvents: [], loading: true, unsubscribe: null })
  },
}))
