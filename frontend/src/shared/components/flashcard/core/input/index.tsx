'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { AnswerFeedback } from "../feedback";
import { useValidateInput } from "@/core/hooks";
import { validateAnswer, validateWithSettings, ValidationResult } from "@/core/validation";
import { convertInputForField } from "@/core/romaji-conversion";
import { getModuleType } from "./helpers/module-type";
import { MultiInputTable } from "./helpers/multi-input-table";
import { TextInput } from "./text-input";
import { AnswerInputProps } from "../../types/input";

export function AnswerInput({
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
}: AnswerInputProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [frontendValidationResult, setFrontendValidationResult] = useState<ValidationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackTimer, setFeedbackTimer] = useState(0);
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const validateInputMutation = useValidateInput();

  useEffect(() => {
    if (!disabled) {
      const enabledModes = getEnabledInputModes();
      const firstInputRef = inputRefs.current[enabledModes[0]];
      if (firstInputRef) {
        firstInputRef.focus();
      }
    }
  }, [disabled]);

  // Reset feedback state when currentItem changes
  useEffect(() => {
    setShowFeedback(false);
    setValidationResult(null);
    setFrontendValidationResult(null);
    setAnswers({});
    setIsSubmitting(false);
    setFeedbackTimer(0);
    if (feedbackTimerRef.current) {
      clearInterval(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [currentItem?.id]);

  // Feedback timer
  useEffect(() => {
    if (showFeedback && enableRealtimeFeedback) {
      setFeedbackTimer(10);

      feedbackTimerRef.current = setInterval(() => {
        setFeedbackTimer((prev) => {
          if (prev <= 1) {
            onSubmit("", validationResult || frontendValidationResult);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      setFeedbackTimer(0);
    }

    return () => {
      if (feedbackTimerRef.current) {
        clearInterval(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
    };
  }, [showFeedback, enableRealtimeFeedback, onSubmit, validationResult, frontendValidationResult]);

  // Enter key listener for navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && showFeedback && onAdvance) {
        e.preventDefault();
        onAdvance();
      }
    };

    if (showFeedback) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showFeedback, onAdvance]);

  const validateWithServer = useCallback(
    async (userInput: string, expectedCharacter: string) => {
      if (!enableServerValidation || !currentItem) return null;

      try {
        const validationRequest = {
          character: expectedCharacter,
          input: userInput,
          type: "hiragana" as const,
          moduleName: moduleName || "unknown",
        };

        const result = await validateInputMutation.mutateAsync(validationRequest);
        return result;
      } catch (error) {
        console.error("Server validation failed:", error);
        return null;
      }
    },
    [enableServerValidation, currentItem, validateInputMutation, moduleName],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const enabledModes = getEnabledInputModes();
    const isMultipleInput = enabledModes.length > 1;

    const hasValidInput = enabledModes.some((mode) => answers[mode]?.trim());
    if (!hasValidInput || disabled || isSubmitting) return;

    setIsSubmitting(true);
    setShowFeedback(false);
    setValidationResult(null);
    setFrontendValidationResult(null);

    try {
      let serverValidationResult = null;
      let frontendResult: ValidationResult | null = null;

      if (currentItem) {
        if (isMultipleInput) {
          frontendResult = validateWithSettings(answers, currentItem, enabledModes);
        } else {
          const firstAnswer = answers[enabledModes[0]] || "";
          frontendResult = validateAnswer(firstAnswer, currentItem, settings);
        }

        setFrontendValidationResult(frontendResult);
      }

      if (enableServerValidation && currentItem) {
        const firstAnswer = answers[enabledModes[0]] || "";
        const expectedCharacter = (currentItem.hiragana || currentItem.kanji || currentItem.english || "").toString();
        serverValidationResult = await validateWithServer(firstAnswer.trim(), expectedCharacter);
        if (serverValidationResult) {
          setValidationResult(serverValidationResult);
        }
      }

      if (enableRealtimeFeedback) {
        setShowFeedback(true);
      }

      const firstAnswer = answers[enabledModes[0]] || "";

      if (isMultipleInput) {
        const allAnswers = {
          english: answers.english || "",
          hiragana: answers.hiragana || "",
          katakana: answers.katakana || "",
          kanji: answers.kanji || "",
          romaji: answers.romaji || "",
        };
        await onSubmit(allAnswers, serverValidationResult || frontendResult);
      } else {
        await onSubmit(firstAnswer.trim(), serverValidationResult || frontendResult);
      }
    } catch (error) {
      console.error("Submit error:", error);
    } finally {
      setIsSubmitting(false);

      setTimeout(() => {
        const firstInputRef = inputRefs.current[getEnabledInputModes()[0]];
        if (firstInputRef) {
          firstInputRef.focus();
        }
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showFeedback) {
      handleSubmit(e);
    }
  };

  const handleInputChange = (mode: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (["hiragana", "katakana", "romaji"].includes(mode)) {
      const conversion = convertInputForField(inputValue, mode as any, {
        romaji_output_type: settings.romaji_output_type as "hiragana" | "katakana",
      });
      setAnswers((prev) => ({ ...prev, [mode]: conversion.converted }));
      return;
    }

    setAnswers((prev) => ({ ...prev, [mode]: inputValue }));
  };

  const getEnabledInputModes = () => {
    const moduleType = getModuleType(moduleName);
    const modes = [];

    if (settings.input_hiragana) modes.push("hiragana");
    if (settings.input_katakana && moduleType.hasKatakana) modes.push("katakana");
    if (settings.input_kanji && moduleType.hasKanji) modes.push("kanji");
    if (settings.input_english) modes.push("english");
    if (settings.input_romaji) modes.push("romaji");

    return modes;
  };

  const getFeedbackColor = (mode: string): string => {
    if (!frontendValidationResult || !showFeedback) return "";

    const enabledModes = getEnabledInputModes();
    const isMultipleInput = enabledModes.length > 1;

    if (
      isMultipleInput &&
      enabledModes.includes("english") &&
      enabledModes.includes("hiragana")
    ) {
      if (mode === "english" && frontendValidationResult.results) {
        const englishCorrect = frontendValidationResult.results[0];
        return englishCorrect
          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
          : "bg-red-500/20 border-red-400 text-red-300";
      } else if (mode === "hiragana" && frontendValidationResult.results) {
        const hiraganaCorrect = frontendValidationResult.results[1];
        return hiraganaCorrect
          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
          : "bg-red-500/20 border-red-400 text-red-300";
      }
    }

    return frontendValidationResult.feedbackColor || "";
  };

  const renderInput = () => {
    const enabledModes = getEnabledInputModes();
    const isMultipleInput = enabledModes.length > 1;

    if (isMultipleInput) {
      return (
        <MultiInputTable
          modes={enabledModes}
          answers={answers}
          disabled={disabled}
          isSubmitting={isSubmitting}
          inputRefs={inputRefs}
          handleInputChange={handleInputChange}
          handleKeyDown={handleKeyDown}
          getFeedbackColor={getFeedbackColor}
        />
      );
    }

    const singleMode = enabledModes[0] || "answer";
    return (
      <TextInput
        ref={(el) => {
          inputRefs.current[singleMode] = el;
        }}
        mode={singleMode}
        value={answers[singleMode] || ""}
        onChange={handleInputChange(singleMode)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        isSubmitting={isSubmitting}
        feedbackColor={getFeedbackColor(singleMode)}
      />
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          {renderInput()}

          {isSubmitting && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={
              !Object.values(answers).some((answer) => answer.trim()) ||
              disabled ||
              isSubmitting
            }
            className="bg-white text-primary hover:bg-white/90 px-8 py-2"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validating...
              </div>
            ) : (
              "Submit Answer"
            )}
          </Button>
        </div>
      </form>

      {showFeedback &&
        (validationResult || frontendValidationResult) &&
        enableRealtimeFeedback &&
        currentItem && (
          <AnswerFeedback
            item={currentItem}
            userAnswer={answers[getEnabledInputModes()[0]] || ""}
            isCorrect={
              validationResult?.is_correct ||
              frontendValidationResult?.isCorrect ||
              false
            }
            matchedType={frontendValidationResult?.matchedType}
            convertedAnswer={frontendValidationResult?.convertedAnswer}
            settings={settings}
            frontendValidationResult={frontendValidationResult}
            userAnswers={Object.fromEntries(
              getEnabledInputModes().map((mode) => [mode, answers[mode] || ""]),
            )}
            moduleName={moduleName}
          />
        )}

      {showFeedback && feedbackTimer > 0 && (
        <div className="text-center text-white/80 text-sm mt-4">
          <p>Auto-advancing in {feedbackTimer} seconds</p>
          <p className="text-white/60 mt-1">Press Enter to advance now</p>
        </div>
      )}

      {!showFeedback && (
        <div className="text-center text-white/60 text-sm mt-4">
          <p>Press Enter to submit your answer</p>
          <p className="mt-1">
            Hiragana/Katakana fields auto-convert romaji input
          </p>
          {enableServerValidation && (
            <p className="mt-1">Server-side validation enabled</p>
          )}
        </div>
      )}
    </div>
  );
}