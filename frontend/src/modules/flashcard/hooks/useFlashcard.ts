import { useState, useCallback, useRef, useEffect } from "react";
import { FlashcardController } from "../controllers/FlashcardController";
import { FlashcardItem } from "../types/FlashcardTypes";

interface UseFlashcardState {
  currentFlashcard: FlashcardItem | null;
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  totalCount: number;
  hasFlashcards: boolean;
}

interface UseFlashcardReturn extends UseFlashcardState {
  loadFlashcards: (moduleName: string) => Promise<void>;
  loadRandomFlashcard: (moduleName: string) => Promise<void>;
  nextFlashcard: () => void;
  previousFlashcard: () => void;
  skipFlashcard: () => void;
  jumpToFlashcard: (index: number) => boolean;
  jumpToFlashcardById: (id: string) => boolean;
  refreshFlashcards: () => Promise<void>;
  reset: () => void;
  getState: () => UseFlashcardState;
}

export const useFlashcard = (): UseFlashcardReturn => {
  const [state, setState] = useState<UseFlashcardState>({
    currentFlashcard: null,
    isLoading: false,
    error: null,
    currentIndex: 0,
    totalCount: 0,
    hasFlashcards: false,
  });

  const controllerRef = useRef<FlashcardController | null>(null);

  // Initialize controller
  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new FlashcardController();
    }
  }, []);

  const updateState = useCallback((updates: Partial<UseFlashcardState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: Error, context: string) => {
      console.error(`useFlashcard ${context}:`, error);
      updateState({
        error: `${context}: ${error.message}`,
        isLoading: false,
      });
    },
    [updateState],
  );

  const loadFlashcards = useCallback(
    async (moduleName: string) => {
      if (!controllerRef.current) return;

      try {
        updateState({ isLoading: true, error: null });

        await controllerRef.current.loadFlashcards(moduleName);

        const controllerState = controllerRef.current.getState();

        updateState({
          currentFlashcard: controllerState.currentFlashcard,
          currentIndex: controllerState.currentIndex,
          totalCount: controllerState.totalCount,
          hasFlashcards: controllerState.hasFlashcards,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "loadFlashcards");
      }
    },
    [updateState, handleError],
  );

  const loadRandomFlashcard = useCallback(
    async (moduleName: string) => {
      if (!controllerRef.current) return;

      try {
        updateState({ isLoading: true, error: null });

        await controllerRef.current.loadRandomFlashcard(moduleName);

        const controllerState = controllerRef.current.getState();

        updateState({
          currentFlashcard: controllerState.currentFlashcard,
          currentIndex: controllerState.currentIndex,
          totalCount: controllerState.totalCount,
          hasFlashcards: controllerState.hasFlashcards,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "loadRandomFlashcard");
      }
    },
    [updateState, handleError],
  );

  const nextFlashcard = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.nextFlashcard();

      const controllerState = controllerRef.current.getState();

      updateState({
        currentFlashcard: controllerState.currentFlashcard,
        currentIndex: controllerState.currentIndex,
      });
    } catch (error) {
      handleError(error as Error, "nextFlashcard");
    }
  }, [updateState, handleError]);

  const previousFlashcard = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.previousFlashcard();

      const controllerState = controllerRef.current.getState();

      updateState({
        currentFlashcard: controllerState.currentFlashcard,
        currentIndex: controllerState.currentIndex,
      });
    } catch (error) {
      handleError(error as Error, "previousFlashcard");
    }
  }, [updateState, handleError]);

  const skipFlashcard = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.skipFlashcard();

      const controllerState = controllerRef.current.getState();

      updateState({
        currentFlashcard: controllerState.currentFlashcard,
        currentIndex: controllerState.currentIndex,
      });
    } catch (error) {
      handleError(error as Error, "skipFlashcard");
    }
  }, [updateState, handleError]);

  const jumpToFlashcard = useCallback(
    (index: number) => {
      if (!controllerRef.current) return false;

      try {
        const success = controllerRef.current.jumpToFlashcard(index);

        if (success) {
          const controllerState = controllerRef.current.getState();

          updateState({
            currentFlashcard: controllerState.currentFlashcard,
            currentIndex: controllerState.currentIndex,
          });
        }

        return success;
      } catch (error) {
        handleError(error as Error, "jumpToFlashcard");
        return false;
      }
    },
    [updateState, handleError],
  );

  const jumpToFlashcardById = useCallback(
    (id: string) => {
      if (!controllerRef.current) return false;

      try {
        const success = controllerRef.current.jumpToFlashcardById(id);

        if (success) {
          const controllerState = controllerRef.current.getState();

          updateState({
            currentFlashcard: controllerState.currentFlashcard,
            currentIndex: controllerState.currentIndex,
          });
        }

        return success;
      } catch (error) {
        handleError(error as Error, "jumpToFlashcardById");
        return false;
      }
    },
    [updateState, handleError],
  );

  const refreshFlashcards = useCallback(async () => {
    if (!controllerRef.current) return;

    try {
      updateState({ isLoading: true, error: null });

      await controllerRef.current.refreshFlashcards();

      const controllerState = controllerRef.current.getState();

      updateState({
        currentFlashcard: controllerState.currentFlashcard,
        currentIndex: controllerState.currentIndex,
        totalCount: controllerState.totalCount,
        hasFlashcards: controllerState.hasFlashcards,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      handleError(error as Error, "refreshFlashcards");
    }
  }, [updateState, handleError]);

  const reset = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.reset();

      updateState({
        currentFlashcard: null,
        isLoading: false,
        error: null,
        currentIndex: 0,
        totalCount: 0,
        hasFlashcards: false,
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
    loadFlashcards,
    loadRandomFlashcard,
    nextFlashcard,
    previousFlashcard,
    skipFlashcard,
    jumpToFlashcard,
    jumpToFlashcardById,
    refreshFlashcards,
    reset,
    getState,
  };
};

export default useFlashcard;
