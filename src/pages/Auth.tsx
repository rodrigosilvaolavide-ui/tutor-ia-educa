import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Sparkles, GraduationCap, Users, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';

const DEMO_PASSWORD = 'demo1234';
const DEMO_ACCOUNTS = [
  { email: 'alumno@demo.com', label: 'Alumno', icon: GraduationCap },
  { email: 'profesor@demo.com', label: 'Profesor', icon: Users },
  { email: 'directivo@demo.com', label: 'Directivo', icon: Building2 },
] as const;

const signInSchema = z.object({
  email: z.string().trim().email('Email inválido').max(255),
  password: z.string().min(6, 'Mínimo 6 caracteres').max(100),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, 'Nombre requerido').max(100),
  role: z.enum(['alumno', 'profesor', 'directivo']),
});

export default function Auth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({
    email: '', password: '', fullName: '', role: 'alumno' as UserRole,
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse(signInData);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signIn(parsed.data.email, parsed.data.password);
    setLoading(false);
    if (error) {
      toast.error(error.message === 'Invalid login credentials' ? 'Credenciales inválidas' : error.message);
      return;
    }
    toast.success('Sesión iniciada');
    navigate('/');
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse(signUpData);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signUp(parsed.data.email, parsed.data.password, parsed.data.fullName, parsed.data.role);
    setLoading(false);
    if (error) {
      toast.error(error.message.includes('already') ? 'Este email ya está registrado' : error.message);
      return;
    }
    toast.success('Cuenta creada. ¡Bienvenido!');
    navigate('/');
  };

  const handleDemoLogin = async (email: string) => {
    setLoading(true);
    let { error } = await signIn(email, DEMO_PASSWORD);
    if (error) {
      // Cuentas demo aún no existen → crearlas y reintentar
      toast.info('Preparando cuentas demo…');
      const { error: setupErr } = await supabase.functions.invoke('setup-demo-accounts');
      if (setupErr) {
        setLoading(false);
        toast.error('No se pudieron crear las cuentas demo');
        return;
      }
      ({ error } = await signIn(email, DEMO_PASSWORD));
    }
    setLoading(false);
    if (error) {
      toast.error('No se pudo ingresar a la demo');
      return;
    }
    toast.success('Sesión demo iniciada');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <Sparkles className="text-primary-foreground" size={24} />
          </div>
          <h1 className="font-heading font-bold text-2xl">StudyAI</h1>
          <p className="text-sm text-muted-foreground">Tutor inteligente</p>
        </div>

        <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2 text-center uppercase tracking-wide">
            Acceso rápido a la demo
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(({ email, label, icon: Icon }) => (
              <Button
                key={email}
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => handleDemoLogin(email)}
                className="flex flex-col h-auto py-3 gap-1"
              >
                <Icon size={16} />
                <span className="text-xs">{label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="signin">Ingresar</TabsTrigger>
            <TabsTrigger value="signup">Crear cuenta</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" type="email" value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Contraseña</Label>
                <Input id="signin-password" type="password" value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Ingresando…' : 'Ingresar'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Nombre completo</Label>
                <Input id="signup-name" value={signUpData.fullName}
                  onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" value={signUpData.email}
                  onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Contraseña</Label>
                <Input id="signup-password" type="password" value={signUpData.password}
                  onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-role">Rol</Label>
                <select
                  id="signup-role"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={signUpData.role}
                  onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value as UserRole })}
                >
                  <option value="alumno">Alumno</option>
                  <option value="profesor">Profesor</option>
                  <option value="directivo">Directivo</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creando…' : 'Crear cuenta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
