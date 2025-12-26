"use client";

import React, { useState, useCallback } from "react";
import { UserSettings, FlashcardItem } from "@/core/api-client";
import { MultiInputTable } from "./components/MultiInputTable";
import { SubmitButton } from "./components/SubmitButton";
import { useInputValidation } from "./hooks/useInputValidation";
import { useRomajiConversion } from "./hooks/useRomajiConversion";
import { useInputFocus } from "./hooks/useInputFocus";
import { getEnabledInputModes } from "./utils/inputModeUtils";
import { cn } from "@/core/utils";

interface AnswerInputProps {
  onSubmit: (
    answer:
      | string
      | {
          english: string;
          hiragana: string;
          katakana?: string;
          kanji?: string;
          romaji?: string;
        },
    validationResult?: any,
  ) => void;
  onAdvance?: () => void;
  disabled: boolean;
  settings: UserSettings;
  isCorrect?: boolean;
  currentItem?: FlashcardItem;
  lastAnswer?: string;
  lastMatchedType?: string;
  lastConvertedAnswer?: string;
  moduleName?: string;
  enableServerValidation?: boolean;
  enableRealtimeFeedback?: boolean;
}

/**
 * Refactored AnswerInput component with modular architecture
 * Breaks down the original 457-line component into smaller, reusable pieces
 */
export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmit,
  onAdvance,
  disabled,
  settings,
  isCorrect = false,
  currentItem,
  lastAnswer,
  lastMatchedType,
  lastConvertedAnswer,
  moduleName,
  enableServerValidation = true,
  enableRealtimeFeedback = true,
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom hooks for modular functionality
  const { validateInput, validationResult, isValidating } =
    useInputValidation();
  const { autoConvert } = useRomajiConversion();
  const {
    inputRefs,
    focusedField,
    focusFirstInput,
    handleKeyboardNavigation,
    registerInputRef,
  } = useInputFocus(settings, disabled);

  // Get enabled input modes
  const enabledModes = getEnabledInputModes(settings);
  const isMultipleInput = enabledModes.length > 1;

  // Handle input changes with romaji conversion
  const handleInputChange = useCallback(
    (field: string, value: string) => {
      const convertedValue = autoConvert(value, "hiragana");
      setAnswers((prev) => ({ ...prev, [field]: convertedValue }));
    },
    [autoConvert],
  );

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (disabled || isSubmitting) return;

    const hasValidInput = enabledModes.some((mode) => answers[mode]?.trim());
    if (!hasValidInput) return;

    setIsSubmitting(true);

    try {
      // Validate input using new validation system
      const validationResult = await validateInput(
        isMultipleInput ? answers : answers[enabledModes[0]] || "",
        currentItem!,
        settings,
        moduleName,
      );

      // Submit with validation results
      if (isMultipleInput) {
        const structuredAnswer = {
          english: answers.english || "",
          hiragana: answers.hiragana || "",
          katakana: answers.katakana,
          kanji: answers.kanji,
          romaji: answers.romaji,
        };
        onSubmit(structuredAnswer, validationResult);
      } else {
        onSubmit(answers[enabledModes[0]] || "", validationResult);
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    disabled,
    isSubmitting,
    enabledModes,
    answers,
    validateInput,
    currentItem,
    settings,
    moduleName,
    onSubmit,
    isMultipleInput,
  ]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, field: string) => {
      handleKeyboardNavigation(event, field, handleSubmit);
    },
    [handleKeyboardNavigation, handleSubmit],
  );

  // Handle field focus
  const handleFieldFocus = useCallback((field: string) => {
    // Focus logic handled by useInputFocus hook
  }, []);

  // Handle field blur
  const handleFieldBlur = useCallback((field: string) => {
    // Blur logic handled by useInputFocus hook
  }, []);

  return (
    <div className="w-full space-y-4">
      {/* Input Fields */}
      <MultiInputTable
        inputs={answers}
        onInputChange={handleInputChange}
        disabled={disabled}
        settings={settings}
        onKeyDown={handleKeyDown}
        onFocus={handleFieldFocus}
        onBlur={handleFieldBlur}
        inputRefs={
          inputRefs.current as Record<string, React.Ref<HTMLInputElement>>
        }
      />

      {/* Submit Button */}
      <SubmitButton
        onSubmit={handleSubmit}
        disabled={
          disabled || !enabledModes.some((mode) => answers[mode]?.trim())
        }
        isSubmitting={isSubmitting || isValidating}
      />
    </div>
  );
};
