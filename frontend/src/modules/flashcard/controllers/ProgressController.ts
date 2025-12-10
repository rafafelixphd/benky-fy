import {
  ProgressData,
  ProgressUpdate,
  ProgressMetrics,
  ProgressStatus,
  ProgressSummary,
} from "../types/ProgressTypes";
import { ProgressModel } from "../models/ProgressModel";
import { ProgressService } from "../services/ProgressService";
import { AnswerResult } from "../types/AnswerTypes";

/**
 * ProgressController - Controller layer for progress user interactions
 * Implements MVC pattern for handling progress tracking and metrics
 */
export class ProgressController {
  private progressService: ProgressService;
  private currentProgress: ProgressModel | null = null;
  private currentModule: string | null = null;
  private sessionStartTime: Date | null = null;

  constructor(progressService?: ProgressService) {
    this.progressService = progressService || new ProgressService();
  }

  /**
   * Set current module for progress tracking
   * @param moduleName Module name
   */
  setCurrentModule(moduleName: string): void {
    this.currentModule = moduleName;
  }

  /**
   * Update progress with answer result
   * @param answerResult Answer result to update progress with
   * @returns Promise<void>
   */
  async updateProgress(answerResult: AnswerResult): Promise<void> {
    if (!this.currentModule) {
      throw new Error("No current module set for progress update");
    }

    try {
      // Update progress through service
      await this.progressService.updateProgress(
        this.currentModule,
        answerResult,
      );

      // Refresh current progress
      await this.loadProgress(this.currentModule);
    } catch (error) {
      console.error("Error updating progress:", error);
      throw new Error(
        `Failed to update progress: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get progress for current module
   * @returns ProgressData
   */
  getProgress(): ProgressData {
    if (!this.currentProgress) {
      throw new Error("No progress loaded. Call loadProgress() first.");
    }

    return this.currentProgress.toJSON();
  }

  /**
   * Get progress metrics for current module
   * @returns Promise<ProgressMetrics>
   */
  async getProgressMetrics(): Promise<ProgressMetrics> {
    if (!this.currentModule) {
      throw new Error("No current module set for progress metrics");
    }

    try {
      return await this.progressService.getProgressMetrics(this.currentModule);
    } catch (error) {
      console.error("Error getting progress metrics:", error);
      throw new Error(
        `Failed to get progress metrics: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Reset progress for current module
   * @returns Promise<void>
   */
  async resetProgress(): Promise<void> {
    if (!this.currentModule) {
      throw new Error("No current module set for progress reset");
    }

    try {
      await this.progressService.resetProgress(this.currentModule);
      await this.loadProgress(this.currentModule);
    } catch (error) {
      console.error("Error resetting progress:", error);
      throw new Error(
        `Failed to reset progress: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Load progress for a module
   * @param moduleName Module name to load progress for
   * @returns Promise<void>
   */
  async loadProgress(moduleName: string): Promise<void> {
    try {
      this.currentModule = moduleName;
      const progressData = await this.progressService.getProgress(moduleName);
      this.currentProgress = new ProgressModel(progressData);
      this.sessionStartTime = new Date();
    } catch (error) {
      console.error("Error loading progress:", error);
      throw new Error(
        `Failed to load progress for module ${moduleName}: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get current module name
   * @returns string | null
   */
  getCurrentModule(): string | null {
    return this.currentModule;
  }

  /**
   * Get current progress model
   * @returns ProgressModel | null
   */
  getCurrentProgressModel(): ProgressModel | null {
    return this.currentProgress;
  }

  /**
   * Get progress summary for current module
   * @returns ProgressSummary
   */
  getProgressSummary(): ProgressSummary {
    if (!this.currentProgress) {
      throw new Error("No progress loaded. Call loadProgress() first.");
    }

    const progressData = this.currentProgress.toJSON();

    return {
      moduleName: progressData.moduleName,
      totalItems: progressData.totalItems,
      completedItems: progressData.completedItems,
      accuracy: progressData.accuracy,
      status: progressData.status,
      lastActivity: progressData.lastUpdated,
      estimatedTimeToComplete: this.calculateEstimatedTimeToComplete(),
      recommendedNextActions: this.getRecommendedNextActions(),
    };
  }

  /**
   * Get session statistics
   * @returns Session statistics
   */
  getSessionStatistics(): {
    sessionDuration: number;
    itemsCompleted: number;
    accuracy: number;
    averageTimePerItem: number;
  } {
    if (!this.sessionStartTime || !this.currentProgress) {
      return {
        sessionDuration: 0,
        itemsCompleted: 0,
        accuracy: 0,
        averageTimePerItem: 0,
      };
    }

    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    const progressData = this.currentProgress.toJSON();

    return {
      sessionDuration,
      itemsCompleted: progressData.completedItems,
      accuracy: progressData.accuracy,
      averageTimePerItem:
        progressData.completedItems > 0
          ? sessionDuration / progressData.completedItems
          : 0,
    };
  }

  /**
   * Check if progress is available
   * @returns boolean
   */
  hasProgress(): boolean {
    return this.currentProgress !== null;
  }

  /**
   * Get progress status
   * @returns ProgressStatus
   */
  getProgressStatus(): ProgressStatus {
    if (!this.currentProgress) {
      return ProgressStatus.NOT_STARTED;
    }

    return this.currentProgress.toJSON().status;
  }

  /**
   * Get completion percentage
   * @returns number
   */
  getCompletionPercentage(): number {
    if (!this.currentProgress) {
      return 0;
    }

    return this.currentProgress.getCompletionPercentage();
  }

  /**
   * Get accuracy percentage
   * @returns number
   */
  getAccuracy(): number {
    if (!this.currentProgress) {
      return 0;
    }

    return this.currentProgress.getAccuracy();
  }

  /**
   * Get streak days
   * @returns number
   */
  getStreakDays(): number {
    if (!this.currentProgress) {
      return 0;
    }

    return this.currentProgress.toJSON().streakDays || 0;
  }

  /**
   * Get total time spent
   * @returns number
   */
  getTotalTimeSpent(): number {
    if (!this.currentProgress) {
      return 0;
    }

    return this.currentProgress.toJSON().totalTimeSpent || 0;
  }

  /**
   * Check if module is completed
   * @returns boolean
   */
  isModuleCompleted(): boolean {
    if (!this.currentProgress) {
      return false;
    }

    return this.getCompletionPercentage() >= 100;
  }

  /**
   * Check if module is mastered
   * @returns boolean
   */
  isModuleMastered(): boolean {
    if (!this.currentProgress) {
      return false;
    }

    const progressData = this.currentProgress.toJSON();
    return progressData.status === ProgressStatus.MASTERED;
  }

  /**
   * Get progress insights
   * @returns Array of progress insights
   */
  getProgressInsights(): Array<{
    type: "success" | "warning" | "info";
    message: string;
    recommendation?: string;
  }> {
    if (!this.currentProgress) {
      return [];
    }

    const insights: Array<{
      type: "success" | "warning" | "info";
      message: string;
      recommendation?: string;
    }> = [];

    const progressData = this.currentProgress.toJSON();
    const accuracy = progressData.accuracy;
    const completionRate = this.getCompletionPercentage();

    // Accuracy insights
    if (accuracy >= 90) {
      insights.push({
        type: "success",
        message: `Excellent accuracy: ${accuracy.toFixed(1)}%`,
        recommendation: "You're mastering this module!",
      });
    } else if (accuracy >= 70) {
      insights.push({
        type: "info",
        message: `Good accuracy: ${accuracy.toFixed(1)}%`,
        recommendation: "Keep practicing to improve further",
      });
    } else if (accuracy < 50) {
      insights.push({
        type: "warning",
        message: `Accuracy needs improvement: ${accuracy.toFixed(1)}%`,
        recommendation: "Consider reviewing previous lessons",
      });
    }

    // Completion insights
    if (completionRate >= 100) {
      insights.push({
        type: "success",
        message: "Module completed!",
        recommendation: "Great job! Consider moving to the next module",
      });
    } else if (completionRate >= 75) {
      insights.push({
        type: "info",
        message: `Almost there: ${completionRate.toFixed(1)}% complete`,
        recommendation: "You're close to finishing this module",
      });
    }

    return insights;
  }

  /**
   * Reset controller state
   * @returns void
   */
  reset(): void {
    this.currentProgress = null;
    this.currentModule = null;
    this.sessionStartTime = null;
  }

  /**
   * Calculate estimated time to complete
   * @returns number Estimated time in milliseconds
   */
  private calculateEstimatedTimeToComplete(): number {
    if (!this.currentProgress) {
      return 0;
    }

    const progressData = this.currentProgress.toJSON();
    const remainingItems =
      progressData.totalItems - progressData.completedItems;

    if (remainingItems <= 0) {
      return 0;
    }

    const averageTimePerItem = progressData.totalTimeSpent
      ? progressData.totalTimeSpent / progressData.completedItems
      : 30000; // Default 30 seconds per item

    return remainingItems * averageTimePerItem;
  }

  /**
   * Get recommended next actions
   * @returns Array of recommended actions
   */
  private getRecommendedNextActions(): string[] {
    if (!this.currentProgress) {
      return ["Start practicing"];
    }

    const actions: string[] = [];
    const progressData = this.currentProgress.toJSON();
    const accuracy = progressData.accuracy;
    const completionRate = this.getCompletionPercentage();

    if (completionRate < 25) {
      actions.push("Continue with basic practice");
    } else if (completionRate < 50) {
      actions.push("Focus on accuracy improvement");
    } else if (completionRate < 75) {
      actions.push("Review difficult items");
    } else if (completionRate < 100) {
      actions.push("Complete remaining items");
    } else if (accuracy < 80) {
      actions.push("Review and practice weak areas");
    } else {
      actions.push("Move to next module");
    }

    return actions;
  }
}
