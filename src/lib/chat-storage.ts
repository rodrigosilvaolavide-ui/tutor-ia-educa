import { ChatMessage } from '@/lib/types';

export interface ChatSession {
  id: string;
  courseId: string;
  courseName: string;
  topic: string;
  mode: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'tutor-chat-sessions';

function getSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function listSessions(): ChatSession[] {
  return getSessions().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function getSession(id: string): ChatSession | undefined {
  return getSessions().find(s => s.id === id);
}

export function createSession(courseId: string, courseName: string, topic: string, mode: string): ChatSession {
  const session: ChatSession = {
    id: `session-${Date.now()}`,
    courseId,
    courseName,
    topic,
    mode,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  return session;
}

export function updateSessionMessages(id: string, messages: ChatMessage[], mode?: string) {
  const sessions = getSessions();
  const idx = sessions.findIndex(s => s.id === id);
  if (idx !== -1) {
    sessions[idx].messages = messages;
    sessions[idx].updatedAt = new Date().toISOString();
    if (mode) sessions[idx].mode = mode;
    saveSessions(sessions);
  }
}

export function deleteSession(id: string) {
  const sessions = getSessions().filter(s => s.id !== id);
  saveSessions(sessions);
}
