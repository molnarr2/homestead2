import { IResult } from '../../../util/Result'

export default interface INotificationService {
  requestPermission(): Promise<boolean>
  registerDevice(userId: string): Promise<IResult>
  unregisterDevice(userId: string): Promise<IResult>
  startTokenRefreshListener(userId: string): void
}
