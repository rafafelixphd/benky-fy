'use client';

import { useState, useEffect, useRef } from "react";
import { useRomajiConversion } from "../utils/conversion";
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
  const [preview, setPreview] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversionHelper = useRomajiConversion(value, "katakana");

  useEffect(() => {
    if (!value.trim() || !showPreview) {
      setPreview("");
      return;
    }

    setIsConverting(true);
    const convert = async () => {
      if (conversionHelper.debouncedConvert) {
        const result = await conversionHelper.debouncedConvert();
        setPreview(result.converted);
        setIsConverting(false);
      }
    };
    convert();
  }, [value, showPreview, conversionHelper]);

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
        onChange={(e) => onChange(e.target.value)}
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
            {isConverting && (
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            )}
            <span className="text-muted-foreground text-sm font-medium">
              {preview}
            </span>
          </div>
        </div>
      )}

      {/* Invalid Input Indicator */}
      {showPreview && value && !preview && !isConverting && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none">
          <span className="text-muted-foreground text-xs">Invalid romaji</span>
        </div>
      )}
    </div>
  );
}