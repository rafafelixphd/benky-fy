import React from "react";
import { UserSettings } from "@/core/api-client";
import { SingleInputField } from "./SingleInputField";
import { cn } from "@/core/utils";

interface MultiInputTableProps {
  inputs: Record<string, string>;
  onInputChange: (field: string, value: string) => void;
  disabled?: boolean;
  settings: UserSettings;
  className?: string;
  onKeyDown?: (event: React.KeyboardEvent, field: string) => void;
  onFocus?: (field: string) => void;
  onBlur?: (field: string) => void;
  inputRefs?: Record<string, React.Ref<HTMLInputElement>>;
}

/**
 * Multi-input table component for AnswerInput
 */
export const MultiInputTable: React.FC<MultiInputTableProps> = ({
  inputs,
  onInputChange,
  disabled = false,
  settings,
  className,
  onKeyDown,
  onFocus,
  onBlur,
  inputRefs = {},
}) => {
  const getEnabledFields = () => {
    const fields = [];
    if (settings.input_hiragana)
      fields.push({ key: "hiragana", label: "Hiragana" });
    if (settings.input_katakana)
      fields.push({ key: "katakana", label: "Katakana" });
    if (settings.input_english)
      fields.push({ key: "english", label: "English" });
    if (settings.input_kanji) fields.push({ key: "kanji", label: "Kanji" });
    if (settings.input_romaji) fields.push({ key: "romaji", label: "Romaji" });
    return fields;
  };

  const enabledFields = getEnabledFields();

  if (enabledFields.length <= 1) {
    // Single input mode - render as single field
    const field = enabledFields[0];
    if (!field) return null;

    return (
      <div className={cn("w-full", className)}>
        <SingleInputField
          ref={inputRefs[field.key]}
          type={field.key}
          value={inputs[field.key] || ""}
          onChange={(value) => onInputChange(field.key, value)}
          disabled={disabled}
          onKeyDown={(e) => onKeyDown?.(e, field.key)}
          onFocus={() => onFocus?.(field.key)}
          onBlur={() => onBlur?.(field.key)}
        />
      </div>
    );
  }

  // Multi-input mode - render as table
  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 gap-4">
        {enabledFields.map((field) => (
          <div key={field.key} className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <SingleInputField
              ref={inputRefs[field.key]}
              type={field.key}
              value={inputs[field.key] || ""}
              onChange={(value) => onInputChange(field.key, value)}
              disabled={disabled}
              onKeyDown={(e) => onKeyDown?.(e, field.key)}
              onFocus={() => onFocus?.(field.key)}
              onBlur={() => onBlur?.(field.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
