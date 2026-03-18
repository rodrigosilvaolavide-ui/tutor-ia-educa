import { useState } from 'react';
import { Users, FileText, BarChart3, Clock, TrendingUp, Sparkles, BookOpen } from 'lucide-react';
import { mockStudents, mockSections, mockContent } from '@/lib/mock-data';
import TeacherContent from './TeacherContent';
import TeacherStudents from './TeacherStudents';
import TeacherSections from './TeacherSections';
import TeacherReports from './TeacherReports';
import { cn } from '@/lib/utils';

interface TeacherViewProps {
  initialTab?: string;
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 size={16} /> },
  { id: 'content', label: 'Contenido', icon: <FileText size={16} /> },
  { id: 'students', label: 'Alumnos', icon: <Users size={16} /> },
  { id: 'sections', label: 'Secciones', icon: <BookOpen size={16} /> },
  { id: 'reports', label: 'Reportes', icon: <Sparkles size={16} /> },
];

export default function TeacherView({ initialTab }: TeacherViewProps) {
  const [activeTab, setActiveTab] = useState(initialTab || 'dashboard');

  if (activeTab === 'content') return <TeacherContent onBack={() => setActiveTab('dashboard')} />;
  if (activeTab === 'students') return <TeacherStudents onBack={() => setActiveTab('dashboard')} />;
  if (activeTab === 'sections') return <TeacherSections onBack={() => setActiveTab('dashboard')} />;
  if (activeTab === 'reports') return <TeacherReports onBack={() => setActiveTab('dashboard')} />;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen de actividad de tus alumnos con el Tutor AI</p>
        </div>
      </div>

      {/* Quick Nav Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-muted'
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Alumnos activos', value: `${mockStudents.filter(s => !s.needsAttention).length + mockStudents.filter(s => s.needsAttention).length}`, sub: 'de 126 totales', icon: <Users size={18} />, color: 'text-primary' },
          { label: 'Contenido subido', value: `${mockContent.length}`, sub: `${mockContent.filter(c => c.status === 'ready').length} listos`, icon: <FileText size={18} />, color: 'text-info' },
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

      {/* Alerts */}
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

      {/* Students needing attention */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Alumnos que necesitan atención</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {mockStudents.filter(s => s.needsAttention).map(student => (
            <button
              key={student.id}
              onClick={() => setActiveTab('students')}
              className="stat-card flex items-center gap-4 text-left group"
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

      {/* Section summary */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Mis secciones</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {mockSections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveTab('sections')}
              className="stat-card text-left group"
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
                  <p className="text-lg font-bold font-heading text-foreground">{sec.activeStudents}</p>
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
                <p className="text-xs text-muted-foreground mt-3">Temas débiles: {sec.weakTopics.join(', ')}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
