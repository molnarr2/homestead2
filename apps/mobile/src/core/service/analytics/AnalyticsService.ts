import { format, subDays, differenceInDays } from 'date-fns'
import { MMKV } from 'react-native-mmkv'
import ICloudPlatformAnalytics from '../../plugin/ICloudPlatformAnalytics'
import { IFirebaseAuth } from '../../../library/cloudplatform/firebase/FirebaseAuth'
import IAnalyticsService, { ActiveStatus, EngagementLevel, UserStage } from './IAnalyticsService'
import AnalyticsEvent from './AnalyticsEvent'

interface ActionLogEntry {
  event: string
  timestamp: number
}

const KEY_PREFIX = 'analytics_'
const KEY_ACTION_LOG = `${KEY_PREFIX}action_log`
const KEY_USER_STAGE = `${KEY_PREFIX}user_stage`
const KEY_ACTIVE_STATUS = `${KEY_PREFIX}active_status`
const KEY_ENGAGEMENT_LEVEL = `${KEY_PREFIX}engagement_level`
const KEY_DAYS_ACTIVE = `${KEY_PREFIX}days_active`
const KEY_VISIT_COUNT = `${KEY_PREFIX}visit_count`
const KEY_FIRST_SEEN = `${KEY_PREFIX}first_seen`

const DAYS_ACTIVE_MILESTONES = [1, 2, 3, 5, 7, 10, 15, 20, 25, 50, 100]

const USER_PROPERTIES = ['user_stage', 'active_status', 'engagement_level', 'days_active', 'visit_count', 'last_visit_date']

function eventCountKey(event: AnalyticsEvent): string {
  return `${KEY_PREFIX}event_count_${event}`
}

export default class AnalyticsService implements IAnalyticsService {
  private platform: ICloudPlatformAnalytics
  private storage: MMKV

  constructor(platform: ICloudPlatformAnalytics, firebaseAuth: IFirebaseAuth, storage: MMKV) {
    this.platform = platform
    this.storage = storage

    if (!this.storage.getNumber(KEY_FIRST_SEEN)) {
      this.storage.set(KEY_FIRST_SEEN, Date.now())
    }

    firebaseAuth.loggedIn.subscribe({
      next: (loggedIn: boolean) => {
        if (loggedIn) {
          this.platform.setUserId(firebaseAuth.currentUserId)
        } else {
          this.platform.clearUserId()
        }
      },
    })

    platform.appShown.subscribe({
      next: (shown: boolean) => {
        if (shown) {
          this.appShown()
        }
      },
    })
  }

  logAction(event: AnalyticsEvent): void {
    const currentCount = this.storage.getNumber(eventCountKey(event)) ?? 0

    if (event === AnalyticsEvent.add_animal && currentCount === 0) {
      this.platform.logEvent(AnalyticsEvent.add_first_animal)
    }

    const newCount = currentCount + 1
    this.storage.set(eventCountKey(event), newCount)
    this.platform.logEvent(event, { count: newCount })

    this.appendActionLog(event)
    this.recalculateMetrics()
  }

  onboardingCompleted(): void {
    this.setUserStage('activated')
    this.platform.logEvent('activation')
  }

  clearAnalytics(): void {
    const allKeys = this.storage.getAllKeys()
    for (const key of allKeys) {
      if (key.startsWith(KEY_PREFIX)) {
        this.storage.remove(key)
      }
    }
    this.platform.clearUserProperties(USER_PROPERTIES)
  }

  private appShown(): void {
    const visitCount = (this.storage.getNumber(KEY_VISIT_COUNT) ?? 0) + 1
    this.storage.set(KEY_VISIT_COUNT, visitCount)

    const today = format(new Date(), 'yyyy-MM-dd')
    this.storage.set(`${KEY_PREFIX}last_visit_date`, today)

    const daysActiveJson = this.storage.getString(KEY_DAYS_ACTIVE)
    const daysActive: string[] = daysActiveJson ? JSON.parse(daysActiveJson) : []
    if (!daysActive.includes(today)) {
      daysActive.push(today)
      this.storage.set(KEY_DAYS_ACTIVE, JSON.stringify(daysActive))

      const count = daysActive.length
      const isMilestone = DAYS_ACTIVE_MILESTONES.includes(count) || (count > 100 && count % 25 === 0)
      if (isMilestone) {
        this.platform.logEvent('days_active', { count })
      }
    }

    this.platform.setUserProperty('visit_count', String(visitCount))
    this.platform.setUserProperty('last_visit_date', today)
    this.platform.setUserProperty('days_active', String(daysActive.length))

    this.recalculateMetrics()
  }

