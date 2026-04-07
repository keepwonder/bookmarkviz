// Minimal localStorage polyfill for Vitest
const store = new Map<string, string>();

class LocalStorage {
  getItem(key: string): string | null {
    return store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    store.set(key, value);
  }
  removeItem(key: string): void {
    store.delete(key);
  }
  clear(): void {
    store.clear();
  }
  get length(): number {
    return store.size;
  }
  key(_index: number): string | null {
    return null;
  }
}

(globalThis as Record<string, unknown>).localStorage = new LocalStorage();
