import { useState } from 'react';
import { RotateCcw, CheckCircle, XCircle, MinusCircle, ChevronRight, Zap, Send, Loader2, PenLine, ListChecks, Lightbulb } from 'lucide-react';
import { courses } from '@/lib/mock-data';
import { FlashCard } from '@/lib/gamification';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import DoubtDrawer from './DoubtDrawer';
import MasteryBar, { initMastery, updateCardMastery, type MasteryState, type CardMasteryMap } from './MasteryBar';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

type FlashCardMode = 'review' | 'test';
type FlashCardStyle = 'fill' | 'multiple_choice';
type SessionSize = 5 | 10 | 15;
type Phase = 'setup' | 'loading' | 'session' | 'results';

interface ReviewResult { card: FlashCard; rating: 'knew' | 'partial' | 'didnt_know' }
interface TestResult { card: FlashCard; answer: string; rating: 'correct' | 'partial' | 'incorrect'; feedback: string }

async function generateFlashCards(courseName: string, topic: string, count: number, style: FlashCardStyle): Promise<FlashCard[]> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/generate-flashcards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ courseName, topic, count, style }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(err.error || 'Error generando tarjetas');
  }
  const data = await resp.json();
  return data.cards;
}

async function evaluateAnswer(question: string, expectedAnswer: string, studentAnswer: string): Promise<{ rating: 'correct' | 'partial' | 'incorrect'; feedback: string }> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/evaluate-flashcard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ question, expectedAnswer, studentAnswer }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(err.error || 'Error evaluando respuesta');
  }
  return resp.json();
}

