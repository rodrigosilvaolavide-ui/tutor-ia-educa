import { BookOpen, Clock, ArrowRight, Flame, TrendingUp, Star, Target, Layers, Zap, Trophy } from 'lucide-react';
import { courses, recentSessions } from '@/lib/mock-data';
import { currentStudentStats, mockWeeklyGoals, mockBadges, getStudentLevel, courseProgress, topicMastery, getMasteryLevel, masteryLabels } from '@/lib/gamification';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StudentHomeProps {
  onStartStudy: (courseId?: string) => void;
  onNavigate: (view: string) => void;
}

export default function StudentHome({ onStartStudy, onNavigate }: StudentHomeProps) {
  const level = getStudentLevel(currentStudentStats.points);
  const unlockedBadges = mockBadges.filter(b => b.unlocked);
  const weakTopics = Object.entries(topicMastery).filter(([, v]) => v < 50).sort((a, b) => a[1] - b[1]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome + CTA */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="heading-1 text-foreground">¡Hola, Santiago! 👋</h1>
          <p className="text-muted-foreground mt-1">¿Qué quieres estudiar hoy?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 rounded-full">
            <Flame size={14} className="text-accent" />
            <span className="text-sm font-semibold text-foreground">{currentStudentStats.streak} días</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 rounded-full">
            <Star size={14} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">{currentStudentStats.points} pts</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Racha actual', value: `${currentStudentStats.streak} días`, icon: <Flame size={18} />, color: 'text-accent' },
          { label: 'Tiempo esta semana', value: '2h 45m', icon: <Clock size={18} />, color: 'text-info' },
          { label: 'Nivel', value: level.name, icon: <Star size={18} />, color: 'text-primary' },
          { label: 'Dominio promedio', value: '72%', icon: <TrendingUp size={18} />, color: 'text-success' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={cn(stat.color, 'mb-2')}>{stat.icon}</div>
            <p className="text-xl font-bold font-heading text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* CTA: Continue studying */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Continuar estudiando</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {recentSessions.slice(0, 2).map((session) => (
            <motion.button
              key={session.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onStartStudy(session.courseId)}
              className="stat-card flex items-center gap-4 text-left w-full group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                {courses.find(c => c.id === session.courseId)?.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{session.courseName}</p>
                <p className="text-sm text-muted-foreground truncate">{session.topic}</p>
                <p className="text-xs text-muted-foreground mt-1">{session.duration} min · {session.score}% dominio</p>
              </div>
              <ArrowRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('flashcards')}
          className="stat-card flex flex-col items-center gap-3 py-6 cursor-pointer bg-accent/5 border-accent/20 hover:bg-accent/10">
          <Layers size={24} className="text-accent" />
          <p className="font-medium text-foreground text-sm">Flash Cards</p>
          <p className="text-xs text-muted-foreground">Repasa y practica</p>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('simulacros')}
          className="stat-card flex flex-col items-center gap-3 py-6 cursor-pointer bg-info/5 border-info/20 hover:bg-info/10">
          <Target size={24} className="text-info" />
          <p className="font-medium text-foreground text-sm">Simulacros</p>
          <p className="text-xs text-muted-foreground">Mide tu preparación</p>
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('tutor')}
          className="stat-card flex flex-col items-center gap-3 py-6 cursor-pointer bg-primary/5 border-primary/20 hover:bg-primary/10 col-span-2 md:col-span-1">
          <Zap size={24} className="text-primary" />
          <p className="font-medium text-foreground text-sm">Tutor AI</p>
          <p className="text-xs text-muted-foreground">Estudia con tu tutor</p>
        </motion.button>
      </div>

      {/* Courses */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Mis cursos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((course) => {
            const cp = courseProgress.find(c => c.courseId === course.id);
            return (
              <motion.button
                key={course.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onStartStudy(course.id)}
                className="stat-card flex flex-col items-center gap-3 py-6 group cursor-pointer"
              >
                <div className="text-3xl">{course.icon}</div>
                <p className="font-medium text-foreground text-sm">{course.name}</p>
                {cp && (
                  <div className="w-full px-3">
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${cp.mastery}%` }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{cp.mastery}% dominio</p>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Weekly goals */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Metas semanales</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {mockWeeklyGoals.map(goal => (
            <div key={goal.id} className={cn('stat-card flex items-center gap-3', goal.completed && 'bg-success/5 border-success/20')}>
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                goal.completed ? 'bg-success/10' : 'bg-muted')}>
                {goal.completed ? <Trophy size={14} className="text-success" /> : <Target size={14} className="text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', goal.completed ? 'text-success font-medium' : 'text-foreground')}>{goal.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className={cn('h-full rounded-full', goal.completed ? 'bg-success' : 'bg-primary')}
                      style={{ width: `${(goal.current / goal.target) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground">{goal.current}/{goal.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topics to reinforce */}
      {weakTopics.length > 0 && (
        <div>
          <h2 className="heading-3 text-foreground mb-4">Temas por reforzar</h2>
          <div className="flex flex-wrap gap-2">
            {weakTopics.map(([topic, pct]) => (
              <button key={topic} onClick={() => onStartStudy()} className="chip flex items-center gap-1.5">
                <Star size={14} />
                {topic} ({pct}%)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent badges */}
      {unlockedBadges.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="heading-3 text-foreground">Logros recientes</h2>
            <button onClick={() => onNavigate('profile')} className="text-xs text-primary hover:underline">Ver todos</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {unlockedBadges.slice(0, 4).map(badge => (
              <div key={badge.id} className="stat-card text-center py-4 px-6 shrink-0">
                <span className="text-2xl block mb-1">{badge.icon}</span>
                <p className="text-xs font-medium text-foreground">{badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sessions */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Sesiones recientes</h2>
        <div className="space-y-2">
          {recentSessions.map((session) => (
            <div key={session.id} className="stat-card flex items-center gap-4">
              <div className="text-xl">{courses.find(c => c.id === session.courseId)?.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{session.topic}</p>
                <p className="text-xs text-muted-foreground">{session.courseName} · {session.date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-foreground">{session.score}%</p>
                <p className="text-xs text-muted-foreground">{session.duration} min</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
