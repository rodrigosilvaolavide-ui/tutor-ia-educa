import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircleQuestion, Send, X, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { addConfusionSignal } from '@/lib/confusion-signals';

interface DoubtDrawerProps {
  courseName: string;
  topic: string;
  /** Extra context like current flashcard question or simulacro question */
  currentContext?: string;
  /** Source module */
  source: 'flashcards' | 'simulacros';
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tutor-chat`;

const quickActions = [
  'Explícame esto',
  'Dame un ejemplo',
  'Dame una pista',
];

export default function DoubtDrawer({ courseName, topic, currentContext, source }: DoubtDrawerProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset when context changes
  useEffect(() => {
    setMessages([]);
    setInitialized(false);
  }, [currentContext, topic]);

  // Auto-greet when opened for the first time
  useEffect(() => {
    if (!open || initialized) return;
    setInitialized(true);

    const contextMsg = currentContext
      ? `Estás estudiando "${topic}" de ${courseName}. El alumno está viendo esta pregunta: "${currentContext}". Responde como tutor breve y empático. Pregunta en qué necesita ayuda.`
      : `Estás estudiando "${topic}" de ${courseName}. Responde como tutor breve y empático. Pregunta en qué necesita ayuda.`;

    setIsTyping(true);
    let assistantSoFar = '';

    streamChat(
      [{ role: 'user', content: `[CONTEXTO] ${contextMsg}` }],
      (chunk) => {
        assistantSoFar += chunk;
        setMessages([{ id: 'greeting', role: 'assistant', content: assistantSoFar }]);
      },
      () => setIsTyping(false),
    );
  }, [open, initialized, courseName, topic, currentContext]);

  const handleSend = useCallback((text?: string) => {
    const content = text || input.trim();
    if (!content || isTyping) return;

    // Log confusion signal for teacher
    addConfusionSignal({
      source,
      courseName,
      topic,
      question: currentContext,
      studentMessage: content,
      timestamp: new Date(),
    });

    const userMsg: Message = { id: `u${Date.now()}`, role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));
    let assistantSoFar = '';

    streamChat(
      apiMessages,
      (chunk) => {
        assistantSoFar += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant' && last.id.startsWith('s-')) {
            return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
          }
          return [...prev, { id: `s-${Date.now()}`, role: 'assistant', content: assistantSoFar }];
        });
      },
      () => setIsTyping(false),
    );
  }, [input, isTyping, messages, courseName, topic, currentContext, source]);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full',
          'bg-primary text-primary-foreground shadow-lg shadow-primary/25',
          'hover:bg-primary/90 transition-colors',
          open && 'hidden',
        )}
      >
        <MessageCircleQuestion size={18} />
        <span className="text-sm font-medium">¿Duda?</span>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Drawer Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles size={16} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground font-heading">Tutor AI — Ayuda rápida</p>
                <p className="text-xs text-muted-foreground truncate">{topic} · {courseName}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto px-4 py-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted rounded-bl-md',
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none text-foreground [&_p]:mb-1.5 [&_p:last-child]:mb-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <span>{msg.content}</span>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 size={16} className="text-muted-foreground animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <div className="flex gap-2">
                  {quickActions.map(action => (
                    <button
                      key={action}
                      onClick={() => handleSend(action)}
                      disabled={isTyping}
                      className="chip text-xs whitespace-nowrap disabled:opacity-50"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-2 focus-within:ring-2 focus-within:ring-primary/20">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="¿Qué no entiendes?"
                  className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground px-2"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="p-2 rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
                >
                  <Send size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Stream helper (simplified from TutorChat) ─── */
async function streamChat(
  messages: { role: string; content: string }[],
  onDelta: (text: string) => void,
  onDone: () => void,
) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, courseName: '', topic: '', mode: 'Teoría' }),
    });

    if (!resp.ok || !resp.body) {
      onDone();
      toast.error('Error conectando con el tutor');
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buf.indexOf('\n')) !== -1) {
        let line = buf.slice(0, idx);
        buf = buf.slice(idx + 1);
        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (!line.startsWith('data: ')) continue;
        const json = line.slice(6).trim();
        if (json === '[DONE]') { onDone(); return; }
        try {
          const parsed = JSON.parse(json);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch { /* skip */ }
      }
    }
    onDone();
  } catch {
    onDone();
    toast.error('Error de conexión');
  }
}
