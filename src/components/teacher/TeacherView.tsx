import { useState } from 'react';
import { Users, BarChart3, Clock, TrendingUp, Sparkles, Calendar, Layers, Target } from 'lucide-react';
import { mockStudents, mockSections } from '@/lib/mock-data';
import TeacherContent from './TeacherContent';
import TeacherStudents from './TeacherStudents';
import TeacherSections from './TeacherSections';
import TeacherReports from './TeacherReports';
import { cn } from '@/lib/utils';

interface TeacherViewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function TeacherView({ activeTab, onTabChange }: TeacherViewProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'bimester'>('week');

  const setActiveTab = onTabChange;

  if (activeTab === 'content') return <TeacherContent onBack={() => setActiveTab('dashboard')} />;
  if (activeTab === 'students') return <TeacherStudents onBack={() => setActiveTab('dashboard')} initialStudentId={selectedStudentId} onClearStudent={() => setSelectedStudentId(null)} />;
  if (activeTab === 'sections') return <TeacherSections onBack={() => setActiveTab('dashboard')} />;
  if (activeTab === 'reports') return <TeacherReports onBack={() => setActiveTab('dashboard')} />;

  const dateLabels = { week: 'Esta semana', month: 'Este mes', bimester: 'Este bimestre' };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="heading-1 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen de actividad de tus alumnos con el Tutor AI</p>
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

      {/* Stats — removed "Contenido subido" */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: 'Alumnos activos', value: `${mockStudents.length}`, sub: 'de 126 totales', icon: <Users size={18} />, color: 'text-primary' },
          { label: 'Sesiones esta semana', value: '87', sub: '+12% vs. semana pasada', icon: <TrendingUp size={18} />, color: 'text-success' },
          { label: 'Tiempo promedio', value: '22 min', sub: 'por sesión', icon: <Clock size={18} />, color: 'text-warning' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold font-heading text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="stat-card border-warning/30 bg-warning/5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-warning" />
          <h3 className="heading-4 text-foreground">Insights del Tutor AI</h3>
        </div>
        <div className="space-y-2">
          {[
            '4 alumnos tienen dificultades con Factorización en 4°A — considera reforzar en clase.',
            'El tema "La célula" tiene alta confusión en la sección 4°B — revisa el material subido.',
            'Sebastián Torres y Mateo García necesitan atención: bajo uso y temas débiles.',
          ].map((insight, i) => (
            <p key={i} className="text-sm text-foreground flex items-start gap-2">
              <span className="text-warning mt-0.5">•</span> {insight}
            </p>
          ))}
        </div>
      </div>

      {/* Students needing attention — click opens student profile */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Alumnos que necesitan atención</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {mockStudents.filter(s => s.needsAttention).map(student => (
            <button
              key={student.id}
              onClick={() => {
                setSelectedStudentId(student.id);
                setActiveTab('students');
              }}
              className="stat-card flex items-center gap-4 text-left group hover:border-primary/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center text-sm font-semibold text-destructive">
                {student.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.section} · Dominio: {student.mastery}%</p>
                <p className="text-xs text-destructive mt-0.5">Temas débiles: {student.weakTopics.join(', ')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sections — improved UI */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Mis secciones</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {mockSections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveTab('sections')}
              className="stat-card text-left group hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-foreground">{sec.name}</h3>
                <span className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full',
                  sec.engagement >= 80 ? 'bg-success/10 text-success' :
                  sec.engagement >= 60 ? 'bg-warning/10 text-warning' :
                  'bg-destructive/10 text-destructive'
                )}>
                  {sec.engagement}% engagement
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold font-heading text-foreground">{sec.activeStudents}/{sec.totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Activos</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-heading text-foreground">{Math.round(sec.avgStudyTime / 60)}h</p>
                  <p className="text-xs text-muted-foreground">Prom. estudio</p>
                </div>
                <div>
                  <p className="text-lg font-bold font-heading text-foreground">{sec.avgSessionsPerWeek}</p>
                  <p className="text-xs text-muted-foreground">Ses./semana</p>
                </div>
              </div>
              {sec.weakTopics.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning font-medium">
                    {sec.weakTopics.length} {sec.weakTopics.length === 1 ? 'tema débil' : 'temas débiles'}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
