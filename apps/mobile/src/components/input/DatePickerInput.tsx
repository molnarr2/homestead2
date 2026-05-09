import React, { useState, useCallback } from 'react'
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { format, parseISO } from 'date-fns'
import Icon from '@react-native-vector-icons/material-design-icons'

interface DatePickerInputProps {
  label?: string
  value: string
  onChange: (isoDate: string) => void
  placeholder?: string
}

type PickerTab = 'date' | 'time'

const DatePickerInput: React.FC<DatePickerInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Select date & time',
}) => {
  const [visible, setVisible] = useState(false)
  const [draft, setDraft] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState<PickerTab>('date')

  const displayText = value
    ? format(parseISO(value), 'MMM d, yyyy · h:mm a')
    : ''

  const open = useCallback(() => {
    setDraft(value ? parseISO(value) : new Date())
    setActiveTab('date')
    setVisible(true)
  }, [value])

  const confirm = useCallback(() => {
    onChange(draft.toISOString())
    setVisible(false)
  }, [draft, onChange])

  const clear = useCallback(() => {
    onChange('')
    setVisible(false)
  }, [onChange])

  return (
    <View className="mb-4">
      {label ? (
        <Text className="text-sm font-medium text-text-primary mb-1">{label}</Text>
      ) : null}
      <TouchableOpacity
        className="flex-row items-center border border-border-light rounded-lg px-4 py-3 bg-surface"
        onPress={open}
        activeOpacity={0.7}
      >
        <Icon name="calendar-clock-outline" size={20} color={value ? '#4A6741' : '#BDBDBD'} />
        <Text className={`flex-1 text-base ml-3 ${value ? 'text-primary' : 'text-[#BDBDBD]'}`}>
          {displayText || placeholder}
        </Text>
        {value ? (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); clear() }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="close-circle" size={18} color="#BDBDBD" />
          </TouchableOpacity>
        ) : (
          <Icon name="chevron-down" size={18} color="#BDBDBD" />
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View className="flex-1 bg-black/50 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-background rounded-t-2xl px-6 pt-4 pb-8">
                <View className="w-10 h-1 bg-border-medium rounded-full self-center mb-4" />

                <View className="flex-row items-center justify-between mb-5">
                  <TouchableOpacity onPress={() => setVisible(false)} className="py-1">
                    <Text className="text-base text-text-secondary">Cancel</Text>
                  </TouchableOpacity>
                  <Text className="text-lg font-semibold text-text-primary">
                    {label || 'Select Date & Time'}
                  </Text>
                  <TouchableOpacity onPress={confirm} className="py-1">
                    <Text className="text-base font-semibold text-primary">Done</Text>
                  </TouchableOpacity>
                </View>

                <View className="flex-row bg-backgroundDark rounded-xl p-1 mb-5">
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${activeTab === 'date' ? 'bg-surface' : ''}`}
                    onPress={() => setActiveTab('date')}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="calendar-month-outline"
                      size={18}
                      color={activeTab === 'date' ? '#4A6741' : '#6B6B6B'}
                    />
                    <Text className={`text-sm font-medium ml-2 ${activeTab === 'date' ? 'text-primary' : 'text-text-secondary'}`}>
                      Date
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 flex-row items-center justify-center py-2.5 rounded-lg ${activeTab === 'time' ? 'bg-surface' : ''}`}
                    onPress={() => setActiveTab('time')}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name="clock-outline"
                      size={18}
                      color={activeTab === 'time' ? '#4A6741' : '#6B6B6B'}
                    />
                    <Text className={`text-sm font-medium ml-2 ${activeTab === 'time' ? 'text-primary' : 'text-text-secondary'}`}>
                      Time
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-surface rounded-2xl p-4">
                  <DateTimePicker
                    value={draft}
                    mode={activeTab}
                    display="spinner"
                    onChange={(_, date) => { if (date) setDraft(date) }}
                    style={{ height: 180 }}
                    textColor="#1A1A1A"
                    {...(Platform.OS === 'ios' ? { themeVariant: 'light' as const } : {})}
                  />
                </View>

                <View className="flex-row items-center justify-center mt-4 bg-surface rounded-xl py-3 px-4">
                  <Icon name="calendar-check" size={20} color="#4A6741" />
                  <Text className="text-base font-medium text-primary ml-2">
                    {format(draft, 'EEE, MMM d, yyyy')}
                  </Text>
                  <Text className="text-base text-text-secondary mx-2">at</Text>
                  <Icon name="clock-outline" size={18} color="#4A6741" />
                  <Text className="text-base font-medium text-primary ml-2">
                    {format(draft, 'h:mm a')}
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  )
}

export default DatePickerInput
