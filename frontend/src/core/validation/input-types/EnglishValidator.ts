/**
 * English Validator - Handles English text validation
 */

import {
  ValidationStrategy,
  ValidationResult,
} from "../core/ValidationStrategy";
import {
  createSuccessResult,
  createFailureResult,
} from "../core/ValidationResult";

export class EnglishValidator implements ValidationStrategy {
  /**
   * Validate English input
   * @param input User input
   * @param expected Expected English text
   * @returns ValidationResult
   */
  validate(input: string, expected: string): ValidationResult {
    const normalizedInput = this.normalize(input);
    const normalizedExpected = this.normalize(expected);

    // Direct match
    if (normalizedInput === normalizedExpected) {
      return createSuccessResult("english", normalizedInput);
    }

    // Check for multiple correct answers (separated by / or ,)
    const expectedAnswers = this.parseMultipleAnswers(normalizedExpected);
    if (expectedAnswers.includes(normalizedInput)) {
      return createSuccessResult("english", normalizedInput);
    }

    // Check for partial matches
    const similarity = this.calculateSimilarity(
      normalizedInput,
      normalizedExpected,
    );
    if (similarity > 0.8) {
      return {
        isCorrect: false,
        matchedType: "english",
        feedback: [`Close! Expected: ${expected}, Got: ${input}`],
        confidence: similarity,
      };
    }

    // Check for common variations
    if (this.hasCommonVariations(normalizedInput, normalizedExpected)) {
      return createSuccessResult("english", normalizedInput, 0.8);
    }

    return createFailureResult([
      `Incorrect. Expected: ${expected}`,
      `You entered: ${input}`,
    ]);
  }

  /**
   * Get supported types
   * @returns Array of supported types
   */
  getSupportedTypes(): string[] {
    return ["english", "text"];
  }

  /**
   * Normalize English input
   * @param input Input to normalize
   * @returns Normalized input
   */
  normalize(input: string): string {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^\w\s\-']/g, "") // Remove punctuation except hyphens and apostrophes
      .replace(/\s+/g, " "); // Normalize whitespace
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
   * Parse multiple correct answers from a string
   * @param answerString String containing multiple answers
   * @returns Array of normalized answers
   */
  private parseMultipleAnswers(answerString: string): string[] {
    if (!answerString) return [];

    const answers = answerString
      .split(/[\/,]/)
      .map((answer) => this.normalize(answer))
      .filter((answer) => answer.length > 0);

    // Add variations for common patterns
    const flexibleAnswers = new Set<string>();

    answers.forEach((answer) => {
      flexibleAnswers.add(answer);

      // Add version without "to " prefix for verbs
      if (answer.startsWith("to ")) {
        flexibleAnswers.add(answer.substring(3));
      }

      // Add version with "to " prefix if it doesn't have it
      if (!answer.startsWith("to ") && answer.length > 0) {
        flexibleAnswers.add(`to ${answer}`);
      }
    });

    return Array.from(flexibleAnswers);
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

  /**
   * Check for common variations in English
   * @param input User input
   * @param expected Expected input
   * @returns True if common variation found
   */
  private hasCommonVariations(input: string, expected: string): boolean {
    // Check for common contractions
    const contractions: Record<string, string[]> = {
      "don't": ["do not"],
      "won't": ["will not"],
      "can't": ["cannot", "can not"],
      "it's": ["it is"],
      "you're": ["you are"],
      "they're": ["they are"],
      "we're": ["we are"],
    };

    for (const [contracted, expanded] of Object.entries(contractions)) {
      if (
        (input === contracted && expanded.includes(expected)) ||
        (expected === contracted && expanded.includes(input))
      ) {
        return true;
      }
    }

    // Check for singular/plural variations
    if (
      input.endsWith("s") &&
      !expected.endsWith("s") &&
      input.slice(0, -1) === expected
    ) {
      return true;
    }

    if (
      expected.endsWith("s") &&
      !input.endsWith("s") &&
      expected.slice(0, -1) === input
    ) {
      return true;
    }

    return false;
  }
}
