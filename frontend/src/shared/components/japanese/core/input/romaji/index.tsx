'use client';

import { useState } from "react";
import { HiraganaInput } from "./hiragana/hiragana-input";
import { KatakanaInput } from "./katakana/katakana-input";
import { RomajiInputProps, RomajiInputWithOptionsProps } from "@/components/japanese/types/input";

export function RomajiInput({
  value,
  onChange,
  placeholder,
  disabled,
  className,
  outputType = "auto",
  showPreview = true,
  onKeyPress,
}: RomajiInputProps) {
  // For auto mode, we'll show both previews
  if (outputType === "auto") {
    return (
      <div className="space-y-2">
        <HiraganaInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          showPreview={showPreview}
          onKeyPress={onKeyPress}
        />
        <KatakanaInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          showPreview={showPreview}
          onKeyPress={onKeyPress}
        />
      </div>
    );
  }

  // For specific modes, show only the requested input type
  return outputType === "hiragana" ? (
    <HiraganaInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      showPreview={showPreview}
      onKeyPress={onKeyPress}
    />
  ) : (
    <KatakanaInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      showPreview={showPreview}
      onKeyPress={onKeyPress}
    />
  );
}

/**
 * Romaji input with conversion options
 */
export function RomajiInputWithOptions({
  value,
  onChange,
  placeholder = "Enter romaji...",
  disabled = false,
  className = "",
  onKeyPress,
}: RomajiInputWithOptionsProps) {
  const [outputType, setOutputType] = useState<"hiragana" | "katakana" | "auto">("auto");
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="space-y-3">
      {/* Options */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-white/80">Output:</label>
          <select
            value={outputType}
            onChange={(e) =>
              setOutputType(e.target.value as "hiragana" | "katakana" | "auto")
            }
            className="px-2 py-1 rounded bg-white/20 border border-white/30 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/50"
          >
            <option value="auto" className="bg-gray-800">
              Both
            </option>
            <option value="hiragana" className="bg-gray-800">
              Hiragana Only
            </option>
            <option value="katakana" className="bg-gray-800">
              Katakana Only
            </option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-white/80">
          <input
            type="checkbox"
            checked={showPreview}
            onChange={(e) => setShowPreview(e.target.checked)}
            className="rounded border-white/30 bg-white/20 text-white focus:ring-white/50"
          />
          Show preview
        </label>
      </div>

      {/* Input */}
      <RomajiInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
        outputType={outputType}
        showPreview={showPreview}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}
