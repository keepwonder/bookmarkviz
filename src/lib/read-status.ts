// Read status persistence via localStorage

const STORAGE_KEY = 'read-status';

function loadReadSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function saveReadSet(set: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* quota exceeded — trim old entries */ }
}

export function isRead(id: string): boolean {
  return loadReadSet().has(id);
}

export function getReadCount(totalIds: string[]): number {
  const set = loadReadSet();
  return totalIds.filter(id => set.has(id)).length;
}

export function markAsRead(id: string): void {
  const set = loadReadSet();
  set.add(id);
  saveReadSet(set);
}

export function markAsUnread(id: string): void {
  const set = loadReadSet();
  set.delete(id);
  saveReadSet(set);
}

export function toggleRead(id: string): boolean {
  const set = loadReadSet();
  if (set.has(id)) {
    set.delete(id);
    saveReadSet(set);
    return false;
  } else {
    set.add(id);
    saveReadSet(set);
    return true;
  }
}
