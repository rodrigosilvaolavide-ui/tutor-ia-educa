import { useState } from 'react';
import { mockContent, courses } from '@/lib/mock-data';
import { Upload, FileText, Video, Presentation, FileType, Search, Filter, Eye, CheckCircle2, Clock, AlertTriangle, Folder, FolderOpen, ArrowLeft, ChevronRight, Plus, ArrowUpDown } from 'lucide-react';
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

// Build folder structure from courses
interface FolderNode {
  id: string;
  name: string;
  type: 'folder';
  children: (FolderNode | FileNode)[];
}

interface FileNode {
  id: string;
  name: string;
  type: 'file';
  contentId: string;
}

function buildFolderStructure(): FolderNode[] {
  return courses.map(course => ({
    id: course.id,
    name: course.name,
    type: 'folder' as const,
    children: course.units.map(unit => ({
      id: unit.id,
      name: unit.name,
      type: 'folder' as const,
      children: unit.topics.map(topic => ({
        id: topic.id,
        name: topic.name,
        type: 'folder' as const,
        children: mockContent
          .filter(c => c.topic === topic.name)
          .map(c => ({ id: c.id, name: c.name, type: 'file' as const, contentId: c.id })),
      })),
    })),
  }));
}

type ViewMode = 'folders' | 'list';

export default function TeacherContent({ onBack }: TeacherContentProps) {
  const [search, setSearch] = useState('');
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('folders');
  const [currentPath, setCurrentPath] = useState<string[]>([]); // breadcrumb path of folder ids
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFolder, setUploadFolder] = useState('');

  const folders = buildFolderStructure();

  // Navigate folder structure
  const getCurrentFolder = (): (FolderNode | FileNode)[] => {
    let current: (FolderNode | FileNode)[] = folders;
    for (const pathId of currentPath) {
      const folder = current.find(c => c.id === pathId && c.type === 'folder') as FolderNode | undefined;
      if (folder) {
        current = folder.children;
      }
    }
    return current;
  };

  const getBreadcrumbs = (): { id: string; name: string }[] => {
    const crumbs: { id: string; name: string }[] = [];
    let current: (FolderNode | FileNode)[] = folders;
    for (const pathId of currentPath) {
      const folder = current.find(c => c.id === pathId) as FolderNode | undefined;
      if (folder) {
        crumbs.push({ id: folder.id, name: folder.name });
        current = folder.children;
      }
    }
    return crumbs;
  };

  const filtered = mockContent.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const detail = selectedContent ? mockContent.find(c => c.id === selectedContent) : null;

  // Content detail view
  if (detail) {
    const status = statusConfig[detail.status];
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
        <button onClick={() => setSelectedContent(null)} className="text-sm text-muted-foreground hover:text-foreground mb-6 flex items-center gap-1">
          <ArrowLeft size={14} /> Volver a contenido
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

  const currentItems = getCurrentFolder();
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-1 text-foreground">Contenido</h1>
          <p className="text-muted-foreground mt-1">Gestiona el material que alimenta al Tutor AI</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload size={16} /> Subir contenido
        </button>
      </div>

      {/* View toggle + Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => { setViewMode('folders'); setCurrentPath([]); }}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'folders' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Folder size={14} className="inline mr-1" /> Carpetas
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
              viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Lista
          </button>
        </div>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); if (e.target.value) setViewMode('list'); }}
            placeholder="Buscar contenido..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40"
          />
        </div>
      </div>

      {/* Folder View */}
      {viewMode === 'folders' && (
        <div className="space-y-4">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-sm">
            <button
              onClick={() => setCurrentPath([])}
              className={cn('hover:text-foreground transition-colors', currentPath.length === 0 ? 'text-foreground font-medium' : 'text-muted-foreground')}
            >
              Mis cursos
            </button>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.id} className="flex items-center gap-1.5">
                <ChevronRight size={14} className="text-muted-foreground" />
                <button
                  onClick={() => setCurrentPath(currentPath.slice(0, i + 1))}
                  className={cn(
                    'hover:text-foreground transition-colors',
                    i === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'
                  )}
                >
                  {crumb.name}
                </button>
              </span>
            ))}
          </div>

          {/* Folder Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentItems.map(item => {
              if (item.type === 'folder') {
                const folder = item as FolderNode;
                const fileCount = folder.children.filter(c => c.type === 'file').length;
                const folderCount = folder.children.filter(c => c.type === 'folder').length;
                return (
                  <button
                    key={folder.id}
                    onClick={() => setCurrentPath([...currentPath, folder.id])}
                    className="stat-card flex flex-col items-center gap-2 py-5 hover:border-primary/30 transition-colors group text-center"
                  >
                    <FolderOpen size={32} className="text-warning group-hover:text-primary transition-colors" />
                    <p className="text-sm font-medium text-foreground">{folder.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {folderCount > 0 && `${folderCount} carpetas`}
                      {folderCount > 0 && fileCount > 0 && ' · '}
                      {fileCount > 0 && `${fileCount} archivos`}
                      {folderCount === 0 && fileCount === 0 && 'Vacía'}
                    </p>
                  </button>
                );
              } else {
                const file = item as FileNode;
                const content = mockContent.find(c => c.id === file.contentId);
                if (!content) return null;
                const status = statusConfig[content.status];
                return (
                  <button
                    key={file.id}
                    onClick={() => setSelectedContent(file.contentId)}
                    className="stat-card flex flex-col items-center gap-2 py-5 hover:border-primary/30 transition-colors group text-center"
                  >
                    {typeIcons[content.type]}
                    <p className="text-xs font-medium text-foreground line-clamp-2">{content.name}</p>
                    <span className={cn('flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full', status.class)}>
                      {status.icon} {status.label}
                    </span>
                  </button>
                );
              }
            })}
          </div>

          {currentItems.length === 0 && (
            <div className="text-center py-12">
              <Folder size={40} className="mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Esta carpeta está vacía</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Subir contenido aquí
              </button>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
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
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-card border border-border rounded-xl p-6 max-w-lg w-full space-y-4" onClick={e => e.stopPropagation()}>
            <h2 className="heading-3 text-foreground">Subir contenido</h2>

            {/* Upload zone */}
            <div className="border-2 border-dashed border-border rounded-xl p-6 text-center bg-muted/30">
              <Upload size={28} className="mx-auto text-muted-foreground mb-2" />
              <p className="font-medium text-foreground text-sm mb-1">Arrastra archivos aquí o haz clic para subir</p>
              <p className="text-xs text-muted-foreground">PDF, PPT, videos, notas de texto</p>
            </div>

            {/* Folder selector */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Carpeta destino</label>
              <select
                value={uploadFolder}
                onChange={e => setUploadFolder(e.target.value)}
                className="w-full px-3 py-2.5 bg-card border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Seleccionar carpeta...</option>
                {courses.map(course => (
                  <optgroup key={course.id} label={course.name}>
                    {course.units.map(unit =>
                      unit.topics.map(topic => (
                        <option key={topic.id} value={`${course.name} / ${unit.name} / ${topic.name}`}>
                          {course.name} / {unit.name} / {topic.name}
                        </option>
                      ))
                    )}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Subir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
