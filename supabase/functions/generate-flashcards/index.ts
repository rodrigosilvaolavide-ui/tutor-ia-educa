import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { courseName, topic, count, style } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!courseName) {
      return new Response(JSON.stringify({ error: "courseName es requerido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const numCards = Math.min(Math.max(count || 10, 3), 20);
    const cardStyle: "fill" | "multiple_choice" = style === "multiple_choice" ? "multiple_choice" : "fill";

    const baseSystem = `Eres un generador de flash cards educativas para estudiantes de colegio en Latinoamérica. 
Responde SIEMPRE en español neutro LATAM.

INSTRUCCIONES GENERALES:
- Genera exactamente ${numCards} flash cards sobre el tema indicado.
- Las preguntas deben ser claras, específicas y educativas.
- Varía la dificultad: incluye preguntas fáciles, medias y difíciles.
- Cubre diferentes aspectos del tema.
- Las preguntas deben evaluar comprensión, no solo memoria.`;

    const styleInstructions =
      cardStyle === "multiple_choice"
        ? `
INSTRUCCIONES ESPECÍFICAS PARA OPCIÓN MÚLTIPLE:
- Cada tarjeta debe incluir EXACTAMENTE 3 opciones de respuesta.
- Solo UNA opción debe ser la correcta.
- Las otras 2 opciones (distractores) deben ser plausibles, relacionadas al tema, pero claramente incorrectas para alguien que entiende.
- Evita distractores absurdos o demasiado obvios.
- El campo "answer" debe ser EXACTAMENTE igual al texto de la opción correcta.
- Las opciones deben ser cortas (máximo 1-2 oraciones cada una).`
        : `
INSTRUCCIONES ESPECÍFICAS PARA RELLENAR TEXTO:
- Las respuestas deben ser concisas pero completas (máximo 2-3 oraciones).`;

    const systemPrompt = baseSystem + styleInstructions;

    const userPrompt = `Genera ${numCards} flash cards de tipo "${cardStyle === "multiple_choice" ? "opción múltiple" : "rellenar texto"}" para el curso "${courseName}"${topic ? `, tema: "${topic}"` : ''}.`;

    const cardSchema =
      cardStyle === "multiple_choice"
        ? {
            type: "object",
            properties: {
              question: { type: "string", description: "La pregunta de la flash card" },
              answer: { type: "string", description: "La respuesta correcta (debe coincidir con una de las opciones)" },
              options: {
                type: "array",
                description: "Exactamente 3 opciones de respuesta, una de ellas es la correcta",
                items: { type: "string" },
              },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            },
            required: ["question", "answer", "options", "difficulty"],
            additionalProperties: false,
          }
        : {
            type: "object",
            properties: {
              question: { type: "string", description: "La pregunta de la flash card" },
              answer: { type: "string", description: "La respuesta concisa" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            },
            required: ["question", "answer", "difficulty"],
            additionalProperties: false,
          };

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
              name: "generate_flashcards",
              description: "Genera un conjunto de flash cards educativas",
              parameters: {
                type: "object",
                properties: {
                  cards: {
                    type: "array",
                    items: cardSchema,
                  },
                },
                required: ["cards"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_flashcards" } },
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
      return new Response(JSON.stringify({ error: "Error generando flash cards" }), {
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
    const cards = parsed.cards.map((card: any, i: number) => {
      const base = {
        id: `fc-${Date.now()}-${i}`,
        question: card.question,
        answer: card.answer,
        topic: topic || courseName,
        difficulty: card.difficulty,
        style: cardStyle,
      };
      if (cardStyle === "multiple_choice") {
        // Sanitize options: ensure 3 items, ensure answer is included, shuffle
        let options: string[] = Array.isArray(card.options) ? card.options.slice(0, 3) : [];
        if (!options.includes(card.answer)) {
          options[0] = card.answer;
        }
        while (options.length < 3) options.push("Ninguna de las anteriores");
        // shuffle
        options = options.sort(() => Math.random() - 0.5);
        return { ...base, options };
      }
      return base;
    });

    return new Response(JSON.stringify({ cards }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-flashcards error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
