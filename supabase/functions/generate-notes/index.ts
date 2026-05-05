import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const { allowed } = await checkRateLimit(
    req.headers.get("Authorization"),
    "generate-notes",
    30
  );
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Límite diario alcanzado. Vuelve mañana." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { courseName, topic } = await req.json();
    if (!courseName || !topic) {
      return new Response(JSON.stringify({ error: "courseName y topic son requeridos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Eres un generador de notas de estudio para estudiantes de secundaria/preparatoria.
Genera notas de estudio completas y bien estructuradas en español.

FORMATO OBLIGATORIO (usa Markdown):
1. Título con emoji representativo (# 📐 Título del tema)
2. Resumen introductorio en 2-3 oraciones claras
3. Secciones con subtítulos (## y ###), conceptos clave en **negrita**
4. Incluye 1-2 preguntas socráticas en blockquotes con este formato exacto:
   > 🤔 **Reflexiona:** ¿Por qué...?
5. Ejemplos prácticos cuando sea relevante
6. Al final, incluye exactamente este CTA:
   ---
   ✅ **¿Listo para practicar?** Cambia a la pestaña "Chatear con Tutor" para resolver dudas y ejercicios con el Tutor AI.

REGLAS:
- Contenido apropiado para el nivel escolar
- Lenguaje claro y accesible
- Resalta conceptos clave con negrita
- Usa listas cuando ayude a la claridad
- Máximo 800 palabras`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Genera notas de estudio completas sobre el tema "${topic}" del curso "${courseName}".` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Contacta al administrador." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error generando notas" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const notes = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ notes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
