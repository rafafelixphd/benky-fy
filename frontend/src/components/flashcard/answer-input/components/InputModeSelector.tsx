import React from "react";
import { UserSettings } from "@/core/api-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils";

interface InputModeSelectorProps {
  enabledModes: string[];
  onModeChange?: (mode: string) => void;
  settings: UserSettings;
  className?: string;
}

/**
 * Input mode selector component for AnswerInput
 */
export const InputModeSelector: React.FC<InputModeSelectorProps> = ({
  enabledModes,
  onModeChange,
  settings,
  className,
}) => {
  const modeConfig = [
    { key: "hiragana", label: "Hiragana", enabled: settings.input_hiragana },
    { key: "katakana", label: "Katakana", enabled: settings.input_katakana },
    { key: "english", label: "English", enabled: settings.input_english },
    { key: "kanji", label: "Kanji", enabled: settings.input_kanji },
    { key: "romaji", label: "Romaji", enabled: settings.input_romaji },
  ];

  const handleModeToggle = (mode: string) => {
    onModeChange?.(mode);
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {modeConfig.map((mode) => (
        <Button
          key={mode.key}
          variant={enabledModes.includes(mode.key) ? "default" : "outline"}
          size="sm"
          onClick={() => handleModeToggle(mode.key)}
          disabled={!mode.enabled}
          className={cn(
            "transition-colors duration-200",
            enabledModes.includes(mode.key)
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200",
          )}
        >
          {mode.label}
        </Button>
      ))}
    </div>
  );
};
