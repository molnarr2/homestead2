import AdminObject, { adminObject_default } from '../object/AdminObject'

export type ProductionType = 'eggs' | 'milk' | 'fiber' | 'honey' | 'meat'

export default interface ProductionLog {
  id: string
  admin: AdminObject
  animalId: string
  groupName: string
  productionType: ProductionType
  quantity: number
  unit: string
  date: string
  notes: string
}

export function productionLog_default(): ProductionLog {
  return {
    id: '',
    admin: adminObject_default(),
    animalId: '',
    groupName: '',
    productionType: 'eggs',
    quantity: 0,
    unit: 'count',
    date: '',
    notes: '',
  }
}
