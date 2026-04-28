import { IResult } from '../../../util/Result'
import ProductionLog from '../../../schema/production/ProductionLog'

export default interface IProductionService {
  subscribeProductionLogs(callback: (logs: ProductionLog[]) => void): () => void
  createProductionLog(log: ProductionLog): Promise<IResult>
  updateProductionLog(log: ProductionLog): Promise<IResult>
  deleteProductionLog(id: string): Promise<IResult>
}
