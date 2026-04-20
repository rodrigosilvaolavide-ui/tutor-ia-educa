// Gamification system types and mock data

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'constancia' | 'dominio' | 'mejora' | 'disciplina';
  unlocked: boolean;
  unlockedDate?: Date;
  progress?: number; // 0-100 for locked badges
}

export interface WeeklyGoal {
  id: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  completed: boolean;
}

export interface ClassmateProfile {
  id: string;
  name: string;
  avatar: string;
  level: string;
  levelNumber: number;
  streak: number;
  points: number;
  badges: Badge[];
  recentAchievement?: string;
}

export type MasteryLevel = 'starting' | 'in_progress' | 'solid_base' | 'good' | 'high';

export const masteryLabels: Record<MasteryLevel, string> = {
  starting: 'Recién empezando',
  in_progress: 'En progreso',
  solid_base: 'Base sólida',
  good: 'Buen dominio',
  high: 'Dominio alto',
};

export const masteryColors: Record<MasteryLevel, string> = {
  starting: 'text-muted-foreground',
  in_progress: 'text-info',
  solid_base: 'text-warning',
  good: 'text-success',
  high: 'text-primary',
};

export function getMasteryLevel(percent: number): MasteryLevel {
  if (percent < 20) return 'starting';
  if (percent < 45) return 'in_progress';
  if (percent < 65) return 'solid_base';
  if (percent < 85) return 'good';
  return 'high';
}

export const studentLevels = [
  'Iniciando', 'Constante', 'En práctica', 'Avanzando', 'Dominio sólido', 'Alto rendimiento',
];

export function getStudentLevel(points: number): { name: string; number: number } {
  if (points < 100) return { name: 'Iniciando', number: 1 };
  if (points < 300) return { name: 'Constante', number: 2 };
  if (points < 600) return { name: 'En práctica', number: 3 };
  if (points < 1000) return { name: 'Avanzando', number: 4 };
  if (points < 1600) return { name: 'Dominio sólido', number: 5 };
  return { name: 'Alto rendimiento', number: 6 };
}

// Mock data for current student
export const currentStudentStats = {
  name: 'Santiago',
  points: 720,
  streak: 5,
  maxStreak: 8,
  totalStudyTime: 750, // minutes
  sessionsCompleted: 24,
  topicsStudied: 18,
  flashCardsSessions: 15,
  simulacrosCompleted: 4,
};

export const mockBadges: Badge[] = [
  { id: 'b1', name: 'Primer paso', description: 'Completa tu primera sesión de estudio', icon: '🎯', category: 'constancia', unlocked: true, unlockedDate: new Date(2026, 1, 15) },
  { id: 'b2', name: '3 días seguidos', description: 'Mantén una racha de 3 días', icon: '🔥', category: 'constancia', unlocked: true, unlockedDate: new Date(2026, 1, 20) },
  { id: 'b3', name: '7 días seguidos', description: 'Mantén una racha de 7 días', icon: '⚡', category: 'constancia', unlocked: false, progress: 71 },
  { id: 'b4', name: 'Tema dominado', description: 'Alcanza dominio alto en un tema', icon: '🏆', category: 'dominio', unlocked: true, unlockedDate: new Date(2026, 2, 10) },
  { id: 'b5', name: 'Gran mejora', description: 'Mejora 20% en un tema en una semana', icon: '📈', category: 'mejora', unlocked: true, unlockedDate: new Date(2026, 2, 14) },
  { id: 'b6', name: 'Semana completa', description: 'Estudia los 7 días de la semana', icon: '🌟', category: 'disciplina', unlocked: false, progress: 43 },
  { id: 'b7', name: 'Preparado', description: 'Obtén "Listo para rendir" en un simulacro', icon: '✅', category: 'dominio', unlocked: false, progress: 80 },
  { id: 'b8', name: 'Explorador', description: 'Estudia 5 cursos diferentes', icon: '🧭', category: 'disciplina', unlocked: true, unlockedDate: new Date(2026, 2, 16) },
];

export const mockWeeklyGoals: WeeklyGoal[] = [
  { id: 'g1', description: 'Completa 3 sesiones de Flash Cards', current: 2, target: 3, unit: 'sesiones', completed: false },
  { id: 'g2', description: 'Mejora tu dominio en un tema débil', current: 1, target: 1, unit: 'temas', completed: true },
  { id: 'g3', description: 'Mantén 4 días de estudio', current: 3, target: 4, unit: 'días', completed: false },
  { id: 'g4', description: 'Completa 1 simulacro', current: 0, target: 1, unit: 'simulacros', completed: false },
];

