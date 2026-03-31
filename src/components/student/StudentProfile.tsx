import { Flame, Star, Trophy, Target, Clock, BookOpen, TrendingUp, Zap, ChevronRight } from 'lucide-react';
import { currentStudentStats, mockBadges, mockWeeklyGoals, courseProgress, topicMastery, getStudentLevel, getMasteryLevel, masteryLabels, masteryColors } from '@/lib/gamification';
import { courses, recentSessions } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';

const weeklyData = [
  { day: 'Lun', min: 35 },
  { day: 'Mar', min: 22 },
  { day: 'Mié', min: 45 },
  { day: 'Jue', min: 30 },
  { day: 'Vie', min: 50 },
  { day: 'Sáb', min: 15 },
  { day: 'Dom', min: 0 },
];

const progressTrend = [
  { semana: 'S1', dominio: 45 },
  { semana: 'S2', dominio: 52 },
  { semana: 'S3', dominio: 60 },
  { semana: 'S4', dominio: 68 },
  { semana: 'S5', dominio: 72 },
  { semana: 'S6', dominio: 78 },
];

export default function StudentProfile() {
  const level = getStudentLevel(currentStudentStats.points);
  const nextLevelPoints = [100, 300, 600, 1000, 1600, 2500][level.number] || 2500;
  const prevLevelPoints = [0, 100, 300, 600, 1000, 1600][level.number - 1] || 0;
  const levelProgress = Math.round(((currentStudentStats.points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Profile header */}
      <div className="stat-card flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
          S
        </div>
        <div className="flex-1">
          <h1 className="heading-1 text-foreground">{currentStudentStats.name}</h1>
          <p className="text-muted-foreground text-sm">4°A</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              <Star size={14} className="text-primary" /> Nivel {level.number}: {level.name}
            </span>
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              <Flame size={14} className="text-accent" /> {currentStudentStats.streak} días
            </span>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              {currentStudentStats.points} pts
            </span>
          </div>
        </div>
      </div>

      {/* Level progress */}
      <div className="stat-card">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Progreso al siguiente nivel</p>
          <p className="text-xs text-muted-foreground">{currentStudentStats.points} / {nextLevelPoints} pts</p>
        </div>
        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tiempo total', value: `${Math.round(currentStudentStats.totalStudyTime / 60)}h ${currentStudentStats.totalStudyTime % 60}m`, icon: <Clock size={18} />, color: 'text-info' },
          { label: 'Sesiones', value: currentStudentStats.sessionsCompleted.toString(), icon: <BookOpen size={18} />, color: 'text-primary' },
          { label: 'Racha máxima', value: `${currentStudentStats.maxStreak} días`, icon: <Flame size={18} />, color: 'text-accent' },
          { label: 'Dominio promedio', value: '72%', icon: <TrendingUp size={18} />, color: 'text-success' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={cn(s.color, 'mb-2')}>{s.icon}</div>
            <p className="text-xl font-bold font-heading text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly goals */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Metas semanales</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {mockWeeklyGoals.map(goal => (
            <div key={goal.id} className={cn('stat-card flex items-center gap-4', goal.completed && 'bg-success/5 border-success/20')}>
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                goal.completed ? 'bg-success/10' : 'bg-muted')}>
                {goal.completed ? <Trophy size={16} className="text-success" /> : <Target size={16} className="text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', goal.completed ? 'text-success' : 'text-foreground')}>{goal.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
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

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-4">Tiempo de estudio semanal</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="min" fill="hsl(172, 50%, 28%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-4">Evolución de dominio</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={progressTrend}>
              <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="dominio" stroke="hsl(172, 50%, 28%)" strokeWidth={2} dot={{ fill: 'hsl(172, 50%, 28%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course progress */}
      <div className="stat-card">
        <h3 className="heading-4 text-foreground mb-4">Progreso por curso</h3>
        <div className="space-y-4">
          {courseProgress.map(cp => {
            const course = courses.find(c => c.id === cp.courseId);
            return (
              <div key={cp.courseId} className="flex items-center gap-4">
                <span className="text-xl w-8 text-center">{course?.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-foreground">{cp.name}</p>
                    <p className="text-sm font-semibold text-foreground">{cp.mastery}%</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${cp.mastery}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{cp.sessions} sesiones · {cp.flashCards} flash cards · {cp.simulacros} simulacros</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic mastery */}
      <div className="stat-card">
        <h3 className="heading-4 text-foreground mb-4">Dominio por tema</h3>
        <div className="space-y-3">
          {Object.entries(topicMastery).sort((a, b) => b[1] - a[1]).map(([topic, pct]) => {
            const lvl = getMasteryLevel(pct);
            return (
              <div key={topic} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-foreground">{topic}</span>
                    <span className={cn('text-xs font-medium', masteryColors[lvl])}>{masteryLabels[lvl]}</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <span className="text-xs font-medium text-foreground w-10 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Badges</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mockBadges.map(badge => (
            <div key={badge.id} className={cn('stat-card text-center py-5', !badge.unlocked && 'opacity-50')}>
              <span className="text-3xl block mb-2">{badge.icon}</span>
              <p className="text-sm font-medium text-foreground">{badge.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
              {badge.unlocked && badge.unlockedDate && (
                <p className="text-[10px] text-success mt-2">
                  Desbloqueada {badge.unlockedDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                </p>
              )}
              {!badge.unlocked && badge.progress !== undefined && (
                <div className="mt-2">
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${badge.progress}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{badge.progress}%</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent sessions */}
      <div className="stat-card">
        <h3 className="heading-4 text-foreground mb-3">Sesiones recientes</h3>
        <div className="space-y-2">
          {recentSessions.map(session => (
            <div key={session.id} className="flex items-center gap-4 px-3 py-2 rounded-lg hover:bg-muted/50">
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
