import { useState } from 'react';
import { ArrowLeft, MessageSquare, Trash2, Clock, BookOpen } from 'lucide-react';
import { listSessions, deleteSession, ChatSession } from '@/lib/chat-storage';
import { courses } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ChatHistoryProps {
  onBack: () => void;
  onResumeSession: (session: ChatSession) => void;
}

export default function ChatHistory({ onBack, onResumeSession }: ChatHistoryProps) {
  const [sessions, setSessions] = useState(() => listSessions());

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    setSessions(listSessions());
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
  };

  const getPreview = (session: ChatSession): string => {
    const lastUserMsg = [...session.messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) return lastUserMsg.content.slice(0, 80) + (lastUserMsg.content.length > 80 ? '…' : '');
    return 'Sesión de estudio';
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> Volver
      </button>
      <h1 className="heading-1 text-foreground mb-2">Historial de chats</h1>
      <p className="text-muted-foreground mb-8">Retoma una sesión anterior donde la dejaste</p>

      {sessions.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare size={40} className="mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">Aún no tienes sesiones guardadas</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Tus conversaciones con el Tutor AI aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {sessions.map((session) => {
              const courseIcon = courses.find(c => c.id === session.courseId)?.icon || '📚';
              return (
                <motion.button
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => onResumeSession(session)}
                  className="w-full stat-card flex items-center gap-4 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                    {courseIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm truncate">{session.courseName}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">{session.mode}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{session.topic}</p>
                    <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{getPreview(session)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={10} />
                      {formatDate(session.updatedAt)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare size={10} />
                      {session.messages.length}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="p-1 rounded hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
