import React from 'react'
import { ScrollView, View, Text, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useHomeController } from './HomeController'
import OverdueCareSection from './component/OverdueCareSection'
import DueTodaySection from './component/DueTodaySection'
import WithdrawalAlertSection from './component/WithdrawalAlertSection'
import BreedingCountdownSection from './component/BreedingCountdownSection'
import FarmSummarySection from './component/FarmSummarySection'
import ProductionSnapshotSection from './component/ProductionSnapshotSection'
import UpcomingEventsSection from './component/UpcomingEventsSection'
import QuickActionsSection from './component/QuickActionsSection'
import ScreenContainer from '../../components/layout/ScreenContainer'

const HomeScreen: React.FC = () => {
  const navigation = useNavigation()
  const controller = useHomeController(navigation)

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={controller.refreshing} onRefresh={controller.onRefresh} />
        }
      >
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-text-primary">
            {controller.greeting}, {controller.user?.firstName ?? ''}
          </Text>
        </View>

        <View className="px-4 pb-4">
          {controller.overdueEvents.length > 0 && (
            <OverdueCareSection
              items={controller.overdueEvents}
              onEventPress={controller.onCareEventPress}
            />
          )}

          {controller.dueTodayEvents.length > 0 && (
            <DueTodaySection
              items={controller.dueTodayEvents}
              onEventPress={controller.onCareEventPress}
            />
          )}

          {controller.activeWithdrawals.length > 0 && (
            <WithdrawalAlertSection
              withdrawals={controller.activeWithdrawals}
              onAnimalPress={controller.onAnimalPress}
            />
          )}

          {controller.breedingCountdowns.length > 0 && (
            <BreedingCountdownSection
              breedings={controller.breedingCountdowns}
              onBreedingPress={controller.onBreedingPress}
            />
          )}

          <FarmSummarySection
            items={controller.farmSummary}
            onAnimalTypePress={controller.onAnimalTypePress}
            onAddAnimal={controller.onQuickAddAnimal}
          />

          <ProductionSnapshotSection
            items={controller.productionSnapshot}
            onAddProduction={controller.onQuickLogProduction}
          />

          <UpcomingEventsSection
            items={controller.upcomingEvents}
            totalCount={controller.upcomingEventsTotal}
            onViewAll={controller.onQuickRecordCare}
          />

          <QuickActionsSection
            onLogProduction={controller.onQuickLogProduction}
            onAddWeight={controller.onQuickAddWeight}
            onRecordCare={controller.onQuickRecordCare}
            onAddAnimal={controller.onQuickAddAnimal}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default HomeScreen
