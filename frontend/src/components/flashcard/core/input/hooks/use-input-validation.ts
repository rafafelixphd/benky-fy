import { useState, useCallback } from "react";
import { ValidationResult } from "@/core/validation/core/ValidationResult";
import { ModuleValidatorFactory } from "@/core/validation/factories/ModuleValidatorFactory";
import { AnswerSet } from "@/core/validation/core/ActivityValidator";
import { FlashcardItem, UserSettings } from "@/core/api-client";

interface ValidationState {
  validationResult: ValidationResult | null;
  frontendValidationResult: ValidationResult | null;
  isValidating: boolean;
}

/**
 * Custom hook for input validation logic
 */
export const useInputValidation = () => {
  const [state, setState] = useState<ValidationState>({
    validationResult: null,
    frontendValidationResult: null,
    isValidating: false,
  });

  /**
   * Validate input using the validation system
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

      setState(prev => ({ ...prev, isValidating: true }));

      try {
        const factory = new ModuleValidatorFactory();
        const moduleValidator = factory.createModuleValidator(moduleName || "colors");

        const answerSet: AnswerSet = {
          english: currentItem.english,
          hiragana: currentItem.hiragana,
          katakana: currentItem.katakana,
          kanji: currentItem.kanji,
        };

        const result = typeof userAnswer === "string"
          ? moduleValidator.validateAnswer(userAnswer, answerSet)
          : validateMultipleInputs(moduleValidator, userAnswer, answerSet);

        setState(prev => ({
          ...prev,
          validationResult: result,
          frontendValidationResult: result,
          isValidating: false,
        }));

        return result;
      } catch (error) {
        const errorResult: ValidationResult = {
          isCorrect: false,
          feedback: [
            `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
          ],
        };
        setState(prev => ({
          ...prev,
          validationResult: errorResult,
          isValidating: false,
        }));
        return errorResult;
      }
    },
    [],
  );

  const validateMultipleInputs = (
    moduleValidator: any,
    userAnswers: Record<string, string>,
    answerSet: AnswerSet,
  ): ValidationResult => {
    const results = moduleValidator.validateMultipleInputs(userAnswers, answerSet);
    const allCorrect = results.every((r: ValidationResult) => r.isCorrect);
    
    return {
      isCorrect: allCorrect,
      feedback: allCorrect ? ["All inputs correct!"] : ["Some inputs are incorrect"],
      results, // Keep individual results for detailed feedback
    };
  };

  /**
   * Get current validation result
   */
  const getValidationResult = useCallback((): ValidationResult | null => {
    return state.validationResult;
  }, [state.validationResult]);

  /**
   * Clear validation results
   */
  const clearValidation = useCallback(() => {
    setState(prev => ({
      ...prev,
      validationResult: null,
      frontendValidationResult: null,
    }));
  }, []);

  return {
    validateInput,
    getValidationResult,
    clearValidation,
    isValidationInProgress: state.isValidating,
    ...state,
  };
};
