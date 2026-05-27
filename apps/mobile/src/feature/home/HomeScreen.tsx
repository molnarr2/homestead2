import React from 'react'
import { ScrollView, View, Text, Image, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useHomeController } from './HomeController'
import OverdueCareSection from './component/OverdueCareSection'
import DueTodaySection from './component/DueTodaySection'
import WithdrawalAlertSection from './component/WithdrawalAlertSection'
import BreedingCountdownSection from './component/BreedingCountdownSection'
import FarmSummarySection from './component/FarmSummarySection'
import UpcomingEventsSection from './component/UpcomingEventsSection'
import ScreenContainer from '../../components/layout/ScreenContainer'

const HomeScreen: React.FC = () => {
  const navigation = useNavigation()
  const controller = useHomeController(navigation)

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-4 pb-2 flex-row items-center">
          <TouchableOpacity onPress={controller.onOpenDrawer} className="mr-3">
            {controller.user?.avatarUrl ? (
              <Image
                source={{ uri: controller.user.avatarUrl }}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-primary items-center justify-center">
                <Text className="text-base font-bold text-text-inverse">
                  {controller.user?.firstName?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-text-primary flex-1">
            {controller.greeting}, {controller.user?.firstName ?? ''}
          </Text>
        </View>

        <View className="px-4 pb-4">
          <FarmSummarySection
            items={controller.farmSummary}
            onAnimalTypePress={controller.onAnimalTypePress}
            onAddAnimal={controller.onQuickAddAnimal}
          />

          {controller.overdueEventsTotal > 0 && (
            <OverdueCareSection
              items={controller.overdueEvents}
              totalCount={controller.overdueEventsTotal}
              onEventPress={controller.onCareEventPress}
              onViewMore={controller.onViewOverdue}
            />
          )}

          {controller.dueTodayEventsTotal > 0 && (
            <DueTodaySection
              items={controller.dueTodayEvents}
              totalCount={controller.dueTodayEventsTotal}
              onEventPress={controller.onCareEventPress}
              onViewMore={controller.onViewDueToday}
            />
          )}

          {controller.activeWithdrawalsTotal > 0 && (
            <WithdrawalAlertSection
              withdrawals={controller.activeWithdrawals}
              totalCount={controller.activeWithdrawalsTotal}
              onAnimalPress={controller.onAnimalPress}
              onViewMore={controller.onViewWithdrawals}
            />
          )}

          <UpcomingEventsSection
            items={controller.upcomingEvents}
            totalCount={controller.upcomingEventsTotal}
            onViewMore={controller.onViewUpcoming}
          />

          {controller.breedingCountdownsTotal > 0 && (
            <BreedingCountdownSection
              breedings={controller.breedingCountdowns}
              totalCount={controller.breedingCountdownsTotal}
              onBreedingPress={controller.onBreedingPress}
              onViewMore={controller.onViewBreeding}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}

export default HomeScreen
