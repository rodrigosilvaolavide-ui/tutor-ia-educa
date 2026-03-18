import { useState } from 'react';
import { RoleProvider, useRole } from '@/contexts/RoleContext';
import AppLayout from '@/components/layout/AppLayout';
import StudentHome from '@/components/student/StudentHome';
import CourseSelect from '@/components/student/CourseSelect';
import TutorChat from '@/components/student/TutorChat';
import StudentProgress from '@/components/student/StudentProgress';
import TeacherView from '@/components/teacher/TeacherView';
import DirectorView from '@/components/director/DirectorView';

function AppContent() {
  const { role } = useRole();
  const [currentView, setCurrentView] = useState('home');
  const [chatState, setChatState] = useState<{ courseId: string; courseName: string; topic?: string } | null>(null);
  const [selectingCourse, setSelectingCourse] = useState<string | undefined>(undefined);
  const [showCourseSelect, setShowCourseSelect] = useState(false);

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setChatState(null);
    setShowCourseSelect(false);
  };

  const handleStartStudy = (courseId?: string) => {
    if (courseId) {
      setSelectingCourse(courseId);
    } else {
      setSelectingCourse(undefined);
    }
    setShowCourseSelect(true);
    setCurrentView('study');
  };

  const handleSelectCourse = (courseId: string, courseName: string, topic?: string) => {
    setChatState({ courseId, courseName, topic });
    setShowCourseSelect(false);
  };

  const renderContent = () => {
    if (role === 'alumno') {
      if (chatState) {
        return (
          <TutorChat
            courseId={chatState.courseId}
            courseName={chatState.courseName}
            topic={chatState.topic}
            onBack={() => { setChatState(null); setShowCourseSelect(true); }}
          />
        );
      }
      if (currentView === 'study' || showCourseSelect) {
        return (
          <CourseSelect
            onSelectCourse={handleSelectCourse}
            onBack={() => { setShowCourseSelect(false); setCurrentView('home'); }}
            initialCourseId={selectingCourse}
          />
        );
      }
      if (currentView === 'progress') {
        return <StudentProgress />;
      }
      return <StudentHome onStartStudy={handleStartStudy} />;
    }

    if (role === 'profesor') {
      return <TeacherView initialTab={currentView === 'home' ? 'dashboard' : currentView} />;
    }

    if (role === 'directivo') {
      return <DirectorView />;
    }

    return null;
  };

  return (
    <AppLayout currentView={currentView} onNavigate={handleNavigate}>
      {renderContent()}
    </AppLayout>
  );
}

export default function Index() {
  return (
    <RoleProvider>
      <AppContent />
    </RoleProvider>
  );
}
