import { useState, useCallback } from 'react'

interface DebugControllerState {
  appDialogVisible: boolean
  confirmDialogVisible: boolean
  selectDialogVisible: boolean
  bottomSheetVisible: boolean
  selectedSelectValue: string
  textInputValue: string
  textInputError: string
  searchValue: string
  showAppDialog: () => void
  hideAppDialog: () => void
  showConfirmDialog: () => void
  hideConfirmDialog: () => void
  showSelectDialog: () => void
  hideSelectDialog: () => void
  showBottomSheet: () => void
  hideBottomSheet: () => void
  onSelectItem: (value: string) => void
  onTextInputChange: (text: string) => void
  onSearchChange: (text: string) => void
  onConfirm: () => void
}

const useDebugController = (): DebugControllerState => {
  const [appDialogVisible, setAppDialogVisible] = useState(false)
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false)
  const [selectDialogVisible, setSelectDialogVisible] = useState(false)
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false)
  const [selectedSelectValue, setSelectedSelectValue] = useState('option1')
  const [textInputValue, setTextInputValue] = useState('')
  const [textInputError, setTextInputError] = useState('')
  const [searchValue, setSearchValue] = useState('')

  const showAppDialog = useCallback(() => setAppDialogVisible(true), [])
  const hideAppDialog = useCallback(() => setAppDialogVisible(false), [])

  const showConfirmDialog = useCallback(() => setConfirmDialogVisible(true), [])
  const hideConfirmDialog = useCallback(() => setConfirmDialogVisible(false), [])

  const showSelectDialog = useCallback(() => setSelectDialogVisible(true), [])
  const hideSelectDialog = useCallback(() => setSelectDialogVisible(false), [])

  const showBottomSheet = useCallback(() => setBottomSheetVisible(true), [])
  const hideBottomSheet = useCallback(() => setBottomSheetVisible(false), [])

  const onSelectItem = useCallback((value: string) => {
    setSelectedSelectValue(value)
    setSelectDialogVisible(false)
  }, [])

  const onTextInputChange = useCallback((text: string) => {
    setTextInputValue(text)
    setTextInputError(text.length > 0 && text.length < 3 ? 'Must be at least 3 characters' : '')
  }, [])

  const onSearchChange = useCallback((text: string) => {
    setSearchValue(text)
  }, [])

  const onConfirm = useCallback(() => {
    setConfirmDialogVisible(false)
  }, [])

  return {
    appDialogVisible,
    confirmDialogVisible,
    selectDialogVisible,
    bottomSheetVisible,
    selectedSelectValue,
    textInputValue,
    textInputError,
    searchValue,
    showAppDialog,
    hideAppDialog,
    showConfirmDialog,
    hideConfirmDialog,
    showSelectDialog,
    hideSelectDialog,
    showBottomSheet,
    hideBottomSheet,
    onSelectItem,
    onTextInputChange,
    onSearchChange,
    onConfirm,
  }
}

export default useDebugController
