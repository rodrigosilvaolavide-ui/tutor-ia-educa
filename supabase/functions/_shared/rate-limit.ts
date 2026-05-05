import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function checkRateLimit(
  authHeader: string | null,
  functionName: string,
  limitPerDay = 50
): Promise<{ allowed: boolean; userId: string | null; schoolId: string | null }> {

  if (!authHeader) return { allowed: false, userId: null, schoolId: null };

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return { allowed: false, userId: null, schoolId: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("school_id")
    .eq("id", user.id)
    .maybeSingle();

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("ai_usage")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("function_name", functionName)
    .gte("called_at", since);

  if ((count ?? 0) >= limitPerDay) {
    return { allowed: false, userId: user.id, schoolId: profile?.school_id ?? null };
  }

  await supabase.from("ai_usage").insert({
    user_id: user.id,
    school_id: profile?.school_id ?? null,
    function_name: functionName,
  });

  return { allowed: true, userId: user.id, schoolId: profile?.school_id ?? null };
}
