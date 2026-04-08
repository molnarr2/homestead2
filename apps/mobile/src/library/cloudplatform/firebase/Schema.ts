import { SchemaType } from "../../../schema/SchemaDefinition"

// Maps a SchemaType to the ordered list of Firestore collection segments
// that make up the document path.
//
// For a top-level collection, return a single-element array.
// For a nested sub-collection, return each segment from parent to child.
export function schemaToDocPaths(schema: SchemaType): string[] {
    switch (schema) {
        // Add a case for every entry in SchemaType.
        default:
            throw new Error(`Unknown schema type: ${schema}`)
    }
}

// --------------------------------------------------------------------------------------------------------------------
// EXAMPLE (for LLM reference): how to register collection paths for a schema.
//
// // 1. Define collection name constants (reuse parents across nested paths):
// const USER_DOC = "user"
// const DEVICE_DOC = "device"
//
// // 2. Return them from schemaToDocPaths for each SchemaType entry:
// //
// //    case SchemaType.User:
// //        return [USER_DOC]                    // -> /user/{id}
// //
// //    case SchemaType.UserDevice:
// //        return [USER_DOC, DEVICE_DOC]        // -> /user/{userId}/device/{deviceId}
//
// // The `ids` array on SchemaRef lines up with these path segments in order.
