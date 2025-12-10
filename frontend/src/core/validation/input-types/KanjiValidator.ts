/**
 * Kanji Validator - Handles kanji character validation
 */

import {
  ValidationStrategy,
  ValidationResult,
} from "../core/ValidationStrategy";
import {
  createSuccessResult,
  createFailureResult,
} from "../core/ValidationResult";

export class KanjiValidator implements ValidationStrategy {
  /**
   * Validate kanji input
   * @param input User input
   * @param expected Expected kanji
   * @returns ValidationResult
   */
  validate(input: string, expected: string): ValidationResult {
    const normalizedInput = this.normalize(input);
    const normalizedExpected = this.normalize(expected);

    // Direct match
    if (normalizedInput === normalizedExpected) {
      return createSuccessResult("kanji", normalizedInput);
    }

    // Check if input is hiragana/katakana that matches expected kanji reading
    const inputReading = this.getKanjiReading(normalizedInput);
    const expectedReading = this.getKanjiReading(normalizedExpected);

    if (inputReading && expectedReading && inputReading === expectedReading) {
      return createSuccessResult("kanji", normalizedInput, 0.8);
    }

    // Check for furigana matching
    if (this.hasFuriganaMatch(normalizedInput, normalizedExpected)) {
      return createSuccessResult("kanji", normalizedInput, 0.9);
    }

    // Partial match check
    const similarity = this.calculateSimilarity(
      normalizedInput,
      normalizedExpected,
    );
    if (similarity > 0.7) {
      return {
        isCorrect: false,
        matchedType: "kanji",
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
    return ["kanji", "hiragana", "katakana"];
  }

  /**
   * Normalize kanji input
   * @param input Input to normalize
   * @returns Normalized input
   */
  normalize(input: string): string {
    return input.trim();
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
   * Get kanji reading (simplified - in real implementation would use dictionary)
   * @param text Text to get reading for
   * @returns Reading or null if not found
   */
  private getKanjiReading(text: string): string | null {
    // This is a simplified implementation
    // In a real system, you'd use a kanji dictionary

    // Check if text contains kanji
    if (/[\u4E00-\u9FAF]/.test(text)) {
      // For now, return the text as-is for kanji
      return text;
    }

    // Check if text is hiragana/katakana
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
      return text;
    }

    return null;
  }

  /**
   * Check for furigana matching
   * @param input User input
   * @param expected Expected kanji
   * @returns True if furigana match found
   */
  private hasFuriganaMatch(input: string, expected: string): boolean {
    // This is a simplified furigana matching
    // In a real system, you'd have a comprehensive furigana database

    // Check if input contains furigana notation (kanji[hiragana])
    const furiganaPattern = /([\u4E00-\u9FAF]+)\[([\u3040-\u309F]+)\]/g;
    const furiganaMatches = Array.from(input.matchAll(furiganaPattern));

    for (const match of furiganaMatches) {
      const kanji = match[1];
      const reading = match[2];

      if (expected.includes(kanji)) {
        return true;
      }
    }

    return false;
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
