import { useState, useCallback } from "react";
import {
  detectScript,
  romajiToHiragana,
  romajiToKatakana,
  convertInputForField,
} from "@/core/romaji-conversion";

/**
 * Custom hook for romaji conversion logic
 */
export const useRomajiConversion = () => {
  const [conversionHistory, setConversionHistory] = useState<
    Array<{
      input: string;
      output: string;
      script: string;
      timestamp: number;
    }>
  >([]);

  /**
   * Convert romaji to appropriate script
   * @param input Romaji input string
   * @param targetScript Target script ('hiragana' or 'katakana')
   * @returns Converted string
   */
  const convertRomaji = useCallback(
    (
      input: string,
      targetScript: "hiragana" | "katakana" = "hiragana",
    ): string => {
      if (!input.trim()) return input;

      let converted: string;
      if (targetScript === "hiragana") {
        converted = romajiToHiragana(input).converted;
      } else {
        converted = romajiToKatakana(input).converted;
      }

      // Store conversion history
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
   * @param input Input string to analyze
   * @returns Detected script type
   */
  const detectScriptType = useCallback((input: string): string => {
    return detectScript(input);
  }, []);

  /**
   * Normalize input for field conversion
   * @param input Input string
   * @param fieldType Field type ('hiragana', 'katakana', etc.)
   * @returns Normalized and converted input
   */
  const normalizeInput = useCallback(
    (input: string, fieldType: "hiragana" | "katakana" | "romaji"): string => {
      return convertInputForField(input, fieldType).converted;
    },
    [],
  );

  /**
   * Get conversion history
   * @returns Array of conversion history entries
   */
  const getConversionHistory = useCallback(() => {
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
   * @param input Input string
   * @param preferredScript Preferred script for conversion
   * @returns Converted string
   */
  const autoConvert = useCallback(
    (
      input: string,
      preferredScript: "hiragana" | "katakana" = "hiragana",
    ): string => {
      const detectedScript = detectScriptType(input);

      if (detectedScript === "romaji") {
        return convertRomaji(input, preferredScript);
      }

      return input;
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
