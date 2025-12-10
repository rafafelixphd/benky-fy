import { ValidationResult } from "@/core/validation/core/ValidationResult";
import {
  AnswerSubmission,
  AnswerResult,
  AnswerFeedback,
  InputType,
} from "../types/AnswerTypes";
import { AnswerModel } from "../models/AnswerModel";
import { ValidationService } from "../services/ValidationService";
import { FlashcardItem } from "../types/FlashcardTypes";

/**
 * AnswerController - Controller layer for answer user interactions
 * Implements MVC pattern for handling answer submission and validation
 */
export class AnswerController {
  private validationService: ValidationService;
  private currentAnswer: AnswerModel | null = null;
  private answerHistory: AnswerModel[] = [];
  private currentFlashcard: FlashcardItem | null = null;
  private sessionId: string;

  constructor(validationService?: ValidationService) {
    this.validationService = validationService || new ValidationService();
    this.sessionId = this.generateSessionId();
  }

  /**
   * Submit an answer for validation
   * @param userAnswer User's input answer
   * @returns Promise<void>
   */
  async submitAnswer(userAnswer: string): Promise<void> {
    if (!this.currentFlashcard) {
      throw new Error("No current flashcard available for answer submission");
    }

    try {
      // Create answer submission
      const answerSubmission: AnswerSubmission = {
        flashcardId: this.currentFlashcard.id,
        userAnswer,
        inputTypes: this.getInputTypesFromAnswer(userAnswer),
        timestamp: new Date(),
        sessionId: this.sessionId,
        moduleName: this.getModuleNameFromFlashcard(),
      };

      // Create answer model
      this.currentAnswer = new AnswerModel(answerSubmission);

      // Validate the answer synchronously for immediate feedback
      const validationResult = this.validateAnswer(userAnswer);

      // Update answer model with validation result
      this.currentAnswer.updateValidation(validationResult);

      // Add to history
      this.answerHistory.push(this.currentAnswer);
    } catch (error) {
      console.error("Error submitting answer:", error);
      throw new Error(
        `Failed to submit answer: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Validate an answer
   * @param userAnswer User's input answer
   * @returns ValidationResult
   */
  validateAnswer(userAnswer: string): ValidationResult {
    if (!this.currentFlashcard) {
      return {
        isCorrect: false,
        feedback: ["No flashcard available for validation"],
      };
    }

    try {
      // Create answer set from flashcard
      const answerSet = this.createAnswerSetFromFlashcard(
        this.currentFlashcard,
      );

      // Create user settings (simplified for now)
      const userSettings = this.createDefaultUserSettings();

      // Validate using validation service
      const validationResult = this.validationService.validateAnswer(
        userAnswer,
        answerSet,
        userSettings,
        this.getModuleNameFromFlashcard(),
      );

      return validationResult;
    } catch (error) {
      console.error("Error validating answer:", error);
      return {
        isCorrect: false,
        feedback: [
          `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Clear the current answer
   * @returns void
   */
  clearAnswer(): void {
    this.currentAnswer = null;
  }

  /**
   * Get answer feedback
   * @returns AnswerFeedback
   */
  getAnswerFeedback(): AnswerFeedback {
    if (!this.currentAnswer) {
      return {
        isCorrect: false,
        message: "No answer submitted",
        colorClass: "text-gray-500",
        iconClass: "question-circle",
      };
    }

    const validationResult = this.currentAnswer.getValidationResult();

    if (validationResult.isCorrect) {
      return {
        isCorrect: true,
        message: "Correct! Well done!",
        encouragement: "Keep up the great work!",
        colorClass: "text-green-600",
        iconClass: "check-circle",
      };
    } else {
      const feedback = validationResult.feedback || ["Incorrect answer"];
      return {
        isCorrect: false,
        message: feedback[0] || "Incorrect answer",
        suggestions: feedback.slice(1),
        colorClass: "text-red-600",
        iconClass: "times-circle",
      };
    }
  }

  /**
   * Set the current flashcard
   * @param flashcard FlashcardItem to set as current
   * @returns void
   */
  setCurrentFlashcard(flashcard: FlashcardItem): void {
    this.currentFlashcard = flashcard;
    this.clearAnswer(); // Clear previous answer when changing flashcard
  }

  /**
   * Get the current answer
   * @returns AnswerModel | null
   */
  getCurrentAnswer(): AnswerModel | null {
    return this.currentAnswer;
  }

  /**
   * Get answer history
   * @returns AnswerModel[]
   */
  getAnswerHistory(): AnswerModel[] {
    return [...this.answerHistory];
  }

  /**
   * Get answer statistics
   * @returns Answer statistics
   */
  getAnswerStatistics(): {
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    averageAttempts: number;
  } {
    return this.validationService.getValidationStatistics(this.answerHistory);
  }

  /**
   * Get common mistakes
   * @returns Array of common mistakes
   */
  getCommonMistakes(): Array<{
    flashcardId: string;
    mistake: string;
    count: number;
  }> {
    return this.validationService.getCommonMistakes(this.answerHistory);
  }

  /**
   * Check if current answer is correct
   * @returns boolean
   */
  isCurrentAnswerCorrect(): boolean {
    return this.currentAnswer?.isCorrect || false;
  }

  /**
   * Get current flashcard
   * @returns FlashcardItem | null
   */
  getCurrentFlashcard(): FlashcardItem | null {
    return this.currentFlashcard;
  }

  /**
   * Get session ID
   * @returns string
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Reset answer controller state
   * @returns void
   */
  reset(): void {
    this.currentAnswer = null;
    this.answerHistory = [];
    this.currentFlashcard = null;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Get answer history for a specific flashcard
   * @param flashcardId Flashcard ID
   * @returns AnswerModel[]
   */
  getAnswerHistoryForFlashcard(flashcardId: string): AnswerModel[] {
    return this.answerHistory.filter(
      (answer) => answer.flashcardId === flashcardId,
    );
  }

  /**
   * Get latest answer for current flashcard
   * @returns AnswerModel | null
   */
  getLatestAnswerForCurrentFlashcard(): AnswerModel | null {
    if (!this.currentFlashcard) {
      return null;
    }

    const flashcardAnswers = this.getAnswerHistoryForFlashcard(
      this.currentFlashcard.id,
    );
    return flashcardAnswers.length > 0
      ? flashcardAnswers[flashcardAnswers.length - 1]
      : null;
  }

  /**
   * Check if answer has been submitted for current flashcard
   * @returns boolean
   */
  hasAnswerForCurrentFlashcard(): boolean {
    return this.getLatestAnswerForCurrentFlashcard() !== null;
  }

  /**
   * Get answer attempts count for current flashcard
   * @returns number
   */
  getAnswerAttemptsForCurrentFlashcard(): number {
    const latestAnswer = this.getLatestAnswerForCurrentFlashcard();
    return latestAnswer ? latestAnswer.attempts : 0;
  }

  /**
   * Create answer set from flashcard
   * @param flashcard FlashcardItem
   * @returns AnswerSet
   */
  private createAnswerSetFromFlashcard(flashcard: FlashcardItem): any {
    return {
      hiragana: flashcard.hiragana,
      katakana: flashcard.katakana,
      english: flashcard.english,
      kanji: flashcard.kanji,
      romaji: flashcard.romaji,
    };
  }

  /**
   * Create default user settings
   * @returns UserSettings
   */
  private createDefaultUserSettings(): any {
    return {
      input_hiragana: true,
      input_katakana: true,
      input_english: true,
      input_kanji: true,
      input_romaji: true,
      show_feedback: true,
      strict_mode: false,
    };
  }

  /**
   * Get input types from answer
   * @param userAnswer User's answer
   * @returns InputType[]
   */
  private getInputTypesFromAnswer(userAnswer: string): InputType[] {
    const types: InputType[] = [];

    // Simple detection logic - can be enhanced
    if (/[ひらがな]/.test(userAnswer)) {
      types.push(InputType.HIRAGANA);
    }
    if (/[カタカナ]/.test(userAnswer)) {
      types.push(InputType.KATAKANA);
    }
    if (/[一-龯]/.test(userAnswer)) {
      types.push(InputType.KANJI);
    }
    if (/^[a-zA-Z\s]+$/.test(userAnswer)) {
      types.push(InputType.ENGLISH);
    }
    if (/^[a-zA-Z\s]+$/.test(userAnswer)) {
      types.push(InputType.ROMAJI);
    }

    return types.length > 0 ? types : [InputType.ENGLISH];
  }

  /**
   * Get module name from current flashcard
   * @returns string
   */
  private getModuleNameFromFlashcard(): string {
    // Map flashcard types to module names
    const typeToModuleMap: Record<string, string> = {
      verb: "verbs",
      adjective: "adjectives",
      noun: "base_nouns",
      color: "colors_basic",
      number: "numbers_basic",
      greeting: "greetings_essential",
      day: "days_of_week",
      month: "months_complete",
      question: "question_words",
      vocab: "vocab",
    };

    const flashcardType = this.currentFlashcard?.type || "unknown";
    return typeToModuleMap[flashcardType] || "unknown";
  }

  /**
   * Generate session ID
   * @returns string
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
