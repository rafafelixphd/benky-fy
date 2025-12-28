// user.ts
export interface UserData {
  name: string;
  email: string;
  picture?: string;
  provider: string;
  joinDate: string;
  currentLevel: string;
  totalStudyTime: string;
  streakDays: number;
  totalWordsLearned: number;
  favoriteModules: string[];
}

