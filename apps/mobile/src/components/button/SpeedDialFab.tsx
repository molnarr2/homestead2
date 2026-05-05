import React, { useState, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Animated, Pressable, StyleSheet } from 'react-native'
import Icon from '@react-native-vector-icons/material-design-icons'

export interface SpeedDialAction {
  label: string
  icon: React.ComponentProps<typeof Icon>['name']
  onPress: () => void
}

interface Props {
  actions: SpeedDialAction[]
}

const MAIN_SIZE = 56
const ACTION_SIZE = 46
const EDGE_MARGIN = 24
const ACTION_RIGHT = EDGE_MARGIN + (MAIN_SIZE - ACTION_SIZE) / 2
const ROW_SPACING = 62

const SpeedDialFab: React.FC<Props> = ({ actions }) => {
  const [open, setOpen] = useState(false)
  const animation = useRef(new Animated.Value(0)).current
  const rotateAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animation, {
        toValue: open ? 1 : 0,
        useNativeDriver: true,
        friction: 6,
        tension: 60,
      }),
      Animated.timing(rotateAnimation, {
        toValue: open ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start()
  }, [open])

  const rotate = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  })

  const backdropOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  })

  const handleAction = (action: SpeedDialAction) => {
    setOpen(false)
    action.onPress()
  }

  return (
    <>
      {open && (
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: backdropOpacity, backgroundColor: 'rgba(0,0,0,0.3)' }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
        </Animated.View>
      )}

      {actions.map((action, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(ROW_SPACING * (index + 1))],
        })
        const opacity = animation.interpolate({
          inputRange: [0, 0.4, 1],
          outputRange: [0, 0, 1],
        })
        const scale = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        })

        return (
          <Animated.View
            key={action.label}
            pointerEvents={open ? 'auto' : 'none'}
            style={{
              position: 'absolute',
              bottom: EDGE_MARGIN + 16,
              right: ACTION_RIGHT,
              transform: [{ translateY }, { scale }],
              opacity,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              className="bg-surface px-3 py-1.5 rounded-lg mr-3 shadow-sm border border-border-light"
              onPress={() => handleAction(action)}
              activeOpacity={0.7}
            >
              <Text className="text-sm font-medium text-text-primary">{action.label}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ width: ACTION_SIZE, height: ACTION_SIZE, borderRadius: ACTION_SIZE / 2 }}
              className="bg-surface items-center justify-center shadow-md border border-border-light"
              onPress={() => handleAction(action)}
              activeOpacity={0.7}
            >
              <Icon name={action.icon} size={22} color="#4A6741" />
            </TouchableOpacity>
          </Animated.View>
        )
      })}

      <View style={{ position: 'absolute', bottom: EDGE_MARGIN, right: EDGE_MARGIN }}>
        <TouchableOpacity
          style={{ width: MAIN_SIZE, height: MAIN_SIZE, borderRadius: MAIN_SIZE / 2 }}
          className="bg-primary items-center justify-center shadow-lg"
          onPress={() => setOpen(!open)}
          activeOpacity={0.7}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon name="plus" size={28} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </>
  )
}

export default SpeedDialFab
