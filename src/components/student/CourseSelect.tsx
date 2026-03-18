import { useState } from 'react';
import { courses } from '@/lib/mock-data';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseSelectProps {
  onSelectCourse: (courseId: string, courseName: string, topic?: string) => void;
  onBack: () => void;
  initialCourseId?: string;
}

export default function CourseSelect({ onSelectCourse, onBack, initialCourseId }: CourseSelectProps) {
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId ? courses.find(c => c.id === initialCourseId) : null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  if (!selectedCourse) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft size={16} /> Volver al inicio
        </button>
        <h1 className="heading-1 text-foreground mb-2">Elige un curso</h1>
        <p className="text-muted-foreground mb-8">Selecciona el curso que quieres estudiar con tu tutor AI</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <motion.button
              key={course.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCourse(course)}
              className="stat-card flex flex-col items-center gap-3 py-8 cursor-pointer group"
            >
              <div className="text-4xl">{course.icon}</div>
              <p className="font-heading font-semibold text-foreground">{course.name}</p>
              <p className="text-xs text-muted-foreground">{course.units.length} unidades</p>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => { setSelectedCourse(null); setSelectedUnit(null); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={16} /> Cambiar curso
      </button>
      <div className="flex items-center gap-3 mb-8">
        <div className="text-3xl">{selectedCourse.icon}</div>
        <div>
          <h1 className="heading-1 text-foreground">{selectedCourse.name}</h1>
          <p className="text-muted-foreground">Elige un tema o empieza directamente</p>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onSelectCourse(selectedCourse.id, selectedCourse.name)}
        className="w-full stat-card flex items-center gap-4 mb-6 group bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <ChevronRight size={20} className="text-primary" />
        </div>
        <div className="text-left">
          <p className="font-medium text-foreground">Estudiar libremente</p>
          <p className="text-sm text-muted-foreground">El tutor te guiará por los temas del curso</p>
        </div>
      </motion.button>

      <div className="space-y-3">
        {selectedCourse.units.map((unit) => (
          <div key={unit.id} className="stat-card">
            <button
              onClick={() => setSelectedUnit(selectedUnit === unit.id ? null : unit.id)}
              className="w-full flex items-center justify-between"
            >
              <p className="font-heading font-semibold text-foreground text-sm">{unit.name}</p>
              <ChevronRight size={16} className={`text-muted-foreground transition-transform ${selectedUnit === unit.id ? 'rotate-90' : ''}`} />
            </button>
            {selectedUnit === unit.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-3 space-y-1.5 overflow-hidden"
              >
                {unit.topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => onSelectCourse(selectedCourse.id, selectedCourse.name, topic.name)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-muted text-sm text-foreground transition-colors flex items-center justify-between group"
                  >
                    <span>{topic.name}</span>
                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
