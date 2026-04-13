import { useState } from 'react';
import { Brain, Layers, Target, ArrowRight, Clock, ChevronDown, BarChart3, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { courses, recentSessions } from '@/lib/mock-data';
import { courseProgress } from '@/lib/gamification';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StudentHomeProps {
  onStartStudy: (courseId?: string) => void;
  onNavigate: (view: string) => void;
}

/* ─── Rich study recommendations ─── */
const studyRecommendations = [
  {
    courseIcon: '📐', courseId: 'math',
    alert: 'Tienes evaluación de Matemática sobre triángulos notables en 3 días.',
    action: 'Completa un simulacro corto de triángulos notables y revisa los ejercicios que falles.',
    time: '25 min',
    cta: 'Iniciar Simulacro',
    target: 'simulacros' as const,
  },
  {
    courseIcon: '📐', courseId: 'math',
    alert: 'Aún no dominas Factorización y es base para los siguientes temas de Álgebra.',
    action: 'Repasa con el Tutor AI los tipos de factorización: factor común, diferencia de cuadrados y trinomios.',
    time: '30 min',
    cta: 'Estudiar con Tutor AI',
    target: 'tutor' as const,
  },
  {
    courseIcon: '🔬', courseId: 'science',
    alert: 'Estás en 72% de preparación en La célula y te faltan organelos y ciclo celular.',
    action: 'Haz Flash Cards de 15 preguntas sobre organelos celulares hasta obtener 100% de respuestas correctas.',
    time: '20 min',
    cta: 'Repasar Flash Cards',
    target: 'flashcards' as const,
  },
  {
    courseIcon: '🌎', courseId: 'english',
    alert: 'Errores frecuentes en formas negativas del Present Perfect en tu última práctica.',
    action: 'Estudia con el Tutor AI la estructura de oraciones negativas e interrogativas en Present Perfect.',
    time: '20 min',
    cta: 'Estudiar con Tutor AI',
    target: 'tutor' as const,
  },
];

export default function StudentHome({ onStartStudy, onNavigate }: StudentHomeProps) {
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="px-1">
        <h1 className="heading-1 text-foreground">¡Hola, Carlos! 👋</h1>
        <p className="text-muted-foreground mt-1">¿Qué vamos a estudiar hoy?</p>
      </div>

      {/* 3 Main CTAs */}
      <ActionCards onNavigate={onNavigate} onStartStudy={onStartStudy} />

      {/* Qué estudiar ahora */}
      <StudyNowSection onStartStudy={onStartStudy} onNavigate={onNavigate} />

      {/* Continuar estudiando */}
      <ContinueStudying onStartStudy={onStartStudy} />

      {/* Progreso por curso */}
      <CourseProgressSection expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} onStartStudy={onStartStudy} onNavigate={onNavigate} />
    </div>
  );
}

/* ─── Action Cards ─── */
const actions = [
  { key: 'tutor', label: 'Estudiar con Tutor AI', desc: 'Aprende paso a paso con tu tutor', icon: Brain, colorClass: 'bg-primary/10 text-primary', borderClass: 'border-primary/20 hover:border-primary/40' },
  { key: 'flashcards', label: 'Repasar Flash Cards', desc: 'Practica y fija lo aprendido', icon: Layers, colorClass: 'bg-accent/10 text-accent', borderClass: 'border-accent/20 hover:border-accent/40' },
  { key: 'simulacros', label: 'Iniciar Simulacro', desc: 'Mide qué tan preparado estás', icon: Target, colorClass: 'bg-mastery-blue/10 text-info', borderClass: 'border-info/20 hover:border-info/40' },
] as const;

