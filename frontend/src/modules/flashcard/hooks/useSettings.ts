import { useState, useCallback, useRef, useEffect } from "react";
import { SettingsController } from "../controllers/SettingsController";
import { UserSettings } from "@/core/api-client";
import { InputType } from "../types/AnswerTypes";

interface UseSettingsState {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  currentModule: string | null;
  settingsSummary: any;
}

interface UseSettingsReturn extends UseSettingsState {
  loadSettings: (moduleName: string) => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
  resetSettings: () => Promise<void>;
  getSettings: () => UserSettings | null;
  enableInputType: (inputType: InputType) => void;
  disableInputType: (inputType: InputType) => void;
  isInputTypeEnabled: (inputType: InputType) => boolean;
  getEnabledInputTypes: () => string[];
  setDisplayMode: (displayMode: string) => void;
  getDisplayMode: () => string;
  setPracticeMode: (practiceMode: string) => void;
  getPracticeMode: () => string;
  setDifficulty: (difficulty: string) => void;
  getDifficulty: () => string;
  toggleFeedback: () => void;
  isFeedbackEnabled: () => boolean;
  toggleStrictMode: () => void;
  isStrictModeEnabled: () => boolean;
  validateSettings: () => { isValid: boolean; errors: string[] };
  getSettingsSummary: () => any;
  applyPreset: (
    preset: "beginner" | "intermediate" | "advanced" | "custom",
  ) => void;
  saveCurrentSettings: () => Promise<void>;
  getMultipleSettings: (
    moduleNames: string[],
  ) => Promise<Record<string, UserSettings>>;
  updateMultipleSettings: (
    settingsMap: Record<string, UserSettings>,
  ) => Promise<void>;
  reset: () => void;
  getState: () => UseSettingsState;
}

