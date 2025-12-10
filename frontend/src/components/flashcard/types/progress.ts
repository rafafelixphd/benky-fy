export interface ProgressStats {
  correct: number;
  incorrect: number;
  skipped: number;
  total: number;
  streakCount: number;
  bestStreak: number;
  averageResponseTime: number;
}

export interface ProgressSectionProps {
  currentItem: number;
  totalItems: number;
  moduleName: string;
  stats?: ProgressStats;
}

export interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
}

export interface ProgressChartProps {
  stats: ProgressStats;
  className?: string;
}

export interface StreakIndicatorProps {
  currentStreak: number;
  bestStreak: number;
  className?: string;
}

export interface AccuracyChartProps {
  correct: number;
  incorrect: number;
  skipped: number;
  className?: string;
}
