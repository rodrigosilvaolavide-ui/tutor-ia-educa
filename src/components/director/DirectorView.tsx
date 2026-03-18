import { useState } from 'react';
import { Users, Clock, TrendingUp, BookOpen, Sparkles, BarChart3, Download, Building2, GraduationCap } from 'lucide-react';
import { mockSections, mockStudents } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const tabs = [
  { id: 'summary', label: 'Resumen' },
  { id: 'adoption', label: 'Adopción' },
  { id: 'insights', label: 'Insights' },
  { id: 'sections', label: 'Secciones' },
  { id: 'reports', label: 'Reportes' },
];

const adoptionTrend = [
  { sem: 'Sem 1', activos: 45 },
  { sem: 'Sem 2', activos: 62 },
  { sem: 'Sem 3', activos: 78 },
  { sem: 'Sem 4', activos: 85 },
  { sem: 'Sem 5', activos: 92 },
  { sem: 'Sem 6', activos: 98 },
];

const gradeUsage = [
  { grado: '3°', activos: 48, total: 64, promEstudio: 205 },
  { grado: '4°', activos: 50, total: 62, promEstudio: 213 },
  { grado: '5°', activos: 38, total: 58, promEstudio: 180 },
];

const pieData = [
  { name: 'Activos', value: 98, color: 'hsl(172, 50%, 28%)' },
  { name: 'Inactivos', value: 28, color: 'hsl(214, 20%, 90%)' },
];

