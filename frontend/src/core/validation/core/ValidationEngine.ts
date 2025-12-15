/**
 * Validation Engine - Central registry and coordinator for all validators
 */

import { ValidationStrategy, ValidationResult } from "./ValidationStrategy";

export class ValidationEngine implements ValidationStrategy {
  private validators: Map<string, ValidationStrategy> = new Map();

  /**
   * Register a validator for a specific type
   * @param type Input type identifier
   * @param validator Validator strategy to register
   */
  registerValidator(type: string, validator: ValidationStrategy): void {
    this.validators.set(type.toLowerCase(), validator);
  }

  /**
   * Validate input using the appropriate validator
   * @param input User input to validate
   * @param expected Expected correct value
   * @param type Input type identifier
   * @returns ValidationResult with validation details
   */
  validateWithType(
    input: string,
    expected: string,
    type: string,
  ): ValidationResult {
    const validator = this.getValidator(type);

    if (!validator) {
      return {
        isCorrect: false,
        feedback: [`No validator found for type: ${type}`],
      };
    }

    try {
      return validator.validate(input, expected);
    } catch (error) {
      return {
        isCorrect: false,
        feedback: ["Validation error occurred"],
      };
    }
  }

  /**
   * Get all available input types
   * @returns Array of available input types
   */
  getAvailableTypes(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Get validator for a specific type
   * @param type Input type identifier
   * @returns ValidationStrategy or undefined if not found
   */
  getValidator(type: string): ValidationStrategy | undefined {
    return this.validators.get(type.toLowerCase());
  }

  /**
   * Validate input against expected value (implements ValidationStrategy)
   * @param input User input to validate
   * @param expected Expected correct value
   * @returns ValidationResult with validation details
   */
  validate(input: string, expected: string): ValidationResult {
    // Try to auto-detect the type based on the expected value
    const detectedType = this.detectType(expected);

    if (detectedType) {
      return this.validateWithType(input, expected, detectedType);
    }

    // If no type detected, try all validators
    for (const [type, validator] of this.validators) {
      try {
        const result = validator.validate(input, expected);
        if (result.isCorrect) {
          return result;
        }
      } catch (error) {
        // Continue to next validator
        continue;
      }
    }

    return {
      isCorrect: false,
      feedback: ["No matching validator found"],
    };
  }

  /**
   * Get the types this validator supports
   * @returns Array of supported input types
   */
  getSupportedTypes(): string[] {
    return this.getAvailableTypes();
  }

  /**
   * Normalize input for consistent comparison
   * @param input Input to normalize
   * @returns Normalized input string
   */
  normalize(input: string): string {
    return input.trim().toLowerCase();
  }

  /**
   * Check if this validator can handle the given input type
   * @param type Input type to check
   * @returns True if this validator supports the type
   */
  canHandle(type: string): boolean {
    return this.validators.has(type.toLowerCase());
  }

  /**
   * Auto-detect input type based on content
   * @param content Content to analyze
   * @returns Detected type or null
   */
  private detectType(content: string): string | null {
    const normalized = content.trim();

    // Check for hiragana (ひらがな)
    if (/[\u3040-\u309F]/.test(normalized)) {
      return "hiragana";
    }

    // Check for katakana (カタカナ)
    if (/[\u30A0-\u30FF]/.test(normalized)) {
      return "katakana";
    }

    // Check for kanji (漢字)
    if (/[\u4E00-\u9FAF]/.test(normalized)) {
      return "kanji";
    }

    // Check for English (basic Latin characters)
    if (/^[a-zA-Z\s\-'.,!?]+$/.test(normalized)) {
      return "english";
    }

    // Check for romaji (basic Latin with Japanese-like patterns)
    if (/^[a-zA-Z\s\-']+$/.test(normalized) && normalized.length > 0) {
      return "romaji";
    }

    return null;
  }
}
