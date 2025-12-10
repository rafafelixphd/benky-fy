/**
 * Flashcard Validator - Handles flashcard activity validation
 */

import { ActivityValidator, AnswerSet } from "../core/ActivityValidator";
import { UserSettings } from "@/core/api-client";
import { ValidationResult } from "../core/ValidationResult";
import { ValidatorFactory } from "../factories/ValidatorFactory";

export class FlashcardValidator implements ActivityValidator {
  private validatorFactory: ValidatorFactory;

  constructor() {
    this.validatorFactory = new ValidatorFactory();
  }

  /**
   * Validate a single answer against correct answers
   * @param userAnswer User's answer
   * @param correctAnswers Set of correct answers
   * @returns ValidationResult
   */
  validateAnswer(
    userAnswer: string,
    correctAnswers: AnswerSet,
  ): ValidationResult {
    // Try to validate against each available answer type
    const answerTypes = this.getAvailableAnswerTypes(correctAnswers);

    for (const answerType of answerTypes) {
      const validator = this.validatorFactory.getValidator(answerType);
      const expectedAnswer = this.getAnswerForType(correctAnswers, answerType);

      if (expectedAnswer) {
        const result = validator.validate(userAnswer, expectedAnswer);
        if (result.isCorrect) {
          return result;
        }
      }
    }

    // If no match found, return failure
    return {
      isCorrect: false,
      feedback: ["Incorrect answer"],
      confidence: 0,
    };
  }

  /**
   * Get enabled input types based on user settings
   * @param settings User settings
   * @returns Array of enabled input types
   */
  getEnabledInputTypes(settings: UserSettings): string[] {
    const enabledTypes: string[] = [];

    if (settings.input_english) enabledTypes.push("english");
    if (settings.input_hiragana) enabledTypes.push("hiragana");
    if (settings.input_katakana) enabledTypes.push("katakana");
    if (settings.input_kanji) enabledTypes.push("kanji");
    if (settings.input_romaji) enabledTypes.push("romaji");

    return enabledTypes;
  }

  /**
   * Validate multiple inputs against correct answers
   * @param inputs User inputs for different types
   * @param correctAnswers Set of correct answers
   * @returns Array of ValidationResults
   */
  validateMultipleInputs(
    inputs: Record<string, string>,
    correctAnswers: AnswerSet,
  ): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const [inputType, userInput] of Object.entries(inputs)) {
      if (userInput.trim()) {
        const validator = this.validatorFactory.getValidator(inputType);
        const expectedAnswer = this.getAnswerForType(correctAnswers, inputType);

        if (expectedAnswer) {
          const result = validator.validate(userInput, expectedAnswer);
          results.push(result);
        } else {
          results.push({
            isCorrect: false,
            feedback: [`No expected answer for type: ${inputType}`],
            confidence: 0,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get available answer types from AnswerSet
   * @param answers AnswerSet to analyze
   * @returns Array of available answer types
   */
  private getAvailableAnswerTypes(answers: AnswerSet): string[] {
    const types: string[] = [];

    if (answers.english) types.push("english");
    if (answers.hiragana) types.push("hiragana");
    if (answers.katakana) types.push("katakana");
    if (answers.kanji) types.push("kanji");
    if (answers.romaji) types.push("romaji");

    return types;
  }

  /**
   * Get answer for specific type from AnswerSet
   * @param answers AnswerSet to get answer from
   * @param type Answer type to get
   * @returns Answer string or null if not available
   */
  private getAnswerForType(answers: AnswerSet, type: string): string | null {
    switch (type.toLowerCase()) {
      case "english":
        return Array.isArray(answers.english)
          ? answers.english.join(" / ")
          : answers.english || null;
      case "hiragana":
        return answers.hiragana || null;
      case "katakana":
        return answers.katakana || null;
      case "kanji":
        return answers.kanji || null;
      case "romaji":
        return answers.romaji || null;
      default:
        return null;
    }
  }

  /**
   * Validate with specific input type
   * @param userInput User input
   * @param expectedAnswer Expected answer
   * @param inputType Input type
   * @returns ValidationResult
   */
  validateWithType(
    userInput: string,
    expectedAnswer: string,
    inputType: string,
  ): ValidationResult {
    const validator = this.validatorFactory.getValidator(inputType);
    return validator.validate(userInput, expectedAnswer);
  }

  /**
   * Check if all inputs are correct
   * @param inputs User inputs
   * @param correctAnswers Correct answers
   * @returns True if all inputs are correct
   */
  areAllInputsCorrect(
    inputs: Record<string, string>,
    correctAnswers: AnswerSet,
  ): boolean {
    const results = this.validateMultipleInputs(inputs, correctAnswers);
    return results.every((result) => result.isCorrect);
  }

  /**
   * Get partial validation results
   * @param inputs User inputs
   * @param correctAnswers Correct answers
   * @returns Object with correct and incorrect counts
   */
  getValidationSummary(
    inputs: Record<string, string>,
    correctAnswers: AnswerSet,
  ): {
    total: number;
    correct: number;
    incorrect: number;
    results: ValidationResult[];
  } {
    const results = this.validateMultipleInputs(inputs, correctAnswers);
    const correct = results.filter((r) => r.isCorrect).length;
    const incorrect = results.filter((r) => !r.isCorrect).length;

    return {
      total: results.length,
      correct,
      incorrect,
      results,
    };
  }
}
