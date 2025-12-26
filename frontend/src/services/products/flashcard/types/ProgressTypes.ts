/**
 * ProgressTypes - Type definitions for progress tracking system
 */

/**
 * Progress status enumeration
 */
export enum ProgressStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  MASTERED = "mastered",
  NEEDS_REVIEW = "needs_review",
}

/**
 * Progress data interface
 */
export interface ProgressData {
  id: string;
  moduleName: string;
  userId?: string;
  totalItems: number;
  completedItems: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  lastUpdated: Date;
  createdAt: Date;
  status: ProgressStatus;
  streakDays?: number;
  totalTimeSpent?: number; // in milliseconds
}

/**
 * Progress metrics interface
 */
export interface ProgressMetrics {
  accuracy: number;
  completionRate: number;
  averageAttempts: number;
  timePerItem: number; // in milliseconds
  streakDays: number;
  totalTimeSpent: number; // in milliseconds
  improvementRate: number; // percentage improvement over time
  difficultyDistribution: Record<string, number>;
  mistakePatterns: Array<{
    pattern: string;
    frequency: number;
    severity: "low" | "medium" | "high";
  }>;
}

/**
 * Progress update interface
 */
export interface ProgressUpdate {
  moduleName: string;
  itemId: string;
  isCorrect: boolean;
  attempts: number;
  timeSpent: number; // in milliseconds
  timestamp: Date;
  sessionId?: string;
}

/**
 * Progress summary interface
 */
export interface ProgressSummary {
  moduleName: string;
  totalItems: number;
  completedItems: number;
  accuracy: number;
  status: ProgressStatus;
  lastActivity?: Date;
  estimatedTimeToComplete?: number; // in milliseconds
  recommendedNextActions?: string[];
}

/**
 * Progress analytics interface
 */
export interface ProgressAnalytics {
  dailyProgress: Array<{
    date: string;
    itemsCompleted: number;
    accuracy: number;
    timeSpent: number;
  }>;
  weeklyTrends: Array<{
    week: string;
    averageAccuracy: number;
    totalItemsCompleted: number;
  }>;
  monthlyGoals: Array<{
    month: string;
    targetItems: number;
    actualItems: number;
    achievementRate: number;
  }>;
  performanceInsights: Array<{
    insight: string;
    recommendation: string;
    priority: "low" | "medium" | "high";
  }>;
}

/**
 * Progress goal interface
 */
export interface ProgressGoal {
  id: string;
  moduleName: string;
  targetItems: number;
  targetAccuracy: number;
  deadline?: Date;
  isActive: boolean;
  createdAt: Date;
  achievedAt?: Date;
}
