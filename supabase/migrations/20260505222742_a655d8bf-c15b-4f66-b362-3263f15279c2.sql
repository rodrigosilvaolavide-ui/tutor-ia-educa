-- =========================================================
-- Funciones SECURITY DEFINER para evitar recursión en RLS
-- =========================================================
create or replace function public.get_user_role(_uid uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = _uid;
$$;

create or replace function public.get_user_school(_uid uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select school_id from public.profiles where id = _uid;
$$;

-- =========================================================
-- schools
-- =========================================================
alter table public.schools enable row level security;

create policy "usuarios autenticados ven colegios"
  on public.schools for select
  to authenticated
  using (true);

create policy "super_admin gestiona colegios"
  on public.schools for all
  to authenticated
  using (public.get_user_role(auth.uid()) = 'super_admin')
  with check (public.get_user_role(auth.uid()) = 'super_admin');

-- =========================================================
-- profiles
-- =========================================================
alter table public.profiles enable row level security;

create policy "usuarios ven su propio perfil"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "staff ve perfiles de su colegio"
  on public.profiles for select
  to authenticated
  using (
    school_id = public.get_user_school(auth.uid())
    and public.get_user_role(auth.uid()) in ('directivo','profesor','super_admin')
  );

create policy "super_admin ve todos los perfiles"
  on public.profiles for select
  to authenticated
  using (public.get_user_role(auth.uid()) = 'super_admin');

create policy "usuarios actualizan su propio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "super_admin gestiona perfiles"
  on public.profiles for all
  to authenticated
  using (public.get_user_role(auth.uid()) = 'super_admin')
  with check (public.get_user_role(auth.uid()) = 'super_admin');

-- =========================================================
-- chat_sessions
-- =========================================================
alter table public.chat_sessions enable row level security;

create policy "alumnos gestionan sus propias sesiones"
  on public.chat_sessions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "staff ve sesiones de su colegio"
  on public.chat_sessions for select
  to authenticated
  using (
    school_id = public.get_user_school(auth.uid())
    and public.get_user_role(auth.uid()) in ('directivo','profesor','super_admin')
  );

-- =========================================================
-- ai_usage
-- =========================================================
alter table public.ai_usage enable row level security;

create policy "usuarios ven su propio uso"
  on public.ai_usage for select
  to authenticated
  using (user_id = auth.uid());

create policy "staff ve uso de su colegio"
  on public.ai_usage for select
  to authenticated
  using (
    school_id = public.get_user_school(auth.uid())
    and public.get_user_role(auth.uid()) in ('directivo','profesor','super_admin')
  );
-- (No INSERT policy: solo el service role desde Edge Functions registra uso)