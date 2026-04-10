import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type MasteryLevel = 'unknown' | 'learning' | 'solid' | 'mastered';

export interface MasteryState {
  unknown: number;
  learning: number;
  solid: number;
  mastered: number;
}

const masteryConfig: Record<MasteryLevel, { label: string; emoji: string; color: string; bg: string }> = {
  unknown: { label: 'Desconocido', emoji: '🔴', color: 'text-mastery-red', bg: 'bg-mastery-red/10' },
  learning: { label: 'Aprendiendo', emoji: '🟠', color: 'text-mastery-orange', bg: 'bg-mastery-orange/10' },
  solid: { label: 'Base sólida', emoji: '🔵', color: 'text-mastery-blue', bg: 'bg-mastery-blue/10' },
  mastered: { label: 'Dominado', emoji: '🟢', color: 'text-mastery-green', bg: 'bg-mastery-green/10' },
};

interface MasteryBarProps {
  topic: string;
  mastery: MasteryState;
}

function AnimatedCount({ value }: { value: number }) {
  const [bouncing, setBouncing] = useState(false);
  const prevRef = useRef(value);

  useEffect(() => {
    if (value !== prevRef.current) {
      setBouncing(true);
      prevRef.current = value;
      const timer = setTimeout(() => setBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <motion.span
      animate={bouncing ? { scale: [1, 1.4, 1], y: [0, -2, 0] } : {}}
      transition={{ duration: 0.3 }}
      className="font-bold"
    >
      {value}
    </motion.span>
  );
}

export default function MasteryBar({ topic, mastery }: MasteryBarProps) {
  return (
    <div className="px-6 py-2.5 border-b border-border bg-card/50">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-medium text-foreground truncate max-w-[140px]">{topic}</span>
        <div className="flex items-center gap-2">
          {(Object.keys(masteryConfig) as MasteryLevel[]).map(level => {
            const cfg = masteryConfig[level];
            const count = mastery[level];
            return (
              <div
                key={level}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs',
                  cfg.bg, cfg.color,
                )}
              >
                <span>{cfg.emoji}</span>
                <AnimatedCount value={count} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Compute initial mastery from total cards — all start as unknown */
export function initMastery(total: number): MasteryState {
  return { unknown: total, learning: 0, solid: 0, mastered: 0 };
}

/** Map per-card mastery levels, keyed by card id */
export type CardMasteryMap = Record<string, MasteryLevel>;

/** Update mastery after a review rating */
export function updateCardMastery(
  cardId: string,
  rating: 'knew' | 'partial' | 'didnt_know' | 'correct' | 'incorrect',
  cardMap: CardMasteryMap,
  mastery: MasteryState,
): { cardMap: CardMasteryMap; mastery: MasteryState } {
  const current = cardMap[cardId] || 'unknown';
  let next: MasteryLevel = current;

  if (rating === 'didnt_know' || rating === 'incorrect') {
    // Retrocede o permanece en unknown
    if (current === 'mastered') next = 'solid';
    else if (current === 'solid') next = 'learning';
    else next = 'unknown';
  } else if (rating === 'partial') {
    // Avanza a learning máximo
    if (current === 'unknown') next = 'learning';
    else next = current; // stays
  } else if (rating === 'knew' || rating === 'correct') {
    // Avanza un nivel
    if (current === 'unknown') next = 'solid';
    else if (current === 'learning') next = 'solid';
    else if (current === 'solid') next = 'mastered';
    else next = 'mastered';
  }

  const newMastery = { ...mastery };
  newMastery[current] = Math.max(0, newMastery[current] - 1);
  newMastery[next] = newMastery[next] + 1;

  return {
    cardMap: { ...cardMap, [cardId]: next },
    mastery: newMastery,
  };
}