export const mockClassmates: ClassmateProfile[] = [
  { id: 'c1', name: 'Valentina Rojas', avatar: 'VR', level: 'Dominio sólido', levelNumber: 5, streak: 12, points: 1580, badges: mockBadges.filter(b => b.unlocked), recentAchievement: 'Mayor mejora' },
  { id: 'c2', name: 'Camila Mendoza', avatar: 'CM', level: 'Alto rendimiento', levelNumber: 6, streak: 15, points: 2100, badges: mockBadges.filter(b => b.unlocked), recentAchievement: 'Más constante' },
  { id: 'c3', name: 'Mateo García', avatar: 'MG', level: 'Constante', levelNumber: 2, streak: 2, points: 180, badges: mockBadges.slice(0, 2), },
  { id: 'c4', name: 'Isabella Vargas', avatar: 'IV', level: 'En práctica', levelNumber: 3, streak: 7, points: 540, badges: mockBadges.slice(0, 4), recentAchievement: 'Mejor racha' },
  { id: 'c5', name: 'Daniel López', avatar: 'DL', level: 'Constante', levelNumber: 2, streak: 3, points: 220, badges: mockBadges.slice(0, 2), },
  { id: 'c6', name: 'Luciana Herrera', avatar: 'LH', level: 'Avanzando', levelNumber: 4, streak: 9, points: 890, badges: mockBadges.slice(0, 5), recentAchievement: 'Nuevo tema dominado' },
  { id: 'c7', name: 'Andrés Castillo', avatar: 'AC', level: 'Iniciando', levelNumber: 1, streak: 0, points: 45, badges: [], },
  { id: 'c8', name: 'Sofía Rivera', avatar: 'SR', level: 'En práctica', levelNumber: 3, streak: 4, points: 480, badges: mockBadges.slice(0, 3), recentAchievement: 'Más activa en simulacros' },
];

export interface FlashCard {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  style?: 'fill' | 'multiple_choice';
  options?: string[];
}

export const mockFlashCards: FlashCard[] = [
  { id: 'fc1', question: '¿Qué es una ecuación lineal?', answer: 'Una ecuación de primer grado donde la variable tiene exponente 1. Su forma general es ax + b = c.', topic: 'Ecuaciones lineales', difficulty: 'easy' },
  { id: 'fc2', question: '¿Cómo se despeja x en la ecuación 3x + 5 = 20?', answer: 'Paso 1: Restar 5 de ambos lados → 3x = 15\nPaso 2: Dividir entre 3 → x = 5', topic: 'Ecuaciones lineales', difficulty: 'medium' },
  { id: 'fc3', question: '¿Qué es el factor común?', answer: 'Es el proceso de extraer el mayor factor que divide a todos los términos de una expresión algebraica.', topic: 'Factorización', difficulty: 'easy' },
  { id: 'fc4', question: '¿Cuál es la fórmula de la diferencia de cuadrados?', answer: 'a² - b² = (a + b)(a - b)', topic: 'Factorización', difficulty: 'medium' },
  { id: 'fc5', question: '¿Cuáles son los organelos principales de una célula eucariota?', answer: 'Núcleo, mitocondrias, retículo endoplasmático, aparato de Golgi, ribosomas, lisosomas y vacuolas.', topic: 'La célula', difficulty: 'medium' },
  { id: 'fc6', question: '¿Qué función cumple la mitocondria?', answer: 'Es el organelo encargado de la respiración celular, produciendo ATP (energía) para la célula.', topic: 'La célula', difficulty: 'easy' },
  { id: 'fc7', question: '¿Qué es una tesis en un texto argumentativo?', answer: 'Es la idea principal o postura que el autor defiende a lo largo del texto mediante argumentos.', topic: 'Textos argumentativos', difficulty: 'easy' },
  { id: 'fc8', question: '¿Cuál es la diferencia entre un argumento y una falacia?', answer: 'Un argumento es un razonamiento válido basado en evidencia. Una falacia es un razonamiento aparentemente válido pero lógicamente incorrecto.', topic: 'Textos argumentativos', difficulty: 'hard' },
  { id: 'fc9', question: '¿Cuál es el teorema de Pitágoras?', answer: 'En un triángulo rectángulo, el cuadrado de la hipotenusa es igual a la suma de los cuadrados de los catetos: a² + b² = c²', topic: 'Triángulos', difficulty: 'easy' },
  { id: 'fc10', question: 'Si un triángulo rectángulo tiene catetos de 3 y 4, ¿cuánto mide la hipotenusa?', answer: 'h = √(3² + 4²) = √(9 + 16) = √25 = 5', topic: 'Triángulos', difficulty: 'medium' },
];

