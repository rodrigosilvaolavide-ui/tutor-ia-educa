import { useState, useEffect } from 'react';
import { mockStudents } from '@/lib/mock-data';
import { Search, Filter, ArrowLeft, Clock, BookOpen, TrendingUp, AlertTriangle, Sparkles, MessageSquare, X, ChevronRight, ExternalLink, Layers, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TeacherStudentsProps {
  onBack: () => void;
  initialStudentId?: string | null;
  onClearStudent?: () => void;
}

const studyTimeData = [
  { sem: 'Sem 1', min: 120 },
  { sem: 'Sem 2', min: 180 },
  { sem: 'Sem 3', min: 150 },
  { sem: 'Sem 4', min: 220 },
  { sem: 'Sem 5', min: 200 },
  { sem: 'Sem 6', min: 280 },
];

// Mock chat sessions for an individual student
const mockChatSessions = [
  { id: 'ch1', topic: 'Ecuaciones lineales', course: 'Matemática', date: '17 mar', messages: 12, duration: '22 min' },
  { id: 'ch2', topic: 'La célula', course: 'Ciencia', date: '16 mar', messages: 8, duration: '18 min' },
  { id: 'ch3', topic: 'Textos argumentativos', course: 'Comunicación', date: '15 mar', messages: 15, duration: '30 min' },
  { id: 'ch4', topic: 'Factorización', course: 'Matemática', date: '14 mar', messages: 6, duration: '12 min' },
  { id: 'ch5', topic: 'Triángulos', course: 'Matemática', date: '12 mar', messages: 10, duration: '20 min' },
];

// Topics the student hasn't studied yet
const pendingTopics = ['Circunferencia', 'Culturas preincaicas', 'Present Perfect', 'Regiones naturales'];

interface AppliedFilters {
  section?: string;
  engagement?: string;
  mastery?: string;
  status?: string;
}

const filterOptions = {
  section: ['4°A', '4°B', '3°A', '3°B'],
  engagement: ['Alto', 'Medio', 'Bajo'],
  mastery: ['≥ 80%', '50–79%', '< 50%'],
  status: ['Activo', 'Necesita atención', 'Inactivo'],
};

const filterLabels: Record<string, string> = {
  section: 'Sección',
  engagement: 'Engagement',
  mastery: 'Dominio',
  status: 'Estado',
};

export default function TeacherStudents({ onBack, initialStudentId, onClearStudent }: TeacherStudentsProps) {
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<string | null>(initialStudentId || null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<AppliedFilters>({});
  const [viewingChats, setViewingChats] = useState(false);
  const [viewingChatDetail, setViewingChatDetail] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudent(initialStudentId);
    }
  }, [initialStudentId]);

  const activeFilters = Object.entries(filters).filter(([, v]) => v);

  let filtered = mockStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  // Apply filters
  if (filters.section) {
    filtered = filtered.filter(s => s.section === filters.section);
  }
  if (filters.mastery) {
    if (filters.mastery === '≥ 80%') filtered = filtered.filter(s => s.mastery >= 80);
    else if (filters.mastery === '50–79%') filtered = filtered.filter(s => s.mastery >= 50 && s.mastery < 80);
    else if (filters.mastery === '< 50%') filtered = filtered.filter(s => s.mastery < 50);
  }
  if (filters.status) {
    if (filters.status === 'Necesita atención') filtered = filtered.filter(s => s.needsAttention);
    else if (filters.status === 'Activo') filtered = filtered.filter(s => !s.needsAttention);
  }

  const student = selectedStudent ? mockStudents.find(s => s.id === selectedStudent) : null;

  const handleBack = () => {
    if (viewingChatDetail) {
      setViewingChatDetail(null);
    } else if (viewingChats) {
      setViewingChats(false);
    } else {
      setSelectedStudent(null);
      onClearStudent?.();
    }
  };

  // Chat detail view
  if (student && viewingChatDetail) {
    const chat = mockChatSessions.find(c => c.id === viewingChatDetail);
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={14} /> Volver a conversaciones
        </button>
        <div className="stat-card">
          <h2 className="heading-3 text-foreground mb-1">{chat?.topic}</h2>
          <p className="text-sm text-muted-foreground mb-4">{chat?.course} · {chat?.date} · {chat?.duration}</p>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-primary" />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground max-w-[80%]">
                ¡Hola! Vamos a estudiar <strong>{chat?.topic}</strong>. ¿Qué parte del tema te gustaría repasar?
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="bg-primary/10 rounded-lg p-3 text-sm text-foreground max-w-[80%]">
                No entiendo bien cómo resolver los ejercicios. ¿Me puedes explicar paso a paso?
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-semibold text-foreground">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles size={14} className="text-primary" />
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground max-w-[80%]">
                ¡Claro! Vamos a empezar con lo básico y luego avanzamos a ejercicios más complejos...
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-2">
              Vista previa — {chat?.messages} mensajes en total
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chat list view
  if (student && viewingChats) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft size={14} /> Volver al perfil de {student.name.split(' ')[0]}
        </button>
        <div>
          <h2 className="heading-2 text-foreground">Conversaciones de {student.name}</h2>
          <p className="text-muted-foreground text-sm mt-1">Historial de sesiones de estudio con el Tutor AI</p>
        </div>
        <div className="space-y-2">
          {mockChatSessions.map(chat => (
            <button
              key={chat.id}
              onClick={() => setViewingChatDetail(chat.id)}
              className="stat-card w-full flex items-center gap-4 text-left hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MessageSquare size={16} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{chat.topic}</p>
                <p className="text-xs text-muted-foreground">{chat.course} · {chat.date} · {chat.messages} mensajes</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">{chat.duration}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Student detail view
  if (student) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
        <button onClick={handleBack} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
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
          <div className="flex items-center gap-2">
            {student.needsAttention && (
              <span className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                <AlertTriangle size={12} /> Necesita atención
              </span>
            )}
            <button
              onClick={() => setViewingChats(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium hover:bg-primary/20 transition-colors"
            >
              <MessageSquare size={12} /> Ver conversaciones
            </button>
          </div>
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
              <Bar dataKey="min" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Strengths, Weaknesses & Pending Topics */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-success" /> Temas fuertes
            </h3>
            {student.strongTopics.length > 0 ? (
              <div className="space-y-2">
                {student.strongTopics.map(t => (
                  <button
                    key={t}
                    onClick={() => setViewingChats(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-success/5 rounded-lg text-sm text-foreground hover:bg-success/10 transition-colors text-left group"
                  >
                    <div className="w-2 h-2 rounded-full bg-success shrink-0" />
                    <span className="flex-1">{t}</span>
                    <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
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
                  <button
                    key={t}
                    onClick={() => setViewingChats(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-warning/5 rounded-lg text-sm text-foreground hover:bg-warning/10 transition-colors text-left group"
                  >
                    <div className="w-2 h-2 rounded-full bg-warning shrink-0" />
                    <span className="flex-1">{t}</span>
                    <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">¡Sin temas débiles detectados!</p>
            )}
          </div>
          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-3 flex items-center gap-2">
              <BookOpen size={16} className="text-info" /> Temas por aprender
            </h3>
            <div className="space-y-2">
              {pendingTopics.map(t => (
                <div key={t} className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                  {t}
                </div>
              ))}
            </div>
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
        </div>

        {/* Recent sessions — clickable */}
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="heading-4 text-foreground">Sesiones recientes</h3>
            <button onClick={() => setViewingChats(true)} className="text-xs text-primary hover:underline">Ver todas</button>
          </div>
          <div className="space-y-2">
            {mockChatSessions.slice(0, 3).map(s => (
              <button
                key={s.id}
                onClick={() => { setViewingChats(true); setViewingChatDetail(s.id); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{s.topic}</p>
                  <p className="text-xs text-muted-foreground">{s.course} · {s.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">{s.duration}</p>
                  <p className="text-xs text-muted-foreground">{s.messages} msgs</p>
                </div>
                <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Student list view
  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="heading-1 text-foreground">Alumnos</h1>
        <p className="text-muted-foreground mt-1">Seguimiento individual del uso y aprendizaje con el Tutor AI</p>
      </div>

      {/* Search + Filter button */}
      <div className="space-y-3">
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
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 bg-card border rounded-lg text-sm text-foreground hover:bg-muted transition-colors',
                activeFilters.length > 0 ? 'border-primary/40' : 'border-border'
              )}
            >
              <Filter size={14} /> Filtros {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>

            {/* Filter Popup */}
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-card border border-border rounded-xl shadow-lg p-4 z-50 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Filtros</p>
                  <button onClick={() => setFilters({})} className="text-xs text-muted-foreground hover:text-foreground">Limpiar</button>
                </div>
                {Object.entries(filterOptions).map(([key, options]) => (
                  <div key={key}>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{filterLabels[key]}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map(opt => (
                        <button
                          key={opt}
                          onClick={() => setFilters(f => ({ ...f, [key]: f[key as keyof AppliedFilters] === opt ? undefined : opt }))}
                          className={cn(
                            'text-xs px-2.5 py-1 rounded-full border transition-colors',
                            filters[key as keyof AppliedFilters] === opt
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-card border-border text-foreground hover:bg-muted'
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Aplicar filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Bubbles */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(([key, value]) => (
              <span
                key={key}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
              >
                {filterLabels[key]}: {value}
                <button onClick={() => setFilters(f => ({ ...f, [key]: undefined }))} className="hover:text-primary/70">
                  <X size={12} />
                </button>
              </span>
            ))}
            <button onClick={() => setFilters({})} className="text-xs text-muted-foreground hover:text-foreground">
              Limpiar todos
            </button>
          </div>
        )}
      </div>

      <div className="stat-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Alumno</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Sección</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                <span className="inline-flex items-center gap-1 cursor-help" title="Tiempo total de estudio acumulado en las últimas 4 semanas">
                  Tiempo (últ. 4 sem.)
                  <span className="w-3.5 h-3.5 rounded-full border border-muted-foreground/40 text-muted-foreground/60 flex items-center justify-center text-[10px]">?</span>
                </span>
              </th>
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
