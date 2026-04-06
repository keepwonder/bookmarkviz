// Bookmark notes persistence via localStorage

const STORAGE_KEY = 'bookmark-notes';

function loadNotes(): Record<string, string> {
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
  return loadNotes()[id] || '';
}

export function setNote(id: string, text: string): void {
  const notes = loadNotes();
  if (text.trim()) {
    notes[id] = text;
  } else {
    delete notes[id];
  }
  saveNotes(notes);
}

export function deleteNote(id: string): void {
  const notes = loadNotes();
  delete notes[id];
  saveNotes(notes);
}

export function hasNote(id: string): boolean {
  return !!loadNotes()[id];
}
