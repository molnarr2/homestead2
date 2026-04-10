import { IResult } from '../../../util/Result'
import Homestead from '../../../schema/homestead/Homestead'
import HomesteadMember from '../../../schema/homestead/HomesteadMember'

export default interface IHomesteadService {
  getHomestead(homesteadId: string): Promise<Homestead | null>
  createHomestead(name: string, ownerUserId: string, ownerDisplayName: string, ownerEmail: string): Promise<string>
  getHomesteadsForUser(userId: string): Promise<Homestead[]>
  getMembers(homesteadId: string): Promise<HomesteadMember[]>
  addMember(homesteadId: string, member: HomesteadMember): Promise<IResult>
}
