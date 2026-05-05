## Plan: Cuentas demo con datos pre-cargados

Cuando alguien se registre o ingrese con un email que termine en `@demo.com`, la app cargará automáticamente datos mock realistas según su rol, para que la demo funcione "out of the box" sin pasos manuales.

### Cuentas demo predefinidas

| Email | Contraseña | Rol | Qué verá |
|---|---|---|---|
| `alumno@demo.com` | `demo1234` | Alumno | 6 sesiones de chat previas, 3 simulacros completados (promedio 78), 45 flashcards estudiadas, temas con dominio variable |
| `profesor@demo.com` | `demo1234` | Profesor | 8 alumnos en 4 secciones, 6 contenidos subidos, métricas agregadas, insights de simulacros |
| `directivo@demo.com` | `demo1234` | Directivo | Vista institucional con 4 secciones, adopción 78%, tendencias macro |

Todas pertenecen al **Colegio Demo StudyAI** (ya existente).

### Implementación técnica

**1. Nuevas tablas (migración SQL)**
Para que los datos persistan y la IA pueda referenciarlos, se crean tablas mínimas:
- `simulacro_results` — resultados de simulacros por alumno (course, score, weak_topics, fecha)
- `flashcard_progress` — progreso de flashcards (topic, accuracy, streak)
- `student_metrics` — métricas agregadas por alumno (mastery, study_time, last_active)

Con RLS: alumno ve los suyos; profesor/directivo ven los del colegio.

**2. Función de seed (`src/lib/demo-seed.ts`)**
- `seedDemoUserIfNeeded(userId, email, role)` — se ejecuta una sola vez por usuario.
- Detecta dominio `@demo.com` y rol del perfil.
- Inserta los registros mock correspondientes (basados en `mock-data.ts`) vinculados al `user_id` del demo.
- Marca el perfil con `seeded_at` (nueva columna en `profiles`) para no duplicar.

**3. Hook en `AuthContext`**
Tras cargar el perfil, si `email.endsWith('@demo.com')` y `profile.seeded_at` es null, se llama `seedDemoUserIfNeeded()` antes de renderizar la app.

**4. Pre-creación de las 3 cuentas demo**
Mediante una función edge `setup-demo-accounts` (one-shot) que crea los 3 usuarios con `auth.admin.createUser` usando la service role key. Se invoca manualmente desde la UI con un botón discreto en `/auth` ("Crear cuentas demo") que solo aparece si las cuentas aún no existen.

**5. Botones de acceso rápido en `/auth`**
Tres botones bajo el formulario: "Demo Alumno", "Demo Profesor", "Demo Directivo" que rellenan email/contraseña e ingresan en un click.

### Archivos afectados

- **Nuevo**: `supabase/migrations/...` — tablas demo + columna `seeded_at`
- **Nuevo**: `src/lib/demo-seed.ts` — lógica de seeding
- **Nuevo**: `supabase/functions/setup-demo-accounts/index.ts` — crea las 3 cuentas
- **Editado**: `src/contexts/AuthContext.tsx` — invocar seed tras login
- **Editado**: `src/pages/Auth.tsx` — botones de acceso rápido + botón setup
- **Editado**: componentes que hoy leen de `mock-data.ts` (TeacherStudents, TeacherReports, DirectorView, StudentHome) — leer también de las nuevas tablas cuando hay datos reales, fallback a mock

### Notas

- Los datos demo son **por usuario** (cada cuenta demo tiene los suyos), no compartidos.
- Las cuentas demo se pueden "resetear" borrando sus filas y dejando `seeded_at = null`.
- Esto convive con el flujo normal: cualquier email no-`@demo.com` sigue creándose limpio.

¿Apruebas este enfoque o prefieres ajustes (por ejemplo: cuentas compartidas en lugar de individuales, más/menos datos, otros emails)?