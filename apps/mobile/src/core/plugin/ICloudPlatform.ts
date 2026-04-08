import {IResult} from "../../util/Result.ts";
import {CloudDocumentData, SchemaType} from "../../schema/SchemaDefinition.ts";

export type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '>'
  | '>='
  | '!='
  | 'array-contains'
  | 'array-contains-any'
  | 'in'
  | 'not-in'

export type OrderByDirection = 'asc' | 'desc'

export interface IWhereClause {
    field: string
    opStr: WhereFilterOp
    value: any
}

export interface ISortClause {
    field: string
    direction: OrderByDirection
}

export default interface ICloudPlatform {
    getUserId(): string

    getDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[]): Promise<T>
    setDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[], data: T, batchId?: string): Promise<IResult>
    updateDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[], obj: {}, batchId?: string): Promise<IResult>
    collection<T extends CloudDocumentData>(schema: SchemaType, ids: string[], where?: IWhereClause, sort?: ISortClause, limit?: number): Promise<T[]>
    collectionCount(schema: SchemaType, ids: string[], where?: IWhereClause): Promise<number>
    collectionGroup<T extends CloudDocumentData>(schema: SchemaType, where?: IWhereClause[], sort?: ISortClause, limit?: number): Promise<T[]>
    deleteDoc<T extends CloudDocumentData>(schema: SchemaType, ids: string[], batchId?: string): Promise<IResult>
    incrementField<T extends CloudDocumentData>(schema: SchemaType, ids: string[], fieldName: string, increment: number, batchId?: string): Promise<IResult>
    arrayUnionField<T extends CloudDocumentData>(schema: SchemaType, ids: string[], fieldName: string, elements: any[], batchId?: string): Promise<IResult>

    startBatch(): string    // returns an ID for a batch
    commitBatch(batchId: string): Promise<IResult>
}
