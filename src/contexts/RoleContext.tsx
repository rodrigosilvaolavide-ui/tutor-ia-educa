import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
  isSuperAdmin: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const VALID_ROLES: UserRole[] = ['alumno', 'profesor', 'directivo'];

export function RoleProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const realRole = (profile?.role as UserRole) ?? 'alumno';
  const isSuperAdmin = profile?.role === 'super_admin';

  // Super admins can switch views; regular users are locked to their real role
  const [viewRole, setViewRole] = useState<UserRole>(realRole);

  useEffect(() => {
    if (profile) {
      const initial = isSuperAdmin ? 'alumno' : (VALID_ROLES.includes(realRole) ? realRole : 'alumno');
      setViewRole(initial);
    }
  }, [profile?.id]);

  const setRole = (r: UserRole) => {
    if (isSuperAdmin) setViewRole(r);
  };

  const userName = profile?.full_name ?? 'Usuario';

  return (
    <RoleContext.Provider value={{ role: viewRole, setRole, userName, isSuperAdmin }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
