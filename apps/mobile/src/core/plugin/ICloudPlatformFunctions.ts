import Person from "../../schema/ministry/Person.ts"

export default interface ICloudPlatformFunctions {
  /**
   * Configures the cloud functions to use a local emulator for development.
   * This should be called before any other cloud function calls in development mode.
   */
  useEmulator(): void

  /**
   * Creates a new ministry document and assigns the current user an admin role for that ministry.
   * This is typically called during the onboarding process after a user account is created.
   * @returns The ID of the newly created ministry
   */
  createMinistryAndAdminRole(): Promise<string>

  /**
   * Retrieves persons that have been updated since the specified timestamp.
   * @param lastUpdatedEpochSeconds The epoch timestamp in seconds to filter persons by last update time
   * @returns A main of Person objects that have been updated since the specified time
   */
  getPersons(lastUpdatedEpochSeconds: number): Promise<Person[]>

  /**
   * Increments the praise god count for a specific praise report.
   * Uses Firebase's atomic increment to ensure thread-safe updates.
   * @param ministryId The ID of the ministry containing the praise report
   * @param praiseReportId The ID of the praise report to increment
   */
  incrementPraiseGodCount(ministryId: string, praiseReportId: string): Promise<void>

  /**
   * Approves a request to join a ministry by creating a member role and deleting the request.
   * This requires admin access and is executed server-side.
   * @param ministryId The ID of the ministry
   * @param requestId The ID of the request to join
   */
  approveRequestToJoin(ministryId: string, requestId: string): Promise<void>
}
