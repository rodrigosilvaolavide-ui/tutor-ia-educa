import { Clock, BookOpen, TrendingUp, Flame, BarChart3 } from 'lucide-react';
import { courses } from '@/lib/mock-data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const weeklyData = [
  { day: 'Lun', minutos: 35 },
  { day: 'Mar', minutos: 22 },
  { day: 'Mié', minutos: 45 },
  { day: 'Jue', minutos: 30 },
  { day: 'Vie', minutos: 50 },
  { day: 'Sáb', minutos: 15 },
  { day: 'Dom', minutos: 0 },
];

const progressData = [
  { semana: 'Sem 1', dominio: 45 },
  { semana: 'Sem 2', dominio: 52 },
  { semana: 'Sem 3', dominio: 60 },
  { semana: 'Sem 4', dominio: 68 },
  { semana: 'Sem 5', dominio: 72 },
  { semana: 'Sem 6', dominio: 78 },
];

const courseProgress = [
  { name: 'Matemática', progress: 72, sessions: 8 },
  { name: 'Comunicación', progress: 85, sessions: 6 },
  { name: 'Ciencia y Tecnología', progress: 58, sessions: 4 },
  { name: 'Historia', progress: 45, sessions: 3 },
  { name: 'Inglés', progress: 30, sessions: 2 },
];

export default function StudentProgress() {
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="heading-1 text-foreground">Mi progreso</h1>
        <p className="text-muted-foreground mt-1">Tu resumen de aprendizaje y rendimiento</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tiempo total', value: '12h 30m', icon: <Clock size={18} />, color: 'text-info' },
          { label: 'Sesiones', value: '24', icon: <BookOpen size={18} />, color: 'text-primary' },
          { label: 'Dominio promedio', value: '78%', icon: <TrendingUp size={18} />, color: 'text-success' },
          { label: 'Racha máxima', value: '8 días', icon: <Flame size={18} />, color: 'text-warning' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold font-heading text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-4">Tiempo de estudio semanal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="minutos" fill="hsl(172, 50%, 28%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-4">Evolución de dominio</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="dominio" stroke="hsl(172, 50%, 28%)" strokeWidth={2} dot={{ fill: 'hsl(172, 50%, 28%)' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Course Progress */}
      <div className="stat-card">
        <h3 className="heading-4 text-foreground mb-4">Progreso por curso</h3>
        <div className="space-y-4">
          {courseProgress.map((cp) => {
            const course = courses.find(c => c.name === cp.name);
            return (
              <div key={cp.name} className="flex items-center gap-4">
                <div className="text-xl w-8 text-center">{course?.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-foreground">{cp.name}</p>
                    <p className="text-sm font-semibold text-foreground">{cp.progress}%</p>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${cp.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{cp.sessions} sesiones completadas</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-success" /> Temas fuertes
          </h3>
          <div className="space-y-2">
            {['Ecuaciones lineales', 'Textos argumentativos', 'Comprensión lectora', 'Culturas preincaicas'].map(t => (
              <div key={t} className="flex items-center gap-2 px-3 py-2 bg-success/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-success" />
                <span className="text-sm text-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-3 flex items-center gap-2">
            <BarChart3 size={18} className="text-warning" /> Temas por reforzar
          </h3>
          <div className="space-y-2">
            {['Factorización', 'Circunferencia', 'La célula', 'Present Perfect'].map(t => (
              <div key={t} className="flex items-center gap-2 px-3 py-2 bg-warning/5 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-sm text-foreground">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
