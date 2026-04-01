import { Course, StudentData, ContentItem, SectionData, StudySession, ChatMessage } from './types';

export const courses: Course[] = [
  {
    id: 'math', name: 'Matemática', icon: '📐', color: 'bg-blue-50 text-blue-700 border-blue-200',
    units: [
      { id: 'u1', name: 'Álgebra', topics: [
        { id: 't1', name: 'Ecuaciones lineales', subtopics: ['Ecuaciones de primer grado', 'Sistemas de ecuaciones'] },
        { id: 't2', name: 'Factorización', subtopics: ['Factor común', 'Diferencia de cuadrados', 'Trinomio cuadrado perfecto'] },
      ]},
      { id: 'u2', name: 'Geometría', topics: [
        { id: 't3', name: 'Triángulos', subtopics: ['Clasificación', 'Propiedades', 'Teorema de Pitágoras'] },
        { id: 't4', name: 'Circunferencia', subtopics: ['Elementos', 'Ángulos inscritos', 'Longitud y área'] },
      ]},
    ]
  },
  {
    id: 'comm', name: 'Comunicación', icon: '📝', color: 'bg-amber-50 text-amber-700 border-amber-200',
    units: [
      { id: 'u3', name: 'Comprensión lectora', topics: [
        { id: 't5', name: 'Textos argumentativos', subtopics: ['Estructura', 'Tesis y argumentos', 'Falacias'] },
      ]},
    ]
  },
  {
    id: 'science', name: 'Ciencia y Tecnología', icon: '🔬', color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    units: [
      { id: 'u4', name: 'Biología celular', topics: [
        { id: 't6', name: 'La célula', subtopics: ['Organelos', 'Membrana celular', 'Ciclo celular'] },
      ]},
    ]
  },
  {
    id: 'history', name: 'Historia', icon: '🏛️', color: 'bg-purple-50 text-purple-700 border-purple-200',
    units: [
      { id: 'u5', name: 'Historia del Perú', topics: [
        { id: 't7', name: 'Culturas preincaicas', subtopics: ['Chavín', 'Paracas', 'Nazca', 'Mochica'] },
      ]},
    ]
  },
  {
    id: 'english', name: 'Inglés', icon: '🌎', color: 'bg-sky-50 text-sky-700 border-sky-200',
    units: [
      { id: 'u6', name: 'Grammar', topics: [
        { id: 't8', name: 'Present Perfect', subtopics: ['Affirmative', 'Negative', 'Questions'] },
      ]},
    ]
  },
  {
    id: 'social', name: 'Ciencias Sociales', icon: '🌍', color: 'bg-orange-50 text-orange-700 border-orange-200',
    units: [
      { id: 'u7', name: 'Geografía', topics: [
        { id: 't9', name: 'Regiones naturales', subtopics: ['Costa', 'Sierra', 'Selva'] },
      ]},
    ]
  },
];

export const recentSessions: StudySession[] = [
  { id: 's1', courseId: 'math', courseName: 'Matemática', topic: 'Ecuaciones lineales', date: new Date(2026, 2, 17, 15, 30), duration: 25, score: 85, topicsCovered: ['Ecuaciones de primer grado', 'Despeje de variables'], status: 'completed' },
  { id: 's2', courseId: 'science', courseName: 'Ciencia y Tecnología', topic: 'La célula', date: new Date(2026, 2, 16, 10, 0), duration: 18, score: 72, topicsCovered: ['Organelos', 'Membrana celular'], status: 'completed' },
  { id: 's3', courseId: 'comm', courseName: 'Comunicación', topic: 'Textos argumentativos', date: new Date(2026, 2, 15, 14, 0), duration: 30, score: 90, topicsCovered: ['Estructura', 'Tesis y argumentos'], status: 'completed' },
];

