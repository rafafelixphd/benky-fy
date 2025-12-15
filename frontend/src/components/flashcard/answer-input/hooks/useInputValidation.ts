import { useState, useCallback } from "react";
import { ValidationResult } from "@/core/validation/core/ValidationResult";
import { ModuleValidatorFactory } from "@/core/validation/factories/ModuleValidatorFactory";
import { AnswerSet } from "@/core/validation/core/ActivityValidator";
import { FlashcardItem, UserSettings } from "@/core/api-client";

/**
 * Custom hook for input validation logic
 */
export const useInputValidation = () => {
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [frontendValidationResult, setFrontendValidationResult] =
    useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate input using the new validation system
   * @param userAnswer User's input answer
   * @param currentItem Current flashcard item
   * @param settings User settings
   * @param moduleName Module name
   * @returns ValidationResult
   */
  const validateInput = useCallback(
    async (
      userAnswer: string | Record<string, string>,
      currentItem: FlashcardItem,
      settings: UserSettings,
      moduleName?: string,
    ): Promise<ValidationResult> => {
      if (!currentItem) {
        return {
          isCorrect: false,
          feedback: ["No current item to validate against"],
        };
      }

      setIsValidating(true);

      try {
        // Create module-specific validator
        const factory = new ModuleValidatorFactory();
        const moduleValidator = factory.createModuleValidator(
          moduleName || "colors",
        );

        // Convert FlashcardItem to AnswerSet
        const answerSet: AnswerSet = {
          english: currentItem.english,
          hiragana: currentItem.hiragana,
          katakana: currentItem.katakana,
          kanji: currentItem.kanji,
        };

        // Validate based on input type
        let result: ValidationResult;
        if (typeof userAnswer === "string") {
          result = moduleValidator.validateAnswer(userAnswer, answerSet);
        } else {
          // Multiple inputs - validate each one
          const results = moduleValidator.validateMultipleInputs(
            userAnswer,
            answerSet,
          );
          const allCorrect = results.every(
            (r: ValidationResult) => r.isCorrect,
          );
          result = {
            isCorrect: allCorrect,
            feedback: allCorrect
              ? ["All inputs correct!"]
              : ["Some inputs are incorrect"],
          };
        }

        setValidationResult(result);
        setFrontendValidationResult(result);
        return result;
      } catch (error) {
        const errorResult: ValidationResult = {
          isCorrect: false,
          feedback: [
            `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
          ],
        };
        setValidationResult(errorResult);
        return errorResult;
      } finally {
        setIsValidating(false);
      }
    },
    [],
  );

  /**
   * Get current validation result
   * @returns Current ValidationResult or null
   */
  const getValidationResult = useCallback((): ValidationResult | null => {
    return validationResult;
  }, [validationResult]);

  /**
   * Clear validation results
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setFrontendValidationResult(null);
  }, []);

  /**
   * Check if validation is currently in progress
   * @returns True if validation is in progress
   */
  const isValidationInProgress = useCallback((): boolean => {
    return isValidating;
  }, [isValidating]);

  return {
    validateInput,
    getValidationResult,
    clearValidation,
    isValidationInProgress,
    validationResult,
    frontendValidationResult,
    isValidating,
  };
};
