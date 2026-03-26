import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, ArrowLeft, Sparkles, BookOpen, Lightbulb, PenTool, ListChecks, HelpCircle, FileText, ChevronRight, X, AlertCircle, ChevronDown, Check, Search } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TutorChatProps {
  courseId: string;
  courseName: string;
  topic?: string;
  onBack: () => void;
}

const quickActions = [
  { label: 'Explícamelo fácil', icon: <Lightbulb size={14} /> },
  { label: 'Dame un ejemplo', icon: <BookOpen size={14} /> },
  { label: 'Evalúame', icon: <PenTool size={14} /> },
  { label: 'Dame 3 ejercicios', icon: <ListChecks size={14} /> },
  { label: 'Paso a paso', icon: <ChevronRight size={14} /> },
  { label: 'Dame una pista', icon: <HelpCircle size={14} /> },
  { label: 'Resúmeme este tema', icon: <FileText size={14} /> },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;

type ApiMessage = { role: 'user' | 'assistant'; content: string };

async function streamChat({
  messages,
  courseName,
  topic,
  onDelta,
  onDone,
  onError,
}: {
  messages: ApiMessage[];
  courseName: string;
  topic?: string;
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
    body: JSON.stringify({ messages, courseName, topic }),
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

  // Final flush
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

export default function TutorChat({ courseId, courseName, topic, onBack }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-start: send empty messages to get initial greeting
  useEffect(() => {
    if (hasStarted) return;
    setHasStarted(true);
    setIsTyping(true);

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

    // Build API messages from history
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
      onDelta: upsertAssistant,
      onDone: () => setIsTyping(false),
      onError: (err) => {
        setIsTyping(false);
        toast.error(err);
      },
    });
  }, [input, isTyping, messages, courseName, topic]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-border bg-card">
          <button onClick={onBack} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="font-heading font-semibold text-sm text-foreground">{courseName}</h2>
            <p className="text-xs text-muted-foreground truncate">{topic || 'Tema general'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <BookOpen size={18} />
            </button>
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-medium">
              <Sparkles size={12} />
              Tutor activo
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto px-4 md:px-6 py-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
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

        {/* Quick Actions */}
        <div className="px-4 md:px-6 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => handleSend(action.label)}
                disabled={isTyping}
                className="chip whitespace-nowrap shrink-0 text-xs disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="px-4 md:px-6 pb-4">
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
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2 rounded-xl bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Study Panel - Desktop always, mobile toggle */}
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
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Tema actual</p>
            <p className="text-sm font-medium text-foreground">{topic || 'Tema general'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{courseName}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Acciones rápidas</p>
            <div className="space-y-1.5">
              {quickActions.slice(0, 4).map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.label)}
                  disabled={isTyping}
                  className="w-full flex items-center gap-2 text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors disabled:opacity-50"
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Sesión</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Mensajes</span>
                <span className="font-medium text-foreground">{messages.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Estado</span>
                <span className="font-medium text-success">Activo</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Objetivo de la sesión</p>
            <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-foreground">Estudiar y practicar con el Tutor AI sobre {topic || courseName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
