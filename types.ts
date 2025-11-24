export interface Attachment {
  mimeType: string;
  data: string; // Base64
  previewUrl?: string; // For UI display
  type: 'image' | 'video' | 'audio';
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  attachments?: Attachment[];
  type: 'text' | 'audio_response';
  timestamp: number;
}

export type UserRole = 'parent' | 'teacher';
export type Language = 'zh' | 'en';

export interface ChildProfile {
  ageGroup: string;
  exactAge: string;
  gender: 'boy' | 'girl' | 'prefer_not_to_say';
  role: UserRole;
}

export interface AssessmentDefinition {
  id: string;
  title: string;
  description: string;
  questions: string[];
  tags: string[]; // e.g., 'adhd', 'anxiety', 'social'
}

export interface SolutionCard {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  strategiesParent: string[];
  strategiesTeacher: string[];
  kidSkill: string; // New field for Finnish Kid's Skills method
}

export enum AppView {
  HOME = 'HOME',
  CHAT = 'CHAT',
  ASSESSMENT = 'ASSESSMENT',
  SOLUTIONS = 'SOLUTIONS',
  STORIES = 'STORIES'
}

export interface AgeGroup {
  id: string;
  label: string;
  range: string;
  description: string;
}