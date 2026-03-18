import { useState } from 'react';
import { useRole } from '@/contexts/RoleContext';
import { UserRole } from '@/lib/types';
import {
  BookOpen, GraduationCap, BarChart3, Users, FileText,
  LayoutDashboard, ChevronDown, Sparkles, Menu, X
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
    { label: 'Estudiar', id: 'study', icon: <BookOpen size={20} /> },
    { label: 'Mi progreso', id: 'progress', icon: <BarChart3 size={20} /> },
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
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-base text-foreground">StudyAI</h1>
              <p className="text-xs text-muted-foreground">Tutor Inteligente</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
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
        </nav>

        {/* Role Switcher */}
        <div className="p-3 border-t border-border">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                {userName[0]}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
            {roleMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-card border border-border rounded-lg shadow-lg py-1 z-50">
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
