import { useState } from 'react';
import { Brain, Layers, Target, ArrowRight, Clock, ChevronRight, ChevronDown, BookOpen, TrendingUp, AlertCircle, Zap, BarChart3, X } from 'lucide-react';
import { courses, recentSessions } from '@/lib/mock-data';
import { currentStudentStats, courseProgress, topicMastery, getMasteryLevel, masteryLabels } from '@/lib/gamification';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StudentHomeProps {
  onStartStudy: (courseId?: string) => void;
  onNavigate: (view: string) => void;
}

/* ─── Study recommendations (mock) ─── */
const studyRecommendations = [
  {
    course: 'Matemática', coursIcon: '📐', courseId: 'math',
    topic: 'Factorización', reason: 'Te está costando este tema',
    action: 'tutor' as const, actionLabel: 'Estudiar con Tutor AI',
  },
  {
    course: 'Ciencia y Tecnología', coursIcon: '🔬', courseId: 'science',
    topic: 'La célula', reason: 'Lo dejaste a medias la última vez',
    action: 'tutor' as const, actionLabel: 'Continuar con Tutor AI',
  },
  {
    course: 'Inglés', coursIcon: '🌎', courseId: 'english',
    topic: 'Present Perfect', reason: 'Conviene reforzar antes del simulacro',
    action: 'flashcards' as const, actionLabel: 'Practicar Flash Cards',
  },
  {
    course: 'Ciencias Sociales', coursIcon: '🌍', courseId: 'social',
    topic: 'Regiones naturales', reason: 'Es tu siguiente paso recomendado',
    action: 'tutor' as const, actionLabel: 'Estudiar con Tutor AI',
  },
];

/* ─── Recommended plan ─── */
const recommendedPlan = [
  { text: 'Reforzar Factorización en Matemática', action: 'tutor', courseId: 'math', topic: 'Factorización', icon: Brain },
  { text: 'Completar simulacro de Ciencia y Tecnología', action: 'simulacros', courseId: 'science', topic: '', icon: Target },
  { text: 'Terminar La célula en Ciencia', action: 'tutor', courseId: 'science', topic: 'La célula', icon: BookOpen },
  { text: 'Repasar Present Perfect con Flash Cards', action: 'flashcards', courseId: 'english', topic: 'Present Perfect', icon: Layers },
];

export default function StudentHome({ onStartStudy, onNavigate }: StudentHomeProps) {
  const weakTopics = Object.entries(topicMastery)
    .filter(([, v]) => v < 50)
    .sort((a, b) => a[1] - b[1]);

  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [reinforceDetail, setReinforceDetail] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <HeaderSection name={currentStudentStats.name} />

      {/* Main CTAs */}
      <ActionCards onNavigate={onNavigate} onStartStudy={onStartStudy} />

      {/* Qué estudiar ahora */}
      <StudyNowSection recommendations={studyRecommendations} onStartStudy={onStartStudy} onNavigate={onNavigate} />

      {/* Continuar estudiando */}
      <ContinueStudying onStartStudy={onStartStudy} />

      {/* Progreso por curso */}
      <CourseProgressSection expandedCourse={expandedCourse} setExpandedCourse={setExpandedCourse} onStartStudy={onStartStudy} onNavigate={onNavigate} />

      {/* Temas por reforzar */}
      {weakTopics.length > 0 && (
        <ReinforceSection topics={weakTopics} onStartStudy={onStartStudy} reinforceDetail={reinforceDetail} setReinforceDetail={setReinforceDetail} />
      )}

      {/* Plan recomendado */}
      <RecommendedPlan onStartStudy={onStartStudy} onNavigate={onNavigate} />

      {/* Sesiones recientes */}
      <RecentActivity />
    </div>
  );
}

