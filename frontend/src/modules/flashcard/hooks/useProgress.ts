import { useState, useCallback, useRef, useEffect } from "react";
import { ProgressController } from "../controllers/ProgressController";
import {
  ProgressData,
  ProgressMetrics,
  ProgressSummary,
} from "../types/ProgressTypes";
import { AnswerResult } from "../types/AnswerTypes";

interface UseProgressState {
  progress: ProgressData | null;
  metrics: ProgressMetrics | null;
  isLoading: boolean;
  error: string | null;
  currentModule: string | null;
  sessionStatistics: any;
  progressInsights: any[];
}

interface UseProgressReturn extends UseProgressState {
  updateProgress: (answerResult: AnswerResult) => Promise<void>;
  getProgress: () => ProgressData | null;
  getProgressMetrics: () => Promise<ProgressMetrics | null>;
  resetProgress: () => Promise<void>;
  loadProgress: (moduleName: string) => Promise<void>;
  setCurrentModule: (moduleName: string) => void;
  getProgressSummary: () => ProgressSummary | null;
  getSessionStatistics: () => any;
  getProgressInsights: () => any[];
  getCompletionPercentage: () => number;
  getAccuracy: () => number;
  getStreakDays: () => number;
  getTotalTimeSpent: () => number;
  isModuleCompleted: () => boolean;
  isModuleMastered: () => boolean;
  reset: () => void;
  getState: () => UseProgressState;
}

