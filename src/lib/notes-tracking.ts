/** Track whether a student read notes before chatting */

export interface NotesReadRecord {
  id: string;
  courseName: string;
  topic: string;
  readNotesFirst: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'educa_notes_tracking';

export function getNotesTrackingRecords(): NotesReadRecord[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function recordNotesRead(courseName: string, topic: string): void {
  const records = getNotesTrackingRecords();
  // Check if already recorded for this topic
  const existing = records.find(r => r.courseName === courseName && r.topic === topic);
  if (existing) return;
  
  records.push({
    id: `nr-${Date.now()}`,
    courseName,
    topic,
    readNotesFirst: true,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function recordChatWithoutNotes(courseName: string, topic: string): void {
  const records = getNotesTrackingRecords();
  const existing = records.find(r => r.courseName === courseName && r.topic === topic);
  if (existing) return; // Already tracked (either notes or chat)
  
  records.push({
    id: `nr-${Date.now()}`,
    courseName,
    topic,
    readNotesFirst: false,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function didReadNotesFirst(courseName: string, topic: string): boolean | null {
  const records = getNotesTrackingRecords();
  const record = records.find(r => r.courseName === courseName && r.topic === topic);
  return record ? record.readNotesFirst : null;
}
