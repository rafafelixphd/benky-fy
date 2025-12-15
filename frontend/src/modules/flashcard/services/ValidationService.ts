import { ValidationResult } from "@/core/validation/core/ValidationResult";
import { AnswerSet } from "@/core/validation/core/ActivityValidator";
import { UserSettings } from "@/core/api-client";
import { ModuleValidatorFactory } from "@/core/validation/factories/ModuleValidatorFactory";
import { AnswerModel } from "../models/AnswerModel";

/**
 * ValidationService - Service layer for answer validation
 * Implements MVC pattern for validation business logic
 */
export class ValidationService {
  private validatorFactory: ModuleValidatorFactory;

  constructor() {
    this.validatorFactory = new ModuleValidatorFactory();
  }

  /**
   * Validate a single answer
   * @param userAnswer User's input answer
   * @param correctAnswers Correct answer set
   * @param settings User settings
   * @param moduleName Module name for context
   * @returns ValidationResult with validation details
   */
  validateAnswer(
    userAnswer: string,
    correctAnswers: AnswerSet,
    settings: UserSettings,
    moduleName?: string,
  ): ValidationResult {
    try {
      // Create module-specific validator
      const moduleValidator = this.validatorFactory.createModuleValidator(
        moduleName || "colors",
      );

      // Validate the answer
      const result = moduleValidator.validateAnswer(userAnswer, correctAnswers);

      return result;
    } catch (error) {
      console.error("Validation error:", error);
      return {
        isCorrect: false,
        feedback: [
          `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Validate multiple inputs
   * @param inputs Record of input type to user input
   * @param correctAnswers Correct answer set
   * @param settings User settings
   * @param moduleName Module name for context
   * @returns Array of ValidationResults for each input
   */
  validateMultipleInputs(
    inputs: Record<string, string>,
    correctAnswers: AnswerSet,
    settings: UserSettings,
    moduleName?: string,
  ): ValidationResult[] {
    try {
      // Create module-specific validator
      const moduleValidator = this.validatorFactory.createModuleValidator(
        moduleName || "colors",
      );

      // Validate multiple inputs
      const results = moduleValidator.validateMultipleInputs(
        inputs,
        correctAnswers,
      );

      return results;
    } catch (error) {
      console.error("Multiple input validation error:", error);
      return [
        {
          isCorrect: false,
          feedback: [
            `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
          ],
        },
      ];
    }
  }

  /**
   * Get validation feedback messages
   * @param validationResult Validation result
   * @returns Array of feedback messages
   */
  getValidationFeedback(validationResult: ValidationResult): string[] {
    if (!validationResult) {
      return ["No validation result available"];
    }

    if (validationResult.feedback && validationResult.feedback.length > 0) {
      return validationResult.feedback;
    }

    if (validationResult.isCorrect) {
      return ["Correct!"];
    } else {
      return ["Incorrect answer"];
    }
  }

  /**
   * Determine if feedback should be shown
   * @param validationResult Validation result
   * @param showFeedback Global feedback setting
   * @returns True if feedback should be shown
   */
  shouldShowFeedback(
    validationResult: ValidationResult,
    showFeedback: boolean = true,
  ): boolean {
    return showFeedback && validationResult !== null;
  }

  /**
   * Create AnswerModel from validation result
   * @param flashcardId Flashcard ID
   * @param userAnswer User's answer
   * @param validationResult Validation result
   * @param moduleName Module name
   * @returns AnswerModel instance
   */
  createAnswerModel(
    flashcardId: string,
    userAnswer: string | Record<string, string>,
    validationResult: ValidationResult,
    moduleName?: string,
  ): AnswerModel {
    const answerSubmission = {
      flashcardId,
      userAnswer,
      inputTypes: [], // TODO: Extract input types from userAnswer
      moduleName,
      timestamp: new Date(),
    };

    const answerModel = new AnswerModel(answerSubmission);
    answerModel.updateValidation(validationResult);

    return answerModel;
  }

  /**
   * Validate answer with server-side validation
   * @param userAnswer User's answer
   * @param flashcardId Flashcard ID
   * @param moduleName Module name
   * @returns Promise<ValidationResult> Server validation result
   */
  async validateWithServer(
    userAnswer: string,
    flashcardId: string,
    moduleName?: string,
  ): Promise<ValidationResult> {
    try {
      const response = await fetch("/api/validation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAnswer,
          flashcardId,
          moduleName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server validation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Server validation error:", error);
      return {
        isCorrect: false,
        feedback: [
          `Server validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
      };
    }
  }

  /**
   * Get validation statistics
   * @param answers Array of AnswerModel instances
   * @returns Validation statistics
   */
  getValidationStatistics(answers: AnswerModel[]): {
    totalAnswers: number;
    correctAnswers: number;
    incorrectAnswers: number;
    accuracy: number;
    averageAttempts: number;
  } {
    const totalAnswers = answers.length;
    const correctAnswers = answers.filter((answer) => answer.isCorrect).length;
    const incorrectAnswers = totalAnswers - correctAnswers;
    const accuracy =
      totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    const averageAttempts =
      totalAnswers > 0
        ? answers.reduce((sum, answer) => sum + answer.attempts, 0) /
          totalAnswers
        : 0;

    return {
      totalAnswers,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      averageAttempts,
    };
  }

  /**
   * Get common mistakes from answers
   * @param answers Array of AnswerModel instances
   * @returns Array of common mistakes
   */
  getCommonMistakes(answers: AnswerModel[]): Array<{
    flashcardId: string;
    mistake: string;
    count: number;
  }> {
    const mistakeMap = new Map<
      string,
      { flashcardId: string; count: number }
    >();

    answers.forEach((answer) => {
      if (!answer.isCorrect) {
        const mistake = answer.getAnswerAsString();
        const key = `${answer.flashcardId}:${mistake}`;

        if (mistakeMap.has(key)) {
          mistakeMap.get(key)!.count++;
        } else {
          mistakeMap.set(key, {
            flashcardId: answer.flashcardId,
            count: 1,
          });
        }
      }
    });

    return Array.from(mistakeMap.entries())
      .map(([key, data]) => ({
        flashcardId: data.flashcardId,
        mistake: key.split(":")[1],
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 mistakes
  }

  /**
   * Validate settings for validation
   * @param settings User settings
   * @returns True if settings are valid for validation
   */
  validateSettings(settings: UserSettings): boolean {
    const enabledTypes = this.getEnabledInputTypes(settings);
    return enabledTypes.length > 0;
  }

  /**
   * Get enabled input types from settings
   * @param settings User settings
   * @returns Array of enabled input types
   */
  private getEnabledInputTypes(settings: UserSettings): string[] {
    const enabledTypes: string[] = [];

    if (settings.input_hiragana) enabledTypes.push("hiragana");
    if (settings.input_katakana) enabledTypes.push("katakana");
    if (settings.input_english) enabledTypes.push("english");
    if (settings.input_kanji) enabledTypes.push("kanji");
    if (settings.input_romaji) enabledTypes.push("romaji");

    return enabledTypes;
  }
}
