import {
  ProgressData,
  ProgressUpdate,
  ProgressStatus,
} from "../types/ProgressTypes";

/**
 * ProgressModel - Data model for progress tracking
 * Implements MVC pattern for progress data management
 */
export class ProgressModel {
  public readonly id: string;
  public moduleName: string;
  public userId?: string;
  public totalItems: number;
  public completedItems: number;
  public correctAnswers: number;
  public incorrectAnswers: number;
  public accuracy: number;
  public lastUpdated: Date;
  public createdAt: Date;
  public status: ProgressStatus;
  public streakDays?: number;
  public totalTimeSpent?: number; // in milliseconds

  constructor(data: Partial<ProgressData> & { moduleName: string }) {
    this.id = data.id || this.generateId();
    this.moduleName = data.moduleName;
    this.userId = data.userId;
    this.totalItems = data.totalItems || 0;
    this.completedItems = data.completedItems || 0;
    this.correctAnswers = data.correctAnswers || 0;
    this.incorrectAnswers = data.incorrectAnswers || 0;
    this.accuracy = data.accuracy || 0;
    this.lastUpdated = data.lastUpdated
      ? new Date(data.lastUpdated)
      : new Date();
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.status = data.status || ProgressStatus.NOT_STARTED;
    this.streakDays = data.streakDays || 0;
    this.totalTimeSpent = data.totalTimeSpent || 0;
  }

  /**
   * Convert model to JSON object
   * @returns JSON representation of the model
   */
  toJSON(): ProgressData {
    return {
      id: this.id,
      moduleName: this.moduleName,
      userId: this.userId,
      totalItems: this.totalItems,
      completedItems: this.completedItems,
      correctAnswers: this.correctAnswers,
      incorrectAnswers: this.incorrectAnswers,
      accuracy: this.accuracy,
      lastUpdated: this.lastUpdated,
      createdAt: this.createdAt,
      status: this.status,
      streakDays: this.streakDays,
      totalTimeSpent: this.totalTimeSpent,
    };
  }

  /**
   * Create model from JSON data
   * @param data JSON data
   * @returns ProgressModel instance
   */
  static fromJSON(data: any): ProgressModel {
    return new ProgressModel(data as ProgressData);
  }

  /**
   * Validate model data
   * @returns Validation result with errors if any
   */
  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.id || this.id.trim() === "") {
      errors.push("ID is required");
    }

    if (!this.moduleName || this.moduleName.trim() === "") {
      errors.push("Module name is required");
    }

    if (this.totalItems < 0) {
      errors.push("Total items cannot be negative");
    }

    if (this.completedItems < 0 || this.completedItems > this.totalItems) {
      errors.push("Completed items must be between 0 and total items");
    }

    if (this.correctAnswers < 0) {
      errors.push("Correct answers cannot be negative");
    }

    if (this.incorrectAnswers < 0) {
      errors.push("Incorrect answers cannot be negative");
    }

    if (this.accuracy < 0 || this.accuracy > 100) {
      errors.push("Accuracy must be between 0 and 100");
    }

    if (this.streakDays && this.streakDays < 0) {
      errors.push("Streak days cannot be negative");
    }

    if (this.totalTimeSpent && this.totalTimeSpent < 0) {
      errors.push("Total time spent cannot be negative");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a deep copy of the model
   * @returns New ProgressModel instance
   */
  clone(): ProgressModel {
    return new ProgressModel({
      id: this.id,
      moduleName: this.moduleName,
      userId: this.userId,
      totalItems: this.totalItems,
      completedItems: this.completedItems,
      correctAnswers: this.correctAnswers,
      incorrectAnswers: this.incorrectAnswers,
      accuracy: this.accuracy,
      lastUpdated: new Date(this.lastUpdated),
      createdAt: new Date(this.createdAt),
      status: this.status,
      streakDays: this.streakDays,
      totalTimeSpent: this.totalTimeSpent,
    });
  }

  /**
   * Update progress with new answer result
   * @param update Progress update data
   */
  updateProgress(update: ProgressUpdate): void {
    if (update.moduleName !== this.moduleName) {
      throw new Error("Module name mismatch");
    }

    this.completedItems += 1;

    if (update.isCorrect) {
      this.correctAnswers += 1;
    } else {
      this.incorrectAnswers += 1;
    }

    this.recalculateAccuracy();
    this.updateStatus();
    this.lastUpdated = new Date();

    if (update.timeSpent) {
      this.totalTimeSpent = (this.totalTimeSpent || 0) + update.timeSpent;
    }
  }

  /**
   * Recalculate accuracy percentage
   */
  recalculateAccuracy(): void {
    const totalAnswers = this.correctAnswers + this.incorrectAnswers;
    this.accuracy =
      totalAnswers > 0 ? (this.correctAnswers / totalAnswers) * 100 : 0;
  }

  /**
   * Get current accuracy percentage
   * @returns Accuracy percentage
   */
  getAccuracy(): number {
    return this.accuracy;
  }

  /**
   * Update progress status based on completion and accuracy
   */
  updateStatus(): void {
    if (this.completedItems === 0) {
      this.status = ProgressStatus.NOT_STARTED;
    } else if (this.completedItems < this.totalItems) {
      this.status = ProgressStatus.IN_PROGRESS;
    } else if (this.accuracy >= 90) {
      this.status = ProgressStatus.MASTERED;
    } else if (this.accuracy >= 70) {
      this.status = ProgressStatus.COMPLETED;
    } else {
      this.status = ProgressStatus.NEEDS_REVIEW;
    }
  }

  /**
   * Get completion percentage
   * @returns Completion percentage
   */
  getCompletionPercentage(): number {
    return this.totalItems > 0
      ? (this.completedItems / this.totalItems) * 100
      : 0;
  }

  /**
   * Get remaining items count
   * @returns Number of remaining items
   */
  getRemainingItems(): number {
    return this.totalItems - this.completedItems;
  }

  /**
   * Check if module is completed
   * @returns True if all items are completed
   */
  isCompleted(): boolean {
    return this.completedItems >= this.totalItems;
  }

  /**
   * Get average time per item
   * @returns Average time in milliseconds
   */
  getAverageTimePerItem(): number {
    return this.completedItems > 0
      ? (this.totalTimeSpent || 0) / this.completedItems
      : 0;
  }

  /**
   * Reset progress data
   */
  reset(): void {
    this.completedItems = 0;
    this.correctAnswers = 0;
    this.incorrectAnswers = 0;
    this.accuracy = 0;
    this.status = ProgressStatus.NOT_STARTED;
    this.streakDays = 0;
    this.totalTimeSpent = 0;
    this.lastUpdated = new Date();
  }

  /**
   * Generate unique ID
   * @returns Unique ID string
   */
  private generateId(): string {
    return `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