export const mockStudents: StudentData[] = [
  { id: '1', name: 'Valentina Rojas', section: '4°A', grade: '4°', lastActive: new Date(2026, 2, 18, 9, 30), studyTime: 320, sessionsCount: 24, topicsStudied: 18, mastery: 82, needsAttention: false, weakTopics: ['Factorización'], strongTopics: ['Ecuaciones lineales', 'Comprensión lectora'], flashcards: { completed: 42, accuracy: 88, streak: 5 }, simulacros: { completed: 6, avgScore: 84, readiness: 'ready' } },
  { id: '2', name: 'Sebastián Torres', section: '4°A', grade: '4°', lastActive: new Date(2026, 2, 17, 16, 0), studyTime: 180, sessionsCount: 14, topicsStudied: 10, mastery: 65, needsAttention: true, weakTopics: ['Ecuaciones lineales', 'La célula'], strongTopics: ['Textos argumentativos'], flashcards: { completed: 18, accuracy: 62, streak: 1 }, simulacros: { completed: 3, avgScore: 55, readiness: 'needs_work' } },
  { id: '3', name: 'Camila Mendoza', section: '4°A', grade: '4°', lastActive: new Date(2026, 2, 18, 8, 0), studyTime: 410, sessionsCount: 30, topicsStudied: 22, mastery: 91, needsAttention: false, weakTopics: [], strongTopics: ['Matemática', 'Ciencia', 'Historia'], flashcards: { completed: 65, accuracy: 94, streak: 12 }, simulacros: { completed: 8, avgScore: 92, readiness: 'ready' } },
  { id: '4', name: 'Mateo García', section: '4°B', grade: '4°', lastActive: new Date(2026, 2, 14, 12, 0), studyTime: 90, sessionsCount: 7, topicsStudied: 5, mastery: 48, needsAttention: true, weakTopics: ['Factorización', 'Circunferencia', 'La célula'], strongTopics: [], flashcards: { completed: 8, accuracy: 45, streak: 0 }, simulacros: { completed: 1, avgScore: 38, readiness: 'needs_work' } },
  { id: '5', name: 'Isabella Vargas', section: '4°B', grade: '4°', lastActive: new Date(2026, 2, 18, 10, 0), studyTime: 280, sessionsCount: 20, topicsStudied: 15, mastery: 76, needsAttention: false, weakTopics: ['Triángulos'], strongTopics: ['Comunicación', 'Historia'], flashcards: { completed: 35, accuracy: 78, streak: 3 }, simulacros: { completed: 5, avgScore: 72, readiness: 'almost' } },
  { id: '6', name: 'Daniel López', section: '3°A', grade: '3°', lastActive: new Date(2026, 2, 16, 14, 0), studyTime: 150, sessionsCount: 11, topicsStudied: 8, mastery: 58, needsAttention: true, weakTopics: ['Ecuaciones lineales', 'Textos argumentativos'], strongTopics: ['Ciencia'], flashcards: { completed: 14, accuracy: 58, streak: 0 }, simulacros: { completed: 2, avgScore: 50, readiness: 'needs_work' } },
  { id: '7', name: 'Luciana Herrera', section: '3°A', grade: '3°', lastActive: new Date(2026, 2, 18, 7, 45), studyTime: 350, sessionsCount: 26, topicsStudied: 19, mastery: 88, needsAttention: false, weakTopics: [], strongTopics: ['Todas las materias'], flashcards: { completed: 58, accuracy: 91, streak: 9 }, simulacros: { completed: 7, avgScore: 89, readiness: 'ready' } },
  { id: '8', name: 'Andrés Castillo', section: '3°B', grade: '3°', lastActive: new Date(2026, 2, 12, 9, 0), studyTime: 60, sessionsCount: 4, topicsStudied: 3, mastery: 35, needsAttention: true, weakTopics: ['Múltiples temas'], strongTopics: [], flashcards: { completed: 3, accuracy: 33, streak: 0 }, simulacros: { completed: 0, avgScore: 0, readiness: 'needs_work' } },
];

