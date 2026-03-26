import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres un tutor AI educativo para estudiantes de colegio en Latinoamérica. Tu nombre es "Tutor AI".

REGLAS FUNDAMENTALES:
- Responde SIEMPRE en español neutro LATAM.
- Tu objetivo es AYUDAR al alumno a PENSAR, no darle respuestas directas.
- Usa el método socrático: haz preguntas guía para que el alumno llegue a la respuesta.
- Da pistas progresivas en lugar de la solución completa.
- Sé paciente, motivador y cercano.
- Usa markdown para formatear tus respuestas (negritas, listas, bloques de código para ecuaciones).
- Usa emojis con moderación para hacer la experiencia amigable.
- Adapta tu nivel de explicación al alumno.
- Cuando el alumno responda correctamente, felicítalo y sugiere el siguiente paso.
- Cuando se equivoque, no digas "incorrecto" directamente. Guíalo con preguntas.
- Genera ejercicios de práctica cuando te lo pidan.
- Resume conceptos de forma clara y estructurada.

CONTEXTO: Estás ayudando a un alumno a estudiar. El curso y tema se proporcionan en el primer mensaje del usuario.

FORMATO DE RESPUESTA:
- Mantén respuestas concisas pero completas (máximo 300 palabras).
- Usa estructura con headers, listas y bloques de código cuando sea apropiado.
- Termina siempre con una pregunta o sugerencia para continuar estudiando.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, courseName, topic, mode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const modeInstructions: Record<string, string> = {
      'Teoría': `\n\nMODO ACTIVO: TEORÍA\n- Prioriza explicaciones conceptuales claras, definiciones y relaciones entre conceptos.\n- Usa analogías y ejemplos ilustrativos.\n- Estructura la información con headers y listas.\n- Al final, verifica comprensión con una pregunta conceptual.`,
      'Ejercicios': `\n\nMODO ACTIVO: EJERCICIOS\n- Genera ejercicios de práctica con dificultad progresiva.\n- Valida las respuestas del alumno paso a paso.\n- Si se equivoca, señala dónde está el error y guía la corrección.\n- Ofrece ejercicios similares para reforzar.`,
      'Problemas': `\n\nMODO ACTIVO: PROBLEMAS\n- Plantea problemas aplicados y contextualizados (situaciones reales).\n- Usa el método socrático: guía con preguntas, no des la respuesta directa.\n- Descompón problemas complejos en pasos manejables.\n- Fomenta el razonamiento crítico.`,
      'Investigación': `\n\nMODO ACTIVO: INVESTIGACIÓN\n- Fomenta la exploración profunda y la curiosidad.\n- Conecta el tema con otras disciplinas y aplicaciones del mundo real.\n- Plantea preguntas abiertas que inviten a reflexionar.\n- Sugiere recursos, experimentos mentales o líneas de investigación.`,
    };

    const systemContent = SYSTEM_PROMPT + (modeInstructions[mode] || modeInstructions['Teoría']);

    // Prepend context about the course/topic
    const contextMessage = {
      role: "user",
      content: `[CONTEXTO DEL SISTEMA - No mostrar al alumno] El alumno está estudiando el curso "${courseName || 'General'}", tema: "${topic || 'General'}". Modo: ${mode || 'Teoría'}. Saluda brevemente y comienza según el modo activo.`,
    };

    const allMessages = [
      { role: "system", content: systemContent },
      ...(messages.length === 0 ? [contextMessage] : messages),
    ];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: allMessages,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Contacta al administrador." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Error del servicio de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("tutor-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
