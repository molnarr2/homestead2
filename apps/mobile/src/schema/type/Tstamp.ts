import {FirebaseFirestoreTypes, serverTimestamp, Timestamp} from '@react-native-firebase/firestore';
import {FieldValue} from '@react-native-firebase/firestore/lib/modular/FieldValue';
import AdminObject from '../object/AdminObject';
import Log from '../../library/log/Log.ts';

export type Tstamp = FirebaseFirestoreTypes.Timestamp | FieldValue

/// If timestamp is a FieldValue ie set the time to the server's current then would have to return undefined.
export function tstampToDate(tstamp: Tstamp | undefined): Date | undefined {
  if (tstamp === undefined) {
    return undefined
  }

  // Check if it's a malformed timestamp object with _type field
  if (typeof tstamp === 'object' && '_type' in tstamp && (tstamp as any)._type === 'timestamp') {
    return new Date()
  }

  const timestamp = tstamp as FirebaseFirestoreTypes.Timestamp

    // Check if it's a plain object from JSON deserialization
    if (typeof tstamp === 'object' && '_seconds' in tstamp && '_nanoseconds' in tstamp) {
        const reconstructed = new Timestamp((tstamp as any)._seconds, (tstamp as any)._nanoseconds)
        return reconstructed.toDate()
    }

  return timestamp.toDate()
}

export function tstampToDateOrNow(tstamp: Tstamp | undefined): Date {
  if (tstamp === undefined) {
    return new Date()
  }

  // Check if it's a malformed timestamp object with _type field
  if (typeof tstamp === 'object' && '_type' in tstamp && (tstamp as any)._type === 'timestamp') {
    return new Date()
  }

    // Check if it's a plain object from JSON deserialization
    if (typeof tstamp === 'object' && '_seconds' in tstamp && '_nanoseconds' in tstamp) {
        const reconstructed = new Timestamp((tstamp as any)._seconds, (tstamp as any)._nanoseconds)
        return reconstructed.toDate()
    }

    const timestamp = tstamp as FirebaseFirestoreTypes.Timestamp
    return timestamp.toDate()
}

export function tstampServerTime(): Tstamp {
  return serverTimestamp()
}

export function tstampToMilliseconds(tstamp: Tstamp | undefined): number  {
  if (tstamp === undefined) {
    return 0
  }

  // Check if it's a malformed timestamp object with _type field
  if (typeof tstamp === 'object' && '_type' in tstamp && (tstamp as any)._type === 'timestamp') {
    return new Date().getTime()
  }

  // Check if it's a plain object from JSON deserialization
  if (typeof tstamp === 'object' && '_seconds' in tstamp && '_nanoseconds' in tstamp) {
    const reconstructed = new Timestamp((tstamp as any)._seconds, (tstamp as any)._nanoseconds)
    return reconstructed.toMillis()
  }

  const timestamp = tstamp as FirebaseFirestoreTypes.Timestamp

  // Debug: Check if toMillis exists
  if (typeof timestamp.toMillis !== 'function') {
    Log.error('Tstamp', 'tstampToMilliseconds: timestamp.toMillis is not a function! type=' + typeof timestamp + ' keys=' + Object.keys(timestamp).join(','))
    // Try to handle it anyway if it has the expected properties
    if ('_seconds' in timestamp && '_nanoseconds' in timestamp) {
      const reconstructed = new Timestamp((timestamp as any)._seconds, (timestamp as any)._nanoseconds)
      return reconstructed.toMillis()
    }
    return 0
  }

  return timestamp.toMillis()
}

export function dateToTstamp(date: Date): Tstamp {
  return Timestamp.fromDate(date)
}

/**
 * Converts a JSON-serialized timestamp back to a Firebase Timestamp.
 * When Firebase Timestamps are serialized to JSON, they become objects with
 * 'seconds' and 'nanoseconds' properties. This function reconstructs the
 * Firebase Timestamp from that JSON representation.
 *
 * @param jsonTstamp - The JSON object containing seconds and nanoseconds, or undefined
 * @returns A Firebase Timestamp, or undefined if input is undefined
 */
export function jsonToTstamp(jsonTstamp: any): Tstamp | undefined {
  if (jsonTstamp === undefined || jsonTstamp === null) {
    return undefined
  }

  // If it's already a Timestamp, return it as-is
  if (jsonTstamp instanceof Timestamp || typeof jsonTstamp.toDate === 'function') {
    return jsonTstamp as Tstamp
  }

  // Reconstruct from JSON format (seconds and nanoseconds)
  if (typeof jsonTstamp === 'object' && '_seconds' in jsonTstamp && '_nanoseconds' in jsonTstamp) {
    return new Timestamp(jsonTstamp._seconds, jsonTstamp._nanoseconds)
  }

  // If it's a number, treat it as milliseconds
  if (typeof jsonTstamp === 'number') {
    return Timestamp.fromMillis(jsonTstamp)
  }

  // If it's a string, try to parse as date
  if (typeof jsonTstamp === 'string') {
    return Timestamp.fromDate(new Date(jsonTstamp))
  }

  return undefined
}

/**
 * Restores Firebase Timestamps in an AdminObject that was deserialized from JSON.
 * This mutates the input object to convert the timestamp fields from their JSON
 * representation back to proper Firebase Timestamp instances.
 *
 * @param adminObj - The AdminObject with JSON-serialized timestamps
 * @returns The same AdminObject with restored Firebase Timestamps
 */
export function restoreAdminObjectTimestamps(adminObj: AdminObject): AdminObject {
  adminObj.updated_at = jsonToTstamp(adminObj.updated_at) ?? tstampServerTime()
  adminObj.created_at = jsonToTstamp(adminObj.created_at) ?? tstampServerTime()
  return adminObj
}
