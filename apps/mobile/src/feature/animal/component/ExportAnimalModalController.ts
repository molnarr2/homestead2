import { useState, useCallback } from 'react'
import { useAnimalStore } from '../../../store/animalStore'
import { useCareStore } from '../../../store/careStore'
import { useHealthStore } from '../../../store/healthStore'
import { useBreedingStore } from '../../../store/breedingStore'
import { useNoteStore } from '../../../store/noteStore'
import { useWeightStore } from '../../../store/weightStore'
import { useGroupStore } from '../../../store/groupStore'
import { useProductionStore } from '../../../store/productionStore'
import { useHomesteadStore } from '../../../store/homesteadStore'
import { calculateAnimalAge } from '../../../util/AnimalUtility'
import { getActiveWithdrawals } from '../../../util/WithdrawalUtility'
import { bsExportService } from '../../../Bootstrap'
import type Animal from '../../../schema/animal/Animal'

export function useExportAnimalModalController(animal: Animal | undefined) {
  const [loading, setLoading] = useState(false)

  const { animals } = useAnimalStore()
  const { careEvents } = useCareStore()
  const healthRecords = useHealthStore(s => s.healthRecords)
  const { breedingRecords } = useBreedingStore()
  const notes = useNoteStore(s => s.notes)
  const weightLogs = useWeightStore(s => s.weightLogs)
  const { groups } = useGroupStore()
  const productionLogs = useProductionStore(s => s.productionLogs)
  const homestead = useHomesteadStore(s => s.homestead)

  const buildData = useCallback(() => {
    if (!animal) return null
    const animalId = animal.id
    const animalHealthRecords = healthRecords.filter(r => r.animalId === animalId)
    return {
      animal,
      age: calculateAnimalAge(animal.birthday),
      homesteadName: homestead?.name ?? '',
      healthRecords: animalHealthRecords,
      careEvents: careEvents.filter(e => e.animalId === animalId),
      breedingRecords: breedingRecords.filter(r => r.animalId === animalId),
      productionLogs: productionLogs.filter(l => l.animalId === animalId),
      weightLogs: weightLogs.filter(w => w.animalId === animalId),
      notes: notes.filter(n => n.animalId === animalId),
      activeWithdrawals: getActiveWithdrawals(animalHealthRecords),
      animals,
      groups: groups.filter(g => g.animalIds.includes(animalId)),
    }
  }, [animal, animals, careEvents, healthRecords, breedingRecords, notes, weightLogs, groups, productionLogs, homestead])

  const runExport = useCallback(async (exportFn: (data: NonNullable<ReturnType<typeof buildData>>) => Promise<unknown>) => {
    const data = buildData()
    if (!data) return
    setLoading(true)
    try {
      await exportFn(data)
    } finally {
      setLoading(false)
    }
  }, [buildData])

  const onExportComplete = useCallback(
    () => runExport(data => bsExportService.exportCompleteRecord(data)),
    [runExport],
  )

  const onExportHealthCare = useCallback(
    () => runExport(data => bsExportService.exportHealthCareSummary(data)),
    [runExport],
  )

  const onExportBreedingLineage = useCallback(
    () => runExport(data => bsExportService.exportBreedingLineageReport(data)),
    [runExport],
  )

  return {
    loading,
    onExportComplete,
    onExportHealthCare,
    onExportBreedingLineage,
  }
}
