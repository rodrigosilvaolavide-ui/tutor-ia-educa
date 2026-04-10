// Confusion signals storage for teacher visibility
// In production this would be persisted to DB; for now, localStorage + mock

export interface ConfusionSignal {
  id: string;
  source: 'flashcards' | 'simulacros';
  courseName: string;
  topic: string;
  question?: string;
  studentMessage: string;
  timestamp: Date;
}

const STORAGE_KEY = 'confusion_signals';

export function addConfusionSignal(signal: Omit<ConfusionSignal, 'id'>): void {
  const signals = getConfusionSignals();
  signals.push({ ...signal, id: `cs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` });
  // Keep last 50
  const trimmed = signals.slice(-50);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function getConfusionSignals(): ConfusionSignal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getMockSignals();
    const parsed = JSON.parse(raw) as ConfusionSignal[];
    return parsed.length > 0 ? parsed : getMockSignals();
  } catch {
    return getMockSignals();
  }
}

function getMockSignals(): ConfusionSignal[] {
  return [
    { id: 'cs-mock-1', source: 'flashcards', courseName: 'Matemática', topic: 'Ecuaciones lineales', question: '¿Cómo se despeja x en 3x + 5 = 20?', studentMessage: 'Explícame esto', timestamp: new Date(2026, 3, 8, 14, 30) },
    { id: 'cs-mock-2', source: 'simulacros', courseName: 'Ciencia y Tecnología', topic: 'La célula', question: '¿Qué organelo produce energía?', studentMessage: 'No entiendo la diferencia entre mitocondria y cloroplasto', timestamp: new Date(2026, 3, 7, 10, 15) },
    { id: 'cs-mock-3', source: 'flashcards', courseName: 'Comunicación', topic: 'Textos argumentativos', question: '¿Qué es una tesis?', studentMessage: 'Dame un ejemplo', timestamp: new Date(2026, 3, 6, 16, 45) },
    { id: 'cs-mock-4', source: 'simulacros', courseName: 'Matemática', topic: 'Factorización', question: '¿Cuál es la factorización de x² - 9?', studentMessage: 'No sé cuándo aplicar diferencia de cuadrados vs trinomio', timestamp: new Date(2026, 3, 5, 9, 0) },
  ];
}
