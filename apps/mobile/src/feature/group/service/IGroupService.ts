import { IResult } from '../../../util/Result'
import AnimalGroup from '../../../schema/animalGroup/AnimalGroup'
import CareEvent from '../../../schema/care/CareEvent'
import HealthRecord from '../../../schema/health/HealthRecord'

export default interface IGroupService {
  subscribeGroups(callback: (groups: AnimalGroup[]) => void): () => void
  subscribeGroupCareEvents(groupId: string, callback: (events: CareEvent[]) => void): () => void
  subscribeGroupHealthRecords(groupId: string, callback: (records: HealthRecord[]) => void): () => void
  createGroup(group: AnimalGroup, photoUri?: string): Promise<IResult>
  updateGroup(group: AnimalGroup, photoUri?: string): Promise<IResult>
  deleteGroup(groupId: string): Promise<IResult>
  createGroupCareEvent(groupId: string, event: CareEvent): Promise<IResult>
  updateGroupCareEvent(groupId: string, event: CareEvent): Promise<IResult>
  completeGroupCareEvent(groupId: string, event: CareEvent): Promise<IResult>
  deleteGroupCareEvent(groupId: string, eventId: string): Promise<IResult>
  createGroupHealthRecord(groupId: string, record: HealthRecord, photoUri?: string): Promise<IResult>
  updateGroupHealthRecord(groupId: string, record: HealthRecord, photoUri?: string): Promise<IResult>
  removeAnimalFromAllGroups(animalId: string): Promise<IResult>
}
