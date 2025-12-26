import { useState, useCallback } from "react";
import {
  detectScript,
  romajiToHiragana,
  romajiToKatakana,
  convertInputForField,
} from "@/core/romaji-conversion";

interface ConversionHistoryEntry {
  input: string;
  output: string;
  script: string;
  timestamp: number;
}

/**
 * Custom hook for romaji conversion logic
 */
export const useRomajiConversion = () => {
  const [conversionHistory, setConversionHistory] = useState<ConversionHistoryEntry[]>([]);

  /**
   * Convert romaji to appropriate script
   */
  const convertRomaji = useCallback(
    (
      input: string,
      targetScript: "hiragana" | "katakana" = "hiragana",
    ): string => {
      if (!input.trim()) return input;

      const converted = targetScript === "hiragana"
        ? romajiToHiragana(input).converted
        : romajiToKatakana(input).converted;

      setConversionHistory((prev) => [
        ...prev.slice(-9),
        {
          input,
          output: converted,
          script: targetScript,
          timestamp: Date.now(),
        },
      ]);

      return converted;
    },
    [],
  );

  /**
   * Detect script type of input
   */
  const detectScriptType = useCallback((input: string): string => {
    return detectScript(input);
  }, []);

  /**
   * Normalize input for field conversion
   */
  const normalizeInput = useCallback(
    (input: string, fieldType: "hiragana" | "katakana" | "romaji"): string => {
      return convertInputForField(input, fieldType).converted;
    },
    [],
  );

  /**
   * Get conversion history
   */
  const getConversionHistory = useCallback((): ConversionHistoryEntry[] => {
    return conversionHistory;
  }, [conversionHistory]);

  /**
   * Clear conversion history
   */
  const clearConversionHistory = useCallback(() => {
    setConversionHistory([]);
  }, []);

  /**
   * Auto-convert input based on detected script
   */
  const autoConvert = useCallback(
    (
      input: string,
      preferredScript: "hiragana" | "katakana" = "hiragana",
    ): string => {
      const detectedScript = detectScriptType(input);
      return detectedScript === "romaji" ? convertRomaji(input, preferredScript) : input;
    },
    [convertRomaji, detectScriptType],
  );

  return {
    convertRomaji,
    detectScriptType,
    normalizeInput,
    getConversionHistory,
    clearConversionHistory,
    autoConvert,
  };
};
