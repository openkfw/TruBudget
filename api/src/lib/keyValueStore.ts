/**
 * @description Typed key-value store with expiration support using Map
 */

interface StoreEntry<T> {
  value: T;
  exp: number;
}

class KeyValueStore {
  private store: Map<string, StoreEntry<any>>;
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor(cleanupIntervalMs: number = 60 * 1000) {
    this.store = new Map();
    this.cleanupInterval = setInterval(() => this.clearExpiredKeys(), cleanupIntervalMs);
  }

  /**
   * Saves a value in the store with expiration
   * @throws {ValidationError} If key or value is invalid
   */
  public save<T>(key: string, value: T, exp: Date | number): void {
    if (!key?.trim()) {
      throw new Error("Key must be a non-empty string");
    }

    if (value === undefined || value === null) {
      throw new Error("Value cannot be null or undefined");
    }

    const expMs = exp instanceof Date ? exp.getTime() : exp;

    if (typeof expMs !== "number" || expMs <= Date.now()) {
      throw new Error("Expiration must be a future timestamp or Date");
    }

    this.store.set(key, { value, exp: expMs });
  }

  /**
   * Retrieves a value from the store
   * @returns The value if found and not expired, undefined otherwise
   */
  public get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.exp) {
      this.clear(key);
      return undefined;
    }

    return entry.value as T;
  }

  /**
   * Removes a value from the store
   * @returns boolean indicating if the value was cleared
   */
  public clear(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clears all expired keys from the store
   * @returns number of cleared keys
   */
  public clearExpiredKeys(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.store) {
      if (entry.exp <= now) {
        this.store.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  /**
   * Returns all non-expired values in the store
   */
  public getAll<T>(): Map<string, T> {
    const now = Date.now();
    const result = new Map<string, T>();

    for (const [key, entry] of this.store) {
      if (entry.exp > now) {
        result.set(key, entry.value);
      }
    }

    return result;
  }

  /**
   * Returns the number of entries in the store
   */
  public size(): number {
    return this.store.size;
  }

  /**
   * Stops the cleanup interval and clears all entries
   */
  public dispose(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Export a singleton instance
export const kvStore = new KeyValueStore();
