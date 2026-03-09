import type { Timestamp } from "firebase/firestore";

export interface UserSettings {
  language: "fi" | "en";
  soundEnabled: boolean;
  ttsProvider: "browser" | "cloud";
}

export interface UserDocument {
  email: string;
  displayName: string;
  settings: UserSettings;
  createdAt: Timestamp | unknown;
}

export interface ChildProfile {
  id: string;
  name: string;
  avatar: string;
  currentLesson: number;
  totalStars: number;
  unlockedRewards: string[];
  activeBoardTheme: string;
  activePieceColor: string;
}

export interface LessonProgress {
  lessonId: string;
  stars: number;
  completedAt: Timestamp | unknown;
  attempts: number;
}

export interface PuzzleProgress {
  puzzleId: string;
  solved: boolean;
  attempts: number;
}