function ActionCards({ onNavigate, onStartStudy }: { onNavigate: (v: string) => void; onStartStudy: (id?: string) => void }) {
  const handle = (key: string) => {
    if (key === 'tutor') onStartStudy();
    else onNavigate(key);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-1">
      {actions.map(a => (
        <motion.button
          key={a.key}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handle(a.key)}
          className={cn(
            'stat-card flex flex-col items-center gap-3 py-7 cursor-pointer border transition-all',
            a.borderClass,
          )}
        >
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', a.colorClass)}>
            <a.icon size={24} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground text-sm">{a.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

/* ─── Qué estudiar ahora ─── */
function StudyNowSection({ onStartStudy, onNavigate }: { onStartStudy: (id?: string) => void; onNavigate: (v: string) => void }) {
  return (
    <section className="px-1 space-y-3">
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-primary" />
        <h2 className="heading-3 text-foreground">Qué estudiar ahora</h2>
      </div>
      <div className="space-y-3">
        {studyRecommendations.map((rec, i) => (
          <div key={i} className="stat-card space-y-3">
            {/* Alert */}
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0 mt-0.5">{rec.courseIcon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">{rec.alert}</p>
              </div>
            </div>
            {/* Action + Time */}
            <div className="pl-[2.25rem] space-y-2.5">
              <p className="text-xs text-muted-foreground leading-relaxed">{rec.action}</p>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} /> {rec.time}
                </span>
                <button
                  onClick={() => {
                    if (rec.target === 'tutor') onStartStudy(rec.courseId);
                    else onNavigate(rec.target);
                  }}
                  className="text-xs font-medium px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  {rec.cta} →
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Continue Studying ─── */
function ContinueStudying({ onStartStudy }: { onStartStudy: (id?: string) => void }) {
  const recent = recentSessions.slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <section className="px-1 space-y-3">
      <h2 className="heading-3 text-foreground">Continuar estudiando</h2>
      <div className="space-y-2.5">
        {recent.map(session => {
          const course = courses.find(c => c.id === session.courseId);
          return (
            <motion.button
              key={session.id}
              whileHover={{ x: 2 }}
              onClick={() => onStartStudy(session.courseId)}
              className="stat-card flex items-center gap-4 w-full text-left group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">
                {course?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{session.topic}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{session.courseName} · {session.duration} min</p>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Progreso por curso ─── */
function CourseProgressSection({ expandedCourse, setExpandedCourse, onStartStudy, onNavigate }: {
  expandedCourse: string | null;
  setExpandedCourse: (id: string | null) => void;
  onStartStudy: (id?: string) => void;
  onNavigate: (v: string) => void;
}) {
  const courseDetails: Record<string, {
    mastered: string[];
    pending: { topic: string; pct: number; why: string }[];
    weaknesses: { topic: string; detail: string; severity: 'high' | 'medium' }[];
  }> = {
    math: {
      mastered: ['Ecuaciones lineales'],
      pending: [
        { topic: 'Circunferencia', pct: 0, why: 'No se ha iniciado este tema' },
      ],
      weaknesses: [
        { topic: 'Factorización', detail: 'Dificultad con trinomios cuadrados perfectos y diferencia de cuadrados', severity: 'high' },
        { topic: 'Triángulos', detail: 'Falta practicar el Teorema de Pitágoras en problemas aplicados', severity: 'medium' },
      ],
    },
    comm: {
      mastered: ['Textos argumentativos'],
      pending: [],
      weaknesses: [],
    },
    science: {
      mastered: [],
      pending: [
        { topic: 'La célula', pct: 72, why: 'Faltan organelos y ciclo celular' },
      ],
      weaknesses: [
        { topic: 'La célula', detail: 'Confusión entre mitosis y meiosis, funciones de organelos', severity: 'high' },
      ],
    },
    history: {
      mastered: ['Culturas preincaicas'],
      pending: [],
      weaknesses: [],
    },
    english: {
      mastered: [],
      pending: [
        { topic: 'Present Perfect', pct: 45, why: 'Errores en formas negativas e interrogativas' },
      ],
      weaknesses: [
        { topic: 'Present Perfect', detail: 'Confusión entre "have" y "has", estructura de preguntas', severity: 'high' },
      ],
    },
    social: {
      mastered: [],
      pending: [
        { topic: 'Regiones naturales', pct: 15, why: 'Tema recién iniciado' },
      ],
      weaknesses: [],
    },
  };

  return (
    <section className="px-1 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" />
        <h2 className="heading-3 text-foreground">Progreso por curso</h2>
      </div>
      <div className="space-y-2.5">
        {courseProgress.map(cp => {
          const course = courses.find(c => c.id === cp.courseId);
          const isExpanded = expandedCourse === cp.courseId;
          const detail = courseDetails[cp.courseId];

          return (
            <div key={cp.courseId} className="stat-card overflow-hidden">
              <button
                onClick={() => setExpandedCourse(isExpanded ? null : cp.courseId)}
                className="w-full flex items-center gap-4 text-left"
              >
                <span className="text-xl w-8 text-center shrink-0">{course?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-foreground">{cp.name}</p>
                    <span className="text-sm font-semibold text-foreground">{cp.mastery}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', getMasteryBarColor(cp.mastery))} style={{ width: `${cp.mastery}%` }} />
                  </div>
                </div>
                <ChevronDown size={16} className={cn('text-muted-foreground transition-transform shrink-0', isExpanded && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {isExpanded && detail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 mt-4 border-t border-border space-y-4">
                      {/* Weaknesses - top priority */}
                      {detail.weaknesses.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-mastery-red flex items-center gap-1.5">
                            <AlertTriangle size={13} /> Puntos débiles detectados
                          </p>
                          {detail.weaknesses.map(w => (
                            <div key={w.topic} className="bg-mastery-red/5 border border-mastery-red/10 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground">{w.topic}</p>
                                <span className={cn(
                                  'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full',
                                  w.severity === 'high' ? 'bg-mastery-red/10 text-mastery-red' : 'bg-mastery-orange/10 text-mastery-orange'
                                )}>
                                  {w.severity === 'high' ? 'Prioridad alta' : 'Por mejorar'}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground">{w.detail}</p>
                              <div className="flex gap-2">
                                <button onClick={() => onStartStudy(cp.courseId)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                                  Estudiar con Tutor AI
                                </button>
                                <button onClick={() => onNavigate('flashcards')}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
                                  Flash Cards
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pending topics */}
                      {detail.pending.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-mastery-orange flex items-center gap-1.5">
                            <Clock size={13} /> Temas pendientes
                          </p>
                          {detail.pending.map(p => (
                            <div key={p.topic} className="bg-mastery-orange/5 border border-mastery-orange/10 rounded-xl p-3 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground">{p.topic}</p>
                                <span className="text-xs text-muted-foreground">{p.pct}%</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{p.why}</p>
                              <div className="flex gap-2">
                                <button onClick={() => onStartStudy(cp.courseId)}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                                  Estudiar con Tutor AI
                                </button>
                                <button onClick={() => onNavigate('simulacros')}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
                                  Simulacro
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mastered - compact */}
                      {detail.mastered.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-1.5">
                            <CheckCircle2 size={12} className="text-mastery-green" /> Dominados: {detail.mastered.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Helpers ─── */
function getMasteryBarColor(pct: number): string {
  if (pct < 30) return 'bg-mastery-red';
  if (pct < 55) return 'bg-mastery-orange';
  if (pct < 80) return 'bg-mastery-blue';
  return 'bg-mastery-green';
}
