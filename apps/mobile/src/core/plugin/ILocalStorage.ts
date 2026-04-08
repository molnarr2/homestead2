export default interface ILocalStorage {
    setString(key: string, value: string): void
    setBoolean(key: string, value: boolean): void
    setNumber(key: string, value: number): void

    getString(key: string, defaultValue: string): string
    getBoolean(key: string, defaultValue: boolean): boolean
    getNumber(key: string, defaultValue: number): number

    contains(key: string): boolean
    delete(key: string): void
    clearAll(): void
}
