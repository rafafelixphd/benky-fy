/**
 * Hiragana Validator - Handles hiragana character validation
 */

import {
  ValidationStrategy,
  ValidationResult,
} from "../core/ValidationStrategy";
import {
  createSuccessResult,
  createFailureResult,
} from "../core/ValidationResult";

export class HiraganaValidator implements ValidationStrategy {
  private romajiToHiraganaMap: Map<string, string> = new Map([
    // Basic hiragana mappings
    ["a", "あ"],
    ["i", "い"],
    ["u", "う"],
    ["e", "え"],
    ["o", "お"],
    ["ka", "か"],
    ["ki", "き"],
    ["ku", "く"],
    ["ke", "け"],
    ["ko", "こ"],
    ["sa", "さ"],
    ["shi", "し"],
    ["su", "す"],
    ["se", "せ"],
    ["so", "そ"],
    ["ta", "た"],
    ["chi", "ち"],
    ["tsu", "つ"],
    ["te", "て"],
    ["to", "と"],
    ["na", "な"],
    ["ni", "に"],
    ["nu", "ぬ"],
    ["ne", "ね"],
    ["no", "の"],
    ["ha", "は"],
    ["hi", "ひ"],
    ["fu", "ふ"],
    ["he", "へ"],
    ["ho", "ほ"],
    ["ma", "ま"],
    ["mi", "み"],
    ["mu", "む"],
    ["me", "め"],
    ["mo", "も"],
    ["ya", "や"],
    ["yu", "ゆ"],
    ["yo", "よ"],
    ["ra", "ら"],
    ["ri", "り"],
    ["ru", "る"],
    ["re", "れ"],
    ["ro", "ろ"],
    ["wa", "わ"],
    ["wo", "を"],
    ["n", "ん"],
  ]);

  /**
   * Validate hiragana input
   * @param input User input
   * @param expected Expected hiragana
   * @returns ValidationResult
   */
  validate(input: string, expected: string): ValidationResult {
    const normalizedInput = this.normalize(input);
    const normalizedExpected = this.normalize(expected);

    // Direct match
    if (normalizedInput === normalizedExpected) {
      return createSuccessResult("hiragana", normalizedInput);
    }

    // Check if input is romaji that converts to expected hiragana
    const convertedHiragana = this.convertRomajiToHiragana(normalizedInput);
    if (convertedHiragana === normalizedExpected) {
      return createSuccessResult("hiragana", convertedHiragana, 0.9);
    }

    // Check if expected is romaji that converts to input hiragana
    const convertedFromExpected =
      this.convertRomajiToHiragana(normalizedExpected);
    if (normalizedInput === convertedFromExpected) {
      return createSuccessResult("hiragana", normalizedInput, 0.9);
    }

    // Partial match check
    const similarity = this.calculateSimilarity(
      normalizedInput,
      normalizedExpected,
    );
    if (similarity > 0.7) {
      return {
        isCorrect: false,
        matchedType: "hiragana",
        feedback: [
          `Close! Expected: ${normalizedExpected}, Got: ${normalizedInput}`,
        ],
        confidence: similarity,
      };
    }

    return createFailureResult([
      `Incorrect. Expected: ${normalizedExpected}`,
      `You entered: ${normalizedInput}`,
    ]);
  }

  /**
   * Get supported types
   * @returns Array of supported types
   */
  getSupportedTypes(): string[] {
    return ["hiragana", "romaji"];
  }

  /**
   * Normalize hiragana input
   * @param input Input to normalize
   * @returns Normalized input
   */
  normalize(input: string): string {
    return input.trim().toLowerCase();
  }

  /**
   * Check if validator can handle the type
   * @param type Type to check
   * @returns True if supported
   */
  canHandle(type: string): boolean {
    return this.getSupportedTypes().includes(type.toLowerCase());
  }

  /**
   * Convert romaji to hiragana
   * @param romaji Romaji input
   * @returns Converted hiragana or original if no conversion found
   */
  private convertRomajiToHiragana(romaji: string): string {
    const normalized = romaji.toLowerCase().trim();

    // Check for exact match first
    if (this.romajiToHiraganaMap.has(normalized)) {
      return this.romajiToHiraganaMap.get(normalized)!;
    }

    // Try partial matches for compound sounds
    for (const [romajiKey, hiraganaValue] of this.romajiToHiraganaMap) {
      if (normalized.includes(romajiKey)) {
        return normalized.replace(romajiKey, hiraganaValue);
      }
    }

    return normalized; // Return original if no conversion found
  }

  /**
   * Calculate similarity between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Similarity score (0-1)
   */
  private calculateSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;

    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param str1 First string
   * @param str2 Second string
   * @returns Edit distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }
}
