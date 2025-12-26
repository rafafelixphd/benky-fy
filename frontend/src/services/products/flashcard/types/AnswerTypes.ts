/**
 * AnswerTypes - Type definitions for answer system
 */

import { ValidationResult } from "@/core/validation/core/ValidationResult";

/**
 * Input type enumeration
 */
export enum InputType {
  HIRAGANA = "hiragana",
  KATAKANA = "katakana",
  ENGLISH = "english",
  KANJI = "kanji",
  ROMAJI = "romaji",
}

/**
 * Answer result interface
 */
export interface AnswerResult {
  id: string;
  flashcardId: string;
  userAnswer: string | Record<string, string>;
  isCorrect: boolean;
  matchedType?: InputType;
  convertedAnswer?: string;
  validationResult: ValidationResult;
  timestamp: Date;
  attempts: number;
  moduleName?: string;
  sessionId?: string;
}

/**
 * Answer submission interface
 */
export interface AnswerSubmission {
  flashcardId: string;
  userAnswer: string | Record<string, string>;
  inputTypes: InputType[];
  timestamp?: Date;
  sessionId?: string;
  moduleName?: string;
}

/**
 * Answer statistics interface
 */
export interface AnswerStatistics {
  totalAnswers: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  averageAttempts: number;
  mostCommonMistakes: Array<{
    flashcardId: string;
    mistake: string;
    count: number;
  }>;
  timeSpent: number; // in milliseconds
}

/**
 * Answer history interface
 */
export interface AnswerHistory {
  flashcardId: string;
  answers: AnswerResult[];
  totalAttempts: number;
  firstAttempt?: Date;
  lastAttempt?: Date;
  bestAttempt?: AnswerResult;
  averageAccuracy: number;
}

/**
 * Answer validation options interface
 */
export interface AnswerValidationOptions {
  enableServerValidation?: boolean;
  enableRealtimeFeedback?: boolean;
  strictMode?: boolean;
  allowPartialMatches?: boolean;
  timeoutMs?: number;
}

/**
 * Answer feedback interface
 */
export interface AnswerFeedback {
  isCorrect: boolean;
  message: string;
  suggestions?: string[];
  hints?: string[];
  encouragement?: string;
  colorClass?: string;
  iconClass?: string;
}
