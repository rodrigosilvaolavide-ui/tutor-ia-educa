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
    const { question, expectedAnswer, studentAnswer } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!question || !expectedAnswer || !studentAnswer) {
      return new Response(JSON.stringify({ error: "question, expectedAnswer y studentAnswer son requeridos" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Eres un evaluador educativo justo y constructivo para estudiantes de colegio en Latinoamérica.
Responde SIEMPRE en español neutro LATAM.

INSTRUCCIONES:
- Evalúa la respuesta del alumno comparándola con la respuesta esperada.
- Sé justo: si la idea central es correcta aunque la redacción sea diferente, considérala correcta.
- Si tiene la idea parcialmente, márcala como parcialmente correcta.
- Da feedback breve (máximo 1-2 oraciones), constructivo y motivador.
- No repitas la respuesta correcta en el feedback, solo da una pista o reconocimiento.`;

    const userPrompt = `Pregunta: "${question}"
Respuesta esperada: "${expectedAnswer}"
Respuesta del alumno: "${studentAnswer}"

Evalúa la respuesta del alumno.`;

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
        tools: [
          {
            type: "function",
            function: {
              name: "evaluate_answer",
              description: "Evalúa la respuesta de un alumno",
              parameters: {
                type: "object",
                properties: {
                  rating: { type: "string", enum: ["correct", "partial", "incorrect"], description: "Clasificación de la respuesta" },
                  feedback: { type: "string", description: "Feedback breve y constructivo para el alumno" },
                },
                required: ["rating", "feedback"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "evaluate_answer" } },
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
      return new Response(JSON.stringify({ error: "Error evaluando respuesta" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Respuesta inesperada de la IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("evaluate-flashcard error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
