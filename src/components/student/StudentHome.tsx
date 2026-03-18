import { BookOpen, Clock, ArrowRight, Flame, TrendingUp, Star } from 'lucide-react';
import { courses, recentSessions } from '@/lib/mock-data';
import { motion } from 'framer-motion';

interface StudentHomeProps {
  onStartStudy: (courseId?: string) => void;
}

export default function StudentHome({ onStartStudy }: StudentHomeProps) {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="heading-1 text-foreground">¡Hola, Santiago! 👋</h1>
        <p className="text-muted-foreground mt-1">¿Qué quieres estudiar hoy?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Racha semanal', value: '5 días', icon: <Flame size={18} />, color: 'text-warning' },
          { label: 'Tiempo esta semana', value: '2h 45m', icon: <Clock size={18} />, color: 'text-info' },
          { label: 'Sesiones completadas', value: '12', icon: <BookOpen size={18} />, color: 'text-primary' },
          { label: 'Dominio promedio', value: '78%', icon: <TrendingUp size={18} />, color: 'text-success' },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className={`${stat.color} mb-2`}>{stat.icon}</div>
            <p className="text-xl font-bold font-heading text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Continue Studying */}
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

      {/* Courses */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Mis cursos</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <motion.button
              key={course.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onStartStudy(course.id)}
              className="stat-card flex flex-col items-center gap-3 py-6 group cursor-pointer"
            >
              <div className="text-3xl">{course.icon}</div>
              <p className="font-medium text-foreground text-sm">{course.name}</p>
              <span className="text-xs text-muted-foreground">{course.units.length} unidades</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Topics to Review */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Temas por reforzar</h2>
        <div className="flex flex-wrap gap-2">
          {['Factorización', 'Circunferencia', 'La célula', 'Present Perfect'].map((topic) => (
            <button key={topic} onClick={() => onStartStudy()} className="chip flex items-center gap-1.5">
              <Star size={14} />
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Sessions */}
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
