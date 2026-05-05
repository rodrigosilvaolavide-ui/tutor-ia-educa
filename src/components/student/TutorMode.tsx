import { useState, useMemo, useEffect } from 'react';
import { Sparkles, Plus, ChevronDown, ChevronRight, ArrowLeft, MessageCircle, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { courses } from '@/lib/mock-data';
import { listSessions, ChatSession } from '@/lib/chat-storage';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import TutorChat from './TutorChat';
import CourseSelect from './CourseSelect';

interface TutorModeProps {
  onExit: () => void;
  initialCourseId?: string;
  initialSession?: ChatSession;
  initialTopic?: string;
}

export default function TutorMode({ onExit, initialCourseId, initialSession, initialTopic }: TutorModeProps) {
  const [chatState, setChatState] = useState<{
    courseId: string;
    courseName: string;
    topic?: string;
    session?: ChatSession;
  } | null>(
    initialSession
      ? { courseId: initialSession.courseId, courseName: initialSession.courseName, topic: initialSession.topic, session: initialSession }
      : initialCourseId
        ? null // will show CourseSelect filtered
        : null
  );
  const [showCourseSelect, setShowCourseSelect] = useState(!initialSession);
  const [selectingCourse, setSelectingCourse] = useState<string | undefined>(initialCourseId);
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set(initialSession ? [initialSession.courseId] : initialCourseId ? [initialCourseId] : []));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    listSessions().then(setSessions);
  }, [refreshKey, chatState]);

  const sessionsByCourse = useMemo(() => {
    const grouped: Record<string, ChatSession[]> = {};
    for (const s of sessions) {
      if (!grouped[s.courseId]) grouped[s.courseId] = [];
      grouped[s.courseId].push(s);
    }
    return grouped;
  }, [sessions]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const handleNewSession = () => {
    setChatState(null);
    setShowCourseSelect(true);
    setSelectingCourse(undefined);
  };

  const handleSelectCourse = (courseId: string, courseName: string, topic?: string) => {
    setChatState({ courseId, courseName, topic });
    setShowCourseSelect(false);
    setExpandedCourses(prev => new Set([...prev, courseId]));
    setRefreshKey(k => k + 1);
  };

  const handleResumeSession = (session: ChatSession) => {
    setChatState({
      courseId: session.courseId,
      courseName: session.courseName,
      topic: session.topic,
      session,
    });
    setShowCourseSelect(false);
  };

  const handleChatBack = () => {
    setChatState(null);
    setShowCourseSelect(true);
    setRefreshKey(k => k + 1);
  };

  const getSessionStatus = (session: ChatSession): 'completed' | 'in_progress' => {
    const msgCount = session.messages.filter(m => m.role === 'assistant').length;
    return msgCount >= 6 ? 'completed' : 'in_progress';
  };

  const isActiveSession = (session: ChatSession) =>
    chatState?.session?.id === session.id;

  return (
    <div className="flex h-screen bg-background">
      {/* ─── Tutor AI Sidebar ─── */}
      <AnimatePresence initial={false}>
        {!sidebarCollapsed && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex flex-col bg-sidebar text-sidebar-foreground overflow-hidden shrink-0"
          >
            <div className="w-[280px] flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                    <Sparkles size={16} className="text-sidebar-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="font-heading font-bold text-sm text-sidebar-primary-foreground">Tutor AI</h1>
                    <p className="text-[11px] text-sidebar-foreground/50">Modo de estudio</p>
                  </div>
                </div>

                <button
                  onClick={handleNewSession}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-sidebar-primary/20 hover:bg-sidebar-primary/30 text-sidebar-primary-foreground text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  Nueva sesión
                </button>
              </div>

              {/* Courses list */}
              <div className="flex-1 overflow-auto p-3 space-y-0.5">
                <p className="text-[10px] font-medium text-sidebar-foreground/40 uppercase tracking-widest px-2 mb-2">Cursos</p>

                {courses.map(course => {
                  const courseSessions = sessionsByCourse[course.id] || [];
                  const isExpanded = expandedCourses.has(course.id);

                  return (
                    <div key={course.id}>
                      <button
                        onClick={() => toggleCourse(course.id)}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 transition-colors group"
                      >
                        <span className="text-base">{course.icon}</span>
                        <span className="flex-1 text-left font-medium text-sidebar-foreground/80 group-hover:text-sidebar-foreground truncate text-[13px]">
                          {course.name}
                        </span>
                        {courseSessions.length > 0 && (
                          <span className="text-[10px] text-sidebar-foreground/40 mr-1">{courseSessions.length}</span>
                        )}
                        <ChevronDown
                          size={14}
                          className={cn(
                            "text-sidebar-foreground/30 transition-transform shrink-0",
                            !isExpanded && "-rotate-90"
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 pr-1 py-1 space-y-0.5">
                              {courseSessions.length === 0 ? (
                                <button
                                  onClick={() => {
                                    setSelectingCourse(course.id);
                                    setChatState(null);
                                    setShowCourseSelect(true);
                                  }}
                                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-sidebar-foreground/40 hover:text-sidebar-foreground/60 hover:bg-sidebar-accent/30 transition-colors"
                                >
                                  <Plus size={12} />
                                  Iniciar sesión
                                </button>
                              ) : (
                                courseSessions.map(session => {
                                  const status = getSessionStatus(session);
                                  const active = isActiveSession(session);
                                  return (
                                    <button
                                      key={session.id}
                                      onClick={() => handleResumeSession(session)}
                                      className={cn(
                                        "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors",
                                        active
                                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground/80"
                                      )}
                                    >
                                      {status === 'completed' ? (
                                        <CheckCircle2 size={13} className="text-mastery-green shrink-0" />
                                      ) : (
                                        <Loader2 size={13} className="text-sidebar-foreground/40 shrink-0" />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium truncate">{session.topic}</p>
                                        <p className="text-[10px] text-sidebar-foreground/30">
                                          {new Date(session.updatedAt).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                                        </p>
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Exit button */}
              <div className="p-3 border-t border-sidebar-border">
                <button
                  onClick={onExit}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver al inicio
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Main content ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <button onClick={onExit} className="p-1.5 hover:bg-muted rounded-lg">
              <ArrowLeft size={18} />
            </button>
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={14} className="text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm">Tutor AI</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0">
          {chatState ? (
            <TutorChat
              key={chatState.session?.id || `${chatState.courseId}-${chatState.topic}`}
              courseId={chatState.courseId}
              courseName={chatState.courseName}
              topic={chatState.topic}
              onBack={handleChatBack}
              existingSession={chatState.session}
              immersiveMode
              onToggleSidebar={() => setSidebarCollapsed(c => !c)}
              sidebarCollapsed={sidebarCollapsed}
            />
          ) : showCourseSelect ? (
            <CourseSelect
              onSelectCourse={handleSelectCourse}
              onBack={onExit}
              initialCourseId={selectingCourse}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
