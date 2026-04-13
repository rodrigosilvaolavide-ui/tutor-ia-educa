import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Send, ArrowLeft, Sparkles, BookOpen, Lightbulb, PenTool, Search, StickyNote, MessageCircle, ChevronDown, Check, X, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { ChatSession, createSession, updateSessionMessages } from '@/lib/chat-storage';
import { recordChatWithoutNotes, didReadNotesFirst } from '@/lib/notes-tracking';
import { courses } from '@/lib/mock-data';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import TopicNotes from './TopicNotes';

interface TutorChatProps {
  courseId: string;
  courseName: string;
  topic?: string;
  onBack: () => void;
  existingSession?: ChatSession;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;

type TutorMode = 'Teoría' | 'Ejercicios' | 'Problemas' | 'Investigación';

const tutorModes: { value: TutorMode; icon: React.ReactNode; description: string }[] = [
  { value: 'Teoría', icon: <BookOpen size={14} />, description: 'Conceptos y definiciones' },
  { value: 'Ejercicios', icon: <PenTool size={14} />, description: 'Práctica guiada' },
  { value: 'Problemas', icon: <Lightbulb size={14} />, description: 'Retos aplicados' },
  { value: 'Investigación', icon: <Search size={14} />, description: 'Exploración profunda' },
];

type ApiMessage = { role: 'user' | 'assistant'; content: string };

async function streamChat({
  messages,
  courseName,
  topic,
  mode,
  onDelta,
  onDone,
  onError,
}: {
  messages: ApiMessage[];
  courseName: string;
  topic?: string;
  mode?: TutorMode;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, courseName, topic, mode }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({ error: 'Error de conexión' }));
    onError(errorData.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) {
    onError('No se recibió respuesta del tutor');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

/* ─── Session objectives (well-written, pedagogical) ─── */
const sessionObjectives: Record<string, string> = {
  'Ecuaciones lineales': 'Comprender cómo resolver ecuaciones de primer grado, identificar las propiedades de igualdad y aplicar el despeje de variables en problemas contextualizados.',
  'Factorización': 'Dominar las técnicas de factor común, diferencia de cuadrados y trinomio cuadrado perfecto para simplificar expresiones algebraicas.',
  'Triángulos': 'Entender la clasificación de triángulos por lados y ángulos, aplicar el Teorema de Pitágoras y resolver problemas de geometría práctica.',
  'Circunferencia': 'Identificar los elementos de la circunferencia, calcular ángulos inscritos y centrales, y resolver problemas de longitud y área.',
  'Textos argumentativos': 'Reconocer la estructura de un texto argumentativo, identificar tesis y argumentos, y detectar falacias lógicas comunes.',
  'La célula': 'Comprender la estructura celular, diferenciar los organelos y sus funciones, y entender las fases del ciclo celular.',
  'Culturas preincaicas': 'Analizar las principales culturas preincaicas del Perú, sus aportes tecnológicos y su organización social y política.',
  'Present Perfect': 'Dominar la construcción de oraciones afirmativas, negativas e interrogativas en Present Perfect, y distinguir su uso frente al pasado simple.',
  'Regiones naturales': 'Identificar las características geográficas, climáticas y económicas de las regiones Costa, Sierra y Selva del Perú.',
};

/* ─── Subtopics for session progress ─── */
const topicSubtopics: Record<string, string[]> = {
  'Ecuaciones lineales': ['Ecuaciones de primer grado', 'Despeje de variables', 'Sistemas de ecuaciones'],
  'Factorización': ['Factor común', 'Diferencia de cuadrados', 'Trinomio cuadrado perfecto'],
  'Triángulos': ['Clasificación', 'Propiedades', 'Teorema de Pitágoras'],
  'Circunferencia': ['Elementos', 'Ángulos inscritos', 'Longitud y área'],
  'Textos argumentativos': ['Estructura', 'Tesis y argumentos', 'Falacias'],
  'La célula': ['Organelos', 'Membrana celular', 'Ciclo celular'],
  'Culturas preincaicas': ['Chavín', 'Paracas', 'Nazca', 'Mochica'],
  'Present Perfect': ['Afirmativas', 'Negativas', 'Preguntas'],
  'Regiones naturales': ['Costa', 'Sierra', 'Selva'],
};

export default function TutorChat({ courseId, courseName, topic, onBack, existingSession }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(existingSession?.messages || []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [hasStarted, setHasStarted] = useState(!!existingSession);
  const [tutorMode, setTutorMode] = useState<TutorMode>((existingSession?.mode as TutorMode) || 'Teoría');
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [sessionId, setSessionId] = useState<string>(existingSession?.id || '');
  const [activeTab, setActiveTab] = useState<'notes' | 'chat'>('notes');
  const modeMenuRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const topicName = topic || 'General';
  const subtopics = topicSubtopics[topicName] || [];
  const objective = sessionObjectives[topicName] || `Estudiar y comprender los conceptos fundamentales de ${topicName} en ${courseName}, identificando ideas clave y aplicándolas en ejercicios prácticos.`;

  // Estimate progress based on message count
  const sessionProgress = useMemo(() => {
    if (subtopics.length === 0) return { pct: 0, currentIdx: 0 };
    const msgCount = messages.filter(m => m.role === 'assistant').length;
    const currentIdx = Math.min(Math.floor(msgCount / 2), subtopics.length - 1);
    const pct = Math.min(Math.round(((currentIdx + (msgCount > 0 ? 0.5 : 0)) / subtopics.length) * 100), 100);
    return { pct, currentIdx };
  }, [messages, subtopics]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modeMenuRef.current && !modeMenuRef.current.contains(e.target as Node)) {
        setShowModeMenu(false);
      }
    };
    if (showModeMenu) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showModeMenu]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sessionId || messages.length === 0 || isTyping) return;
    updateSessionMessages(sessionId, messages, tutorMode);
  }, [messages, isTyping, sessionId, tutorMode]);

  useEffect(() => {
    if (hasStarted) return;
    setHasStarted(true);
    setIsTyping(true);

    const newSession = createSession(courseId, courseName, topic || 'General', tutorMode);
    setSessionId(newSession.id);

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { id: `m${Date.now()}`, role: 'assistant', content: assistantSoFar, timestamp: new Date() }];
      });
    };

    streamChat({
      messages: [],
      courseName,
      topic: topic || 'General',
      mode: tutorMode,
      onDelta: upsertAssistant,
      onDone: () => setIsTyping(false),
      onError: (err) => {
        setIsTyping(false);
        toast.error(err);
      },
    });
  }, []);

  const handleSend = useCallback((text?: string) => {
    const content = text || input.trim();
    if (!content || isTyping) return;

    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const apiMessages: ApiMessage[] = [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user' as const, content },
    ];

    let assistantSoFar = '';
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id.startsWith('streaming-')) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { id: `streaming-${Date.now()}`, role: 'assistant', content: assistantSoFar, timestamp: new Date() }];
      });
    };

    streamChat({
      messages: apiMessages,
      courseName,
      topic: topic || 'General',
      mode: tutorMode,
      onDelta: upsertAssistant,
      onDone: () => setIsTyping(false),
      onError: (err) => {
        setIsTyping(false);
        toast.error(err);
      },
    });
  }, [input, isTyping, messages, courseName, topic, tutorMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSwitchToChat = useCallback(() => {
    setActiveTab('chat');
    if (!didReadNotesFirst(courseName, topic || 'General')) {
      recordChatWithoutNotes(courseName, topic || 'General');
    }
  }, [courseName, topic]);

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* ─── Topbar ─── */}
        <div className="border-b border-border bg-card">
          <div className="flex items-center gap-3 px-4 md:px-6 h-14">
            <button onClick={onBack} className="p-1.5 hover:bg-muted rounded-lg transition-colors shrink-0">
              <ArrowLeft size={18} />
            </button>

            <div className="flex-1 min-w-0 flex items-center gap-3">
              <div className="min-w-0">
                <p className="font-heading font-semibold text-sm text-foreground truncate">{courseName} — {topicName}</p>
              </div>
            </div>

            {/* Mode selector - only in chat tab */}
            {activeTab === 'chat' && (
              <div className="relative" ref={modeMenuRef}>
                <button
                  onClick={() => setShowModeMenu(!showModeMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-xs font-medium text-foreground transition-colors"
                >
                  {tutorModes.find(m => m.value === tutorMode)?.icon}
                  <span className="hidden sm:inline">{tutorMode}</span>
                  <ChevronDown size={12} className={cn("transition-transform", showModeMenu && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {showModeMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                    >
                      <div className="p-1.5">
                        {tutorModes.map((mode) => (
                          <button
                            key={mode.value}
                            onClick={() => { setTutorMode(mode.value); setShowModeMenu(false); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                              tutorMode === mode.value ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                            )}
                          >
                            <span className="shrink-0">{mode.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{mode.value}</p>
                              <p className="text-xs text-muted-foreground">{mode.description}</p>
                            </div>
                            {tutorMode === mode.value && <Check size={14} className="shrink-0 text-primary" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => setShowPanel(!showPanel)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <BookOpen size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex px-4 md:px-6 gap-1">
            <button
              onClick={() => setActiveTab('notes')}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === 'notes'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <StickyNote size={14} />
              Notas del tema
            </button>
            <button
              onClick={handleSwitchToChat}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-colors",
                activeTab === 'chat'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle size={14} />
              Chatear con Tutor
            </button>
          </div>
        </div>

        {activeTab === 'notes' ? (
          <TopicNotes courseName={courseName} topic={topic || 'General'} onGoToChat={handleSwitchToChat} />
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-auto px-4 md:px-6 py-4 space-y-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
                  >
                    <div className={cn(
                      'max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border border-border rounded-bl-md'
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={14} className="text-primary" />
                          </div>
                          <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_strong]:text-foreground">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && messages.length === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles size={14} className="text-primary animate-pulse-soft" />
                  </div>
                  <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 md:px-6 pb-4 pt-2">
              <div className="flex items-end gap-2 bg-card border border-border rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40 transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta o respuesta..."
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground px-2 py-1.5 max-h-32"
                />
                <button onClick={() => handleSend()} disabled={!input.trim() || isTyping} className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── Study Panel (sidebar) ─── */}
      <div className={cn(
        'border-l border-border bg-card w-72 flex-col',
        showPanel ? 'flex absolute right-0 top-0 bottom-0 z-40 md:relative' : 'hidden md:flex'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-heading font-semibold text-sm">Panel de estudio</h3>
          <button onClick={() => setShowPanel(false)} className="md:hidden p-1 hover:bg-muted rounded">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-5">
          {/* Tema actual */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Tema actual</p>
            <p className="text-base font-heading font-semibold text-foreground leading-snug">{courseName} — {topicName}</p>
          </div>

          {/* Objetivo de sesión */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Objetivo de la sesión</p>
            <p className="text-xs text-foreground leading-relaxed">{objective}</p>
          </div>

          {/* Progreso de sesión */}
          {subtopics.length > 0 && (
            <div>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2">Progreso de la sesión</p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${sessionProgress.pct}%` }}
                />
              </div>
              <div className="space-y-1">
                {subtopics.map((sub, i) => {
                  const isDone = i < sessionProgress.currentIdx;
                  const isCurrent = i === sessionProgress.currentIdx;
                  return (
                    <div key={sub} className={cn(
                      'flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
                      isCurrent ? 'bg-primary/10 text-primary font-medium' :
                      isDone ? 'text-muted-foreground' : 'text-muted-foreground/60'
                    )}>
                      <span className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0',
                        isDone ? 'bg-mastery-green/20 text-mastery-green' :
                        isCurrent ? 'bg-primary/20 text-primary ring-2 ring-primary/30' :
                        'bg-muted text-muted-foreground/50'
                      )}>
                        {isDone ? '✓' : i + 1}
                      </span>
                      <span className={isDone ? 'line-through' : ''}>{sub}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
