import { useState } from 'react';
import { courses } from '@/lib/mock-data';
import { mockSimulacroQuestions, SimulacroQuestion, topicMastery, getMasteryLevel, masteryLabels } from '@/lib/gamification';
import { ArrowLeft, ChevronRight, CheckCircle, XCircle, Clock, Target, TrendingUp, AlertTriangle, BookOpen, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Phase = 'setup' | 'session' | 'results';

interface Answer {
  questionId: string;
  answer: string;
  correct: boolean;
}

export default function Simulacros() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [questions, setQuestions] = useState<SimulacroQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [shortAnswer, setShortAnswer] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const startSimulacro = () => {
    const filtered = selectedTopic
      ? mockSimulacroQuestions.filter(q => q.topic === selectedTopic)
      : mockSimulacroQuestions;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5).slice(0, 8);
    setQuestions(shuffled.length > 0 ? shuffled : mockSimulacroQuestions.slice(0, 8));
    setCurrentIndex(0);
    setAnswers([]);
    setStartTime(new Date());
    setPhase('session');
  };

  const submitAnswer = () => {
    const q = questions[currentIndex];
    let answer = '';
    let correct = false;

    if (q.type === 'multiple_choice') {
      answer = selectedOption;
      correct = selectedOption === q.correctAnswer;
    } else {
      answer = shortAnswer;
      correct = shortAnswer.toLowerCase().includes(q.correctAnswer.toLowerCase().slice(0, 8));
    }

    setAnswers(prev => [...prev, { questionId: q.id, answer, correct }]);
    setSelectedOption('');
    setShortAnswer('');

    if (currentIndex + 1 >= questions.length) {
      setEndTime(new Date());
      setPhase('results');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const progress = questions.length > 0 ? ((currentIndex + (phase === 'results' ? 1 : 0)) / questions.length) * 100 : 0;

  // SETUP
  if (phase === 'setup') {
    const course = courses.find(c => c.id === selectedCourse);
    const allTopics = course ? course.units.flatMap(u => u.topics.map(t => t.name)) : [];

    return (
      <div className="p-6 md:p-8 max-w-3xl mx-auto animate-fade-in">
        <h1 className="heading-1 text-foreground mb-2">Simulacros</h1>
        <p className="text-muted-foreground mb-8">Mide qué tan preparado estás para tu examen</p>

        <div className="space-y-6">
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

          {/* Info */}
          <div className="stat-card bg-primary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-primary" />
              <p className="text-sm font-medium text-foreground">¿Cómo funciona?</p>
            </div>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Preguntas de opción múltiple y respuesta corta</li>
              <li>• Al final verás tu nivel de preparación</li>
              <li>• Los resultados alimentan tu progreso y dominio por tema</li>
            </ul>
          </div>

          <button onClick={startSimulacro} disabled={!selectedCourse}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40">
            Iniciar simulacro
          </button>
        </div>
      </div>
    );
  }

  // SESSION
  if (phase === 'session' && questions.length > 0) {
    const q = questions[currentIndex];
    const canSubmit = q.type === 'multiple_choice' ? !!selectedOption : shortAnswer.trim().length > 0;

    return (
      <div className="flex flex-col h-full">
        <div className="px-6 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Pregunta {currentIndex + 1} de {questions.length}</span>
            <span className="text-xs text-muted-foreground">{q.topic}</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full" animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div key={currentIndex} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.2 }} className="w-full max-w-lg space-y-6">

              <div className="stat-card p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{q.subtopic}</p>
                <p className="text-lg font-medium text-foreground leading-relaxed">{q.question}</p>
              </div>

              {q.type === 'multiple_choice' && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <button key={i} onClick={() => setSelectedOption(opt)}
                      className={cn('w-full text-left px-4 py-3 rounded-xl border text-sm transition-all',
                        selectedOption === opt ? 'border-primary bg-primary/5 text-foreground' : 'border-border hover:border-primary/30 text-foreground')}>
                      <span className="font-medium text-muted-foreground mr-3">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'short_answer' && (
                <textarea value={shortAnswer} onChange={e => setShortAnswer(e.target.value)}
                  placeholder="Escribe tu respuesta..."
                  rows={3}
                  className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              )}

              <button onClick={submitAnswer} disabled={!canSubmit}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center gap-2">
                {currentIndex + 1 >= questions.length ? 'Finalizar' : 'Siguiente'} <ChevronRight size={16} />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // RESULTS
  const correctCount = answers.filter(a => a.correct).length;
  const score = Math.round((correctCount / answers.length) * 100);
  const duration = startTime && endTime ? Math.round((endTime.getTime() - startTime.getTime()) / 60000) : 0;

  const readinessLevel = score >= 80 ? 'ready' : score >= 55 ? 'almost' : 'needs_work';
  const readinessConfig = {
    ready: { label: 'Listo para rendir', color: 'text-success', bg: 'bg-success/10', icon: <CheckCircle size={20} className="text-success" /> },
    almost: { label: 'Casi listo', color: 'text-warning', bg: 'bg-warning/10', icon: <TrendingUp size={20} className="text-warning" /> },
    needs_work: { label: 'Necesitas reforzar', color: 'text-destructive', bg: 'bg-destructive/10', icon: <AlertTriangle size={20} className="text-destructive" /> },
  };
  const readiness = readinessConfig[readinessLevel];

  // Topic breakdown
  const topicBreakdown: Record<string, { correct: number; total: number }> = {};
  questions.forEach((q, i) => {
    if (!topicBreakdown[q.topic]) topicBreakdown[q.topic] = { correct: 0, total: 0 };
    topicBreakdown[q.topic].total++;
    if (answers[i]?.correct) topicBreakdown[q.topic].correct++;
  });

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', duration: 0.5 }}
          className={cn('w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4', readiness.bg)}>
          {readiness.icon}
        </motion.div>
        <h1 className="heading-1 text-foreground">{readiness.label}</h1>
        <p className="text-muted-foreground mt-1">Simulacro completado · {duration} min</p>
      </div>

      {/* Score */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="stat-card text-center">
          <p className={cn('text-2xl font-bold font-heading', readiness.color)}>{score}%</p>
          <p className="text-xs text-muted-foreground">Score</p>
        </div>
        <div className="stat-card text-center">
          <p className="text-2xl font-bold font-heading text-foreground">{correctCount}/{answers.length}</p>
          <p className="text-xs text-muted-foreground">Correctas</p>
        </div>
        <div className="stat-card text-center">
          <div className="flex items-center justify-center gap-1">
            <Clock size={16} className="text-muted-foreground" />
            <p className="text-2xl font-bold font-heading text-foreground">{duration}</p>
          </div>
          <p className="text-xs text-muted-foreground">Minutos</p>
        </div>
      </div>

      {/* Topic breakdown */}
      <div className="stat-card mb-6">
        <h3 className="text-sm font-medium text-foreground mb-3">Desempeño por tema</h3>
        <div className="space-y-3">
          {Object.entries(topicBreakdown).map(([topic, data]) => {
            const pct = Math.round((data.correct / data.total) * 100);
            return (
              <div key={topic}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-foreground">{topic}</span>
                  <span className={cn('font-medium', pct >= 70 ? 'text-success' : pct >= 40 ? 'text-warning' : 'text-destructive')}>{pct}%</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-destructive')}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className="stat-card border-primary/20 bg-primary/5 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-primary" />
          <p className="text-xs font-medium text-primary uppercase tracking-wider">Recomendación</p>
        </div>
        <p className="text-sm text-foreground">
          {readinessLevel === 'ready'
            ? '¡Excelente preparación! Mantén tu racha y sigue practicando para consolidar tu dominio.'
            : readinessLevel === 'almost'
            ? `Estás casi listo. Refuerza los temas con menor puntaje usando Flash Cards o el Tutor AI.`
            : 'Necesitas dedicar más tiempo a estos temas. Te recomendamos estudiar con el Tutor AI y practicar con Flash Cards antes de volver a intentarlo.'}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button onClick={() => { setPhase('setup'); setCurrentIndex(0); setAnswers([]); }}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90">
          Hacer otro simulacro
        </button>
        <button onClick={() => setPhase('setup')}
          className="w-full py-3 border border-border text-foreground rounded-xl text-sm font-medium hover:bg-muted">
          Cambiar curso o tema
        </button>
      </div>
    </div>
  );
}
