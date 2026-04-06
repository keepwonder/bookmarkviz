// Export and import user data (read status, collections, notes)

interface ExportData {
  version: number;
  exportedAt: string;
  readStatus: string[];
  collections: { id: string; name: string; emoji: string; bookmarkIds: string[]; createdAt: number }[];
  notes: Record<string, string>;
}

const READ_KEY = 'read-status';
const COL_KEY = 'bookmark-collections';
const NOTES_KEY = 'bookmark-notes';

function fromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function exportData(): void {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    readStatus: fromStorage<string[]>(READ_KEY, []),
    collections: fromStorage(COL_KEY, []),
    notes: fromStorage<Record<string, string>>(NOTES_KEY, {}),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bookmarkviz-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(json: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(json) as ExportData;
    if (!data.version || data.version < 1) {
      return { success: false, message: 'Invalid backup format' };
    }

    // Import read status
    if (Array.isArray(data.readStatus)) {
      const existing = fromStorage<string[]>(READ_KEY, []);
      const merged = new Set([...existing, ...data.readStatus]);
      localStorage.setItem(READ_KEY, JSON.stringify([...merged]));
    }

    // Import collections (merge by id)
    if (Array.isArray(data.collections)) {
      const existing = fromStorage<{ id: string; bookmarkIds: string[] }[]>(COL_KEY, []);
      const map = new Map(existing.map(c => [c.id, c]));
      for (const col of data.collections) {
        const cur = map.get(col.id);
        if (cur) {
          cur.bookmarkIds = [...new Set([...cur.bookmarkIds, ...col.bookmarkIds])];
        } else {
          map.set(col.id, col as { id: string; bookmarkIds: string[] });
        }
      }
      localStorage.setItem(COL_KEY, JSON.stringify([...map.values()]));
    }

    // Import notes (merge by key)
    if (data.notes && typeof data.notes === 'object') {
      const existing = fromStorage<Record<string, string>>(NOTES_KEY, {});
      const merged = { ...existing, ...data.notes };
      localStorage.setItem(NOTES_KEY, JSON.stringify(merged));
    }

    return { success: true, message: 'Data imported successfully' };
  } catch {
    return { success: false, message: 'Failed to parse backup file' };
  }
}
