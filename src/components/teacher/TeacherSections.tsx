import { useState } from 'react';
import { mockSections, mockStudents } from '@/lib/mock-data';
import { Users, Clock, TrendingUp, AlertTriangle, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TeacherSectionsProps {
  onBack: () => void;
}

export default function TeacherSections({ onBack }: TeacherSectionsProps) {
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'bimester'>('week');
  const [showRiskStudents, setShowRiskStudents] = useState<string | null>(null); // section id

  const engagementData = mockSections.map(s => ({ name: s.name, engagement: s.engagement }));
  const dateLabels = { week: 'Esta semana', month: 'Este mes', bimester: 'Este bimestre' };

  const riskSection = showRiskStudents ? mockSections.find(s => s.id === showRiskStudents) : null;
  const riskStudents = riskSection ? mockStudents.filter(s => s.section === riskSection.name && s.needsAttention) : [];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="heading-1 text-foreground">Secciones</h1>
          <p className="text-muted-foreground mt-1">Vista macro del desempeño por sección con el Tutor AI</p>
        </div>
        {/* Date filter */}
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          {(['week', 'month', 'bimester'] as const).map(d => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                dateRange === d ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {dateLabels[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Engagement Chart */}
      <div className="stat-card">
        <h3 className="heading-4 text-foreground mb-4">Engagement por sección</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="engagement" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {mockSections.map(sec => {
          const atRisk = mockStudents.filter(s => s.section === sec.name && s.needsAttention);
          return (
            <div key={sec.id} className="stat-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="heading-3 text-foreground">{sec.name}</h3>
                <span className={cn(
                  'text-xs font-medium px-2.5 py-1 rounded-full',
                  sec.engagement >= 80 ? 'bg-success/10 text-success' :
                  sec.engagement >= 60 ? 'bg-warning/10 text-warning' :
                  'bg-destructive/10 text-destructive'
                )}>
                  {sec.engagement}% engagement
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Activos', value: `${sec.activeStudents}/${sec.totalStudents}`, icon: <Users size={14} /> },
                  { label: 'Prom. estudio', value: `${Math.round(sec.avgStudyTime / 60)}h`, icon: <Clock size={14} /> },
                  { label: 'Ses./semana', value: sec.avgSessionsPerWeek.toString(), icon: <TrendingUp size={14} /> },
                ].map(m => (
                  <div key={m.label} className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="flex justify-center text-muted-foreground mb-1">{m.icon}</div>
                    <p className="text-sm font-bold font-heading text-foreground">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              {sec.weakTopics.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Temas débiles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sec.weakTopics.map(t => (
                      <span key={t} className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Cursos más usados</p>
                <p className="text-sm text-foreground">{sec.topCourses.join(', ')}</p>
              </div>

              {/* Risk students — clickable to show list */}
              {atRisk.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowRiskStudents(sec.id)}
                    className="flex items-center gap-1.5 text-xs text-destructive hover:underline"
                  >
                    <AlertTriangle size={12} />
                    {atRisk.length} {atRisk.length === 1 ? 'alumno en riesgo' : 'alumnos en riesgo'}
                  </button>
                </div>
              )}

              {/* AI Report */}
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center gap-1.5 mb-1">
                  <Sparkles size={12} className="text-primary" />
                  <p className="text-xs font-medium text-primary">Reporte IA</p>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {sec.engagement >= 80
                    ? `${sec.name} muestra buen engagement. Se sugiere profundizar en temas avanzados y desafiar a los alumnos con ejercicios de mayor complejidad.`
                    : `${sec.name} requiere intervención. Considere reforzar ${sec.weakTopics[0] || 'temas identificados'} en clase y motivar el uso de la plataforma.`
                  }
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk Students Modal */}
      {showRiskStudents && riskSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRiskStudents(null)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="heading-3 text-foreground">Alumnos en riesgo — {riskSection.name}</h3>
              <button onClick={() => setShowRiskStudents(null)} className="p-1 hover:bg-muted rounded-lg">
                <X size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              {riskStudents.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 bg-destructive/5 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-xs font-semibold text-destructive">
                    {s.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Dominio: {s.mastery}% · Temas débiles: {s.weakTopics.join(', ')}</p>
                  </div>
                </div>
              ))}
              {riskStudents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No hay alumnos en riesgo en esta sección</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
