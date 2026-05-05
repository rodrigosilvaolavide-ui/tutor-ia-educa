import { Trophy, Flame, TrendingUp, Star, Users, Info } from 'lucide-react';
import { mockClassmates, currentStudentStats, getStudentLevel } from '@/lib/gamification';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const weeklyHighlights = [
  { label: 'Mayor mejora', student: 'Valentina Rojas', icon: '📈' },
  { label: 'Más constante', student: 'Camila Mendoza', icon: '🔥' },
  { label: 'Mejor racha', student: 'Isabella Vargas', icon: '⚡' },
  { label: 'Más activo en simulacros', student: 'Sofía Rivera', icon: '🎯' },
  { label: 'Nuevo tema dominado', student: 'Luciana Herrera', icon: '🏆' },
];

export default function MyClass() {
  const level = getStudentLevel(currentStudentStats.points);
  const classAvgStreak = 4.2;
  const classAvgPoints = 520;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="heading-1 text-foreground">Mi Clase</h1>
        <p className="text-muted-foreground mt-1">4°A · Compara tu avance y celebra los logros de tu sección</p>
      </div>

      {/* Your position summary */}
      <div className="stat-card bg-primary/5 border-primary/20">
        <h2 className="text-sm font-medium text-primary mb-4">Tu posición</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-xl font-bold font-heading text-foreground">{level.name}</p>
            <p className="text-xs text-muted-foreground">Nivel {level.number}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame size={16} className="text-accent" />
              <p className="text-xl font-bold font-heading text-foreground">{currentStudentStats.streak}</p>
            </div>
            <p className="text-xs text-muted-foreground">Racha</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold font-heading text-foreground">{currentStudentStats.points}</p>
            <p className="text-xs text-muted-foreground">Puntos</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {currentStudentStats.streak > classAvgStreak && (
            <p className="text-xs text-foreground flex items-center gap-2">
              <TrendingUp size={12} className="text-success" /> Tu racha es más alta que el promedio de tu clase
            </p>
          )}
          {currentStudentStats.points > classAvgPoints && (
            <p className="text-xs text-foreground flex items-center gap-2">
              <Star size={12} className="text-accent" /> Tus puntos de progreso están por encima del promedio
            </p>
          )}
          <p className="text-xs text-foreground flex items-center gap-2">
            <TrendingUp size={12} className="text-info" /> Esta semana mejoraste más que el promedio en Flash Cards
          </p>
        </div>
      </div>

      {/* Weekly highlights */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Compañeros destacados de la semana</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {weeklyHighlights.map((h) => (
            <motion.div key={h.label} whileHover={{ scale: 1.02 }}
              className="stat-card text-center py-4">
              <span className="text-2xl block mb-2">{h.icon}</span>
              <p className="text-xs font-medium text-foreground truncate">{h.student}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{h.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Classmate gallery */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Compañeros de sección</h2>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4">
          <Info size={14} className="shrink-0" />
          <span>
            Ranking de demo — aparecerán tus compañeros reales cuando más alumnos estén activos en la app.
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mockClassmates.map((c) => (
            <div key={c.id} className="stat-card text-center py-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary mx-auto mb-3">
                {c.avatar}
              </div>
              <p className="text-sm font-medium text-foreground">{c.name.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground">{c.level}</p>
              <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Flame size={10} className="text-accent" />{c.streak}</span>
                <span className="flex items-center gap-1"><Star size={10} className="text-primary" />{c.badges.length}</span>
              </div>
              {c.recentAchievement && (
                <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                  {c.recentAchievement}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Healthy comparisons */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Comparativas</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: 'Tu constancia vs promedio', you: currentStudentStats.streak, avg: classAvgStreak, unit: 'días', icon: <Flame size={16} className="text-accent" /> },
            { label: 'Tus puntos vs promedio', you: currentStudentStats.points, avg: classAvgPoints, unit: 'pts', icon: <Star size={16} className="text-primary" /> },
            { label: 'Tus sesiones de Flash Cards', you: currentStudentStats.flashCardsSessions, avg: 10, unit: 'sesiones', icon: <Users size={16} className="text-info" /> },
          ].map(comp => {
            const pctAbove = Math.round(((comp.you - comp.avg) / comp.avg) * 100);
            const isAbove = comp.you > comp.avg;
            return (
              <div key={comp.label} className="stat-card">
                <div className="flex items-center gap-2 mb-3">{comp.icon}<p className="text-sm font-medium text-foreground">{comp.label}</p></div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold font-heading text-foreground">{comp.you}</p>
                    <p className="text-xs text-muted-foreground">{comp.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-sm font-medium', isAbove ? 'text-success' : 'text-muted-foreground')}>
                      {isAbove ? `+${pctAbove}%` : `${pctAbove}%`}
                    </p>
                    <p className="text-xs text-muted-foreground">vs. prom. {comp.avg}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
