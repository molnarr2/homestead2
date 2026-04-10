import { IResult } from '../../../util/Result'
import User from '../../../schema/user/User'

export default interface IUserService {
  subscribeUser(userId: string, callback: (user: User | null) => void): () => void
  getUser(userId: string): Promise<User | null>
  createUser(user: User): Promise<IResult>
  updateUser(user: User): Promise<IResult>
  uploadAvatar(userId: string, uri: string): Promise<{ url: string, ref: string } | null>
  setActiveHomestead(userId: string, homesteadId: string): Promise<IResult>
}
