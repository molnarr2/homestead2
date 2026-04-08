import React from 'react'
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
type ButtonStyle = 'outline' | 'solid'

interface ThemeButtonProps {
  variant: ButtonVariant
  buttonStyle: ButtonStyle
  title: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
}

const solidStyles: Record<ButtonVariant, { bg: string; text: string; indicator: string }> = {
  primary: { bg: 'bg-primary', text: 'text-text-inverse', indicator: '#FFFFFF' },
  secondary: { bg: 'bg-secondary', text: 'text-text-inverse', indicator: '#FFFFFF' },
  tertiary: { bg: 'bg-accent', text: 'text-primary-dark', indicator: '#2D4228' },
}

const outlineStyles: Record<ButtonVariant, { border: string; text: string; indicator: string }> = {
  primary: { border: 'border-primary', text: 'text-primary', indicator: '#4A6741' },
  secondary: { border: 'border-secondary', text: 'text-secondary', indicator: '#8B6F47' },
  tertiary: { border: 'border-accent', text: 'text-accent', indicator: '#D4A847' },
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  variant,
  buttonStyle,
  title,
  onPress,
  disabled,
  loading,
}) => {
  const isDisabled = disabled || loading

  if (buttonStyle === 'solid') {
    const s = solidStyles[variant]
    return (
      <TouchableOpacity
        className={`${s.bg} rounded-xl py-3 px-6 items-center ${isDisabled ? 'opacity-50' : ''}`}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {loading ? (
          <ActivityIndicator color={s.indicator} />
        ) : (
          <Text className={`text-base font-semibold ${s.text}`}>{title}</Text>
        )}
      </TouchableOpacity>
    )
  }

  const s = outlineStyles[variant]
  return (
    <TouchableOpacity
      className={`border ${s.border} rounded-xl py-3 px-6 items-center ${isDisabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={s.indicator} />
      ) : (
        <Text className={`text-base font-semibold ${s.text}`}>{title}</Text>
      )}
    </TouchableOpacity>
  )
}

export default ThemeButton