export const useSettings = (): UseSettingsReturn => {
  const [state, setState] = useState<UseSettingsState>({
    settings: null,
    isLoading: false,
    error: null,
    currentModule: null,
    settingsSummary: {
      moduleName: "unknown",
      enabledInputTypes: [],
      displayMode: "mixed",
      practiceMode: "normal",
      difficulty: "beginner",
      feedbackEnabled: true,
      strictModeEnabled: false,
    },
  });

  const controllerRef = useRef<SettingsController | null>(null);

  // Initialize controller
  useEffect(() => {
    if (!controllerRef.current) {
      controllerRef.current = new SettingsController();
    }
  }, []);

  const updateState = useCallback((updates: Partial<UseSettingsState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback(
    (error: Error, context: string) => {
      console.error(`useSettings ${context}:`, error);
      updateState({
        error: `${context}: ${error.message}`,
        isLoading: false,
      });
    },
    [updateState],
  );

  const loadSettings = useCallback(
    async (moduleName: string) => {
      if (!controllerRef.current) return;

      try {
        updateState({ isLoading: true, error: null });

        await controllerRef.current.loadSettings(moduleName);

        const settings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings,
          currentModule: moduleName,
          settingsSummary: summary,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "loadSettings");
      }
    },
    [updateState, handleError],
  );

  const updateSettings = useCallback(
    async (settings: UserSettings) => {
      if (!controllerRef.current) return;

      try {
        updateState({ isLoading: true, error: null });

        await controllerRef.current.updateSettings(settings);

        const updatedSettings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings: updatedSettings,
          settingsSummary: summary,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "updateSettings");
      }
    },
    [updateState, handleError],
  );

  const resetSettings = useCallback(async () => {
    if (!controllerRef.current) return;

    try {
      updateState({ isLoading: true, error: null });

      await controllerRef.current.resetSettings();

      const settings = controllerRef.current.getSettings();
      const summary = controllerRef.current.getSettingsSummary();

      updateState({
        settings,
        settingsSummary: summary,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      handleError(error as Error, "resetSettings");
    }
  }, [updateState, handleError]);

  const getSettings = useCallback(() => {
    if (!controllerRef.current) return null;

    try {
      return controllerRef.current.getSettings();
    } catch (error) {
      handleError(error as Error, "getSettings");
      return null;
    }
  }, [handleError]);

  const enableInputType = useCallback(
    (inputType: InputType) => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.enableInputType(inputType);

        const settings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings,
          settingsSummary: summary,
        });
      } catch (error) {
        handleError(error as Error, "enableInputType");
      }
    },
    [updateState, handleError],
  );

  const disableInputType = useCallback(
    (inputType: InputType) => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.disableInputType(inputType);

        const settings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings,
          settingsSummary: summary,
        });
      } catch (error) {
        handleError(error as Error, "disableInputType");
      }
    },
    [updateState, handleError],
  );

  const isInputTypeEnabled = useCallback(
    (inputType: InputType) => {
      if (!controllerRef.current) return false;

      try {
        return controllerRef.current.isInputTypeEnabled(inputType);
      } catch (error) {
        handleError(error as Error, "isInputTypeEnabled");
        return false;
      }
    },
    [handleError],
  );

  const getEnabledInputTypes = useCallback(() => {
    if (!controllerRef.current) return [];

    try {
      return controllerRef.current.getEnabledInputTypes();
    } catch (error) {
      handleError(error as Error, "getEnabledInputTypes");
      return [];
    }
  }, [handleError]);

  const setDisplayMode = useCallback(
    (displayMode: string) => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.setDisplayMode(displayMode);

        const settings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings,
          settingsSummary: summary,
        });
      } catch (error) {
        handleError(error as Error, "setDisplayMode");
      }
    },
    [updateState, handleError],
  );

  const getDisplayMode = useCallback(() => {
    if (!controllerRef.current) return "mixed";

    try {
      return controllerRef.current.getDisplayMode();
    } catch (error) {
      handleError(error as Error, "getDisplayMode");
      return "mixed";
    }
  }, [handleError]);

  const setPracticeMode = useCallback(
    (practiceMode: string) => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.setPracticeMode(practiceMode);

        const settings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings,
          settingsSummary: summary,
        });
      } catch (error) {
        handleError(error as Error, "setPracticeMode");
      }
    },
    [updateState, handleError],
  );

  const getPracticeMode = useCallback(() => {
    if (!controllerRef.current) return "normal";

    try {
      return controllerRef.current.getPracticeMode();
    } catch (error) {
      handleError(error as Error, "getPracticeMode");
      return "normal";
    }
  }, [handleError]);

  const setDifficulty = useCallback(
    (difficulty: string) => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.setDifficulty(difficulty);

        const settings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings,
          settingsSummary: summary,
        });
      } catch (error) {
        handleError(error as Error, "setDifficulty");
      }
    },
    [updateState, handleError],
  );

  const getDifficulty = useCallback(() => {
    if (!controllerRef.current) return "beginner";

    try {
      return controllerRef.current.getDifficulty();
    } catch (error) {
      handleError(error as Error, "getDifficulty");
      return "beginner";
    }
  }, [handleError]);

  const toggleFeedback = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.toggleFeedback();

      const settings = controllerRef.current.getSettings();
      const summary = controllerRef.current.getSettingsSummary();

      updateState({
        settings,
        settingsSummary: summary,
      });
    } catch (error) {
      handleError(error as Error, "toggleFeedback");
    }
  }, [updateState, handleError]);

  const isFeedbackEnabled = useCallback(() => {
    if (!controllerRef.current) return true;

    try {
      return controllerRef.current.isFeedbackEnabled();
    } catch (error) {
      handleError(error as Error, "isFeedbackEnabled");
      return true;
    }
  }, [handleError]);

  const toggleStrictMode = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.toggleStrictMode();

      const settings = controllerRef.current.getSettings();
      const summary = controllerRef.current.getSettingsSummary();

      updateState({
        settings,
        settingsSummary: summary,
      });
    } catch (error) {
      handleError(error as Error, "toggleStrictMode");
    }
  }, [updateState, handleError]);

  const isStrictModeEnabled = useCallback(() => {
    if (!controllerRef.current) return false;

    try {
      return controllerRef.current.isStrictModeEnabled();
    } catch (error) {
      handleError(error as Error, "isStrictModeEnabled");
      return false;
    }
  }, [handleError]);

  const validateSettings = useCallback(() => {
    if (!controllerRef.current) {
      return { isValid: false, errors: ["No controller available"] };
    }

    try {
      return controllerRef.current.validateSettings();
    } catch (error) {
      handleError(error as Error, "validateSettings");
      return { isValid: false, errors: ["Validation error"] };
    }
  }, [handleError]);

  const getSettingsSummary = useCallback(() => {
    if (!controllerRef.current) {
      return {
        moduleName: "unknown",
        enabledInputTypes: [],
        displayMode: "mixed",
        practiceMode: "normal",
        difficulty: "beginner",
        feedbackEnabled: true,
        strictModeEnabled: false,
      };
    }

    try {
      return controllerRef.current.getSettingsSummary();
    } catch (error) {
      handleError(error as Error, "getSettingsSummary");
      return {
        moduleName: "unknown",
        enabledInputTypes: [],
        displayMode: "mixed",
        practiceMode: "normal",
        difficulty: "beginner",
        feedbackEnabled: true,
        strictModeEnabled: false,
      };
    }
  }, [handleError]);

  const applyPreset = useCallback(
    (preset: "beginner" | "intermediate" | "advanced" | "custom") => {
      if (!controllerRef.current) return;

      try {
        controllerRef.current.applyPreset(preset);

        const settings = controllerRef.current.getSettings();
        const summary = controllerRef.current.getSettingsSummary();

        updateState({
          settings,
          settingsSummary: summary,
        });
      } catch (error) {
        handleError(error as Error, "applyPreset");
      }
    },
    [updateState, handleError],
  );

  const saveCurrentSettings = useCallback(async () => {
    if (!controllerRef.current) return;

    try {
      updateState({ isLoading: true, error: null });

      await controllerRef.current.saveCurrentSettings();

      updateState({
        isLoading: false,
        error: null,
      });
    } catch (error) {
      handleError(error as Error, "saveCurrentSettings");
    }
  }, [updateState, handleError]);

  const getMultipleSettings = useCallback(
    async (moduleNames: string[]) => {
      if (!controllerRef.current) return {};

      try {
        return await controllerRef.current.getMultipleSettings(moduleNames);
      } catch (error) {
        handleError(error as Error, "getMultipleSettings");
        return {};
      }
    },
    [handleError],
  );

  const updateMultipleSettings = useCallback(
    async (settingsMap: Record<string, UserSettings>) => {
      if (!controllerRef.current) return;

      try {
        updateState({ isLoading: true, error: null });

        await controllerRef.current.updateMultipleSettings(settingsMap);

        updateState({
          isLoading: false,
          error: null,
        });
      } catch (error) {
        handleError(error as Error, "updateMultipleSettings");
      }
    },
    [updateState, handleError],
  );

  const reset = useCallback(() => {
    if (!controllerRef.current) return;

    try {
      controllerRef.current.reset();

      updateState({
        settings: null,
        isLoading: false,
        error: null,
        currentModule: null,
        settingsSummary: {
          moduleName: "unknown",
          enabledInputTypes: [],
          displayMode: "mixed",
          practiceMode: "normal",
          difficulty: "beginner",
          feedbackEnabled: true,
          strictModeEnabled: false,
        },
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
    loadSettings,
    updateSettings,
    resetSettings,
    getSettings,
    enableInputType,
    disableInputType,
    isInputTypeEnabled,
    getEnabledInputTypes,
    setDisplayMode,
    getDisplayMode,
    setPracticeMode,
    getPracticeMode,
    setDifficulty,
    getDifficulty,
    toggleFeedback,
    isFeedbackEnabled,
    toggleStrictMode,
    isStrictModeEnabled,
    validateSettings,
    getSettingsSummary,
    applyPreset,
    saveCurrentSettings,
    getMultipleSettings,
    updateMultipleSettings,
    reset,
    getState,
  };
};

export default useSettings;
