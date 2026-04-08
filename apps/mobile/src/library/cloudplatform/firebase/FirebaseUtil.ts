// @ts-ignore
import firestore, { FirebaseFirestoreTypes, DocumentReference, DocumentData, CollectionReference } from '@react-native-firebase/firestore'
import { SchemaType } from '../../../schema/SchemaDefinition'
import { schemaToDocPaths } from './Schema'
import { IWhereClause, ISortClause } from "../../../core/plugin/ICloudPlatform";

// import DocumentReference = FirebaseFirestoreTypes.DocumentReference
//import DocumentData = FirebaseFirestoreTypes.DocumentData
//import CollectionReference = FirebaseFirestoreTypes.CollectionReference

export function firebaseDoc(schema: SchemaType, ids: string[]): DocumentReference<DocumentData> {

    const paths = schemaToFirebasePaths(schema, ids, false)
    const path = paths.join("/")
    return firestore().doc(path)
}

export function firebaseCollection(schema: SchemaType, ids: string[], where?: IWhereClause, sort?: ISortClause, limit?: number): CollectionReference<DocumentData> {
    const paths = schemaToFirebasePaths(schema, ids, true)
    const path = paths.join("/")

    let ref: any = firestore().collection(path)
    
    if (where && where.field !== "") {
        // Use FieldPath.documentId() when querying by document ID
        const fieldPath = where.field === "id" ? firestore.FieldPath.documentId() : where.field
        ref = ref.where(fieldPath, where.opStr, where.value)
    }
    
    if (sort) {
        ref = ref.orderBy(sort.field, sort.direction)
    }
    
    if (limit) {
        ref = ref.limit(limit)
    }
    
    return ref
}

export function firebaseCollectionGroup(schema: SchemaType, where: IWhereClause[], sort?: ISortClause, limit?: number): CollectionReference<DocumentData> {
    const docPaths = schemaToDocPaths(schema)
    const lastPath = docPaths[docPaths.length-1]

    let ref: any = firestore().collectionGroup(lastPath)
    for (let i=0; i < where.length; i++) {
        // Use FieldPath.documentId() when querying by document ID
        const fieldPath = where[i].field === "id" ? firestore.FieldPath.documentId() : where[i].field
        ref = ref.where(fieldPath, where[i].opStr, where[i].value)
    }
    
    if (sort) {
        ref = ref.orderBy(sort.field, sort.direction)
    }
    
    if (limit) {
        ref = ref.limit(limit)
    }
    
    return ref
}

function schemaToFirebasePaths(schema: SchemaType, ids: string[], subcollectionRef: boolean): string[] {
    const docPaths = schemaToDocPaths(schema)
    var requiredIds = docPaths.length
    if (subcollectionRef) {
        requiredIds--
    }

    if (ids.length < requiredIds) {
        throw new Error("schema: " + schema + " requires more ids. required=" + requiredIds + " actual=" + ids.length)
    }

    var firebasePaths: string[] = []
    for (var i=0; i < docPaths.length; i++) {
        firebasePaths.push(docPaths[i])
        if (i < requiredIds) {
            firebasePaths.push(ids[i])
        }
    }

    return firebasePaths
}
