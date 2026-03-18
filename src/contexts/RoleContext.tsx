import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '@/lib/types';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  userName: string;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('alumno');

  const userName = role === 'alumno' ? 'Santiago' : role === 'profesor' ? 'Prof. García' : 'Dir. Martínez';

  return (
    <RoleContext.Provider value={{ role, setRole, userName }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