async function explainAnswer(question: string, correctAnswer: string, studentAnswer: string, topic: string, courseName: string): Promise<string> {
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/explain-flashcard`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
    body: JSON.stringify({ question, correctAnswer, studentAnswer, topic, courseName }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Error de red' }));
    throw new Error(err.error || 'Error generando explicación');
  }
  const data = await resp.json();
  return data.explanation as string;
}

export default function FlashCards() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [mode, setMode] = useState<FlashCardMode>('review');
  const [style, setStyle] = useState<FlashCardStyle>('fill');
  const [sessionSize, setSessionSize] = useState<SessionSize>(10);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewResults, setReviewResults] = useState<ReviewResult[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [testAnswer, setTestAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [mastery, setMastery] = useState<MasteryState>(initMastery(0));
  const [cardMasteryMap, setCardMasteryMap] = useState<CardMasteryMap>({});

  const startSession = async () => {
    const course = courses.find(c => c.id === selectedCourse);
    if (!course) return;

    setPhase('loading');
    try {
      const generated = await generateFlashCards(course.name, selectedTopic, sessionSize, style);
      if (generated.length === 0) throw new Error('No se generaron tarjetas');
      setCards(generated);
      setCurrentIndex(0);
      setFlipped(false);
      setReviewResults([]);
      setTestResults([]);
      setMastery(initMastery(generated.length));
      setCardMasteryMap({});
      setPhase('session');
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : 'Error generando tarjetas');
      setPhase('setup');
    }
  };

  const handleReviewRate = (rating: 'knew' | 'partial' | 'didnt_know') => {
    const card = cards[currentIndex];
    setReviewResults(prev => [...prev, { card, rating }]);
    const updated = updateCardMastery(card.id, rating, cardMasteryMap, mastery);
    setMastery(updated.mastery);
    setCardMasteryMap(updated.cardMap);
    nextCard();
  };

  const handleTestSubmit = async () => {
    if (!testAnswer.trim() || evaluating) return;
    const card = cards[currentIndex];

    setEvaluating(true);
    try {
      const result = await evaluateAnswer(card.question, card.answer, testAnswer);
      setTestResults(prev => [...prev, { card, answer: testAnswer, rating: result.rating, feedback: result.feedback }]);
      const masteryRating = result.rating === 'correct' ? 'correct' : result.rating === 'partial' ? 'partial' : 'incorrect';
      const updated = updateCardMastery(card.id, masteryRating as any, cardMasteryMap, mastery);
      setMastery(updated.mastery);
      setCardMasteryMap(updated.cardMap);
      setShowFeedback(true);
      setTestAnswer('');
    } catch (e) {
      console.error(e);
      // Fallback to simple local evaluation
      const correct = testAnswer.toLowerCase().includes(card.answer.toLowerCase().slice(0, 10));
      const rating = correct ? 'correct' : testAnswer.length > 15 ? 'partial' : 'incorrect';
      const feedback = rating === 'correct' ? '¡Correcto! Bien hecho.' : rating === 'partial' ? 'Parcialmente correcto. Revisa los detalles.' : 'Incorrecto. Revisa la respuesta correcta.';
      setTestResults(prev => [...prev, { card, answer: testAnswer, rating, feedback }]);
      const updated = updateCardMastery(card.id, rating as any, cardMasteryMap, mastery);
      setMastery(updated.mastery);
      setCardMasteryMap(updated.cardMap);
      setShowFeedback(true);
      setTestAnswer('');
    } finally {
      setEvaluating(false);
    }
  };

  const handleMultipleChoice = (option: string) => {
    if (selectedOption || evaluating) return;
    const card = cards[currentIndex];
    const isCorrect = option === card.answer;
    setSelectedOption(option);
    const rating: 'correct' | 'incorrect' = isCorrect ? 'correct' : 'incorrect';
    const feedback = isCorrect
      ? '¡Correcto! Excelente elección.'
      : 'Incorrecto. Revisa la respuesta correcta.';
    setTestResults(prev => [...prev, { card, answer: option, rating, feedback }]);
    const updated = updateCardMastery(card.id, rating as any, cardMasteryMap, mastery);
    setMastery(updated.mastery);
    setCardMasteryMap(updated.cardMap);
    setShowFeedback(true);
  };

  const nextCard = () => {
    setFlipped(false);
    setShowFeedback(false);
    setSelectedOption(null);
    if (currentIndex + 1 >= cards.length) {
      setPhase('results');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const progress = cards.length > 0 ? ((currentIndex + (phase === 'results' ? 1 : 0)) / cards.length) * 100 : 0;

  const getResultStats = () => {
    if (mode === 'review') {
      const knew = reviewResults.filter(r => r.rating === 'knew').length;
      const partial = reviewResults.filter(r => r.rating === 'partial').length;
      const didntKnow = reviewResults.filter(r => r.rating === 'didnt_know').length;
      return { knew, partial, didntKnow, total: reviewResults.length, accuracy: Math.round((knew / reviewResults.length) * 100) };
    }
    const correct = testResults.filter(r => r.rating === 'correct').length;
    const partial = testResults.filter(r => r.rating === 'partial').length;
    const incorrect = testResults.filter(r => r.rating === 'incorrect').length;
    return { knew: correct, partial, didntKnow: incorrect, total: testResults.length, accuracy: Math.round(((correct + partial * 0.5) / testResults.length) * 100) };
  };

  // LOADING
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in">
        <Loader2 size={36} className="text-primary animate-spin" />
        <div className="text-center">
          <p className="text-lg font-medium text-foreground">Generando tarjetas con IA...</p>
          <p className="text-sm text-muted-foreground mt-1">Creando {sessionSize} preguntas personalizadas</p>
        </div>
      </div>
    );
  }

  // SETUP
  if (phase === 'setup') {
    const course = courses.find(c => c.id === selectedCourse);
    const allTopics = course ? course.units.flatMap(u => u.topics.map(t => t.name)) : [];

    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
        <h1 className="heading-1 text-foreground mb-2">Flash Cards</h1>
        <p className="text-muted-foreground mb-8">Repasa y practica de forma rápida e interactiva</p>

        <div className="space-y-6">
          {/* Course */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Elige un curso</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {courses.map(c => (
                <button key={c.id} onClick={() => { setSelectedCourse(c.id); setSelectedTopic(''); }}
                  className={cn('stat-card flex flex-col items-center gap-2 py-5 transition-all', selectedCourse === c.id ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30')}>
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic */}
          {selectedCourse && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Elige un tema (opcional)</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedTopic('')}
                  className={cn('chip', !selectedTopic && 'bg-primary/15 text-primary')}>
                  Todos los temas
                </button>
                {allTopics.map(t => (
                  <button key={t} onClick={() => setSelectedTopic(t)}
                    className={cn('chip', selectedTopic === t && 'bg-primary/15 text-primary')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Elige el modo</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setMode('review'); setStyle('fill'); }}
                className={cn('stat-card text-left transition-all', mode === 'review' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30')}>
                <RotateCcw size={20} className="text-primary mb-2" />
                <p className="font-medium text-foreground text-sm">Repasar</p>
                <p className="text-xs text-muted-foreground mt-1">Revela la respuesta y evalúa tu conocimiento</p>
              </button>
              <button onClick={() => setMode('test')}
                className={cn('stat-card text-left transition-all', mode === 'test' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30')}>
                <Zap size={20} className="text-accent mb-2" />
                <p className="font-medium text-foreground text-sm">Ponerte a prueba</p>
                <p className="text-xs text-muted-foreground mt-1">Escribe tu respuesta y la IA la evalúa</p>
              </button>
            </div>
          </div>

          {/* Style — only available when testing */}
          {mode === 'test' && (
            <div>
              <label className="text-sm font-medium text-foreground mb-3 block">Elige el estilo</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setStyle('fill')}
                  className={cn('stat-card text-left transition-all', style === 'fill' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30')}>
                  <PenLine size={20} className="text-primary mb-2" />
                  <p className="font-medium text-foreground text-sm">Rellenar texto</p>
                  <p className="text-xs text-muted-foreground mt-1">Escribes tu propia respuesta a cada pregunta</p>
                </button>
                <button onClick={() => setStyle('multiple_choice')}
                  className={cn('stat-card text-left transition-all', style === 'multiple_choice' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30')}>
                  <ListChecks size={20} className="text-accent mb-2" />
                  <p className="font-medium text-foreground text-sm">Opción múltiple</p>
                  <p className="text-xs text-muted-foreground mt-1">Eliges la respuesta correcta entre 3 opciones</p>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">Tamaño de sesión</label>
            <div className="flex gap-3">
              {([5, 10, 15] as SessionSize[]).map(s => (
                <button key={s} onClick={() => setSessionSize(s)}
                  className={cn('px-5 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    sessionSize === s ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground hover:border-primary/30')}>
                  {s} tarjetas
                </button>
              ))}
            </div>
          </div>

          {/* Start */}
          <button onClick={startSession} disabled={!selectedCourse}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40">
            Comenzar sesión
          </button>
        </div>
      </div>
    );
  }

  // SESSION
  if (phase === 'session' && cards.length > 0) {
    const card = cards[currentIndex];

    return (
      <div className="flex flex-col h-full relative">
        {/* Mastery Bar */}
        <MasteryBar topic={selectedTopic || 'General'} mastery={mastery} />
        {/* Progress bar */}
        <div className="px-6 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{currentIndex + 1} de {cards.length}</span>
            <span className="text-xs font-medium text-foreground">{mode === 'review' ? 'Repaso' : 'Evaluación'}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        {/* Card area */}
        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg"
            >
              {/* The card */}
              <div
                onClick={() => mode === 'review' && !flipped && setFlipped(true)}
                className={cn(
                  'stat-card min-h-[280px] flex flex-col items-center justify-center text-center p-8 transition-all',
                  mode === 'review' && !flipped && 'cursor-pointer hover:border-primary/30'
                )}
              >
                {!flipped || mode === 'test' ? (
                  <>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider mb-4">{card.topic}</span>
                    <p className="text-lg font-medium text-foreground leading-relaxed">{card.question}</p>
                    {mode === 'review' && (
                      <p className="text-xs text-muted-foreground mt-6">Toca para revelar la respuesta</p>
                    )}
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, rotateX: 10 }} animate={{ opacity: 1, rotateX: 0 }} transition={{ duration: 0.2 }}>
                    <span className="text-xs text-primary uppercase tracking-wider mb-4 block">Respuesta</span>
                    <p className="text-base text-foreground leading-relaxed whitespace-pre-line">{card.answer}</p>
                  </motion.div>
                )}
              </div>

              {/* Test mode — fill text input */}
              {mode === 'test' && style === 'fill' && !showFeedback && (
                <div className="mt-4 flex gap-2">
                  <input
                    value={testAnswer}
                    onChange={e => setTestAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTestSubmit()}
                    placeholder="Escribe tu respuesta..."
                    disabled={evaluating}
                    className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  />
                  <button onClick={handleTestSubmit} disabled={!testAnswer.trim() || evaluating}
                    className="px-4 py-3 bg-primary text-primary-foreground rounded-xl disabled:opacity-40">
                    {evaluating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  </button>
                </div>
              )}

              {/* Test mode — multiple choice options */}
              {mode === 'test' && style === 'multiple_choice' && card.options && (
                <div className="mt-4 grid gap-2">
                  {card.options.map((opt, i) => {
                    const isCorrect = opt === card.answer;
                    const isSelected = selectedOption === opt;
                    const reveal = !!selectedOption;
                    return (
                      <button
                        key={i}
                        onClick={() => handleMultipleChoice(opt)}
                        disabled={reveal}
                        className={cn(
                          'w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-between gap-3',
                          !reveal && 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
                          reveal && isCorrect && 'border-success/40 bg-success/10 text-foreground',
                          reveal && isSelected && !isCorrect && 'border-destructive/40 bg-destructive/10 text-foreground',
                          reveal && !isSelected && !isCorrect && 'border-border bg-card text-muted-foreground opacity-60'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className={cn(
                            'w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold shrink-0',
                            !reveal && 'border-border text-muted-foreground',
                            reveal && isCorrect && 'border-success bg-success text-success-foreground',
                            reveal && isSelected && !isCorrect && 'border-destructive bg-destructive text-destructive-foreground',
                            reveal && !isSelected && !isCorrect && 'border-border text-muted-foreground'
                          )}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="leading-snug">{opt}</span>
                        </span>
                        {reveal && isCorrect && <CheckCircle size={16} className="text-success shrink-0" />}
                        {reveal && isSelected && !isCorrect && <XCircle size={16} className="text-destructive shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Test feedback */}
              {mode === 'test' && showFeedback && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                  {(() => {
                    const result = testResults[testResults.length - 1];
                    const colors = { correct: 'border-success/30 bg-success/5', partial: 'border-warning/30 bg-warning/5', incorrect: 'border-destructive/30 bg-destructive/5' };
                    const icons = { correct: <CheckCircle size={16} className="text-success" />, partial: <MinusCircle size={16} className="text-warning" />, incorrect: <XCircle size={16} className="text-destructive" /> };
                    return (
                      <>
                        <div className={cn('p-4 rounded-xl border', colors[result.rating])}>
                          <div className="flex items-center gap-2 mb-1">
                            {icons[result.rating]}
                            <span className="text-sm font-medium text-foreground">{result.feedback}</span>
                          </div>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50">
                          <p className="text-xs text-muted-foreground mb-1">Respuesta correcta</p>
                          <p className="text-sm text-foreground">{card.answer}</p>
                        </div>
                        <button onClick={nextCard}
                          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
                          {currentIndex + 1 >= cards.length ? 'Ver resultados' : 'Siguiente'} <ChevronRight size={16} />
                        </button>
                      </>
                    );
                  })()}
                </motion.div>
              )}

              {/* Review mode rating buttons */}
              {mode === 'review' && flipped && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 grid grid-cols-3 gap-3">
                  <button onClick={() => handleReviewRate('didnt_know')}
                    className="py-3 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors">
                    No la sabía
                  </button>
                  <button onClick={() => handleReviewRate('partial')}
                    className="py-3 rounded-xl border border-warning/30 bg-warning/5 text-warning text-sm font-medium hover:bg-warning/10 transition-colors">
                    Más o menos
                  </button>
                  <button onClick={() => handleReviewRate('knew')}
                    className="py-3 rounded-xl border border-success/30 bg-success/5 text-success text-sm font-medium hover:bg-success/10 transition-colors">
                    La sabía
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <DoubtDrawer
          courseName={courses.find(c => c.id === selectedCourse)?.name || ''}
          topic={selectedTopic || 'General'}
          currentContext={card.question}
          source="flashcards"
        />
      </div>
    );
  }

  // RESULTS
  const stats = getResultStats();
  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
          className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-primary" />
        </motion.div>
        <h1 className="heading-1 text-foreground">¡Sesión completada!</h1>
        <p className="text-muted-foreground mt-1">{mode === 'review' ? 'Repaso' : 'Evaluación'} · {stats.total} tarjetas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="stat-card text-center">
          <p className="text-2xl font-bold font-heading text-foreground">{stats.accuracy}%</p>
          <p className="text-xs text-muted-foreground">Precisión</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold font-heading text-foreground">{stats.knew}/{stats.total}</p>
          <p className="text-xs text-muted-foreground">{mode === 'test' ? 'Correctas' : 'Sabías'}</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="stat-card mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Desglose</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm"><CheckCircle size={14} className="text-success" /> {mode === 'test' ? 'Correctas' : 'La sabía'}</span>
            <span className="font-medium text-foreground">{stats.knew}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm"><MinusCircle size={14} className="text-warning" /> {mode === 'test' ? 'Parciales' : 'Más o menos'}</span>
            <span className="font-medium text-foreground">{stats.partial}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm"><XCircle size={14} className="text-destructive" /> {mode === 'test' ? 'Incorrectas' : 'No la sabía'}</span>
            <span className="font-medium text-foreground">{stats.didntKnow}</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      {stats.didntKnow > 0 && (
        <div className="stat-card border-primary/20 bg-primary/5 mb-6">
          <p className="text-xs font-medium text-primary mb-1">💡 Recomendación</p>
          <p className="text-sm text-foreground">
            Tienes {stats.didntKnow} {stats.didntKnow === 1 ? 'tarjeta' : 'tarjetas'} que necesitas reforzar. Te recomendamos estudiar este tema con el Tutor AI.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={() => { setPhase('setup'); setCurrentIndex(0); setFlipped(false); }}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90">
          Otra sesión de Flash Cards
        </button>
        <button onClick={() => setPhase('setup')}
          className="w-full py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted">
          Cambiar tema o modo
        </button>
      </div>
    </div>
  );
}
