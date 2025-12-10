/**
 * Activity Validator interfaces and types for learning activities
 */

import { ValidationResult } from "./ValidationResult";
import { UserSettings } from "@/core/api-client";

/**
 * Answer set containing correct answers for different input types
 */
export interface AnswerSet {
  english?: string | string[];
  hiragana?: string;
  katakana?: string;
  kanji?: string;
  romaji?: string;
}

/**
 * Conjugation form for verb conjugation validation
 */
export interface ConjugationForm {
  form: string;
  conjugation: string;
  reading?: string;
}

/**
 * Verb interface for conjugation validation
 */
export interface Verb {
  dictionary_form: string;
  reading: string;
  conjugations: ConjugationForm[];
}

/**
 * Activity Validator interface for learning activities
 * Connects input validators to specific learning activities
 */
export interface ActivityValidator {
  /**
   * Validate a single answer against correct answers
   * @param userAnswer User's answer
   * @param correctAnswers Set of correct answers
   * @returns ValidationResult
   */
  validateAnswer(
    userAnswer: string,
    correctAnswers: AnswerSet,
  ): ValidationResult;

  /**
   * Get enabled input types based on user settings
   * @param settings User settings
   * @returns Array of enabled input types
   */
  getEnabledInputTypes(settings: UserSettings): string[];

  /**
   * Validate multiple inputs against correct answers
   * @param inputs User inputs for different types
   * @param correctAnswers Set of correct answers
   * @returns Array of ValidationResults
   */
  validateMultipleInputs(
    inputs: Record<string, string>,
    correctAnswers: AnswerSet,
  ): ValidationResult[];
}
