import { useState } from 'react';
import { mockContent } from '@/lib/mock-data';
import { Upload, FileText, Video, Presentation, FileType, Search, Filter, Eye, MoreHorizontal, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeacherContentProps {
  onBack: () => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText size={18} className="text-destructive" />,
  ppt: <Presentation size={18} className="text-warning" />,
  video: <Video size={18} className="text-info" />,
  text: <FileType size={18} className="text-foreground" />,
  concepts: <FileType size={18} className="text-primary" />,
  summary: <FileType size={18} className="text-success" />,
};

const statusConfig = {
  ready: { label: 'Listo', icon: <CheckCircle2 size={14} />, class: 'text-success bg-success/10' },
  processing: { label: 'Procesando', icon: <Clock size={14} />, class: 'text-warning bg-warning/10' },
  needs_review: { label: 'Revisar', icon: <AlertTriangle size={14} />, class: 'text-destructive bg-destructive/10' },
};

export default function TeacherContent({ onBack }: TeacherContentProps) {
  const [search, setSearch] = useState('');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const filtered = mockContent.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const detail = selectedContent ? mockContent.find(c => c.id === selectedContent) : null;

  if (detail) {
    const status = statusConfig[detail.status];
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
        <button onClick={() => setSelectedContent(null)} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
          ← Volver a contenido
        </button>
        <div className="stat-card">
          <div className="flex items-start gap-4 mb-6">
            {typeIcons[detail.type]}
            <div className="flex-1">
              <h1 className="heading-2 text-foreground">{detail.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">{detail.course} · {detail.grade}{detail.section} · {detail.unit}</p>
            </div>
            <span className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', status.class)}>
              {status.icon} {status.label}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tema</p>
                <p className="text-sm text-foreground">{detail.topic}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Fecha de subida</p>
                <p className="text-sm text-foreground">{detail.uploadDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tamaño</p>
                <p className="text-sm text-foreground">{detail.size}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tipo de contenido</p>
                <p className="text-sm text-foreground capitalize">{detail.type === 'ppt' ? 'Presentación' : detail.type === 'pdf' ? 'Documento PDF' : detail.type === 'video' ? 'Video' : detail.type}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Conceptos extraídos por IA</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Concepto principal', 'Definición clave', 'Fórmula base', 'Ejemplo aplicado', 'Regla fundamental'].map(c => (
                    <span key={c} className="chip text-xs">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Resumen generado por IA</p>
                <p className="text-sm text-foreground leading-relaxed bg-muted/50 rounded-lg p-3">
                  Este material cubre los conceptos fundamentales del tema con ejemplos prácticos y ejercicios de aplicación. Incluye definiciones clave y fórmulas esenciales para el desarrollo del tema.
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Tags sugeridos</p>
                <div className="flex flex-wrap gap-1.5">
                  {[detail.course, detail.unit, detail.topic, detail.grade].map(t => (
                    <span key={t} className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t border-border">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Editar metadata
            </button>
            <button className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors">
              Marcar como contenido base
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1 text-foreground">Contenido</h1>
          <p className="text-muted-foreground mt-1">Gestiona el material que alimenta al Tutor AI</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Upload size={16} /> Subir contenido
        </button>
      </div>

      {/* Upload Zone */}
      <div className="border-2 border-dashed border-border rounded-xl p-8 text-center bg-muted/30">
        <Upload size={32} className="mx-auto text-muted-foreground mb-3" />
        <p className="font-medium text-foreground mb-1">Arrastra archivos aquí o haz clic para subir</p>
        <p className="text-sm text-muted-foreground">PDF, PPT, videos, notas de texto, listas de conceptos</p>
        <div className="flex justify-center gap-3 mt-4">
          {['PDF', 'PPT', 'Video', 'Texto'].map(t => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-card border border-border text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar contenido..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm text-foreground hover:bg-muted transition-colors">
          <Filter size={14} /> Filtros
        </button>
      </div>

      {/* Content Table */}
      <div className="stat-card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nombre</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Curso</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Tema</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const status = statusConfig[item.status];
              return (
                <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {typeIcons[item.type]}
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{item.course} · {item.topic}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">{item.course}</td>
                  <td className="px-4 py-3 text-foreground hidden md:table-cell">{item.topic}</td>
                  <td className="px-4 py-3">
                    <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit', status.class)}>
                      {status.icon} {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedContent(item.id)} className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                      <Eye size={16} className="text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
