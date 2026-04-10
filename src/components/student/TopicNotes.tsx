import { useState, useEffect } from 'react';
import { Loader2, BookOpen, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { recordNotesRead } from '@/lib/notes-tracking';
import { toast } from 'sonner';

const NOTES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`;

interface TopicNotesProps {
  courseName: string;
  topic: string;
  onGoToChat: () => void;
}

export default function TopicNotes({ courseName, topic, onGoToChat }: TopicNotesProps) {
  const [notes, setNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cacheKey = `notes_${courseName}_${topic}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setNotes(cached);
      setLoading(false);
      recordNotesRead(courseName, topic);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(NOTES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ courseName, topic }),
    })
      .then(async (resp) => {
        if (!resp.ok) {
          const data = await resp.json().catch(() => ({ error: 'Error de conexión' }));
          throw new Error(data.error || `Error ${resp.status}`);
        }
        return resp.json();
      })
      .then((data) => {
        setNotes(data.notes);
        sessionStorage.setItem(cacheKey, data.notes);
        recordNotesRead(courseName, topic);
      })
      .catch((err) => {
        setError(err.message);
        toast.error(err.message);
      })
      .finally(() => setLoading(false));
  }, [courseName, topic]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <Loader2 size={32} className="animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Generando notas del tema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={() => {
            setLoading(true);
            setError(null);
            fetch(NOTES_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({ courseName, topic }),
            })
              .then(r => r.json())
              .then(d => { setNotes(d.notes); sessionStorage.setItem(`notes_${courseName}_${topic}`, d.notes); })
              .catch(e => setError(e.message))
              .finally(() => setLoading(false));
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-auto"
    >
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="prose prose-sm max-w-none text-foreground
          [&_h1]:text-xl [&_h1]:font-heading [&_h1]:font-bold [&_h1]:mb-4
          [&_h2]:text-lg [&_h2]:font-heading [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
          [&_p]:mb-3 [&_p]:leading-relaxed
          [&_strong]:text-primary
          [&_blockquote]:border-l-4 [&_blockquote]:border-mastery-orange [&_blockquote]:bg-mastery-orange/5
          [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:rounded-r-lg [&_blockquote]:my-4
          [&_blockquote_p]:mb-0 [&_blockquote_strong]:text-mastery-orange
          [&_ul]:space-y-1 [&_ol]:space-y-1
          [&_li]:leading-relaxed
          [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs
          [&_hr]:my-6 [&_hr]:border-border
        ">
          <ReactMarkdown>{notes || ''}</ReactMarkdown>
        </div>

        {/* CTA button */}
        <div className="mt-8 mb-4 flex justify-center">
          <button
            onClick={onGoToChat}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors shadow-md"
          >
            <BookOpen size={16} />
            Ir al Tutor AI
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
