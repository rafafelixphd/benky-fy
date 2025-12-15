/**
 * Validator Factory - Creates and manages input-type validators
 */

import { ValidationStrategy } from "../core/ValidationStrategy";
import { HiraganaValidator } from "../input-types/HiraganaValidator";
import { EnglishValidator } from "../input-types/EnglishValidator";
import { KatakanaValidator } from "../input-types/KatakanaValidator";
import { KanjiValidator } from "../input-types/KanjiValidator";

export class ValidatorFactory {
  private validators: Map<string, ValidationStrategy> = new Map();
  private validatorClasses: Map<string, new () => ValidationStrategy> =
    new Map();

  constructor() {
    this.registerDefaultValidators();
  }

  /**
   * Create a validator instance for the specified type
   * @param type Input type (hiragana, katakana, english, kanji)
   * @returns ValidationStrategy instance
   */
  createValidator(type: string): ValidationStrategy {
    const normalizedType = type.toLowerCase();

    if (this.validators.has(normalizedType)) {
      return this.validators.get(normalizedType)!;
    }

    const ValidatorClass = this.validatorClasses.get(normalizedType);
    if (ValidatorClass) {
      const instance = new ValidatorClass();
      this.validators.set(normalizedType, instance);
      return instance;
    }

    throw new Error(`No validator found for type: ${type}`);
  }

  /**
   * Get all supported validator types
   * @returns Array of supported types
   */
  getSupportedTypes(): string[] {
    return Array.from(this.validatorClasses.keys());
  }

  /**
   * Register a validator for a specific type
   * @param type Input type identifier
   * @param validator Validator instance to register
   */
  registerValidator(type: string, validator: ValidationStrategy): void {
    const normalizedType = type.toLowerCase();
    this.validators.set(normalizedType, validator);
  }

  /**
   * Register a validator class for a specific type
   * @param type Input type identifier
   * @param ValidatorClass Validator class to register
   */
  registerValidatorClass(
    type: string,
    ValidatorClass: new () => ValidationStrategy,
  ): void {
    const normalizedType = type.toLowerCase();
    this.validatorClasses.set(normalizedType, ValidatorClass);
  }

  /**
   * Check if a validator type is supported
   * @param type Input type to check
   * @returns True if supported
   */
  isSupported(type: string): boolean {
    return this.validatorClasses.has(type.toLowerCase());
  }

  /**
   * Get validator instance if it exists, otherwise create one
   * @param type Input type
   * @returns ValidationStrategy instance
   */
  getValidator(type: string): ValidationStrategy {
    return this.createValidator(type);
  }

  /**
   * Register default validators
   */
  private registerDefaultValidators(): void {
    this.registerValidatorClass("hiragana", HiraganaValidator);
    this.registerValidatorClass("katakana", KatakanaValidator);
    this.registerValidatorClass("english", EnglishValidator);
    this.registerValidatorClass("kanji", KanjiValidator);
  }
}
