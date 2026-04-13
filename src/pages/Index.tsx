import { useState } from 'react';
import { RoleProvider, useRole } from '@/contexts/RoleContext';
import AppLayout from '@/components/layout/AppLayout';
import StudentHome from '@/components/student/StudentHome';
import FlashCards from '@/components/student/FlashCards';
import Simulacros from '@/components/student/Simulacros';
import TutorMode from '@/components/student/TutorMode';
import TeacherView from '@/components/teacher/TeacherView';
import DirectorView from '@/components/director/DirectorView';
import { ChatSession } from '@/lib/chat-storage';

function AppContent() {
  const { role } = useRole();
  const [currentView, setCurrentView] = useState('home');
  const [tutorState, setTutorState] = useState<{
    active: boolean;
    courseId?: string;
    session?: ChatSession;
    topic?: string;
  }>({ active: false });

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    setTutorState({ active: false });
  };

  const handleStartStudy = (courseId?: string) => {
    setTutorState({ active: true, courseId });
  };

  const handleResumeSession = (session: ChatSession) => {
    setTutorState({ active: true, session });
  };

  const handleExitTutor = () => {
    setTutorState({ active: false });
    setCurrentView('home');
  };

  // Immersive Tutor AI mode — bypasses AppLayout entirely
  if (role === 'alumno' && (tutorState.active || currentView === 'tutor')) {
    return (
      <TutorMode
        onExit={handleExitTutor}
        initialCourseId={tutorState.courseId}
        initialSession={tutorState.session}
        initialTopic={tutorState.topic}
      />
    );
  }

  const renderContent = () => {
    if (role === 'alumno') {
      if (currentView === 'flashcards') return <FlashCards />;
      if (currentView === 'simulacros') return <Simulacros />;
      return (
        <StudentHome
          onStartStudy={handleStartStudy}
          onNavigate={handleNavigate}
        />
      );
    }

    if (role === 'profesor') {
      const teacherTab = currentView === 'home' ? 'dashboard' : currentView;
      return <TeacherView activeTab={teacherTab} onTabChange={(tab) => setCurrentView(tab === 'dashboard' ? 'home' : tab)} />;
    }

    if (role === 'directivo') {
      const directorTab = currentView === 'home' ? 'summary' : currentView;
      return <DirectorView activeTab={directorTab} onTabChange={(tab) => setCurrentView(tab === 'summary' ? 'home' : tab)} />;
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
