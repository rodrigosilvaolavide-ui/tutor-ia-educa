import { mockSections, mockStudents } from '@/lib/mock-data';
import { Users, Clock, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface TeacherSectionsProps {
  onBack: () => void;
}

export default function TeacherSections({ onBack }: TeacherSectionsProps) {
  const engagementData = mockSections.map(s => ({ name: s.name, engagement: s.engagement }));

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="heading-1 text-foreground">Secciones</h1>
        <p className="text-muted-foreground mt-1">Vista macro del desempeño por sección con el Tutor AI</p>
      </div>

      {/* Engagement Chart */}
      <div className="stat-card">
        <h3 className="heading-4 text-foreground mb-4">Engagement por sección</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementData}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="engagement" fill="hsl(172, 50%, 28%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Section Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {mockSections.map(sec => (
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

            {/* Risk students */}
            {(() => {
              const atRisk = mockStudents.filter(s => s.section === sec.name && s.needsAttention);
              return atRisk.length > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-destructive" /> Alumnos en riesgo
                  </p>
                  <div className="space-y-1">
                    {atRisk.map(s => (
                      <div key={s.id} className="flex items-center gap-2 text-sm text-foreground px-2 py-1.5 bg-destructive/5 rounded">
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center text-[10px] font-semibold text-destructive">
                          {s.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        {s.name} — {s.mastery}% dominio
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

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
        ))}
      </div>
    </div>
  );
}
