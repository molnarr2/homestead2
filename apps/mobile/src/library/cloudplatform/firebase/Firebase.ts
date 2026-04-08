import auth from "@react-native-firebase/auth"
import ICloudPlatform, { IWhereClause, ISortClause } from "../../../core/plugin/ICloudPlatform";
import { CloudDocumentData, SchemaType, USER_ID_REF } from "../../../schema/SchemaDefinition"
import { ErrorResult, IResult, SuccessResult } from "../../../util/Result"
import { firebaseCollection, firebaseCollectionGroup, firebaseDoc } from "./FirebaseUtil";
// @ts-ignore
import firestore, { WriteBatch } from '@react-native-firebase/firestore'
import uuid from 'react-native-uuid'
import Log from '../../log/Log.ts'

export default class Firebase implements ICloudPlatform {

    batches: { [id: string]: WriteBatch } = {}

    getUserId(): string {
        const currentUser = auth().currentUser
        if (currentUser == null) {
            throw new Error("User is not signed in")
        }
        return currentUser.uid
    }

    async setDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[], data: T, batchId: string = ""): Promise<IResult> {
        try {
            const parsedIds = this.parseSchemaIds(ids)
            const docRef = firebaseDoc(schema, parsedIds)
            if (batchId === "") {
                await docRef.set(data)
            } else {
                this.batches[batchId].set(docRef, data)
            }
        } catch (e) {
            Log.error("Firebase", "Unable to set database document: [" + SchemaType[schema] + "] error: " + e)
            return ErrorResult("Unable to set database document: [" + SchemaType[schema] + "]")
        }
        return SuccessResult
    }

    async updateDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[], obj: {}, batchId: string = ""): Promise<IResult> {
        const parsedIds = this.parseSchemaIds(ids)
        const docRef = firebaseDoc(schema, parsedIds)

        if (batchId === "") {
            await docRef.update(obj)
        } else {
            this.batches[batchId].update(docRef, obj)
        }

        return SuccessResult
    }

    async getDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[]): Promise<T> {
        const parsedIds = this.parseSchemaIds(ids)
        const docRef = firebaseDoc(schema, parsedIds)
        const docSnap = await docRef.get()

        try {
            if (docSnap?.exists) {
                return docSnap.data() as T
            } else {
                throw new Error("Unknown document.")
            }
        } catch (ex) {
            Log.error("Firebase", "unable to get docSnap document: " + ex)
            throw new Error("Unable to get docSnap document:  " + schema)
        }
    }

    async collection<T extends CloudDocumentData>(schema: SchemaType, ids: string[], where?: IWhereClause, sort?: ISortClause, limit?: number): Promise<T[]> {
        try {
            const parsedIds = this.parseSchemaIds(ids)
            const collectionRef = firebaseCollection(schema, parsedIds, where, sort, limit)
            const querySnapshot = await collectionRef.get()

            const rows: T[] = []
            querySnapshot.forEach((doc: any) => {
                rows.push(doc.data() as T)
            })

            return rows
        } catch (e: any) {
            const schemaName = SchemaType[schema]
            const whereClause = where?.field ? `WHERE ${where.field} ${where.opStr} ${JSON.stringify(where.value)}` : 'NO WHERE CLAUSE'
            const sortClause = sort ? `ORDER BY ${sort.field} ${sort.direction}` : ''
            const limitClause = limit ? `LIMIT ${limit}` : ''
            
            Log.error("Firebase", `collection query failed for [${schemaName}] IDs: ${JSON.stringify(ids)} Query: ${whereClause} ${sortClause} ${limitClause} Error code: ${e.code || 'UNKNOWN'} Error message: ${e.message || e}`)
            
            // Check if this is an index-related error
            if (e.code === 'failed-precondition' || (e.message && e.message.includes('index'))) {
                Log.error("Firebase", `INDEX REQUIRED: This query requires a composite index on collection [${schemaName}] Create index for field(s): ${where?.field}${sort ? `, ${sort.field}` : ''}`)
                if (e.message && e.message.includes('https://')) {
                    const urlMatch = e.message.match(/(https:\/\/[^\s]+)/)
                    if (urlMatch) {
                        Log.error("Firebase", `Index creation URL: ${urlMatch[1]}`)
                    }
                }
            }
            
            throw e
        }
    }

    async collectionCount(schema: SchemaType, ids: string[], where?: IWhereClause): Promise<number> {
        try {
            const parsedIds = this.parseSchemaIds(ids)
            const collectionRef = firebaseCollection(schema, parsedIds, where)
            const snapshot = await collectionRef.count().get()
            return snapshot.data().count
        } catch (e: any) {
            const schemaName = SchemaType[schema]
            const whereClause = where?.field ? `WHERE ${where.field} ${where.opStr} ${JSON.stringify(where.value)}` : 'NO WHERE CLAUSE'
            Log.error("Firebase", `collectionCount query failed for [${schemaName}] IDs: ${JSON.stringify(ids)} Query: ${whereClause} Error code: ${e.code || 'UNKNOWN'} Error message: ${e.message || e}`)
            throw e
        }
    }

    async collectionGroup<T extends CloudDocumentData>(schema: SchemaType, where: IWhereClause[] = [], sort?: ISortClause, limit?: number): Promise<T[]> {
        try {
            const collectionRef = firebaseCollectionGroup(schema, where, sort, limit)
            const querySnapshot = await collectionRef.get()

            const rows: T[] = []
            querySnapshot.forEach((doc: any) => {
                rows.push(doc.data() as T)
            })

            return rows
        } catch (e: any) {
            const schemaName = SchemaType[schema]
            const whereClauses = where.length > 0 
                ? where.map(w => `${w.field} ${w.opStr} ${JSON.stringify(w.value)}`).join(' AND ')
                : 'NO WHERE CLAUSE'
            const sortClause = sort ? `ORDER BY ${sort.field} ${sort.direction}` : ''
            const limitClause = limit ? `LIMIT ${limit}` : ''
            
            Log.error("Firebase", `collectionGroup query failed for [${schemaName}] Query: WHERE ${whereClauses} ${sortClause} ${limitClause} Error code: ${e.code || 'UNKNOWN'} Error message: ${e.message || e}`)
            
            // Check if this is an index-related error
            if (e.code === 'failed-precondition' || (e.message && e.message.includes('index'))) {
                Log.error("Firebase", `INDEX REQUIRED: This collectionGroup query requires a composite index on [${schemaName}] Create index for field(s): ${where.map(w => w.field).concat(sort ? [sort.field] : []).join(', ')}`)
                if (e.message && e.message.includes('https://')) {
                    const urlMatch = e.message.match(/(https:\/\/[^\s]+)/)
                    if (urlMatch) {
                        Log.error("Firebase", `Index creation URL: ${urlMatch[1]}`)
                    }
                }
            }
            
            throw e
        }
    }

    async deleteDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[], batchId: string = ""): Promise<IResult> {
        try {
            const parsedIds = this.parseSchemaIds(ids)
            const docRef = firebaseDoc(schema, parsedIds)

            if (batchId === "") {
                await docRef.delete()
            } else {
                this.batches[batchId].delete(docRef)
            }

        } catch (e) {
            Log.error("Firebase", "Unable to delete database document: [" + SchemaType[schema] + "] error: " + e)
            return ErrorResult("Unable to delete database document: [" + SchemaType[schema] + "]")
        }
        return SuccessResult
    }

    async incrementField<T extends CloudDocumentData>(schema: SchemaType, ids: string[], fieldName: string, increment: number, batchId: string = ""): Promise<IResult> {
        const increaseBy = firestore.FieldValue.increment(increment)
        return await this.updateDoc(schema, ids, {[fieldName]: increaseBy}, batchId)
    }

    async arrayUnionField<T extends CloudDocumentData>(schema: SchemaType, ids: string[], fieldName: string, elements: any[], batchId: string = ""): Promise<IResult> {
        const arrayUnion = firestore.FieldValue.arrayUnion(...elements)
        return await this.updateDoc(schema, ids, {[fieldName]: arrayUnion}, batchId)
    }

    startBatch(): string {
        const id = uuid.v4() as string
        const batch = firestore().batch()
        this.batches[id] = batch
        return id
    }

    async commitBatch(batchId: string): Promise<IResult> {
        await this.batches[batchId].commit()
        delete this.batches[batchId]
        return SuccessResult
    }

    private parseSchemaIds(ids: string[]): string[] {
        const results: string[] = []
        for (var i = 0; i < ids.length; i++) {
            if (ids[i] === USER_ID_REF) {
                results.push(this.getUserId())
            } else {
                results.push(ids[i])
            }
        }

        return results
    }
}
