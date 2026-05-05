
-- 1. Insert demo school with fixed ID
insert into public.schools (id, name, slug, active)
values ('00000000-0000-0000-0000-000000000001', 'Colegio Demo StudyAI', 'demo', true)
on conflict (id) do nothing;

-- 2. Allow users to insert their own profile (safety net)
create policy "usuarios crean su propio perfil"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- 3. Trigger function: auto-create profile on signup, assigned to demo school
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, school_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'alumno'),
    '00000000-0000-0000-0000-000000000001'::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 4. Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
