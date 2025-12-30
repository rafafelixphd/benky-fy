'use client';

import { useRef } from "react";
import { useRomajiConversion } from "@/lib/hooks/use-romaji-conversion";
import { RomajiInputProps } from "@/components/japanese/types/input";

export function KatakanaInput({
  value,
  onChange,
  placeholder = "Enter romaji for katakana...",
  disabled = false,
  className = "",
  showPreview = true,
  onKeyPress,
}: Omit<RomajiInputProps, "outputType">) {
  const inputRef = useRef<HTMLInputElement>(null);
  const conversionResult = useRomajiConversion(value, "katakana");

  const preview = (showPreview && value.trim()) ? conversionResult.converted : "";
  const isInvalid = (showPreview && value.trim() && !preview);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  const handleFocus = () => {
    inputRef.current?.select();
  };

  return (
    <div className="relative">
      {/* Main Input */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg bg-background border border-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 ${className}`}
      />

      {/* Preview */}
      {showPreview && preview && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
          <div className="flex items-center gap-2">
            {/* Removed loading spinner since conversion is sync */}
            <span className="text-muted-foreground text-sm font-medium">
              {preview}
            </span>
          </div>
        </div>
      )}

      {/* Invalid Input Indicator */}
      {isInvalid && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
          <span className="text-muted-foreground text-xs">Invalid romaji</span>
        </div>
      )}
    </div>
  );
}