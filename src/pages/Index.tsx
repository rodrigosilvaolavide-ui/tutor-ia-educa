import { useState } from 'react';
import { RoleProvider, useRole } from '@/contexts/RoleContext';
import AppLayout from '@/components/layout/AppLayout';
import StudentHome from '@/components/student/StudentHome';
import CourseSelect from '@/components/student/CourseSelect';
import TutorChat from '@/components/student/TutorChat';
import FlashCards from '@/components/student/FlashCards';
import Simulacros from '@/components/student/Simulacros';
import MyClass from '@/components/student/MyClass';
import StudentProfile from '@/components/student/StudentProfile';
import TeacherView from '@/components/teacher/TeacherView';
import DirectorView from '@/components/director/DirectorView';
import { ChatSession } from '@/lib/chat-storage';

function AppContent() {
  const { role } = useRole();
  const [currentView, setCurrentView] = useState('home');
  const [chatState, setChatState] = useState<{ courseId: string; courseName: string; topic?: string; session?: ChatSession } | null>(null);
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
    setCurrentView('tutor');
  };

  const handleSelectCourse = (courseId: string, courseName: string, topic?: string) => {
    setChatState({ courseId, courseName, topic });
    setShowCourseSelect(false);
  };

  const handleResumeSession = (session: ChatSession) => {
    setChatState({
      courseId: session.courseId,
      courseName: session.courseName,
      topic: session.topic,
      session,
    });
    setCurrentView('tutor');
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
            existingSession={chatState.session}
          />
        );
      }
      if (currentView === 'tutor' || showCourseSelect) {
        return (
          <CourseSelect
            onSelectCourse={handleSelectCourse}
            onBack={() => { setShowCourseSelect(false); setCurrentView('home'); }}
            initialCourseId={selectingCourse}
          />
        );
      }
      if (currentView === 'flashcards') return <FlashCards />;
      if (currentView === 'simulacros') return <Simulacros />;
      if (currentView === 'myclass') return <MyClass />;
      if (currentView === 'profile') return <StudentProfile />;
      return <StudentHome onStartStudy={handleStartStudy} onNavigate={handleNavigate} />;
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
