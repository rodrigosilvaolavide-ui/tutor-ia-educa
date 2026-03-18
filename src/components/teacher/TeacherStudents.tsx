import { useState } from 'react';
import { mockStudents } from '@/lib/mock-data';
import { Search, Filter, ArrowLeft, Clock, BookOpen, TrendingUp, AlertTriangle, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TeacherStudentsProps {
  onBack: () => void;
}

const studyTimeData = [
  { sem: 'Sem 1', min: 120 },
  { sem: 'Sem 2', min: 180 },
  { sem: 'Sem 3', min: 150 },
  { sem: 'Sem 4', min: 220 },
  { sem: 'Sem 5', min: 200 },
  { sem: 'Sem 6', min: 280 },
];

export default function TeacherStudents({ onBack }: TeacherStudentsProps) {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const filtered = mockStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const student = selectedStudent ? mockStudents.find(s => s.id === selectedStudent) : null;

  if (student) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
        <button onClick={() => setSelectedStudent(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={14} /> Volver a alumnos
        </button>

        {/* Header */}
        <div className="stat-card flex items-center gap-4">
          <div className={cn(
            'w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold',
            student.needsAttention ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          )}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <h1 className="heading-2 text-foreground">{student.name}</h1>
            <p className="text-sm text-muted-foreground">{student.section} · {student.grade} grado</p>
          </div>
          {student.needsAttention && (
            <span className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
              <AlertTriangle size={12} /> Necesita atención
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tiempo de estudio', value: `${Math.round(student.studyTime / 60)}h ${student.studyTime % 60}m`, icon: <Clock size={16} /> },
            { label: 'Sesiones', value: student.sessionsCount.toString(), icon: <BookOpen size={16} /> },
            { label: 'Temas estudiados', value: student.topicsStudied.toString(), icon: <TrendingUp size={16} /> },
            { label: 'Dominio estimado', value: `${student.mastery}%`, icon: <Sparkles size={16} /> },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="text-primary mb-1">{s.icon}</div>
              <p className="text-lg font-bold font-heading text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Study time chart */}
        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-4">Tiempo de estudio por semana</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={studyTimeData}>
              <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="min" fill="hsl(172, 50%, 28%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-success" /> Temas fuertes
            </h3>
            {student.strongTopics.length > 0 ? (
              <div className="space-y-2">
                {student.strongTopics.map(t => (
                  <div key={t} className="flex items-center gap-2 px-3 py-2 bg-success/5 rounded-lg text-sm text-foreground">
                    <div className="w-2 h-2 rounded-full bg-success" /> {t}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aún no hay suficientes datos</p>
            )}
          </div>
          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" /> Temas débiles
            </h3>
            {student.weakTopics.length > 0 ? (
              <div className="space-y-2">
                {student.weakTopics.map(t => (
                  <div key={t} className="flex items-center gap-2 px-3 py-2 bg-warning/5 rounded-lg text-sm text-foreground">
                    <div className="w-2 h-2 rounded-full bg-warning" /> {t}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">¡Sin temas débiles detectados!</p>
            )}
          </div>
        </div>

        {/* AI Summary */}
        <div className="stat-card border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-primary" />
            <h3 className="heading-4 text-foreground">Resumen IA para el profesor</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {student.name} muestra un patrón de estudio {student.mastery >= 70 ? 'consistente' : 'irregular'} con énfasis en {student.strongTopics[0] || 'temas variados'}.
            {student.needsAttention
              ? ` Se recomienda intervención directa en los temas débiles identificados y motivar mayor frecuencia de uso de la plataforma.`
              : ` El alumno demuestra buen aprovechamiento de la herramienta. Se sugiere desafiar con temas de mayor complejidad.`
            }
          </p>
          <div className="mt-3 flex gap-2">
            <button className="chip text-xs">
              <MessageSquare size={12} /> Ver conversaciones recientes
            </button>
          </div>
        </div>

        {/* Recent sessions */}
        <div className="stat-card">
          <h3 className="heading-4 text-foreground mb-3">Sesiones recientes</h3>
          <div className="space-y-2">
            {[
              { topic: 'Ecuaciones lineales', course: 'Matemática', date: '17 mar', score: 78, duration: '22 min' },
              { topic: 'La célula', course: 'Ciencia', date: '16 mar', score: 65, duration: '18 min' },
              { topic: 'Textos argumentativos', course: 'Comunicación', date: '15 mar', score: 82, duration: '30 min' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.topic}</p>
                  <p className="text-xs text-muted-foreground">{s.course} · {s.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-foreground">{s.score}%</p>
                  <p className="text-xs text-muted-foreground">{s.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="heading-1 text-foreground">Alumnos</h1>
        <p className="text-muted-foreground mt-1">Seguimiento individual del uso y aprendizaje con el Tutor AI</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar alumno..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
          <Filter size={14} /> Filtros
        </button>
      </div>

      <div className="stat-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Alumno</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Sección</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tiempo</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dominio</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} onClick={() => setSelectedStudent(s.id)} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                      s.needsAttention ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                    )}>
                      {s.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground md:hidden">{s.section}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-foreground hidden md:table-cell">{s.section}</td>
                <td className="px-4 py-3 text-foreground hidden md:table-cell">{Math.round(s.studyTime / 60)}h {s.studyTime % 60}m</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div className={cn('h-full rounded-full', s.mastery >= 70 ? 'bg-success' : s.mastery >= 50 ? 'bg-warning' : 'bg-destructive')} style={{ width: `${s.mastery}%` }} />
                    </div>
                    <span className="text-xs font-medium text-foreground">{s.mastery}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {s.needsAttention ? (
                    <span className="flex items-center gap-1 text-xs text-destructive"><AlertTriangle size={12} /> Necesita atención</span>
                  ) : (
                    <span className="text-xs text-success">Activo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
