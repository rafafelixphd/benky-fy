import { ValidationResult } from "@/core/validation/core/ValidationResult";

/**
 * Format validation result for display
 * @param result ValidationResult object
 * @returns Formatted validation message
 */
export const formatValidationResult = (result: ValidationResult): string => {
  if (result.isCorrect) {
    return result.feedback?.[0] || "Correct!";
  }

  if (result.feedback && result.feedback.length > 0) {
    return result.feedback.join(", ");
  }

  return "Incorrect answer";
};

/**
 * Get validation message for display
 * @param result ValidationResult object
 * @param showDetails Whether to show detailed feedback
 * @returns Validation message string
 */
export const getValidationMessage = (
  result: ValidationResult,
  showDetails: boolean = true,
): string => {
  if (!result) return "";

  if (result.isCorrect) {
    return result.feedback?.[0] || "Correct!";
  }

  if (showDetails && result.feedback && result.feedback.length > 0) {
    return result.feedback.join(", ");
  }

  return "Incorrect";
};

/**
 * Determine if validation should be shown
 * @param result ValidationResult object
 * @param showFeedback Whether feedback is enabled
 * @param timerDuration Timer duration for feedback display
 * @returns True if validation should be shown
 */
export const shouldShowValidation = (
  result: ValidationResult | null,
  showFeedback: boolean,
  timerDuration: number,
): boolean => {
  return showFeedback && result !== null && timerDuration > 0;
};

/**
 * Get validation styling classes
 * @param result ValidationResult object
 * @returns CSS classes for validation styling
 */
export const getValidationClasses = (
  result: ValidationResult | null,
): string => {
  if (!result) return "";

  if (result.isCorrect) {
    return "border-green-500 bg-green-50 text-green-700";
  }

  return "border-red-500 bg-red-50 text-red-700";
};

/**
 * Get feedback color for validation result
 * @param result ValidationResult object
 * @returns Feedback color string
 */
export const getFeedbackColor = (result: ValidationResult | null): string => {
  if (!result) return "";

  if (result.isCorrect) {
    return "text-green-600";
  }

  return "text-red-600";
};

/**
 * Check if validation result indicates success
 * @param result ValidationResult object
 * @returns True if validation was successful
 */
export const isValidationSuccessful = (
  result: ValidationResult | null,
): boolean => {
  return result?.isCorrect === true;
};

/**
 * Get timer duration for feedback display
 * @param result ValidationResult object
 * @returns Timer duration in milliseconds
 */
export const getFeedbackTimerDuration = (
  result: ValidationResult | null,
): number => {
  if (!result) return 0;

  if (result.isCorrect) {
    return 3000; // 3 seconds for correct answers
  }

  return 5000; // 5 seconds for incorrect answers
};
