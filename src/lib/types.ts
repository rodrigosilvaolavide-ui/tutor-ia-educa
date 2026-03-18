export type UserRole = 'alumno' | 'profesor' | 'directivo';

export interface Course {
  id: string;
  name: string;
  icon: string;
  color: string;
  units: Unit[];
}

export interface Unit {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  subtopics: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface StudySession {
  id: string;
  courseId: string;
  courseName: string;
  topic: string;
  date: Date;
  duration: number; // minutes
  score?: number;
  topicsCovered: string[];
  status: 'completed' | 'in_progress';
}

export interface StudentData {
  id: string;
  name: string;
  avatar?: string;
  section: string;
  grade: string;
  lastActive: Date;
  studyTime: number;
  sessionsCount: number;
  topicsStudied: number;
  mastery: number;
  needsAttention: boolean;
  weakTopics: string[];
  strongTopics: string[];
}

export interface ContentItem {
  id: string;
  name: string;
  type: 'pdf' | 'ppt' | 'video' | 'text' | 'concepts' | 'summary';
  course: string;
  grade: string;
  section: string;
  unit: string;
  topic: string;
  uploadDate: Date;
  status: 'processing' | 'ready' | 'needs_review';
  size?: string;
}

export interface SectionData {
  id: string;
  name: string;
  grade: string;
  activeStudents: number;
  totalStudents: number;
  avgStudyTime: number;
  avgSessionsPerWeek: number;
  engagement: number;
  weakTopics: string[];
  topCourses: string[];
}
