/**
 * Conjugation Validator - Handles verb conjugation validation
 */

import {
  ActivityValidator,
  AnswerSet,
  ConjugationForm,
  Verb,
} from "../core/ActivityValidator";
import { UserSettings } from "@/core/api-client";
import { ValidationResult } from "../core/ValidationResult";
import { ValidatorFactory } from "../factories/ValidatorFactory";

export class ConjugationValidator implements ActivityValidator {
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
    // For conjugation, we typically validate against hiragana or kanji
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

    return {
      isCorrect: false,
      feedback: ["Incorrect conjugation"],
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

    if (settings.input_hiragana) enabledTypes.push("hiragana");
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
   * Validate conjugation against specific conjugation form
   * @param userAnswer User's answer
   * @param correctConjugation Correct conjugation form
   * @returns ValidationResult
   */
  validateConjugation(
    userAnswer: string,
    correctConjugation: ConjugationForm,
  ): ValidationResult {
    const validator = this.validatorFactory.getValidator("hiragana");
    return validator.validate(userAnswer, correctConjugation.conjugation);
  }

  /**
   * Get conjugation forms for a verb
   * @param verb Verb to get conjugations for
   * @returns Array of conjugation forms
   */
  getConjugationForms(verb: Verb): ConjugationForm[] {
    return verb.conjugations;
  }

  /**
   * Validate multiple conjugations
   * @param inputs User inputs for different conjugations
   * @param correctConjugations Correct conjugations
   * @returns Array of ValidationResults
   */
  validateMultipleConjugations(
    inputs: Record<string, string>,
    correctConjugations: Record<string, ConjugationForm>,
  ): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const [conjugationType, userInput] of Object.entries(inputs)) {
      if (userInput.trim() && correctConjugations[conjugationType]) {
        const result = this.validateConjugation(
          userInput,
          correctConjugations[conjugationType],
        );
        results.push(result);
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

    if (answers.hiragana) types.push("hiragana");
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
      case "hiragana":
        return answers.hiragana || null;
      case "kanji":
        return answers.kanji || null;
      case "romaji":
        return answers.romaji || null;
      default:
        return null;
    }
  }

  /**
   * Validate conjugation with specific input type
   * @param userInput User input
   * @param expectedConjugation Expected conjugation
   * @param inputType Input type
   * @returns ValidationResult
   */
  validateConjugationWithType(
    userInput: string,
    expectedConjugation: string,
    inputType: string,
  ): ValidationResult {
    const validator = this.validatorFactory.getValidator(inputType);
    return validator.validate(userInput, expectedConjugation);
  }

  /**
   * Check if all conjugations are correct
   * @param inputs User inputs
   * @param correctConjugations Correct conjugations
   * @returns True if all conjugations are correct
   */
  areAllConjugationsCorrect(
    inputs: Record<string, string>,
    correctConjugations: Record<string, ConjugationForm>,
  ): boolean {
    const results = this.validateMultipleConjugations(
      inputs,
      correctConjugations,
    );
    return results.every((result) => result.isCorrect);
  }

  /**
   * Get conjugation validation summary
   * @param inputs User inputs
   * @param correctConjugations Correct conjugations
   * @returns Object with validation summary
   */
  getConjugationValidationSummary(
    inputs: Record<string, string>,
    correctConjugations: Record<string, ConjugationForm>,
  ): {
    total: number;
    correct: number;
    incorrect: number;
    results: ValidationResult[];
  } {
    const results = this.validateMultipleConjugations(
      inputs,
      correctConjugations,
    );
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
