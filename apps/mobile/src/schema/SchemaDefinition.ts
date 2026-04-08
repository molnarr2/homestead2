// Rules and Concepts:
// * If the id is NOT set for a model it will be auto generated if using a set operation.

// This is the main list of schemas within the app. Add one entry per document type.
export enum SchemaType {
    // User,
    // Feedback,
    // UserDevice,
}

// --------------------------------------------------------------------------------------------------------------------
// Interfaces and exports that everything else depends on for the schema definitions.

export interface SchemaRef<T extends CloudDocumentData> {
    schema: SchemaType
    ids: string[]
    payload: T | null
}

export declare interface CloudDocumentData {
    id: string
    /** A mapping between a field and its value. */
    [field: string]: any
}

// Used to identify when we need the user id but don't know what it is. This is then filled in automatically.
export const USER_ID_REF = "#USERIDREF#"

// --------------------------------------------------------------------------------------------------------------------
// EXAMPLE (for LLM reference): how to define a schema-backed document type.
//
// 1. Add an entry to SchemaType above, e.g. `User`.
// 2. Define the document data interface extending CloudDocumentData:
//
//    export interface UserData extends CloudDocumentData {
//        id: string
//        name: string
//        email: string
//    }
//
// 3. Build a SchemaRef when reading/writing:
//
//    const ref: SchemaRef<UserData> = {
//        schema: SchemaType.User,
//        ids: ["abc123"],         // document path ids (parent-to-child order)
//        payload: null,            // set when writing; null when reading
//    }
//
// 4. For nested paths (e.g. user -> device), use multiple ids:
//
//    const deviceRef: SchemaRef<UserDeviceData> = {
//        schema: SchemaType.UserDevice,
//        ids: [USER_ID_REF, "deviceId"],
//        payload: null,
//    }