export interface SimulacroQuestion {
  id: string;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: string[];
  correctAnswer: string;
  topic: string;
  subtopic: string;
}

export const mockSimulacroQuestions: SimulacroQuestion[] = [
  { id: 'sq1', type: 'multiple_choice', question: '¿Cuál es el valor de x en la ecuación 2x + 6 = 14?', options: ['x = 3', 'x = 4', 'x = 5', 'x = 8'], correctAnswer: 'x = 4', topic: 'Ecuaciones lineales', subtopic: 'Ecuaciones de primer grado' },
  { id: 'sq2', type: 'multiple_choice', question: '¿Cuál es la factorización de x² - 9?', options: ['(x+3)(x-3)', '(x+9)(x-1)', '(x-3)²', '(x+3)²'], correctAnswer: '(x+3)(x-3)', topic: 'Factorización', subtopic: 'Diferencia de cuadrados' },
  { id: 'sq3', type: 'short_answer', question: 'Resuelve: 5x - 3 = 2x + 12', correctAnswer: 'x = 5', topic: 'Ecuaciones lineales', subtopic: 'Ecuaciones de primer grado' },
  { id: 'sq4', type: 'multiple_choice', question: '¿Qué organelo es responsable de la producción de energía celular?', options: ['Núcleo', 'Mitocondria', 'Ribosoma', 'Aparato de Golgi'], correctAnswer: 'Mitocondria', topic: 'La célula', subtopic: 'Organelos' },
  { id: 'sq5', type: 'multiple_choice', question: 'En un triángulo rectángulo con catetos de 5 y 12, ¿cuánto mide la hipotenusa?', options: ['13', '17', '15', '11'], correctAnswer: '13', topic: 'Triángulos', subtopic: 'Teorema de Pitágoras' },
  { id: 'sq6', type: 'short_answer', question: '¿Qué es una falacia argumentativa? Explica brevemente.', correctAnswer: 'Es un razonamiento que parece válido pero contiene errores lógicos', topic: 'Textos argumentativos', subtopic: 'Falacias' },
  { id: 'sq7', type: 'multiple_choice', question: '¿Cuál es la función de la membrana celular?', options: ['Producir energía', 'Regular el paso de sustancias', 'Almacenar información genética', 'Sintetizar proteínas'], correctAnswer: 'Regular el paso de sustancias', topic: 'La célula', subtopic: 'Membrana celular' },
  { id: 'sq8', type: 'multiple_choice', question: '¿Qué tipo de triángulo tiene todos sus lados iguales?', options: ['Escaleno', 'Isósceles', 'Equilátero', 'Rectángulo'], correctAnswer: 'Equilátero', topic: 'Triángulos', subtopic: 'Clasificación' },
  { id: 'sq9', type: 'short_answer', question: 'Factoriza: 6x² + 12x', correctAnswer: '6x(x + 2)', topic: 'Factorización', subtopic: 'Factor común' },
  { id: 'sq10', type: 'multiple_choice', question: '¿Cuál de las siguientes culturas preincaicas es conocida por sus líneas en el desierto?', options: ['Chavín', 'Paracas', 'Nazca', 'Mochica'], correctAnswer: 'Nazca', topic: 'Culturas preincaicas', subtopic: 'Nazca' },
];

export const topicMastery: Record<string, number> = {
  'Ecuaciones lineales': 85,
  'Factorización': 42,
  'Triángulos': 68,
  'Circunferencia': 25,
  'Textos argumentativos': 90,
  'La célula': 55,
  'Culturas preincaicas': 72,
  'Present Perfect': 30,
  'Regiones naturales': 15,
};

export const courseProgress: { courseId: string; name: string; mastery: number; sessions: number; flashCards: number; simulacros: number }[] = [
  { courseId: 'math', name: 'Matemática', mastery: 72, sessions: 8, flashCards: 25, simulacros: 2 },
  { courseId: 'comm', name: 'Comunicación', mastery: 85, sessions: 6, flashCards: 18, simulacros: 1 },
  { courseId: 'science', name: 'Ciencia y Tecnología', mastery: 55, sessions: 4, flashCards: 12, simulacros: 1 },
  { courseId: 'history', name: 'Historia', mastery: 72, sessions: 3, flashCards: 8, simulacros: 0 },
  { courseId: 'english', name: 'Inglés', mastery: 30, sessions: 2, flashCards: 5, simulacros: 0 },
  { courseId: 'social', name: 'Ciencias Sociales', mastery: 15, sessions: 1, flashCards: 2, simulacros: 0 },
];
