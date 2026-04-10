import { IResult } from '../../../util/Result'
import ProductionLog from '../../../schema/production/ProductionLog'

export default interface IProductionService {
  getProductionLogs(): Promise<ProductionLog[]>
  getProductionLogsForAnimal(animalId: string): Promise<ProductionLog[]>
  createProductionLog(log: ProductionLog): Promise<IResult>
  updateProductionLog(log: ProductionLog): Promise<IResult>
  deleteProductionLog(id: string): Promise<IResult>
}
