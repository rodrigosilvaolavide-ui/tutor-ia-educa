import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/lib/types';
import {
  BookOpen, BarChart3, Users,
  LayoutDashboard, ChevronDown, Sparkles, Menu, X,
  Layers, FileText, GraduationCap, User, Zap, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  id: string;
  icon: React.ReactNode;
}

const navByRole: Record<UserRole, NavItem[]> = {
  alumno: [
    { label: 'Inicio', id: 'home', icon: <LayoutDashboard size={20} /> },
    { label: 'Tutor AI', id: 'tutor', icon: <Sparkles size={20} /> },
    { label: 'Flash Cards', id: 'flashcards', icon: <Layers size={20} /> },
    { label: 'Simulacros', id: 'simulacros', icon: <Target size={20} /> },
  ],
  profesor: [
    { label: 'Dashboard', id: 'home', icon: <LayoutDashboard size={20} /> },
    { label: 'Contenido', id: 'content', icon: <FileText size={20} /> },
    { label: 'Alumnos', id: 'students', icon: <Users size={20} /> },
    { label: 'Secciones', id: 'sections', icon: <GraduationCap size={20} /> },
    { label: 'Reportes', id: 'reports', icon: <BarChart3 size={20} /> },
  ],
  directivo: [
    { label: 'Resumen', id: 'home', icon: <LayoutDashboard size={20} /> },
    { label: 'Adopción', id: 'adoption', icon: <Users size={20} /> },
    { label: 'Insights', id: 'insights', icon: <Sparkles size={20} /> },
    { label: 'Secciones', id: 'sections', icon: <GraduationCap size={20} /> },
    { label: 'Reportes', id: 'reports', icon: <BarChart3 size={20} /> },
  ],
};

const roleLabels: Record<UserRole, string> = {
  alumno: 'Alumno',
  profesor: 'Profesor',
  directivo: 'Directivo',
};

interface AppLayoutProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export default function AppLayout({ currentView, onNavigate, children }: AppLayoutProps) {
  const { role, setRole, userName } = useRole();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = navByRole[role];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar text-sidebar-foreground">
        <div className="p-5 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sidebar-primary flex items-center justify-center">
              <Sparkles size={18} className="text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-base text-sidebar-primary-foreground">StudyAI</h1>
              <p className="text-xs text-sidebar-foreground/60">Tutor Inteligente</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                currentView === item.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Role Switcher */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sidebar-accent/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sm font-semibold text-sidebar-primary">
                {userName[0]}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
                <p className="text-xs text-sidebar-foreground/50">{roleLabels[role]}</p>
              </div>
              <ChevronDown size={16} className="text-sidebar-foreground/50" />
            </button>
            {roleMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card text-foreground border border-border rounded-xl shadow-lg py-1 z-50">
                <p className="px-3 py-1.5 text-xs text-muted-foreground font-medium">Cambiar vista</p>
                {(['alumno', 'profesor', 'directivo'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => { setRole(r); setRoleMenuOpen(false); onNavigate('home'); }}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors',
                      role === r ? 'text-primary font-medium' : 'text-foreground'
                    )}
                  >
                    {roleLabels[r]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={16} className="text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-sm">StudyAI</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </header>

        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-b border-border p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setMobileMenuOpen(false); }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  currentView === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="border-t border-border pt-2 mt-2">
              <p className="px-3 py-1 text-xs text-muted-foreground">Cambiar vista</p>
              {(['alumno', 'profesor', 'directivo'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setMobileMenuOpen(false); onNavigate('home'); }}
                  className={cn(
                    'w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-muted',
                    role === r ? 'text-primary font-medium' : 'text-foreground'
                  )}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
