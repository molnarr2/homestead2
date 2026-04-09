import auth, { firebase } from "@react-native-firebase/auth";
import { BehaviorSubject, Subject, Subscribable } from "rxjs";
import { createMMKV } from "react-native-mmkv";
import { ErrorResult, IResult, SuccessResult } from "../../../util/Result";
import Log from "../../log/Log.ts";

const LOGGED_IN_KEY: string = "auth-logged-in";

export interface IFirebaseAuth {
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

export default class FirebaseAuth implements IFirebaseAuth {
    private storage = createMMKV();

    loggedInSubject: Subject<boolean>;
    loggedIn: Subscribable<boolean>;
    isLoggedIn: boolean = false;

    constructor() {
        this.isLoggedIn = this.storage.getBoolean(LOGGED_IN_KEY) ?? false;
        this.loggedInSubject = new BehaviorSubject<boolean>(this.isLoggedIn);
        this.loggedIn = this.loggedInSubject;

        auth().onAuthStateChanged(user => {
            this.isLoggedIn = user !== null;
            this.storage.set(LOGGED_IN_KEY, this.isLoggedIn);
            this.loggedInSubject.next(this.isLoggedIn);
        });
    }

    get currentUserId(): string {
        const user = auth().currentUser;
        if (user != null) {
            return user.uid;
        } else {
            return "";
        }
    }

    get isAnonymous(): boolean {
        const user = auth().currentUser;
        if (user != null) {
            return user.isAnonymous;
        } else {
            return false;
        }
    }

    async createUserWithEmailAndPassword(email: string, password: string): Promise<IResult> {
        try {
            await auth().createUserWithEmailAndPassword(email, password);
            return SuccessResult;
        } catch (error: any) {
            let errorMessage = "Unknown error";
            if (typeof error === "string") {
                errorMessage = error.toUpperCase();
            } else {
                // Must be done this way...NativeFirebaseError
                if (error.code === "auth/email-already-in-use") {
                    errorMessage = "Email already in use";
                } else if (error.code === "auth/invalid-email") {
                    errorMessage = "Invalid email";
                } else if (error.code === "auth/operation-not-allowed") {
                    errorMessage = "Operation not allowed";
                } else if (error.code === "auth/weak-password") {
                    errorMessage = "Weak password make sure it is atleast 8 characters long";
                } else {
                    errorMessage = "Unable to create user. " + (error?.message || "");
                }
            }

            return ErrorResult(errorMessage);
        }
    }

    async createAccountAnonymously(): Promise<IResult> {
        try {
            await auth().signInAnonymously();
            return SuccessResult;
        } catch (error: any) {
            let errorMessage = "Unknown error";
            if (typeof error === "string") {
                errorMessage = error.toUpperCase();
            } else {
                errorMessage = "Unable to create anonymous account. " + error;
            }

            return ErrorResult(errorMessage);
        }
    }

    async signInWithEmailAndPassword(email: string, password: string): Promise<IResult> {
        try {
            await auth().signInWithEmailAndPassword(email, password);
            return SuccessResult;
        } catch (error: any) {
            return this.processFirebaseError(error)
        }
    }

    async waitUntilAuthenticated(): Promise<boolean> {
        const ready = new Promise((resolve, reject) => {
            const unsubscribe = auth().onAuthStateChanged(user => {
                resolve(true);
                unsubscribe();
            });
            if (this.currentUserId != "") {
                resolve(true);
                unsubscribe();
            }
        });

        await ready;
        return this.currentUserId !== "";
    }

    signOut(): void {
        auth().signOut();
    }

    async sendPasswordResetEmail(email: string): Promise<void> {
        await auth().sendPasswordResetEmail(email);
    }

    async deleteAuthAccount() {
        await auth().currentUser?.delete();
    }

    async reauthenticate(email: string, password: string): Promise<IResult> {
        try {
            const authCredential = firebase.auth.EmailAuthProvider.credential(email, password);
            await auth().currentUser?.reauthenticateWithCredential(authCredential);
        } catch (error: any) {
            return this.processFirebaseError(error)
        }

        return SuccessResult;
    }

    async linkUsernamePassword(email: string, password: string): Promise<IResult> {
        try {
            const authCredential = firebase.auth.EmailAuthProvider.credential(email, password);
            await auth().currentUser?.linkWithCredential(authCredential);
        } catch (error: any) {
            return this.processFirebaseError(error)
        }

        return SuccessResult;
    }

    private processFirebaseError(error: any): IResult {
        Log.error("FirebaseAuth", "Firebase error: " + error)
        let errorMessage = "Unknown error";
        if (typeof error === "string") {
            errorMessage = error.toUpperCase();
        } else if (error.code) {
            // Must be done this way...NativeFirebaseError
            if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email";
            } else if (error.code === "auth/wrong-password") {
                errorMessage = "Wrong password";
            } else if (error.code === "auth/user-mismatch") {
                errorMessage = "Credentials are for wrong user";
            } else if (error.code === "auth/user-not-found") {
                errorMessage = "wrong password / email";
            } else if (error.code === "auth/provider-already-linked") {
                errorMessage = "user already has username linked";
            } else if (error.code === "auth/invalid-credential") {
                errorMessage = "invalid credential";
            } else if (error.code === "auth/credential-already-in-use") {
                errorMessage = "credential already in use";
            } else if (error.code === "auth/email-already-in-use") {
                errorMessage = "email already in use";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "password is too weak, make sure to use letters, numbers, and at least 8 characters long";
            } else {
                errorMessage = "Wrong username or password";
            }
        }

        return ErrorResult(errorMessage);
    }
}
