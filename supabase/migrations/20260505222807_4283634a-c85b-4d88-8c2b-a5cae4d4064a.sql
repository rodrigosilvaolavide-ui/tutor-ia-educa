revoke execute on function public.get_user_role(uuid) from public, anon;
revoke execute on function public.get_user_school(uuid) from public, anon;
grant execute on function public.get_user_role(uuid) to authenticated;
grant execute on function public.get_user_school(uuid) to authenticated;