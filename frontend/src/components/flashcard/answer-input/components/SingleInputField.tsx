import React from "react";
import { cn } from "@/core/utils";

interface SingleInputFieldProps {
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

/**
 * Single input field component for AnswerInput
 */
export const SingleInputField = React.forwardRef<
  HTMLInputElement,
  SingleInputFieldProps
>(
  (
    {
      type,
      value,
      onChange,
      placeholder,
      disabled = false,
      className,
      onKeyDown,
      onFocus,
      onBlur,
    },
    ref,
  ) => {
    const getInputType = () => {
      switch (type) {
        case "hiragana":
        case "katakana":
        case "kanji":
          return "text";
        case "english":
          return "text";
        case "romaji":
          return "text";
        default:
          return "text";
      }
    };

    const getPlaceholder = () => {
      if (placeholder) return placeholder;

      switch (type) {
        case "hiragana":
          return "ひらがな";
        case "katakana":
          return "カタカナ";
        case "kanji":
          return "漢字";
        case "english":
          return "English";
        case "romaji":
          return "romaji";
        default:
          return "Enter answer...";
      }
    };

    return (
      <input
        ref={ref}
        type={getInputType()}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder()}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(
          "w-full px-3 py-2 rounded-md",
          "bg-background text-foreground placeholder-muted-foreground",
          "border border-input",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed",
          "transition-colors duration-200",
          className,
        )}
      />
    );
  },
);

SingleInputField.displayName = "SingleInputField";