export const useProgress = (): UseProgressReturn => {
  const [state, setState] = useState<UseProgressState>({
    progress: null,
    metrics: null,
    isLoading: false,
    error: null,
    currentModule: null,
    sessionStatistics: {
      sessionDuration: 0,
      itemsCompleted: 0,
      accuracy: 0,
      averageTimePerItem: 0,
    },
    progressInsights: [],
  });

  const controllerRef = useRef<ProgressController | null>(null);

  // Initialize controller
  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new ProgressController();
    }
  }, []);

  const updateState = useCallback((updates: Partial<UseProgressState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: Error, context: string) => {
      console.error(`useProgress ${context}:`, error);
      updateState({
        error: `${context}: ${error.message}`,
        isLoading: false,
      });
    },
    [updateState],
  );

  const updateProgress = useCallback(
    async (answerResult: AnswerResult) => {
      if (!controllerRef.current) return;

      try {
        updateState({ isLoading: true, error: null });

        await controllerRef.current.updateProgress(answerResult);

        const progress = controllerRef.current.getProgress();
        const sessionStats = controllerRef.current.getSessionStatistics();
        const insights = controllerRef.current.getProgressInsights();

        updateState({
          progress,
          sessionStatistics: sessionStats,
          progressInsights: insights,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "updateProgress");
      }
    },
    [updateState, handleError],
  );

  const getProgress = useCallback(() => {
    if (!controllerRef.current) return null;

    try {
      return controllerRef.current.getProgress();
    } catch (error) {
      handleError(error as Error, "getProgress");
      return null;
    }
  }, [handleError]);

  const getProgressMetrics = useCallback(async () => {
    if (!controllerRef.current) return null;

    try {
      updateState({ isLoading: true, error: null });

      const metrics = await controllerRef.current.getProgressMetrics();

      updateState({
        metrics,
        isLoading: false,
        error: null,
      });

      return metrics;
    } catch (error) {
      handleError(error as Error, "getProgressMetrics");
      return null;
    }
  }, [updateState, handleError]);

  const resetProgress = useCallback(async () => {
    if (!controllerRef.current) return;

    try {
      updateState({ isLoading: true, error: null });

      await controllerRef.current.resetProgress();

      const progress = controllerRef.current.getProgress();
      const sessionStats = controllerRef.current.getSessionStatistics();
      const insights = controllerRef.current.getProgressInsights();

      updateState({
        progress,
        sessionStatistics: sessionStats,
        progressInsights: insights,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      handleError(error as Error, "resetProgress");
    }
  }, [updateState, handleError]);

  const loadProgress = useCallback(
    async (moduleName: string) => {
      if (!controllerRef.current) return;

      try {
        updateState({ isLoading: true, error: null });

        await controllerRef.current.loadProgress(moduleName);

        const progress = controllerRef.current.getProgress();
        const sessionStats = controllerRef.current.getSessionStatistics();
        const insights = controllerRef.current.getProgressInsights();

        updateState({
          progress,
          currentModule: moduleName,
          sessionStatistics: sessionStats,
          progressInsights: insights,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "loadProgress");
      }
    },
    [updateState, handleError],
  );

  const setCurrentModule = useCallback(
    (moduleName: string) => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.setCurrentModule(moduleName);
        updateState({ currentModule: moduleName });
      } catch (error) {
        handleError(error as Error, "setCurrentModule");
      }
    },
    [updateState, handleError],
  );

  const getProgressSummary = useCallback(() => {
    if (!controllerRef.current) return null;

    try {
      return controllerRef.current.getProgressSummary();
    } catch (error) {
      handleError(error as Error, "getProgressSummary");
      return null;
    }
  }, [handleError]);

  const getSessionStatistics = useCallback(() => {
    if (!controllerRef.current) {
      return {
        sessionDuration: 0,
        itemsCompleted: 0,
        accuracy: 0,
        averageTimePerItem: 0,
      };
    }

    try {
      return controllerRef.current.getSessionStatistics();
    } catch (error) {
      handleError(error as Error, "getSessionStatistics");
      return {
        sessionDuration: 0,
        itemsCompleted: 0,
        accuracy: 0,
        averageTimePerItem: 0,
      };
    }
  }, [handleError]);

  const getProgressInsights = useCallback(() => {
    if (!controllerRef.current) return [];

    try {
      return controllerRef.current.getProgressInsights();
    } catch (error) {
      handleError(error as Error, "getProgressInsights");
      return [];
    }
  }, [handleError]);

  const getCompletionPercentage = useCallback(() => {
    if (!controllerRef.current) return 0;

    try {
      return controllerRef.current.getCompletionPercentage();
    } catch (error) {
      handleError(error as Error, "getCompletionPercentage");
      return 0;
    }
  }, [handleError]);

  const getAccuracy = useCallback(() => {
    if (!controllerRef.current) return 0;

    try {
      return controllerRef.current.getAccuracy();
    } catch (error) {
      handleError(error as Error, "getAccuracy");
      return 0;
    }
  }, [handleError]);

  const getStreakDays = useCallback(() => {
    if (!controllerRef.current) return 0;

    try {
      return controllerRef.current.getStreakDays();
    } catch (error) {
      handleError(error as Error, "getStreakDays");
      return 0;
    }
  }, [handleError]);

  const getTotalTimeSpent = useCallback(() => {
    if (!controllerRef.current) return 0;

    try {
      return controllerRef.current.getTotalTimeSpent();
    } catch (error) {
      handleError(error as Error, "getTotalTimeSpent");
      return 0;
    }
  }, [handleError]);

  const isModuleCompleted = useCallback(() => {
    if (!controllerRef.current) return false;

    try {
      return controllerRef.current.isModuleCompleted();
    } catch (error) {
      handleError(error as Error, "isModuleCompleted");
      return false;
    }
  }, [handleError]);

  const isModuleMastered = useCallback(() => {
    if (!controllerRef.current) return false;

    try {
      return controllerRef.current.isModuleMastered();
    } catch (error) {
      handleError(error as Error, "isModuleMastered");
      return false;
    }
  }, [handleError]);

  const reset = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.reset();

      updateState({
        progress: null,
        metrics: null,
        isLoading: false,
        error: null,
        currentModule: null,
        sessionStatistics: {
          sessionDuration: 0,
          itemsCompleted: 0,
          accuracy: 0,
          averageTimePerItem: 0,
        },
        progressInsights: [],
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
    updateProgress,
    getProgress,
    getProgressMetrics,
    resetProgress,
    loadProgress,
    setCurrentModule,
    getProgressSummary,
    getSessionStatistics,
    getProgressInsights,
    getCompletionPercentage,
    getAccuracy,
    getStreakDays,
    getTotalTimeSpent,
    isModuleCompleted,
    isModuleMastered,
    reset,
    getState,
  };
};

export default useProgress;
