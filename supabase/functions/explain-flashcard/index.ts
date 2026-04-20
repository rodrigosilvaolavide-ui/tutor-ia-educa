import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, correctAnswer, studentAnswer, topic, courseName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!question || !correctAnswer) {
      return new Response(JSON.stringify({ error: "question y correctAnswer son requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Eres un tutor educativo claro y conciso para estudiantes de colegio en Latinoamérica.
Responde SIEMPRE en español neutro LATAM, en tono cercano y motivador.

INSTRUCCIONES:
- Explica brevemente (2-3 oraciones máximo) por qué la respuesta correcta es la correcta.
- Si el alumno eligió una opción incorrecta, menciona muy brevemente por qué esa opción no es válida.
- Sé didáctico: usa lenguaje sencillo y conceptos claros.
- No repitas la pregunta literalmente.
- No uses listas ni viñetas, solo texto fluido.`;

    const context = courseName && topic ? `Curso: ${courseName}. Tema: ${topic}.\n` : "";
    const userPrompt = `${context}Pregunta: "${question}"
Respuesta correcta: "${correctAnswer}"
${studentAnswer ? `Respuesta elegida por el alumno: "${studentAnswer}"` : ""}

Explica brevemente por qué la respuesta correcta es la correcta.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error generando explicación" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content?.trim();

    if (!explanation) {
      return new Response(JSON.stringify({ error: "Respuesta inesperada de la IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ explanation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("explain-flashcard error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
