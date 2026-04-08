import React from 'react'
import { Modal, View, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native'

interface BottomSheetProps {
  visible: boolean
  onDismiss: () => void
  children: React.ReactNode
}

const BottomSheet: React.FC<BottomSheetProps> = ({ visible, onDismiss, children }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={onDismiss}>
        <View className="flex-1 bg-black/50 justify-end">
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              <View className="bg-surface rounded-t-2xl px-6 pt-4 pb-8">
                <View className="w-10 h-1 bg-border-medium rounded-full self-center mb-4" />
                {children}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

export default BottomSheet
