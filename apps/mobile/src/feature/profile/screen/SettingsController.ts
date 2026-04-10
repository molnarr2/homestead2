import { useState, useEffect } from 'react'
import { createMMKV } from 'react-native-mmkv'

const settingsStorage = createMMKV()

const SETTINGS_KEYS = {
  notificationsEnabled: 'settings-notifications-enabled',
  weightUnit: 'settings-weight-unit',
  milkUnit: 'settings-milk-unit',
}

export function useSettingsController() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>('lbs')
  const [milkUnit, setMilkUnit] = useState<'gallons' | 'liters'>('gallons')

  useEffect(() => {
    const storedNotif = settingsStorage.getBoolean(SETTINGS_KEYS.notificationsEnabled)
    if (storedNotif !== undefined) setNotificationsEnabled(storedNotif)

    const storedWeight = settingsStorage.getString(SETTINGS_KEYS.weightUnit)
    if (storedWeight === 'lbs' || storedWeight === 'kg') setWeightUnit(storedWeight)

    const storedMilk = settingsStorage.getString(SETTINGS_KEYS.milkUnit)
    if (storedMilk === 'gallons' || storedMilk === 'liters') setMilkUnit(storedMilk)
  }, [])

  const onToggleNotifications = (value: boolean) => {
    setNotificationsEnabled(value)
    settingsStorage.set(SETTINGS_KEYS.notificationsEnabled, value)
  }

  const onChangeWeightUnit = (value: 'lbs' | 'kg') => {
    setWeightUnit(value)
    settingsStorage.set(SETTINGS_KEYS.weightUnit, value)
  }

  const onChangeMilkUnit = (value: 'gallons' | 'liters') => {
    setMilkUnit(value)
    settingsStorage.set(SETTINGS_KEYS.milkUnit, value)
  }

  return {
    notificationsEnabled, onToggleNotifications,
    weightUnit, onChangeWeightUnit,
    milkUnit, onChangeMilkUnit,
  }
}
