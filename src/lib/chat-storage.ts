import { ChatMessage } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

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

type Row = {
  id: string;
  course_id: string;
  course_name: string;
  topic: string | null;
  mode: string | null;
  messages: unknown;
  created_at: string;
  updated_at: string;
};

function rowToSession(r: Row): ChatSession {
  return {
    id: r.id,
    courseId: r.course_id,
    courseName: r.course_name,
    topic: r.topic ?? 'General',
    mode: r.mode ?? 'Teoría',
    messages: Array.isArray(r.messages) ? (r.messages as ChatMessage[]) : [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listSessions(): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error || !data) return [];
  return (data as Row[]).map(rowToSession);
}

export async function getSession(id: string): Promise<ChatSession | undefined> {
  const { data } = await supabase.from('chat_sessions').select('*').eq('id', id).maybeSingle();
  return data ? rowToSession(data as Row) : undefined;
}

export async function createSession(
  courseId: string,
  courseName: string,
  topic: string,
  mode: string
): Promise<ChatSession> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Get school_id from profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('school_id')
    .eq('id', user.id)
    .maybeSingle();

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: user.id,
      school_id: profile?.school_id ?? null,
      course_id: courseId,
      course_name: courseName,
      topic,
      mode,
      messages: [],
    })
    .select()
    .single();

  if (error || !data) throw error ?? new Error('No se pudo crear la sesión');
  return rowToSession(data as Row);
}

export async function updateSessionMessages(id: string, messages: ChatMessage[], mode?: string) {
  const patch: Record<string, unknown> = {
    messages: messages as unknown,
    updated_at: new Date().toISOString(),
  };
  if (mode) patch.mode = mode;
  await supabase.from('chat_sessions').update(patch).eq('id', id);
}

export async function deleteSession(id: string) {
  await supabase.from('chat_sessions').delete().eq('id', id);
}
