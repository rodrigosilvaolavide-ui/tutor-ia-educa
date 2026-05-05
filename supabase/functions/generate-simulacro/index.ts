import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { checkRateLimit } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const { allowed } = await checkRateLimit(
    req.headers.get("Authorization"),
    "generate-simulacro",
    30
  );
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: "Límite diario alcanzado. Vuelve mañana." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const { courseName, topic, count } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!courseName) {
      return new Response(JSON.stringify({ error: "courseName es requerido" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const numQuestions = Math.min(Math.max(count || 8, 4), 15);

    const systemPrompt = `Eres un generador de exámenes educativos para estudiantes de colegio en Latinoamérica.
Responde SIEMPRE en español neutro LATAM.

INSTRUCCIONES:
- Genera exactamente ${numQuestions} preguntas de examen sobre el tema indicado.
- Mezcla preguntas de opción múltiple (con exactamente 4 opciones) y de respuesta corta.
- Aproximadamente 60-70% deben ser opción múltiple y el resto respuesta corta.
- Las preguntas deben cubrir diferentes subtemas y niveles de dificultad.
- Las opciones incorrectas deben ser plausibles (distractores creíbles).
- Las respuestas correctas de desarrollo corto deben ser concisas (1-2 oraciones máximo).
- Cada pregunta debe tener un subtema específico asociado.
- Las preguntas deben evaluar comprensión, aplicación y análisis, no solo memoria.`;

    const userPrompt = `Genera ${numQuestions} preguntas de simulacro para el curso "${courseName}"${topic ? `, tema: "${topic}"` : ''}.`;

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
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_simulacro",
              description: "Genera preguntas de simulacro/examen",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["multiple_choice", "short_answer"] },
                        question: { type: "string" },
                        options: { type: "array", items: { type: "string" }, description: "4 opciones para multiple_choice, omitir para short_answer" },
                        correctAnswer: { type: "string", description: "La respuesta correcta exacta (debe coincidir con una de las opciones si es multiple_choice)" },
                        topic: { type: "string", description: "Tema general" },
                        subtopic: { type: "string", description: "Subtema específico" },
                      },
                      required: ["type", "question", "correctAnswer", "topic", "subtopic"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_simulacro" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados. Contacta al administrador." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error generando simulacro" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Respuesta inesperada de la IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const questions = parsed.questions.map((q: any, i: number) => ({
      id: `sq-${Date.now()}-${i}`,
      type: q.type,
      question: q.question,
      options: q.options || undefined,
      correctAnswer: q.correctAnswer,
      topic: q.topic,
      subtopic: q.subtopic,
    }));

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-simulacro error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