export const mockContent: ContentItem[] = [
  { id: 'c1', name: 'Guía de ecuaciones lineales.pdf', type: 'pdf', course: 'Matemática', grade: '4°', section: 'A', unit: 'Álgebra', topic: 'Ecuaciones lineales', uploadDate: new Date(2026, 2, 10), status: 'ready', size: '2.4 MB' },
  { id: 'c2', name: 'Presentación - La célula.pptx', type: 'ppt', course: 'Ciencia y Tecnología', grade: '4°', section: 'A', unit: 'Biología celular', topic: 'La célula', uploadDate: new Date(2026, 2, 12), status: 'ready', size: '5.1 MB' },
  { id: 'c3', name: 'Resumen de factorización.pdf', type: 'pdf', course: 'Matemática', grade: '4°', section: 'A', unit: 'Álgebra', topic: 'Factorización', uploadDate: new Date(2026, 2, 14), status: 'processing', size: '1.8 MB' },
  { id: 'c4', name: 'Video - Textos argumentativos', type: 'video', course: 'Comunicación', grade: '4°', section: 'A-B', unit: 'Comprensión lectora', topic: 'Textos argumentativos', uploadDate: new Date(2026, 2, 15), status: 'ready', size: '45 MB' },
  { id: 'c5', name: 'Conceptos clave - Triángulos', type: 'concepts', course: 'Matemática', grade: '4°', section: 'B', unit: 'Geometría', topic: 'Triángulos', uploadDate: new Date(2026, 2, 16), status: 'needs_review', size: '0.5 MB' },
  { id: 'c6', name: 'Notas de clase - Culturas preincaicas', type: 'text', course: 'Historia', grade: '4°', section: 'A', unit: 'Historia del Perú', topic: 'Culturas preincaicas', uploadDate: new Date(2026, 2, 17), status: 'ready', size: '0.3 MB' },
];

export const mockSections: SectionData[] = [
  { id: 'sec1', name: '4°A', grade: '4°', activeStudents: 28, totalStudents: 32, avgStudyTime: 245, avgSessionsPerWeek: 3.2, engagement: 87, weakTopics: ['Factorización', 'Circunferencia'], topCourses: ['Matemática', 'Comunicación'] },
  { id: 'sec2', name: '4°B', grade: '4°', activeStudents: 22, totalStudents: 30, avgStudyTime: 180, avgSessionsPerWeek: 2.4, engagement: 73, weakTopics: ['Triángulos', 'La célula'], topCourses: ['Ciencia y Tecnología', 'Historia'] },
  { id: 'sec3', name: '3°A', grade: '3°', activeStudents: 30, totalStudents: 33, avgStudyTime: 290, avgSessionsPerWeek: 3.8, engagement: 91, weakTopics: ['Ecuaciones lineales'], topCourses: ['Matemática', 'Comunicación'] },
  { id: 'sec4', name: '3°B', grade: '3°', activeStudents: 18, totalStudents: 31, avgStudyTime: 120, avgSessionsPerWeek: 1.6, engagement: 58, weakTopics: ['Múltiples temas'], topCourses: ['Comunicación'] },
];

export const sampleChatMessages: ChatMessage[] = [
  { id: 'm1', role: 'assistant', content: '¡Hola! 👋 Soy tu tutor de **Matemática**. Hoy vamos a trabajar con **ecuaciones lineales**.\n\nAntes de empezar, cuéntame: ¿ya has visto este tema en clase o es la primera vez que lo estudias?', timestamp: new Date(2026, 2, 18, 10, 0) },
  { id: 'm2', role: 'user', content: 'Ya lo vimos en clase pero no me quedó muy claro cómo despejar la x', timestamp: new Date(2026, 2, 18, 10, 1) },
  { id: 'm3', role: 'assistant', content: 'Perfecto, eso es muy común. Vamos paso a paso. 🎯\n\n**Despejar la x** significa dejarla sola en un lado de la ecuación. La clave es:\n\n1. Lo que está **sumando** pasa al otro lado **restando**\n2. Lo que está **multiplicando** pasa al otro lado **dividiendo**\n\nPor ejemplo, si tenemos:\n\n```\n2x + 5 = 13\n```\n\n**Paso 1:** El 5 está sumando, así que pasa restando:\n```\n2x = 13 - 5\n2x = 8\n```\n\n**Paso 2:** El 2 está multiplicando a x, así que pasa dividiendo:\n```\nx = 8 ÷ 2\nx = 4\n```\n\n¿Tiene sentido hasta aquí? ¿Quieres que te explique otro ejemplo o prefieres intentar uno tú?', timestamp: new Date(2026, 2, 18, 10, 2) },
  { id: 'm4', role: 'user', content: 'Sí entendí! Dame uno para practicar', timestamp: new Date(2026, 2, 18, 10, 3) },
  { id: 'm5', role: 'assistant', content: '¡Excelente! 💪 Aquí va tu ejercicio:\n\n**Resuelve:**\n```\n3x - 7 = 14\n```\n\nToma tu tiempo, escribe cada paso y yo te voy guiando. ¿Cuál sería tu primer paso?', timestamp: new Date(2026, 2, 18, 10, 3) },
];
