import { useState, useCallback, useRef, useEffect } from "react";
import { AnswerController } from "../controllers/AnswerController";
import { ValidationResult } from "@/core/validation/core/ValidationResult";
import { AnswerFeedback } from "../types/AnswerTypes";
import { FlashcardItem } from "../types/FlashcardTypes";

interface UseAnswerState {
  userAnswer: string;
  validationResult: ValidationResult | null;
  isSubmitting: boolean;
  showFeedback: boolean;
  currentAnswer: any | null;
  answerHistory: any[];
  sessionId: string;
  error: string | null;
}

interface UseAnswerReturn extends UseAnswerState {
  submitAnswer: (answer: string) => Promise<void>;
  validateAnswer: (answer: string) => ValidationResult;
  clearAnswer: () => void;
  getAnswerFeedback: () => AnswerFeedback;
  setCurrentFlashcard: (flashcard: FlashcardItem) => void;
  isCurrentAnswerCorrect: () => boolean;
  getAnswerStatistics: () => any;
  getCommonMistakes: () => any[];
  getAnswerHistoryForFlashcard: (flashcardId: string) => any[];
  getLatestAnswerForCurrentFlashcard: () => any | null;
  hasAnswerForCurrentFlashcard: () => boolean;
  getAnswerAttemptsForCurrentFlashcard: () => number;
  reset: () => void;
  getState: () => UseAnswerState;
}

