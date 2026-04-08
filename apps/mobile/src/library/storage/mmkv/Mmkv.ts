import { createMMKV } from 'react-native-mmkv'
import ILocalStorage from '../../../core/plugin/ILocalStorage'

// Create a single MMKV instance to be reused throughout the app
export const storage = createMMKV()

export default class Mmkv implements ILocalStorage {
    setString(key: string, value: string): void {
        storage.set(key, value)
    }
    setBoolean(key: string, value: boolean): void {
        storage.set(key, value)
    }
    setNumber(key: string, value: number): void {
        storage.set(key, value)
    }
    getString(key: string, defaultValue: string): string {
        const value = storage.getString(key)
        if (value == null) {
            return defaultValue
        }
        return value
    }
    getBoolean(key: string, defaultValue: boolean): boolean {
        const value = storage.getBoolean(key)
        if (value == null) {
            return defaultValue
        }
        return value
    }
    getNumber(key: string, defaultValue: number): number {
        const value = storage.getNumber(key)
        if (value == null) {
            return defaultValue
        }
        return value
    }
    contains(key: string): boolean {
        return storage.contains(key)
    }
    delete(key: string): void {
        storage.remove(key)
    }
    clearAll(): void {
        storage.clearAll()
    }

}