/* ─── Header ─── */
function HeaderSection({ name }: { name: string }) {
  const daysStudied = 4;
  const sessionsThisWeek = 6;
  const weakCount = Object.values(topicMastery).filter(v => v < 50).length;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 md:px-10 md:py-10">
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative z-10 space-y-4">
        <h1 className="heading-1 text-foreground">
          ¡Hola, {name}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">¿Qué vamos a estudiar hoy?</p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-sm font-medium text-foreground">
            📅 {daysStudied} días estudiados esta semana
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mastery-blue/10 text-sm font-medium text-foreground">
            📖 {sessionsThisWeek} sesiones completadas
          </span>
          {weakCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mastery-orange/10 text-sm font-medium text-foreground">
              ⚠️ {weakCount} temas por reforzar
            </span>
          )}
        </div>
      </div>
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
function StudyNowSection({ recommendations, onStartStudy, onNavigate }: {
  recommendations: typeof studyRecommendations;
  onStartStudy: (id?: string) => void;
  onNavigate: (v: string) => void;
}) {
  return (
    <section className="px-1 space-y-3">
      <div className="flex items-center gap-2">
        <Zap size={18} className="text-primary" />
        <h2 className="heading-3 text-foreground">Qué estudiar ahora</h2>
      </div>
      <div className="space-y-2.5">
        {recommendations.map((rec) => (
          <motion.button
            key={`${rec.courseId}-${rec.topic}`}
            whileHover={{ x: 2 }}
            onClick={() => {
              if (rec.action === 'tutor') onStartStudy(rec.courseId);
              else onNavigate(rec.action);
            }}
            className="stat-card flex items-center gap-4 w-full text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">
              {rec.coursIcon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{rec.course}: {rec.topic}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{rec.reason}</p>
            </div>
            <span className="text-xs text-primary font-medium shrink-0 hidden sm:block">{rec.actionLabel}</span>
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* ─── Continue Studying ─── */
function ContinueStudying({ onStartStudy }: { onStartStudy: (id?: string) => void }) {
  const recent = recentSessions.slice(0, 3);
  if (recent.length === 0) return null;

  const insights: Record<string, string> = {
    's1': 'Buen avance, te falta practicar más',
    's2': 'Te falta reforzar conceptos base',
    's3': 'Conviene cerrar este tema antes de seguir',
  };

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
                <p className="text-xs text-muted-foreground mt-0.5">
                  {insights[session.id] || `Última sesión: ${session.courseName}`}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[140px]">
                    <div
                      className={cn('h-full rounded-full', getMasteryBarColor(session.score))}
                      style={{ width: `${session.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{session.score}%</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                <Clock size={12} /> {session.duration} min
              </span>
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
  // Mock detail data per course
  const courseDetails: Record<string, { mastered: string[]; pending: string[]; weaknesses: string[]; recommendation: string }> = {
    math: {
      mastered: ['Ecuaciones lineales'],
      pending: ['Circunferencia'],
      weaknesses: ['Factorización: Dificultad con trinomios', 'Circunferencia: No se ha iniciado'],
      recommendation: 'Refuerza Factorización con el Tutor AI antes de avanzar a Circunferencia.',
    },
    comm: {
      mastered: ['Textos argumentativos'],
      pending: [],
      weaknesses: [],
      recommendation: 'Excelente avance. Practica con un simulacro para consolidar.',
    },
    science: {
      mastered: [],
      pending: ['La célula'],
      weaknesses: ['La célula: Falta reforzar organelos y ciclo celular'],
      recommendation: 'Continúa estudiando La célula con el Tutor AI.',
    },
    history: {
      mastered: ['Culturas preincaicas'],
      pending: [],
      weaknesses: [],
      recommendation: 'Buen dominio. Puedes practicar con Flash Cards.',
    },
    english: {
      mastered: [],
      pending: ['Present Perfect'],
      weaknesses: ['Present Perfect: Confusión con formas negativas y preguntas'],
      recommendation: 'Estudia Present Perfect con el Tutor AI para aclarar dudas.',
    },
    social: {
      mastered: [],
      pending: ['Regiones naturales'],
      weaknesses: ['Regiones naturales: Recién empezando'],
      recommendation: 'Inicia el tema con el Tutor AI.',
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
          const statusLabel = cp.mastery >= 80 ? 'Buen dominio' : cp.mastery >= 50 ? 'En progreso' : 'Por reforzar';
          const statusColor = cp.mastery >= 80 ? 'text-mastery-green' : cp.mastery >= 50 ? 'text-mastery-blue' : 'text-mastery-orange';

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
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-medium', statusColor)}>{statusLabel}</span>
                      <span className="text-sm font-semibold text-foreground">{cp.mastery}%</span>
                    </div>
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
                    <div className="pt-4 mt-4 border-t border-border space-y-3">
                      {detail.mastered.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-mastery-green mb-1">✅ Temas dominados</p>
                          <p className="text-xs text-muted-foreground">{detail.mastered.join(', ')}</p>
                        </div>
                      )}
                      {detail.pending.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-mastery-orange mb-1">📋 Temas pendientes</p>
                          <p className="text-xs text-muted-foreground">{detail.pending.join(', ')}</p>
                        </div>
                      )}
                      {detail.weaknesses.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-mastery-red mb-1">⚠️ Puntos débiles detectados</p>
                          <ul className="text-xs text-muted-foreground space-y-0.5">
                            {detail.weaknesses.map(w => <li key={w}>• {w}</li>)}
                          </ul>
                        </div>
                      )}
                      <div className="bg-primary/5 rounded-lg p-3">
                        <p className="text-xs font-medium text-primary mb-1">💡 Recomendación</p>
                        <p className="text-xs text-foreground">{detail.recommendation}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => onStartStudy(cp.courseId)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                          Estudiar con Tutor AI
                        </button>
                        <button onClick={() => onNavigate('flashcards')}
                          className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
                          Flash Cards
                        </button>
                        <button onClick={() => onNavigate('simulacros')}
                          className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted transition-colors">
                          Simulacro
                        </button>
                      </div>
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

/* ─── Temas por reforzar ─── */
function ReinforceSection({ topics, onStartStudy, reinforceDetail, setReinforceDetail }: {
  topics: [string, number][];
  onStartStudy: (id?: string) => void;
  reinforceDetail: string | null;
  setReinforceDetail: (t: string | null) => void;
}) {
  const topicReasons: Record<string, { why: string; what: string; courseId: string }> = {
    'Factorización': { why: 'Bajo rendimiento en las últimas sesiones de práctica', what: 'Trinomios y diferencia de cuadrados', courseId: 'math' },
    'Circunferencia': { why: 'No se ha estudiado este tema aún', what: 'Elementos y ángulos inscritos', courseId: 'math' },
    'Present Perfect': { why: 'Errores frecuentes en formas negativas', what: 'Estructura de oraciones negativas y preguntas', courseId: 'english' },
    'Regiones naturales': { why: 'Tema recién iniciado, falta profundizar', what: 'Características de Costa, Sierra y Selva', courseId: 'social' },
  };

  return (
    <section className="px-1 space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle size={18} className="text-mastery-orange" />
        <h2 className="heading-3 text-foreground">Temas por reforzar</h2>
      </div>
      <div className="space-y-2">
        {topics.map(([topic, pct]) => {
          const detail = topicReasons[topic];
          const isOpen = reinforceDetail === topic;

          return (
            <div key={topic} className="stat-card overflow-hidden">
              <button
                onClick={() => setReinforceDetail(isOpen ? null : topic)}
                className="w-full flex items-center gap-3 text-left"
              >
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  pct < 25 ? 'bg-mastery-red/10' : 'bg-mastery-orange/10'
                )}>
                  <AlertCircle size={14} className={pct < 25 ? 'text-mastery-red' : 'text-mastery-orange'} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{topic}</p>
                  <p className="text-xs text-muted-foreground">{pct}% de dominio</p>
                </div>
                <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {isOpen && detail && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="pt-3 mt-3 border-t border-border space-y-2">
                      <p className="text-xs text-muted-foreground"><strong className="text-foreground">¿Por qué?</strong> {detail.why}</p>
                      <p className="text-xs text-muted-foreground"><strong className="text-foreground">¿Qué reforzar?</strong> {detail.what}</p>
                      <div className="flex gap-2 pt-1">
                        <button onClick={() => onStartStudy(detail.courseId)}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90">
                          Estudiar con Tutor AI
                        </button>
                        <button onClick={() => onStartStudy(detail.courseId)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-border text-foreground font-medium hover:bg-muted">
                          Flash Cards
                        </button>
                      </div>
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

/* ─── Plan recomendado ─── */
function RecommendedPlan({ onStartStudy, onNavigate }: { onStartStudy: (id?: string) => void; onNavigate: (v: string) => void }) {
  return (
    <section className="px-1 space-y-3">
      <div className="flex items-center gap-2">
        <TrendingUp size={18} className="text-primary" />
        <h2 className="heading-3 text-foreground">Plan recomendado</h2>
      </div>
      <div className="space-y-2">
        {recommendedPlan.map((item, i) => (
          <motion.button
            key={i}
            whileHover={{ x: 2 }}
            onClick={() => {
              if (item.action === 'tutor') onStartStudy(item.courseId);
              else onNavigate(item.action);
            }}
            className="stat-card flex items-center gap-3 w-full text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <item.icon size={16} className="text-primary" />
            </div>
            <p className="text-sm text-foreground flex-1">{item.text}</p>
            <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* ─── Sesiones recientes ─── */
function RecentActivity() {
  const recent = recentSessions.slice(0, 3);
  if (recent.length === 0) return null;

  return (
    <section className="px-1 space-y-3">
      <h2 className="heading-3 text-foreground">Actividad reciente</h2>
      <div className="stat-card">
        <div className="space-y-2">
          {recent.map(session => (
            <div key={session.id} className="flex items-center gap-3 py-1.5">
              <div className="text-lg">{courses.find(c => c.id === session.courseId)?.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{session.topic}</p>
                <p className="text-xs text-muted-foreground">
                  {session.courseName} · {session.date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">{session.score}%</p>
                <p className="text-xs text-muted-foreground">{session.duration} min</p>
              </div>
            </div>
          ))}
        </div>
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