export const useAnswer = (): UseAnswerReturn => {
  const [state, setState] = useState<UseAnswerState>({
    userAnswer: "",
    validationResult: null,
    isSubmitting: false,
    showFeedback: false,
    currentAnswer: null,
    answerHistory: [],
    sessionId: "",
    error: null,
  });

  const controllerRef = useRef<AnswerController | null>(null);

  // Initialize controller
  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new AnswerController();
      setState((prev) => ({
        ...prev,
        sessionId: controllerRef.current?.getSessionId() || "",
      }));
    }
  }, []);

  const updateState = useCallback((updates: Partial<UseAnswerState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: Error, context: string) => {
      console.error(`useAnswer ${context}:`, error);
      updateState({
        error: `${context}: ${error.message}`,
        isSubmitting: false,
      });
    },
    [updateState],
  );

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!controllerRef.current) return;

      try {
        updateState({
          isSubmitting: true,
          error: null,
          userAnswer: answer,
        });

        await controllerRef.current.submitAnswer(answer);

        const validationResult = controllerRef.current.validateAnswer(answer);
        const feedback = controllerRef.current.getAnswerFeedback();
        const currentAnswer = controllerRef.current.getCurrentAnswer();
        const answerHistory = controllerRef.current.getAnswerHistory();

        updateState({
          validationResult,
          showFeedback: true,
          currentAnswer,
          answerHistory,
          isSubmitting: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "submitAnswer");
      }
    },
    [updateState, handleError],
  );

  const validateAnswer = useCallback(
    (answer: string) => {
      if (!controllerRef.current) {
        return {
          isCorrect: false,
          feedback: ["No controller available for validation"],
        };
      }

      try {
        const validationResult = controllerRef.current.validateAnswer(answer);

        updateState({
          validationResult,
          userAnswer: answer,
        });

        return validationResult;
      } catch (error) {
        handleError(error as Error, "validateAnswer");
        return {
          isCorrect: false,
          feedback: [
            `Validation error: ${error instanceof Error ? error.message : "Unknown error"}`,
          ],
        };
      }
    },
    [updateState, handleError],
  );

  const clearAnswer = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.clearAnswer();

      updateState({
        userAnswer: "",
        validationResult: null,
        showFeedback: false,
        currentAnswer: null,
      });
    } catch (error) {
      handleError(error as Error, "clearAnswer");
    }
  }, [updateState, handleError]);

  const getAnswerFeedback = useCallback(() => {
    if (!controllerRef.current) {
      return {
        isCorrect: false,
        message: "No controller available",
        colorClass: "text-gray-500",
        iconClass: "question-circle",
      };
    }

    try {
      return controllerRef.current.getAnswerFeedback();
    } catch (error) {
      handleError(error as Error, "getAnswerFeedback");
      return {
        isCorrect: false,
        message: "Error getting feedback",
        colorClass: "text-red-500",
        iconClass: "exclamation-circle",
      };
    }
  }, [handleError]);

  const setCurrentFlashcard = useCallback(
    (flashcard: FlashcardItem) => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.setCurrentFlashcard(flashcard);

        // Clear previous answer when changing flashcard
        updateState({
          userAnswer: "",
          validationResult: null,
          showFeedback: false,
          currentAnswer: null,
        });
      } catch (error) {
        handleError(error as Error, "setCurrentFlashcard");
      }
    },
    [updateState, handleError],
  );

  const isCurrentAnswerCorrect = useCallback(() => {
    if (!controllerRef.current) return false;

    try {
      return controllerRef.current.isCurrentAnswerCorrect();
    } catch (error) {
      handleError(error as Error, "isCurrentAnswerCorrect");
      return false;
    }
  }, [handleError]);

  const getAnswerStatistics = useCallback(() => {
    if (!controllerRef.current) {
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        averageAttempts: 0,
      };
    }

    try {
      return controllerRef.current.getAnswerStatistics();
    } catch (error) {
      handleError(error as Error, "getAnswerStatistics");
      return {
        totalAnswers: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        averageAttempts: 0,
      };
    }
  }, [handleError]);

  const getCommonMistakes = useCallback(() => {
    if (!controllerRef.current) return [];

    try {
      return controllerRef.current.getCommonMistakes();
    } catch (error) {
      handleError(error as Error, "getCommonMistakes");
      return [];
    }
  }, [handleError]);

  const getAnswerHistoryForFlashcard = useCallback(
    (flashcardId: string) => {
      if (!controllerRef.current) return [];

      try {
        return controllerRef.current.getAnswerHistoryForFlashcard(flashcardId);
      } catch (error) {
        handleError(error as Error, "getAnswerHistoryForFlashcard");
        return [];
      }
    },
    [handleError],
  );

  const getLatestAnswerForCurrentFlashcard = useCallback(() => {
    if (!controllerRef.current) return null;

    try {
      return controllerRef.current.getLatestAnswerForCurrentFlashcard();
    } catch (error) {
      handleError(error as Error, "getLatestAnswerForCurrentFlashcard");
      return null;
    }
  }, [handleError]);

  const hasAnswerForCurrentFlashcard = useCallback(() => {
    if (!controllerRef.current) return false;

    try {
      return controllerRef.current.hasAnswerForCurrentFlashcard();
    } catch (error) {
      handleError(error as Error, "hasAnswerForCurrentFlashcard");
      return false;
    }
  }, [handleError]);

  const getAnswerAttemptsForCurrentFlashcard = useCallback(() => {
    if (!controllerRef.current) return 0;

    try {
      return controllerRef.current.getAnswerAttemptsForCurrentFlashcard();
    } catch (error) {
      handleError(error as Error, "getAnswerAttemptsForCurrentFlashcard");
      return 0;
    }
  }, [handleError]);

  const reset = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.reset();

      updateState({
        userAnswer: "",
        validationResult: null,
        isSubmitting: false,
        showFeedback: false,
        currentAnswer: null,
        answerHistory: [],
        sessionId: controllerRef.current.getSessionId(),
      });
    } catch (error) {
      handleError(error as Error, "reset");
    }
  }, [updateState, handleError]);

  const getState = useCallback(() => {
    return { ...state };
  }, [state]);

  return {
    ...state,
    submitAnswer,
    validateAnswer,
    clearAnswer,
    getAnswerFeedback,
    setCurrentFlashcard,
    isCurrentAnswerCorrect,
    getAnswerStatistics,
    getCommonMistakes,
    getAnswerHistoryForFlashcard,
    getLatestAnswerForCurrentFlashcard,
    hasAnswerForCurrentFlashcard,
    getAnswerAttemptsForCurrentFlashcard,
    reset,
    getState,
  };
};

export default useAnswer;
