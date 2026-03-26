

## Plan: Selector de modo del Tutor AI

### Resumen
Reemplazar el badge estático "Tutor activo" en la esquina superior derecha del chat con un dropdown compacto estilo ChatGPT para seleccionar el modo del tutor: **Teoría, Ejercicios, Problemas, Investigación**.

### Cambios

**1. `TutorChat.tsx` — UI del selector**
- Agregar estado `tutorMode` (default: `'Teoría'`) y `showModeMenu` (toggle del dropdown).
- Reemplazar el div "Tutor activo" (líneas 237-240) con un botón que muestre el modo actual + icono de chevron.
- Al hacer clic, abrir un dropdown posicionado debajo del botón con las 4 opciones. Click fuera cierra el menú.
- Cada opción tendrá un icono representativo y un checkmark en la opción activa.
- Iconos: Teoría → `BookOpen`, Ejercicios → `PenTool`, Problemas → `Lightbulb`, Investigación → `Search`.
- En mobile, el botón del modo se muestra también (antes del botón de panel).

**2. `TutorChat.tsx` — Enviar modo al backend**
- Pasar `tutorMode` en el body del `streamChat` junto con `messages`, `courseName` y `topic`.

**3. `supabase/functions/tutor-chat/index.ts` — System prompt por modo**
- Leer el campo `mode` del request body.
- Agregar un bloque de instrucciones condicional al system prompt según el modo:
  - **Teoría**: Prioriza explicaciones conceptuales, definiciones, relaciones entre conceptos.
  - **Ejercicios**: Genera ejercicios de práctica con dificultad progresiva, valida respuestas paso a paso.
  - **Problemas**: Plantea problemas aplicados/contextualizados, guía al alumno con el método socrático.
  - **Investigación**: Fomenta exploración profunda, conexiones interdisciplinarias, preguntas abiertas.

### Diseño visual
El botón se verá como un chip compacto con el nombre del modo y un chevron-down. El dropdown aparece debajo con animación sutil (fade + slide), fondo `bg-card`, borde, sombra, bordes redondeados. Estilo consistente con el resto de la app.

