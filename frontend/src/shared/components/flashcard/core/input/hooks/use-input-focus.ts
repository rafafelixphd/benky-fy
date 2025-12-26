import { useRef, useCallback, useEffect, useState } from "react";
import { UserSettings } from "@/core/api-client";
import { getModuleType } from "../helpers/module-type";

interface InputFocusState {
  focusedField: string | null;
  inputRefs: Record<string, HTMLInputElement | null>;
}

const getEnabledInputModes = (settings: UserSettings, moduleName?: string) => {
  const moduleType = getModuleType(moduleName);
  const modes = [];

  if (settings.input_hiragana) modes.push("hiragana");
  if (settings.input_katakana && moduleType.hasKatakana) modes.push("katakana");
  if (settings.input_kanji && moduleType.hasKanji) modes.push("kanji");
  if (settings.input_english) modes.push("english");
  if (settings.input_romaji) modes.push("romaji");

  return modes;
};

/**
 * Custom hook for input focus management
 */
export const useInputFocus = (settings: UserSettings, disabled: boolean, moduleName?: string) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  /**
   * Focus the first enabled input field
   */
  const focusFirstInput = useCallback(() => {
    if (disabled) return;

    const enabledModes = getEnabledInputModes(settings, moduleName);
    const firstInputRef = inputRefs.current[enabledModes[0]];

    if (firstInputRef) {
      firstInputRef.focus();
      setFocusedField(enabledModes[0]);
    }
  }, [settings, disabled, moduleName]);

  /**
   * Focus the next input field
   */
  const focusNextInput = useCallback(
    (currentField: string) => {
      if (disabled) return;

      const enabledModes = getEnabledInputModes(settings, moduleName);
      const currentIndex = enabledModes.indexOf(currentField);

      if (currentIndex !== -1 && currentIndex < enabledModes.length - 1) {
        const nextField = enabledModes[currentIndex + 1];
        const nextInputRef = inputRefs.current[nextField];

        if (nextInputRef) {
          nextInputRef.focus();
          setFocusedField(nextField);
        }
      }
    },
    [settings, disabled, moduleName],
  );

  /**
   * Focus the previous input field
   */
  const focusPreviousInput = useCallback(
    (currentField: string) => {
      if (disabled) return;

      const enabledModes = getEnabledInputModes(settings, moduleName);
      const currentIndex = enabledModes.indexOf(currentField);

      if (currentIndex > 0) {
        const prevField = enabledModes[currentIndex - 1];
        const prevInputRef = inputRefs.current[prevField];

        if (prevInputRef) {
          prevInputRef.focus();
          setFocusedField(prevField);
        }
      }
    },
    [settings, disabled, moduleName],
  );

  /**
   * Clear focus from all input fields
   */
  const clearFocus = useCallback(() => {
    Object.values(inputRefs.current).forEach((ref) => {
      if (ref) ref.blur();
    });
    setFocusedField(null);
  }, []);

  /**
   * Set focus to a specific field
   */
  const focusField = useCallback(
    (fieldName: string) => {
      if (disabled) return;

      const inputRef = inputRefs.current[fieldName];
      if (inputRef) {
        inputRef.focus();
        setFocusedField(fieldName);
      }
    },
    [disabled],
  );

  /**
   * Handle keyboard navigation - ONLY ENTER key allowed
   */
  const handleKeyboardNavigation = useCallback(
    (
      event: React.KeyboardEvent,
      currentField: string,
      onSubmit?: () => void,
    ) => {
      if (event.key === "Enter" && onSubmit) {
        event.preventDefault();
        onSubmit();
      }
    },
    [],
  );

  /**
   * Register input ref
   */
  const registerInputRef = useCallback(
    (fieldName: string, ref: HTMLInputElement | null) => {
      inputRefs.current[fieldName] = ref;
    },
    [],
  );

  // Auto-focus first input when component mounts or settings change
  useEffect(() => {
    if (!disabled) {
      const timer = setTimeout(focusFirstInput, 100);
      return () => clearTimeout(timer);
    }
  }, [disabled, focusFirstInput]);

  return {
    inputRefs,
    focusedField,
    focusFirstInput,
    focusNextInput,
    focusPreviousInput,
    clearFocus,
    focusField,
    handleKeyboardNavigation,
    registerInputRef,
  };
};
