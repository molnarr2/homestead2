import React from 'react'
import { Modal, View, Text, TouchableWithoutFeedback } from 'react-native'

interface AppDialogProps {
  visible: boolean
  onDismiss: () => void
  title?: string
  children: React.ReactNode
  actions?: React.ReactNode
}

const AppDialog: React.FC<AppDialogProps> = ({ visible, onDismiss, title, children, actions }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <TouchableWithoutFeedback>
            <View className="bg-surface rounded-2xl w-full max-w-sm p-6">
              {title ? (
                <Text className="text-lg font-semibold text-text-primary mb-4">{title}</Text>
              ) : null}
              <View>{children}</View>
              {actions ? (
                <View className="flex-row justify-end mt-4 gap-3">{actions}</View>
              ) : null}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

export default AppDialog
