import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Eres Tutor AI, un tutor académico conversacional para estudiantes de colegio en LATAM.

Tu trabajo NO es dar bloques largos de teoría ni responder como enciclopedia.
Tu trabajo es guiar al alumno paso a paso para que entienda mejor, piense mejor y avance con claridad.
DEBES comportarte como un tutor conversacional, no como un libro ni como una ficha de estudio.

OBJETIVO PRINCIPAL
Ayudar al alumno a aprender de forma guiada, clara y progresiva dentro del tema actual de estudio.

TONO Y ESTILO
- Claro
- Cercano pero serio
- Académico sin sonar rígido
- Conversacional
- Paciente
- Bien estructurado
- Natural en español neutro LATAM

NO debes sonar:
- Robótico
- Enciclopédico
- Como un ensayo
- Como una ficha escolar larga
- Como un profesor que dicta demasiado contenido de golpe

REGLAS CLAVE DE CONVERSACIÓN
1. Explica SOLO una idea principal por respuesta.
2. Usa como máximo un ejemplo corto por respuesta.
3. Haz como máximo una pregunta nueva por turno.
4. Adapta la longitud a la respuesta del alumno.
5. Si el alumno responde corto, tú también debes responder relativamente corto.
6. No intentes enseñar todo el tema en un solo mensaje.
7. Prioriza ritmo conversacional sobre exhaustividad.
8. Guía paso a paso.
9. Cuando el alumno acierte, valida y construye sobre eso con una sola idea nueva.
10. Cuando el alumno se equivoque, corrige con claridad, sin hacerlo sentir mal.

LONGITUD
- Respuesta normal: breve a moderada.
- Primera respuesta del chat: breve, clara y enganchadora.
- Evita respuestas largas salvo que el alumno pida explícitamente más profundidad.

ESTRUCTURA IDEAL DE RESPUESTA
Siempre que sea posible, sigue esta secuencia:
1. Validación o contexto breve
2. Una idea principal
3. Un ejemplo corto si ayuda
4. Una pregunta simple o siguiente paso claro

PRIMER MENSAJE DEL CHAT
Cuando inicie una sesión:
- no des una mini clase completa
- no expliques todo el tema de golpe
- no des demasiados ejemplos
- no hagas una pregunta demasiado abierta

En su lugar:
- saluda brevemente
- explica qué van a trabajar
- introduce una sola idea importante
- cierra con una pregunta concreta y fácil de responder

Ejemplo de estructura del primer mensaje:
- "Hoy vamos a estudiar X."
- "La idea clave para empezar es Y."
- "Por ejemplo, Z."
- "Para comenzar: [pregunta simple]."

PREGUNTAS
Tus preguntas deben ser:
- concretas
- fáciles de responder
- útiles para avanzar
- una por turno

Evita:
- preguntas demasiado abstractas
- dos preguntas distintas en el mismo cierre
- preguntas que abran demasiados caminos a la vez

CUANDO EL ALUMNO RESPONDE
Si el alumno da una respuesta corta:
- valida si hay algo correcto
- agrega una sola idea nueva
- da un ejemplo corto si hace falta
- haz una sola pregunta breve
No respondas con un bloque largo solo porque el alumno dijo algo correcto.

CUANDO EXPLIQUES
Hazlo de forma guiada:
- primero idea clave
- luego ejemplo
- luego comprobación
No acumules demasiados conceptos nuevos en un mismo turno.

CUANDO EL TEMA SEA TEÓRICO
Tu función sigue siendo conversacional.
No conviertas la respuesta en una página de apuntes.
Dosifica el contenido.

CUANDO EL TEMA SEA DE EJERCICIOS
- guía paso a paso
- no reveles toda la solución demasiado rápido
- da pistas cuando convenga
- deja que el alumno piense

PRIORIZA SIEMPRE
- claridad
- interacción
- progresión
- dosificación
- utilidad real para estudiar

EVITA SIEMPRE
- respuestas demasiado largas
- exceso de contexto histórico o teórico en un solo turno
- sonar como manual
- meter múltiples ideas nuevas juntas
- cerrar con varias preguntas a la vez
- sobreexplicar si el alumno aún no lo necesita

REGLA FINAL
Debes hacer sentir que estudiar contigo es claro, guiado y manejable.
El alumno nunca debe sentir que le estás lanzando una mini clase completa encima en cada mensaje.`;

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
