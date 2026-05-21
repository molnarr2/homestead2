import AnalyticsEvent from './AnalyticsEvent'

export type UserStage = 'new_user' | 'activated' | 'engaged' | 'retained' | 'power'
export type ActiveStatus = 'active' | 'at_risk' | 'churned'
export type EngagementLevel = 'new' | 'none' | 'low' | 'medium' | 'high'

export default interface IAnalyticsService {
  logAction(event: AnalyticsEvent): void
  onboardingCompleted(): void
  clearAnalytics(): void
  onFeedbackTrigger(callback: () => void): void
  onReviewTrigger(callback: () => void): void
  getTotalCoreEventCount(): number
}
