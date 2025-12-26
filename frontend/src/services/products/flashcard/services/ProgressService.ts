import {
  ProgressData,
  ProgressUpdate,
  ProgressMetrics,
  ProgressStatus,
} from "../types/ProgressTypes";
import { ProgressModel } from "../models/ProgressModel";
import { AnswerResult } from "../types/AnswerTypes";

/**
 * ProgressService - Service layer for progress tracking
 * Implements MVC pattern for progress business logic
 */
export class ProgressService {
  private baseUrl: string;
  private cache: Map<string, ProgressData> = new Map();

  constructor(baseUrl: string = "/api/progress") {
    this.baseUrl = baseUrl;
  }

  /**
   * Update progress with answer result
   * @param moduleName Module name
   * @param answerResult Answer result
   * @returns Promise<void>
   */
  async updateProgress(
    moduleName: string,
    answerResult: AnswerResult,
  ): Promise<void> {
    try {
      // Get current progress
      let progress = await this.getProgress(moduleName);

      // Create progress update
      const update: ProgressUpdate = {
        moduleName,
        itemId: answerResult.flashcardId,
        isCorrect: answerResult.isCorrect,
        attempts: answerResult.attempts,
        timeSpent: answerResult.timestamp
          ? Date.now() - answerResult.timestamp.getTime()
          : 0,
        timestamp: new Date(),
        sessionId: answerResult.sessionId,
      };

      // Update progress model
      const progressModel = new ProgressModel(progress);
      progressModel.updateProgress(update);

      // Save updated progress
      await this.saveProgress(moduleName, progressModel.toJSON());
    } catch (error) {
      console.error("Error updating progress:", error);
      throw new Error(
        `Failed to update progress: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get progress for a module
   * @param moduleName Module name
   * @returns Promise<ProgressData> Progress data
   */
  async getProgress(moduleName: string): Promise<ProgressData> {
    try {
      // Check cache first
      if (this.cache.has(moduleName)) {
        return this.cache.get(moduleName)!;
      }

      const response = await fetch(`${this.baseUrl}/${moduleName}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Create new progress if not found
          return this.createNewProgress(moduleName);
        }
        throw new Error(`Failed to fetch progress for module: ${moduleName}`);
      }

      const progressData = await response.json();

      // Cache the result
      this.cache.set(moduleName, progressData);

      return progressData;
    } catch (error) {
      console.error("Error fetching progress:", error);
      throw new Error(
        `Failed to fetch progress: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get progress metrics for a module
   * @param moduleName Module name
   * @returns Promise<ProgressMetrics> Progress metrics
   */
  async getProgressMetrics(moduleName: string): Promise<ProgressMetrics> {
    try {
      const progress = await this.getProgress(moduleName);
      const progressModel = new ProgressModel(progress);

      const metrics: ProgressMetrics = {
        accuracy: progressModel.getAccuracy(),
        completionRate: progressModel.getCompletionPercentage(),
        averageAttempts: progressModel.getAverageTimePerItem(),
        timePerItem: progressModel.getAverageTimePerItem(),
        streakDays: progress.streakDays || 0,
        totalTimeSpent: progress.totalTimeSpent || 0,
        improvementRate: await this.calculateImprovementRate(moduleName),
        difficultyDistribution:
          await this.getDifficultyDistribution(moduleName),
        mistakePatterns: await this.getMistakePatterns(moduleName),
      };

      return metrics;
    } catch (error) {
      console.error("Error getting progress metrics:", error);
      throw new Error(
        `Failed to get progress metrics: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Reset progress for a module
   * @param moduleName Module name
   * @returns Promise<void>
   */
  async resetProgress(moduleName: string): Promise<void> {
    try {
      const progress = await this.getProgress(moduleName);
      const progressModel = new ProgressModel(progress);

      progressModel.reset();

      await this.saveProgress(moduleName, progressModel.toJSON());

      // Clear cache
      this.cache.delete(moduleName);
    } catch (error) {
      console.error("Error resetting progress:", error);
      throw new Error(
        `Failed to reset progress: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get progress summary for all modules
   * @returns Promise<Array<{moduleName: string, summary: any}>>
   */
  async getAllProgressSummaries(): Promise<
    Array<{ moduleName: string; summary: any }>
  > {
    try {
      const response = await fetch(`${this.baseUrl}/summaries`);

      if (!response.ok) {
        throw new Error("Failed to fetch progress summaries");
      }

      const summaries = await response.json();
      return summaries;
    } catch (error) {
      console.error("Error getting progress summaries:", error);
      throw new Error(
        `Failed to get progress summaries: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Create new progress for a module
   * @param moduleName Module name
   * @returns ProgressData New progress data
   */
  private async createNewProgress(moduleName: string): Promise<ProgressData> {
    const newProgress: ProgressData = {
      id: `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      moduleName,
      totalItems: 0, // Will be updated when flashcards are loaded
      completedItems: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
      status: ProgressStatus.NOT_STARTED,
      streakDays: 0,
      totalTimeSpent: 0,
    };

    await this.saveProgress(moduleName, newProgress);
    return newProgress;
  }

  /**
   * Save progress data
   * @param moduleName Module name
   * @param progressData Progress data to save
   * @returns Promise<void>
   */
  private async saveProgress(
    moduleName: string,
    progressData: ProgressData,
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${moduleName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save progress for module: ${moduleName}`);
      }

      // Update cache
      this.cache.set(moduleName, progressData);
    } catch (error) {
      console.error("Error saving progress:", error);
      throw new Error(
        `Failed to save progress: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Calculate improvement rate
   * @param moduleName Module name
   * @returns Improvement rate percentage
   */
  private async calculateImprovementRate(moduleName: string): Promise<number> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${moduleName}/improvement-rate`,
      );

      if (!response.ok) {
        return 0; // Default to 0 if not available
      }

      const data = await response.json();
      return data.improvementRate || 0;
    } catch (error) {
      console.error("Error calculating improvement rate:", error);
      return 0;
    }
  }

  /**
   * Get difficulty distribution
   * @param moduleName Module name
   * @returns Difficulty distribution object
   */
  private async getDifficultyDistribution(
    moduleName: string,
  ): Promise<Record<string, number>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/${moduleName}/difficulty-distribution`,
      );

      if (!response.ok) {
        return { beginner: 0, intermediate: 0, advanced: 0 };
      }

      const data = await response.json();
      return data.distribution || { beginner: 0, intermediate: 0, advanced: 0 };
    } catch (error) {
      console.error("Error getting difficulty distribution:", error);
      return { beginner: 0, intermediate: 0, advanced: 0 };
    }
  }

  /**
   * Get mistake patterns
   * @param moduleName Module name
   * @returns Array of mistake patterns
   */
  private async getMistakePatterns(moduleName: string): Promise<
    Array<{
      pattern: string;
      frequency: number;
      severity: "low" | "medium" | "high";
    }>
  > {
    try {
      const response = await fetch(
        `${this.baseUrl}/${moduleName}/mistake-patterns`,
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      return data.patterns || [];
    } catch (error) {
      console.error("Error getting mistake patterns:", error);
      return [];
    }
  }

  /**
   * Clear progress cache
   * @param moduleName Optional module name to clear specific cache
   */
  clearCache(moduleName?: string): void {
    if (moduleName) {
      this.cache.delete(moduleName);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics object
   */
  getCacheStats(): { size: number; modules: string[] } {
    return {
      size: this.cache.size,
      modules: Array.from(this.cache.keys()),
    };
  }
}
