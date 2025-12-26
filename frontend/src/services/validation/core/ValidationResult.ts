/**
 * Validation Result interface and utilities
 */

export interface ValidationResult {
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
  feedback?: string[];
  confidence?: number;
  normalizedInput?: string;
  normalizedExpected?: string;
  error?: string;
  // Legacy properties for backward compatibility
  results?: boolean[];
  feedbackColor?: string;
  timerDuration?: number;
}

/**
 * Create a successful validation result
 * @param matchedType Type that matched
 * @param convertedAnswer Converted answer
 * @param confidence Confidence level (0-1)
 * @returns ValidationResult for successful validation
 */
export function createSuccessResult(
  matchedType: string,
  convertedAnswer?: string,
  confidence: number = 1.0,
): ValidationResult {
  return {
    isCorrect: true,
    matchedType,
    convertedAnswer,
    confidence,
    feedback: ["Correct!"],
  };
}

/**
 * Create a failed validation result
 * @param feedback Error feedback messages
 * @param error Optional error message
 * @returns ValidationResult for failed validation
 */
export function createFailureResult(
  feedback: string[] = ["Incorrect"],
  error?: string,
): ValidationResult {
  return {
    isCorrect: false,
    feedback,
    error,
    confidence: 0,
  };
}

/**
 * Create a partial validation result
 * @param matchedType Type that partially matched
 * @param feedback Partial match feedback
 * @param confidence Confidence level (0-1)
 * @returns ValidationResult for partial validation
 */
export function createPartialResult(
  matchedType: string,
  feedback: string[],
  confidence: number = 0.5,
): ValidationResult {
  return {
    isCorrect: false,
    matchedType,
    feedback,
    confidence,
  };
}
