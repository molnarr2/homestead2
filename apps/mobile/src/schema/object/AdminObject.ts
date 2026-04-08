import {Tstamp, tstampServerTime} from '../type/Tstamp';

export default interface AdminObject {
  deleted: boolean
  updated_at: Tstamp
  created_at: Tstamp
}

export function adminObject_default(): AdminObject {
  return {
    deleted: false,
    updated_at: tstampServerTime(),
    created_at: tstampServerTime(),
  }
}

/**
 * Updates the updated_at timestamp of an AdminObject to the current server time.
 * @param adminObj The AdminObject to update
 * @returns The updated AdminObject
 */
export function adminObject_updateLastUpdated(adminObj: AdminObject): AdminObject {
  adminObj.updated_at = tstampServerTime()
  return adminObj
}
