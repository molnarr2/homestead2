import { IResult } from '../../../util/Result'
import { Subscribable } from 'rxjs'

export default interface IAuthService {
  readonly currentUserId: string
  readonly currentUserEmail: string
  readonly isLoggedIn: boolean
  readonly isAnonymous: boolean
  readonly loggedIn: Subscribable<boolean>

  createAccount(email: string, password: string): Promise<IResult>
  createAccountAnonymously(): Promise<IResult>
  signin(email: string, password: string): Promise<IResult>
  signout(): void
  sendPasswordResetEmail(email: string): Promise<void>
  deleteAccount(): Promise<IResult>
  reauthenticate(email: string, password: string): Promise<IResult>
  linkUsernamePassword(email: string, password: string): Promise<IResult>
}
