-- Colegios
create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  active boolean default true,
  created_at timestamptz default now()
);

-- Perfiles de usuario (extiende auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  school_id uuid references public.schools(id),
  role text not null check (role in ('super_admin','directivo','profesor','alumno')),
  full_name text not null,
  grade text,
  section text,
  subject text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Sesiones de tutor (reemplaza localStorage)
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  school_id uuid references public.schools(id),
  course_id text not null,
  course_name text not null,
  topic text,
  mode text default 'Teoría',
  messages jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Uso de IA por usuario (para rate limiting)
create table public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  school_id uuid references public.schools(id),
  function_name text not null,
  tokens_used integer default 0,
  called_at timestamptz default now()
);

-- Índices útiles
create index idx_profiles_school on public.profiles(school_id);
create index idx_chat_sessions_user on public.chat_sessions(user_id);
create index idx_chat_sessions_school on public.chat_sessions(school_id);
create index idx_ai_usage_user_time on public.ai_usage(user_id, called_at desc);