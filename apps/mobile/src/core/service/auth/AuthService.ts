import { IResult } from '../../../util/Result'
import { Subscribable } from 'rxjs'
import { IFirebaseAuth } from '../../../library/cloudplatform/firebase/FirebaseAuth'
import IAuthService from './IAuthService'

export default class AuthService implements IAuthService {
  private auth: IFirebaseAuth

  constructor(auth: IFirebaseAuth) {
    this.auth = auth
  }

  get currentUserId(): string {
    return this.auth.currentUserId
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn
  }

  get isAnonymous(): boolean {
    return this.auth.isAnonymous
  }

  get loggedIn(): Subscribable<boolean> {
    return this.auth.loggedIn
  }

  async createAccount(email: string, password: string): Promise<IResult> {
    return this.auth.createUserWithEmailAndPassword(email, password)
  }

  async createAccountAnonymously(): Promise<IResult> {
    return this.auth.createAccountAnonymously()
  }

  async signin(email: string, password: string): Promise<IResult> {
    return this.auth.signInWithEmailAndPassword(email, password)
  }

  signout(): void {
    this.auth.signOut()
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    return this.auth.sendPasswordResetEmail(email)
  }

  async deleteAuthAccount(): Promise<void> {
    return this.auth.deleteAuthAccount()
  }

  async reauthenticate(email: string, password: string): Promise<IResult> {
    return this.auth.reauthenticate(email, password)
  }

  async linkUsernamePassword(email: string, password: string): Promise<IResult> {
    return this.auth.linkUsernamePassword(email, password)
  }
}
