import { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Sparkles, BookOpen, Lightbulb, PenTool, ListChecks, HelpCircle, FileText, ChevronRight, X } from 'lucide-react';
import { sampleChatMessages } from '@/lib/mock-data';
import { ChatMessage } from '@/lib/types';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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

export default function TutorChat({ courseId, courseName, topic, onBack }: TutorChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(sampleChatMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = text || input.trim();
    if (!content) return;

    const userMsg: ChatMessage = {
      id: `m${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `m${Date.now() + 1}`,
        role: 'assistant',
        content: getAIResponse(content),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

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
            <p className="text-xs text-muted-foreground truncate">{topic || 'Ecuaciones lineales'}</p>
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

          {isTyping && (
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
                className="chip whitespace-nowrap shrink-0 text-xs"
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
              disabled={!input.trim()}
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
            <p className="text-sm font-medium text-foreground">Ecuaciones lineales</p>
            <p className="text-xs text-muted-foreground mt-0.5">Álgebra · Matemática</p>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Conceptos clave</p>
            <ul className="space-y-1.5">
              {['Despejar variables', 'Operaciones inversas', 'Verificación de soluciones', 'Ecuaciones con fracciones'].map(c => (
                <li key={c} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Progreso de sesión</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Comprensión</span>
                <span className="font-medium text-foreground">75%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="space-y-2 mt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Ejercicios resueltos</span>
                <span className="font-medium text-foreground">3/5</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-success rounded-full transition-all" style={{ width: '60%' }} />
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Sugerencias</p>
            <div className="space-y-2">
              {['Practica con ecuaciones fraccionarias', 'Repasa operaciones inversas', 'Intenta el mini quiz'].map(s => (
                <button key={s} className="w-full text-left text-xs px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted text-foreground transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Objetivo de la sesión</p>
            <div className="px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-xs text-foreground">Resolver ecuaciones lineales de primer grado con una incógnita</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('pista') || lower.includes('ayuda')) {
    return '💡 **Pista:**\n\nRecuerda que el primer paso siempre es **mover los números al lado opuesto** de la variable.\n\n¿Qué número puedes mover primero en tu ecuación?';
  }
  if (lower.includes('ejemplo')) {
    return '📝 **Ejemplo:**\n\nResolvamos juntos: `5x + 3 = 28`\n\n**Paso 1:** Restamos 3 de ambos lados:\n```\n5x = 28 - 3\n5x = 25\n```\n\n**Paso 2:** Dividimos entre 5:\n```\nx = 25 ÷ 5\nx = 5\n```\n\n✅ **Verificación:** 5(5) + 3 = 25 + 3 = 28 ✓\n\n¿Quieres intentar uno similar?';
  }
  if (lower.includes('evalú') || lower.includes('quiz')) {
    return '📋 **Mini evaluación - Ecuaciones lineales**\n\nResuelve las siguientes ecuaciones:\n\n1. `4x + 2 = 18`\n2. `7x - 5 = 23`\n3. `2x + 9 = 3x - 1`\n\nEscribe tus respuestas una por una y te las reviso. ¡Tú puedes! 💪';
  }
  if (lower.includes('ejercicio')) {
    return '✏️ **3 ejercicios para practicar:**\n\n1. `6x - 4 = 20`\n2. `3x + 7 = 2x + 15`\n3. `2(x + 3) = 14`\n\nIntenta resolverlos paso a paso. Cuando termines, dime tus respuestas y las revisamos juntos.';
  }
  if (lower.includes('resumen') || lower.includes('resúme')) {
    return '📖 **Resumen: Ecuaciones lineales**\n\nUna ecuación lineal es una igualdad con una variable elevada a la primera potencia.\n\n**Para resolver:**\n1. Agrupar términos con x de un lado\n2. Agrupar números del otro lado\n3. Simplificar\n4. Despejar x\n\n**Regla de oro:** Lo que haces de un lado, lo haces del otro.\n\n¿Hay algo que quieras repasar con más detalle?';
  }
  return '¡Muy bien! 👏\n\nVeamos tu respuesta...\n\nEl primer paso es correcto: mover el **-7** al otro lado. Queda:\n```\n3x = 14 + 7\n3x = 21\n```\n\nAhora, ¿cuál es el siguiente paso para encontrar el valor de x?';
}
