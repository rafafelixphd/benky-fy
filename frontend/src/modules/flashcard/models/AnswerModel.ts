import {
  AnswerResult,
  AnswerSubmission,
  InputType,
} from "../types/AnswerTypes";
import { ValidationResult } from "@/core/validation/core/ValidationResult";

/**
 * AnswerModel - Data model for answer submissions and results
 * Implements MVC pattern for answer data management
 */
export class AnswerModel {
  public readonly id: string;
  public flashcardId: string;
  public userAnswer: string | Record<string, string>;
  public isCorrect: boolean;
  public matchedType?: InputType;
  public convertedAnswer?: string;
  public validationResult: ValidationResult;
  public timestamp: Date;
  public attempts: number;
  public moduleName?: string;
  public sessionId?: string;

  constructor(data: AnswerSubmission | AnswerResult) {
    this.id = "id" in data ? data.id : this.generateId();
    this.flashcardId = data.flashcardId;
    this.userAnswer = data.userAnswer;
    this.isCorrect = "isCorrect" in data ? data.isCorrect : false;
    this.matchedType = "matchedType" in data ? data.matchedType : undefined;
    this.convertedAnswer =
      "convertedAnswer" in data ? data.convertedAnswer : undefined;
    this.validationResult =
      "validationResult" in data
        ? data.validationResult
        : {
            isCorrect: false,
            feedback: ["No validation performed"],
          };
    this.timestamp =
      "timestamp" in data && data.timestamp
        ? new Date(data.timestamp)
        : new Date();
    this.attempts = "attempts" in data ? data.attempts : 1;
    this.moduleName = data.moduleName;
    this.sessionId = data.sessionId;
  }

  /**
   * Convert model to JSON object
   * @returns JSON representation of the model
   */
  toJSON(): AnswerResult {
    return {
      id: this.id,
      flashcardId: this.flashcardId,
      userAnswer: this.userAnswer,
      isCorrect: this.isCorrect,
      matchedType: this.matchedType,
      convertedAnswer: this.convertedAnswer,
      validationResult: this.validationResult,
      timestamp: this.timestamp,
      attempts: this.attempts,
      moduleName: this.moduleName,
      sessionId: this.sessionId,
    };
  }

  /**
   * Create model from JSON data
   * @param data JSON data
   * @returns AnswerModel instance
   */
  static fromJSON(data: any): AnswerModel {
    return new AnswerModel(data as AnswerResult);
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

    if (!this.flashcardId || this.flashcardId.trim() === "") {
      errors.push("Flashcard ID is required");
    }

    if (
      !this.userAnswer ||
      (typeof this.userAnswer === "string" && this.userAnswer.trim() === "")
    ) {
      errors.push("User answer is required");
    }

    if (this.attempts < 1) {
      errors.push("Attempts must be at least 1");
    }

    if (
      this.matchedType &&
      !Object.values(InputType).includes(this.matchedType)
    ) {
      errors.push("Invalid matched type");
    }

    if (!this.validationResult) {
      errors.push("Validation result is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Create a deep copy of the model
   * @returns New AnswerModel instance
   */
  clone(): AnswerModel {
    return new AnswerModel({
      id: this.id,
      flashcardId: this.flashcardId,
      userAnswer:
        typeof this.userAnswer === "string"
          ? this.userAnswer
          : { ...this.userAnswer },
      isCorrect: this.isCorrect,
      matchedType: this.matchedType,
      convertedAnswer: this.convertedAnswer,
      validationResult: { ...this.validationResult },
      timestamp: new Date(this.timestamp),
      attempts: this.attempts,
      moduleName: this.moduleName,
      sessionId: this.sessionId,
    });
  }

  /**
   * Update validation result
   * @param validationResult New validation result
   */
  updateValidation(validationResult: ValidationResult): void {
    this.validationResult = validationResult;
    this.isCorrect = validationResult.isCorrect;
    this.matchedType = validationResult.matchedType as InputType;
    this.convertedAnswer = validationResult.convertedAnswer;
  }

  /**
   * Increment attempt count
   */
  incrementAttempts(): void {
    this.attempts += 1;
  }

  /**
   * Get answer as string
   * @returns Answer as string
   */
  getAnswerAsString(): string {
    if (typeof this.userAnswer === "string") {
      return this.userAnswer;
    }
    return Object.values(this.userAnswer).join(" / ");
  }

  /**
   * Get validation result
   * @returns ValidationResult
   */
  getValidationResult(): ValidationResult {
    return this.validationResult;
  }

  /**
   * Get answer for specific input type
   * @param inputType Input type
   * @returns Answer for the input type
   */
  getAnswerForType(inputType: InputType): string {
    if (typeof this.userAnswer === "string") {
      return this.userAnswer;
    }
    return this.userAnswer[inputType] || "";
  }

  /**
   * Check if answer is for multiple input types
   * @returns True if answer is for multiple types
   */
  isMultipleInput(): boolean {
    return typeof this.userAnswer === "object";
  }

  /**
   * Get input types used in answer
   * @returns Array of input types
   */
  getInputTypes(): InputType[] {
    if (typeof this.userAnswer === "string") {
      return this.matchedType ? [this.matchedType] : [];
    }
    return Object.keys(this.userAnswer) as InputType[];
  }

  /**
   * Get time elapsed since answer submission
   * @returns Time in milliseconds
   */
  getTimeElapsed(): number {
    return Date.now() - this.timestamp.getTime();
  }

  /**
   * Generate unique ID
   * @returns Unique ID string
   */
  private generateId(): string {
    return `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
