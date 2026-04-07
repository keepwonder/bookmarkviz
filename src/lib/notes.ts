// Bookmark notes persistence via localStorage

const STORAGE_KEY = 'bookmark-notes';

function loadFromStorage(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveNotes(notes: Record<string, string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

export function getNote(id: string): string {
  return loadFromStorage()[id] || '';
}

export function setNote(id: string, text: string): void {
  const notes = loadFromStorage();
  if (text.trim()) {
    notes[id] = text;
  } else {
    delete notes[id];
  }
  saveNotes(notes);
}

export function deleteNote(id: string): void {
  const notes = loadFromStorage();
  delete notes[id];
  saveNotes(notes);
}

export function hasNote(id: string): boolean {
  return !!loadFromStorage()[id];
}

// Export all notes for cloud migration
export function loadNotes(): Record<string, string> {
  return loadFromStorage();
}