  private appendActionLog(event: AnalyticsEvent): void {
    const logJson = this.storage.getString(KEY_ACTION_LOG)
    const log: ActionLogEntry[] = logJson ? JSON.parse(logJson) : []
    log.push({ event, timestamp: Date.now() })
    this.storage.set(KEY_ACTION_LOG, JSON.stringify(log))
  }

  private coreActionCountSinceDays(days: number): number {
    const since = subDays(new Date(), days).getTime()
    const logJson = this.storage.getString(KEY_ACTION_LOG)
    if (!logJson) return 0
    const log: ActionLogEntry[] = JSON.parse(logJson)
    return log.filter(entry => entry.timestamp >= since).length
  }

  private coreActionCountBetweenDays(fromDays: number, toDays: number): number {
    const now = new Date()
    const from = subDays(now, fromDays).getTime()
    const to = subDays(now, toDays).getTime()
    const logJson = this.storage.getString(KEY_ACTION_LOG)
    if (!logJson) return 0
    const log: ActionLogEntry[] = JSON.parse(logJson)
    return log.filter(entry => entry.timestamp >= from && entry.timestamp < to).length
  }

  private recalculateMetrics(): void {
    const newEngagement = this.calculateEngagementLevel()
    const currentEngagement = this.storage.getString(KEY_ENGAGEMENT_LEVEL) as EngagementLevel | undefined
    if (newEngagement !== currentEngagement) {
      this.setEngagementLevel(newEngagement)
    }

    const newStage = this.calculateUserStage()
    const currentStage = this.storage.getString(KEY_USER_STAGE) as UserStage | undefined
    if (newStage !== currentStage) {
      this.setUserStage(newStage)
    }

    const newStatus = this.calculateActiveStatus()
    const currentStatus = this.storage.getString(KEY_ACTIVE_STATUS) as ActiveStatus | undefined
    if (newStatus !== currentStatus) {
      this.setActiveStatus(newStatus)
    }
  }

  private calculateEngagementLevel(): EngagementLevel {
    const firstSeen = this.storage.getNumber(KEY_FIRST_SEEN) ?? Date.now()
    const daysSinceFirstSeen = differenceInDays(new Date(), new Date(firstSeen))
    if (daysSinceFirstSeen < 14) return 'new'

    const count = this.coreActionCountSinceDays(14)
    if (count > 20) return 'high'
    if (count > 5) return 'medium'
    if (count > 1) return 'low'
    return 'none'
  }

  private calculateUserStage(): UserStage {
    const currentStage = this.storage.getString(KEY_USER_STAGE) as UserStage | undefined

    if (!currentStage || currentStage === 'new_user') return currentStage ?? 'new_user'
    if (currentStage === 'activated') {
      const totalActions = this.coreActionCountSinceDays(365)
      if (totalActions > 0) return 'engaged'
      return 'activated'
    }

    const week1 = this.coreActionCountBetweenDays(7, 0)
    const week2 = this.coreActionCountBetweenDays(14, 7)
    const week3 = this.coreActionCountBetweenDays(21, 14)
    const hasThreeWeeks = week1 > 0 && week2 > 0 && week3 > 0

    if (currentStage === 'power') {
      const engagement = this.calculateEngagementLevel()
      const mediumOrHigher = engagement === 'medium' || engagement === 'high'
      if (hasThreeWeeks && mediumOrHigher) return 'power'
      return 'retained'
    }

    if (currentStage === 'retained') {
      const engagement = this.calculateEngagementLevel()
      const mediumOrHigher = engagement === 'medium' || engagement === 'high'
      if (hasThreeWeeks && mediumOrHigher) return 'power'
      return 'retained'
    }

    if (currentStage === 'engaged') {
      if (hasThreeWeeks) return 'retained'
      return 'engaged'
    }

    return currentStage
  }

  private calculateActiveStatus(): ActiveStatus {
    const recentCount = this.coreActionCountSinceDays(7)
    if (recentCount > 0) return 'active'
    const threeWeekCount = this.coreActionCountSinceDays(21)
    if (threeWeekCount > 0) return 'at_risk'
    return 'churned'
  }

  private setUserStage(stage: UserStage): void {
    this.storage.set(KEY_USER_STAGE, stage)
    this.platform.setUserProperty('user_stage', stage)
    this.platform.logEvent('user_stage', { stage })
  }

  private setActiveStatus(status: ActiveStatus): void {
    this.storage.set(KEY_ACTIVE_STATUS, status)
    this.platform.setUserProperty('active_status', status)
    this.platform.logEvent('active_status', { status })
  }

  private setEngagementLevel(level: EngagementLevel): void {
    this.storage.set(KEY_ENGAGEMENT_LEVEL, level)
    this.platform.setUserProperty('engagement_level', level)
    this.platform.logEvent('engagement_level', { level })
  }
}
