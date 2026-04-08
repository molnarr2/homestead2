import { Subscribable } from "rxjs";
import {IResult} from "../../util/Result.ts";

export default interface ICloudPlatformAuth {
    readonly currentUserId: string
    readonly isAnonymous: boolean
    readonly isLoggedIn: boolean
    readonly loggedIn: Subscribable<boolean>

    createUserWithEmailAndPassword(email: string, password: string): Promise<IResult>
    createAccountAnonymously(): Promise<IResult>

    signInWithEmailAndPassword(email: string, password: string): Promise<IResult>

    waitUntilAuthenticated(): Promise<boolean>

    signOut(): void

    sendPasswordResetEmail(email: string): Promise<void>

    deleteAuthAccount(): Promise<void>

    reauthenticate(email: string, password: string): Promise<IResult>

    linkUsernamePassword(email: string, password: string): Promise<IResult>
}
