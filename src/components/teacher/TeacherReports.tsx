import { Sparkles, Download, FileText, TrendingDown, TrendingUp, Users, AlertTriangle } from 'lucide-react';

interface TeacherReportsProps {
  onBack: () => void;
}

const reports = [
  { id: 'r1', title: 'Principales dificultades de esta semana', type: 'Semanal', date: '17 mar 2026', icon: <TrendingDown size={16} className="text-warning" /> },
  { id: 'r2', title: 'Temas con mayor confusión', type: 'Por tema', date: '17 mar 2026', icon: <AlertTriangle size={16} className="text-destructive" /> },
  { id: 'r3', title: 'Alumnos que necesitan apoyo', type: 'Por alumno', date: '17 mar 2026', icon: <Users size={16} className="text-info" /> },
  { id: 'r4', title: 'Conceptos con mayor mejora', type: 'Progreso', date: '17 mar 2026', icon: <TrendingUp size={16} className="text-success" /> },
  { id: 'r5', title: 'Prioridades de intervención recomendadas', type: 'Estratégico', date: '17 mar 2026', icon: <Sparkles size={16} className="text-primary" /> },
];

export default function TeacherReports({ onBack }: TeacherReportsProps) {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1 text-foreground">Reportes</h1>
          <p className="text-muted-foreground mt-1">Insights académicos generados por IA</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Sparkles size={16} /> Generar reporte
        </button>
      </div>

      {/* AI Insights Panel */}
      <div className="stat-card border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-primary" />
          <h3 className="heading-4 text-foreground">Panel de Insights IA</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hallazgo principal</p>
            <p className="text-sm text-foreground">El 35% de los alumnos de 4°A tienen dificultades con Factorización. Se recomienda dedicar una sesión de refuerzo esta semana.</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tendencia positiva</p>
            <p className="text-sm text-foreground">La comprensión de Ecuaciones lineales mejoró un 15% en las últimas 2 semanas gracias al uso frecuente del tutor.</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Acción recomendada</p>
            <p className="text-sm text-foreground">Contactar a Mateo García y Andrés Castillo — ambos muestran bajo engagement y múltiples temas débiles.</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Próximo paso</p>
            <p className="text-sm text-foreground">Subir material de refuerzo para Circunferencia (4°A) y La célula (4°B) para mejorar la calidad de tutoría.</p>
          </div>
        </div>
      </div>

      {/* Reports list */}
      <div>
        <h2 className="heading-3 text-foreground mb-4">Reportes disponibles</h2>
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="stat-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {report.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{report.title}</p>
                <p className="text-xs text-muted-foreground">{report.type} · {report.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <FileText size={16} className="text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Download size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate controls */}
      <div className="stat-card">
        <h3 className="heading-4 text-foreground mb-4">Generar nuevo reporte</h3>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { label: 'Reporte por alumno', desc: 'Selecciona un alumno y obtén un resumen detallado' },
            { label: 'Reporte por sección', desc: 'Análisis completo de una sección' },
            { label: 'Reporte por curso', desc: 'Rendimiento general en un curso específico' },
          ].map(r => (
            <button key={r.label} className="text-left p-4 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all">
              <p className="font-medium text-foreground text-sm mb-1">{r.label}</p>
              <p className="text-xs text-muted-foreground">{r.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
