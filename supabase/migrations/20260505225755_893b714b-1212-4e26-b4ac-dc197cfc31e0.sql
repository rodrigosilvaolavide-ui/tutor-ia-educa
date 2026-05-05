
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.get_user_role(uuid) from public, anon;
revoke execute on function public.get_user_school(uuid) from public, anon;
