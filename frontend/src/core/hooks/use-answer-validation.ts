import { useState, useCallback } from "react";
import { FlashcardItem, ValidationRequest } from "@/core/api-client";
import { useValidateInput } from "@/core/hooks";
import { validateAnswer, validateWithSettings } from "@/core/validation";
import { ValidationResult } from "@/core/validation/core/ValidationResult";

interface UseAnswerValidationProps {
  enableServerValidation: boolean;
  enableRealtimeFeedback: boolean;
  currentItem?: FlashcardItem;
}

export function useAnswerValidation({
  enableServerValidation,
  enableRealtimeFeedback,
  currentItem,
}: UseAnswerValidationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [frontendValidationResult, setFrontendValidationResult] =
    useState<ValidationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const validateInputMutation = useValidateInput();

  const validateWithServer = useCallback(
    async (userInput: string, expectedCharacter: string) => {
      if (!enableServerValidation || !currentItem) return null;

      try {
        const validationRequest = {
          character: expectedCharacter,
          input: userInput,
          type: "hiragana" as const,
          moduleName: currentItem.id.split("_")[0],
        };

        const result =
          await validateInputMutation.mutateAsync(validationRequest);
        return result;
      } catch (error) {
        console.error("Server validation failed:", error);
        return null;
      }
    },
    [enableServerValidation, currentItem, validateInputMutation],
  );

  const performValidation = useCallback(
    async (answers: Record<string, string>, enabledModes: string[]) => {
      const isMultipleInput = enabledModes.length > 1;
      let serverValidationResult = null;
      let frontendResult: ValidationResult | null = null;

      // Perform frontend validation first
      if (currentItem) {
        if (isMultipleInput) {
          frontendResult = validateWithSettings(
            answers,
            currentItem,
            enabledModes,
          );
        } else {
          const firstAnswer = answers[enabledModes[0]] || "";
          frontendResult = validateAnswer(firstAnswer, currentItem, {
            input_english: true,
            input_hiragana: true,
            input_katakana: false,
            input_kanji: false,
            input_romaji: false,
          });
        }

        setFrontendValidationResult(frontendResult);
      }

      // Perform server-side validation if enabled
      if (enableServerValidation && currentItem) {
        const firstAnswer = answers[enabledModes[0]] || "";
        const expectedCharacter = (
          currentItem.hiragana ||
          currentItem.kanji ||
          currentItem.english ||
          ""
        ).toString();
        serverValidationResult = await validateWithServer(
          firstAnswer.trim(),
          expectedCharacter,
        );
        if (serverValidationResult) {
          setValidationResult(serverValidationResult);
        }
      }

      return { serverValidationResult, frontendResult };
    },
    [currentItem, enableServerValidation, validateWithServer],
  );

  const resetValidation = useCallback(() => {
    setShowFeedback(false);
    setValidationResult(null);
    setFrontendValidationResult(null);
    setIsSubmitting(false);
  }, []);

  const showValidationFeedback = useCallback(() => {
    if (enableRealtimeFeedback) {
      setShowFeedback(true);
    }
  }, [enableRealtimeFeedback]);

  return {
    isSubmitting,
    setIsSubmitting,
    validationResult,
    frontendValidationResult,
    showFeedback,
    performValidation,
    resetValidation,
    showValidationFeedback,
  };
}
