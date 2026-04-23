import { Sparkles, Download, FileText, TrendingDown, TrendingUp, Users, AlertTriangle, Layers, Target } from 'lucide-react';

interface TeacherReportsProps {
  onBack: () => void;
}

const reports = [
  { id: 'r1', title: 'Principales dificultades de esta semana', type: 'Semanal', date: '17 mar 2026', icon: <TrendingDown size={16} className="text-warning" /> },
  { id: 'r2', title: 'Temas con mayor confusión', type: 'Por tema', date: '17 mar 2026', icon: <AlertTriangle size={16} className="text-destructive" /> },
  { id: 'r3', title: 'Alumnos que necesitan apoyo', type: 'Por alumno', date: '17 mar 2026', icon: <Users size={16} className="text-info" /> },
  { id: 'r4', title: 'Conceptos con mayor mejora', type: 'Progreso', date: '17 mar 2026', icon: <TrendingUp size={16} className="text-success" /> },
  { id: 'r5', title: 'Prioridades de intervención recomendadas', type: 'Estratégico', date: '17 mar 2026', icon: <Sparkles size={16} className="text-primary" /> },
  { id: 'r6', title: 'Rendimiento en Flash Cards por sección', type: 'Flash Cards', date: '17 mar 2026', icon: <Layers size={16} className="text-info" /> },
  { id: 'r7', title: 'Resultados de simulacros y preparación', type: 'Simulacros', date: '17 mar 2026', icon: <Target size={16} className="text-destructive" /> },
  { id: 'r8', title: 'Temas débiles detectados en simulacros', type: 'Simulacros', date: '17 mar 2026', icon: <Target size={16} className="text-warning" /> },
];

const simulacroInsights = [
  { label: 'Brecha crítica', text: '3°B concentra los resultados más bajos: 48% de score promedio y solo 22% de alumnos listos para rendir.', tone: 'text-destructive' },
  { label: 'Tema recurrente', text: 'Los errores se agrupan en Ecuaciones lineales, Textos argumentativos y problemas de interpretación de consignas.', tone: 'text-warning' },
  { label: 'Acción sugerida', text: 'Antes del próximo simulacro, conviene abrir una sesión guiada de repaso y una práctica corta de preguntas tipo examen.', tone: 'text-primary' },
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
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flash Cards — Insight</p>
            <p className="text-sm text-foreground">La sección 3°B tiene solo 52% de precisión en Flash Cards. Los temas con peor rendimiento son Ecuaciones lineales y Textos argumentativos.</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Simulacros — Alerta</p>
            <p className="text-sm text-foreground">Solo el 22% de 3°B está "Listo para rendir". Se recomienda reforzar temas base antes de evaluar.</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Flash Cards — Positivo</p>
            <p className="text-sm text-foreground">3°A lidera con 85% de precisión promedio en Flash Cards y 29 de 33 alumnos activos en el módulo.</p>
          </div>
          <div className="p-3 bg-card rounded-lg">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Simulacros — Positivo</p>
            <p className="text-sm text-foreground">70% de alumnos de 3°A están "Listos para rendir" con un score promedio de 79%. La práctica constante da resultados.</p>
          </div>
          {simulacroInsights.map(insight => (
            <div key={insight.label} className="p-3 bg-card rounded-lg border border-border">
              <p className={`text-xs uppercase tracking-wider mb-1 ${insight.tone}`}>{insight.label}</p>
              <p className="text-sm text-foreground">{insight.text}</p>
            </div>
          ))}
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
            { label: 'Reporte de Flash Cards', desc: 'Precisión, temas débiles y progreso por sesión' },
            { label: 'Reporte de Simulacros', desc: 'Nivel de preparación y temas a reforzar' },
            { label: 'Reporte comparativo', desc: 'Compara rendimiento entre secciones y herramientas' },
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
