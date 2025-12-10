import { useRef, useCallback, useEffect, useState } from "react";
import { getEnabledInputModes } from "../utils/inputModeUtils";
import { UserSettings } from "@/core/api-client";

/**
 * Custom hook for input focus management
 */
export const useInputFocus = (settings: UserSettings, disabled: boolean) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  /**
   * Focus the first enabled input field
   */
  const focusFirstInput = useCallback(() => {
    if (disabled) return;

    const enabledModes = getEnabledInputModes(settings);
    const firstInputRef = inputRefs.current[enabledModes[0]];

    if (firstInputRef) {
      firstInputRef.focus();
      setFocusedField(enabledModes[0]);
    }
  }, [settings, disabled]);

  /**
   * Focus the next input field
   * @param currentField Current focused field
   */
  const focusNextInput = useCallback(
    (currentField: string) => {
      if (disabled) return;

      const enabledModes = getEnabledInputModes(settings);
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
    [settings, disabled],
  );

  /**
   * Focus the previous input field
   * @param currentField Current focused field
   */
  const focusPreviousInput = useCallback(
    (currentField: string) => {
      if (disabled) return;

      const enabledModes = getEnabledInputModes(settings);
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
    [settings, disabled],
  );

  /**
   * Clear focus from all input fields
   */
  const clearFocus = useCallback(() => {
    Object.values(inputRefs.current).forEach((ref) => {
      if (ref) {
        ref.blur();
      }
    });
    setFocusedField(null);
  }, []);

  /**
   * Set focus to a specific field
   * @param fieldName Name of the field to focus
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
   * @param event Keyboard event
   * @param currentField Current focused field
   * @param onSubmit Submit handler for ENTER key
   */
  const handleKeyboardNavigation = useCallback(
    (
      event: React.KeyboardEvent,
      currentField: string,
      onSubmit?: () => void,
    ) => {
      // Only handle ENTER key - no other keybindings allowed
      if (event.key === "Enter" && onSubmit) {
        event.preventDefault();
        onSubmit();
      }
      // All other keys (arrows, s, x, etc.) are ignored
    },
    [],
  );

  /**
   * Register input ref
   * @param fieldName Name of the field
   * @param ref Input element ref
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
