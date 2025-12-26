/**
 * Core validation interfaces and types
 */

export interface ValidationResult {
  isCorrect: boolean;
  matchedType?: string;
  convertedAnswer?: string;
  feedback?: string[];
  confidence?: number;
  normalizedInput?: string;
  normalizedExpected?: string;
}

export interface ValidationStrategy {
  /**
   * Validate input against expected value
   * @param input User input to validate
   * @param expected Expected correct value
   * @returns ValidationResult with validation details
   */
  validate(input: string, expected: string): ValidationResult;

  /**
   * Get the types this validator supports
   * @returns Array of supported input types
   */
  getSupportedTypes(): string[];

  /**
   * Normalize input for consistent comparison
   * @param input Input to normalize
   * @returns Normalized input string
   */
  normalize(input: string): string;

  /**
   * Check if this validator can handle the given input type
   * @param type Input type to check
   * @returns True if this validator supports the type
   */
  canHandle(type: string): boolean;
}

export interface ValidationEngine {
  /**
   * Register a validator for a specific type
   * @param type Input type identifier
   * @param validator Validator strategy to register
   */
  registerValidator(type: string, validator: ValidationStrategy): void;

  /**
   * Validate input using the appropriate validator
   * @param input User input to validate
   * @param expected Expected correct value
   * @param type Input type identifier
   * @returns ValidationResult with validation details
   */
  validate(input: string, expected: string, type: string): ValidationResult;

  /**
   * Get all available input types
   * @returns Array of available input types
   */
  getAvailableTypes(): string[];

  /**
   * Get validator for a specific type
   * @param type Input type identifier
   * @returns ValidationStrategy or undefined if not found
   */
  getValidator(type: string): ValidationStrategy | undefined;
}
