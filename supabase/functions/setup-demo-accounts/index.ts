import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEMO_SCHOOL_ID = "00000000-0000-0000-0000-000000000001";
const DEMO_PASSWORD = "demo1234";

const accounts = [
  { email: "alumno@demo.com", full_name: "Valentina Rojas (Demo)", role: "alumno", grade: "4°", section: "A" },
  { email: "profesor@demo.com", full_name: "Prof. María Quispe (Demo)", role: "profesor", subject: "Matemática" },
  { email: "directivo@demo.com", full_name: "Dir. Carlos Ramírez (Demo)", role: "directivo" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const results: Array<{ email: string; status: string }> = [];

    for (const a of accounts) {
      // Try to create; if exists, just upsert profile.
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: a.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: a.full_name, role: a.role },
      });

      let userId = created?.user?.id;

      if (createErr && !userId) {
        // Already exists — find by listing users (best-effort)
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        userId = list?.users?.find((u) => u.email === a.email)?.id;
        if (!userId) {
          results.push({ email: a.email, status: `error: ${createErr.message}` });
          continue;
        }
      }

      // Upsert profile
      await admin.from("profiles").upsert({
        id: userId!,
        full_name: a.full_name,
        role: a.role,
        school_id: DEMO_SCHOOL_ID,
        grade: a.grade ?? null,
        section: a.section ?? null,
        subject: a.subject ?? null,
        active: true,
      });

      results.push({ email: a.email, status: created ? "created" : "exists" });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
