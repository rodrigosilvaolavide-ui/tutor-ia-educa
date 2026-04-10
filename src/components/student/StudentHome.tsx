import { Brain, Layers, Trophy, ArrowRight, Clock, Target, Star, CheckCircle2 } from 'lucide-react';
import { courses, recentSessions } from '@/lib/mock-data';
import { currentStudentStats, mockWeeklyGoals, getStudentLevel, courseProgress, topicMastery } from '@/lib/gamification';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StudentHomeProps {
  onStartStudy: (courseId?: string) => void;
  onNavigate: (view: string) => void;
}

export default function StudentHome({ onStartStudy, onNavigate }: StudentHomeProps) {
  const level = getStudentLevel(currentStudentStats.points);
  const weakTopics = Object.entries(topicMastery).filter(([, v]) => v < 50).sort((a, b) => a[1] - b[1]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Section */}
      <HeroSection
        name={currentStudentStats.name}
        streak={currentStudentStats.streak}
        points={currentStudentStats.points}
        levelName={level.name}
      />

      {/* Main Actions */}
      <ActionCards onNavigate={onNavigate} onStartStudy={onStartStudy} />

      {/* Continue Studying */}
      <ContinueStudying onStartStudy={onStartStudy} />

      {/* Weekly Goals */}
      <WeeklyGoals />

      {/* Topics to Reinforce */}
      {weakTopics.length > 0 && (
        <ReinforcementChips topics={weakTopics} onStartStudy={onStartStudy} />
      )}
    </div>
  );
}

/* ─── Hero ─── */
function HeroSection({ name, streak, points, levelName }: { name: string; streak: number; points: number; levelName: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8 md:px-10 md:py-10">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 space-y-4">
        <h1 className="heading-1 text-foreground">
          ¡Hola, {name}! 🚀
        </h1>
        <p className="text-muted-foreground text-lg">¿Listo para estudiar hoy?</p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mastery-orange/10 text-sm font-semibold text-foreground">
            🔥 {streak} días
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/10 text-sm font-semibold text-foreground">
            ⚡ {points} pts
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mastery-green/10 text-sm font-semibold text-foreground">
            ✨ {levelName}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Action Cards ─── */
const actions = [
  { key: 'tutor', label: 'Estudiar con Tutor AI', desc: 'Aprende con tu tutor personal', icon: Brain, colorClass: 'bg-primary/10 text-primary', borderClass: 'border-primary/20 hover:border-primary/40' },
  { key: 'flashcards', label: 'Repasar Flash Cards', desc: 'Practica lo aprendido', icon: Layers, colorClass: 'bg-accent/10 text-accent', borderClass: 'border-accent/20 hover:border-accent/40' },
  { key: 'simulacros', label: 'Iniciar Simulacro', desc: 'Mide tu preparación', icon: Trophy, colorClass: 'bg-mastery-blue/10 text-info', borderClass: 'border-info/20 hover:border-info/40' },
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

/* ─── Weekly Goals ─── */
function WeeklyGoals() {
  return (
    <section className="px-1 space-y-3">
      <h2 className="heading-3 text-foreground">Metas semanales</h2>
      <div className="space-y-2.5">
        {mockWeeklyGoals.map(goal => (
          <div key={goal.id} className={cn('stat-card flex items-center gap-3', goal.completed && 'border-mastery-green/30')}>
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center shrink-0',
              goal.completed ? 'bg-mastery-green/10' : 'bg-muted',
            )}>
              {goal.completed
                ? <CheckCircle2 size={16} className="text-mastery-green" />
                : <Target size={14} className="text-muted-foreground" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn('text-sm', goal.completed ? 'text-mastery-green font-medium line-through' : 'text-foreground')}>
                {goal.description}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-28">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', goal.completed ? 'bg-mastery-green' : 'bg-primary')}
                  style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground w-8 text-right">{goal.current}/{goal.target}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Reinforcement Chips ─── */
function ReinforcementChips({ topics, onStartStudy }: { topics: [string, number][]; onStartStudy: (id?: string) => void }) {
  return (
    <section className="px-1 space-y-3">
      <h2 className="heading-3 text-foreground">Temas por reforzar</h2>
      <div className="flex flex-wrap gap-2">
        {topics.map(([topic, pct]) => (
          <button
            key={topic}
            onClick={() => onStartStudy()}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer hover:scale-105',
              pct < 25
                ? 'bg-mastery-red/10 text-mastery-red hover:bg-mastery-red/20'
                : 'bg-mastery-orange/10 text-mastery-orange hover:bg-mastery-orange/20',
            )}
          >
            <Star size={13} />
            {topic} · {pct}%
          </button>
        ))}
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