interface DirectorViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function DirectorView({ activeTab, onTabChange }: DirectorViewProps) {
  const setActiveTab = onTabChange;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="heading-1 text-foreground">Panel Directivo</h1>
        <p className="text-muted-foreground mt-1">Visibilidad estratégica del uso y aprendizaje con el Tutor AI</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Alumnos activos', value: '98', sub: 'de 126 matriculados', icon: <Users size={18} />, color: 'text-primary' },
              { label: 'Profesores activos', value: '12', sub: 'de 15 registrados', icon: <GraduationCap size={18} />, color: 'text-info' },
              { label: 'Sesiones totales', value: '1,247', sub: 'este mes', icon: <BookOpen size={18} />, color: 'text-success' },
              { label: 'Prom. semanal', value: '2.8h', sub: 'por alumno', icon: <Clock size={18} />, color: 'text-warning' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div className={`${s.color} mb-2`}>{s.icon}</div>
                <p className="text-xl font-bold font-heading text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* AI Executive Summary */}
          <div className="stat-card border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-primary" />
              <h3 className="heading-4 text-foreground">Resumen ejecutivo IA</h3>
            </div>
            <p className="text-sm text-foreground leading-relaxed mb-3">
              La adopción del Tutor AI muestra una tendencia positiva con un 78% de alumnos activos. Las secciones de 3° presentan mejor engagement
              que las de 4°. Los temas con mayor confusión a nivel institucional son Factorización y La célula. Se recomienda priorizar la subida de
              contenido de refuerzo en estas áreas y motivar el uso en las secciones 3°B y 4°B.
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="p-3 bg-card rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Mejor sección</p>
                <p className="text-sm font-semibold text-success">3°A — 91% engagement</p>
              </div>
              <div className="p-3 bg-card rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Sección en riesgo</p>
                <p className="text-sm font-semibold text-destructive">3°B — 58% engagement</p>
              </div>
              <div className="p-3 bg-card rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Curso más usado</p>
                <p className="text-sm font-semibold text-foreground">Matemática</p>
              </div>
            </div>
          </div>

          {/* Engagement trend */}
          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-4">Tendencia de engagement</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={adoptionTrend}>
                <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="activos" stroke="hsl(172, 50%, 28%)" strokeWidth={2} dot={{ fill: 'hsl(172, 50%, 28%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Section comparison */}
          <div>
            <h2 className="heading-3 text-foreground mb-4">Comparativa de secciones</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {mockSections.map(sec => (
                <div key={sec.id} className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-heading font-semibold text-foreground">{sec.name}</h4>
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full',
                      sec.engagement >= 80 ? 'bg-success/10 text-success' :
                      sec.engagement >= 60 ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    )}>
                      {sec.engagement}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{sec.activeStudents}/{sec.totalStudents} activos</p>
                  <p className="text-xs text-muted-foreground">{sec.avgSessionsPerWeek} ses./semana</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'adoption' && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="stat-card">
              <h3 className="heading-4 text-foreground mb-4">Alumnos activos vs inactivos</h3>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width={200} height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 ml-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span className="text-sm text-foreground">98 activos (78%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-border" />
                    <span className="text-sm text-foreground">28 inactivos (22%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <h3 className="heading-4 text-foreground mb-4">Evolución de adopción</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={adoptionTrend}>
                  <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="activos" stroke="hsl(172, 50%, 28%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-4">Uso por grado</h3>
            <div className="space-y-4">
              {gradeUsage.map(g => (
                <div key={g.grado} className="flex items-center gap-4">
                  <span className="font-heading font-semibold text-foreground w-8">{g.grado}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{g.activos} de {g.total} activos</span>
                      <span>{Math.round(g.activos / g.total * 100)}%</span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${g.activos / g.total * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground w-20 text-right">{Math.round(g.promEstudio / 60)}h prom.</span>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-3">Actividad de contenido por profesores</h3>
            <div className="space-y-2">
              {[
                { name: 'Prof. García', uploads: 12, status: 'Muy activo' },
                { name: 'Prof. López', uploads: 8, status: 'Activo' },
                { name: 'Prof. Herrera', uploads: 3, status: 'Moderado' },
                { name: 'Prof. Castro', uploads: 1, status: 'Bajo' },
              ].map(p => (
                <div key={p.name} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {p.name.split(' ')[1][0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.uploads} contenidos subidos</p>
                  </div>
                  <span className={cn('text-xs font-medium', p.uploads >= 8 ? 'text-success' : p.uploads >= 3 ? 'text-warning' : 'text-destructive')}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-6">
          <div className="stat-card border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={18} className="text-primary" />
              <h3 className="heading-4 text-foreground">Insights académicos institucionales</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-card rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Temas débiles a nivel institución</p>
                <div className="space-y-1.5">
                  {['Factorización (4°A, 4°B)', 'La célula (4°B)', 'Circunferencia (4°A)', 'Ecuaciones lineales (3°A)'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-2 h-2 rounded-full bg-warning" /> {t}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-card rounded-lg">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Temas fuertes a nivel institución</p>
                <div className="space-y-1.5">
                  {['Textos argumentativos (todas)', 'Comprensión lectora (4°A)', 'Culturas preincaicas (4°A)', 'Triángulos (3°A)'].map(t => (
                    <div key={t} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-2 h-2 rounded-full bg-success" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-3">Comparativa de desempeño entre secciones</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockSections.map(s => ({ name: s.name, engagement: s.engagement, estudio: Math.round(s.avgStudyTime / 60) }))}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="engagement" name="Engagement %" fill="hsl(172, 50%, 28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="stat-card border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-primary" />
              <p className="text-xs font-medium text-primary uppercase tracking-wider">Recomendaciones estratégicas IA</p>
            </div>
            <div className="space-y-3">
              {[
                'Priorizar la sección 3°B para intervención — engagement significativamente bajo (58%).',
                'Incentivar a Prof. Castro a subir más contenido — sus alumnos tienen menos recursos disponibles.',
                'Considerar un taller de refuerzo en Factorización para todo 4° grado.',
                'Reconocer a la sección 3°A como caso de éxito — 91% engagement y buenos resultados.'
              ].map((rec, i) => (
                <p key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary font-bold">{i + 1}.</span> {rec}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div className="space-y-6">
          <div className="stat-card">
            <h3 className="heading-4 text-foreground mb-4">Engagement por sección</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={mockSections.map(s => ({ name: s.name, engagement: s.engagement }))}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="engagement" fill="hsl(172, 50%, 28%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {mockSections.map(sec => (
              <div key={sec.id} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="heading-4 text-foreground">{sec.name}</h4>
                  <span className={cn(
                    'text-xs font-medium px-2.5 py-1 rounded-full',
                    sec.engagement >= 80 ? 'bg-success/10 text-success' :
                    sec.engagement >= 60 ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  )}>
                    {sec.engagement}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold font-heading text-foreground">{sec.activeStudents}</p>
                    <p className="text-xs text-muted-foreground">Activos</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold font-heading text-foreground">{Math.round(sec.avgStudyTime / 60)}h</p>
                    <p className="text-xs text-muted-foreground">Prom.</p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded">
                    <p className="text-lg font-bold font-heading text-foreground">{sec.avgSessionsPerWeek}</p>
                    <p className="text-xs text-muted-foreground">Ses./sem</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Temas débiles: {sec.weakTopics.join(', ') || 'Ninguno'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="heading-3 text-foreground">Reportes ejecutivos</h2>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              <Sparkles size={16} /> Generar resumen
            </button>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Resumen ejecutivo semanal', period: 'Semana del 14 - 18 mar 2026', type: 'Semanal' },
              { title: 'Reporte de adopción mensual', period: 'Marzo 2026', type: 'Mensual' },
              { title: 'Análisis de rendimiento por grado', period: 'Marzo 2026', type: 'Académico' },
              { title: 'Reporte de intervención recomendada', period: '17 mar 2026', type: 'Estratégico' },
            ].map((r, i) => (
              <div key={i} className="stat-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BarChart3 size={18} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.type} · {r.period}</p>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download size={16} className="text-muted-foreground" />
                </button>
              </div>
            ))}
          </div>

          <div className="stat-card border-primary/20 bg-primary/5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-primary" />
              <h3 className="heading-4 text-foreground">Recomendaciones estratégicas IA</h3>
            </div>
            <div className="space-y-2">
              {[
                'Programar reunión con coordinadores de 3°B para plan de acción de engagement.',
                'Evaluar incentivos para aumentar uso en fines de semana.',
                'Considerar capacitación adicional para profesores con baja actividad de contenido.',
              ].map((r, i) => (
                <p key={i} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary">→</span> {r}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
