import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { parseISO, subDays, isSameDay } from 'date-fns'
import ProductionLog from '../../../schema/production/ProductionLog'
import { fromIsoString } from '../../../util/DateUtility'

interface Props {
  logs: ProductionLog[]
  days: number
  referenceDate: string
}

const ProductionTrendChart: React.FC<Props> = ({ logs, days, referenceDate }) => {
  const dailyTotals = useMemo(() => {
    const today = fromIsoString(referenceDate)
    const totals: number[] = []

    for (let i = days - 1; i >= 0; i--) {
      const day = subDays(today, i)
      let total = 0
      for (const log of logs) {
        if (isSameDay(parseISO(log.date), day)) {
          total += log.quantity
        }
      }
      totals.push(total)
    }
    return totals
  }, [logs, days, referenceDate])

  const max = Math.max(...dailyTotals, 1)

  return (
    <View className="bg-surface rounded-xl p-4 border border-border-light">
      <Text className="text-sm font-medium text-text-primary mb-3">Last {days} Days</Text>
      <View className="flex-row items-end gap-0.5" style={{ height: 80 }}>
        {dailyTotals.map((value, index) => {
          const heightPercent = (value / max) * 100
          return (
            <View key={index} className="flex-1 items-center justify-end" style={{ height: 80 }}>
              <View
                className={`w-full rounded-t ${value > 0 ? 'bg-primary' : 'bg-border-light'}`}
                style={{ height: Math.max(heightPercent * 0.8, 2) }}
              />
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default ProductionTrendChart
