import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import AppDialog from './AppDialog'

interface ConfirmDialogProps {
  visible: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  onConfirm,
  onCancel,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
}) => {
  return (
    <AppDialog
      visible={visible}
      onDismiss={onCancel}
      title={title}
      actions={
        <>
          <TouchableOpacity
            className="px-4 py-2 rounded-lg"
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-text-secondary">{cancelLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-lg ${destructive ? 'bg-status-error' : 'bg-primary'}`}
            onPress={onConfirm}
            activeOpacity={0.7}
          >
            <Text className="text-sm font-medium text-text-inverse">{confirmLabel}</Text>
          </TouchableOpacity>
        </>
      }
    >
      <Text className="text-sm text-text-secondary">{message}</Text>
    </AppDialog>
  )
}

export default ConfirmDialog
