/**
 * Module Validator Factory - Creates and manages module-specific validators
 */

import { ActivityValidator } from "../core/ActivityValidator";
import { FlashcardValidator } from "../activity-types/FlashcardValidator";
import { ConjugationValidator } from "../activity-types/ConjugationValidator";

export class ModuleValidatorFactory {
  private validators: Map<string, ActivityValidator> = new Map();
  private validatorClasses: Map<string, new () => ActivityValidator> =
    new Map();

  constructor() {
    this.registerDefaultValidators();
  }

  /**
   * Create a module validator for the specified module
   * @param moduleName Module name (verbs, colors, numbers, hiragana, katakana)
   * @returns ActivityValidator instance
   */
  createModuleValidator(moduleName: string): ActivityValidator {
    const normalizedModule = moduleName.toLowerCase();

    if (this.validators.has(normalizedModule)) {
      return this.validators.get(normalizedModule)!;
    }

    const ValidatorClass = this.validatorClasses.get(normalizedModule);
    if (ValidatorClass) {
      const instance = new ValidatorClass();
      this.validators.set(normalizedModule, instance);
      return instance;
    }

    // Default to FlashcardValidator for unknown modules
    return this.createModuleValidator("flashcard");
  }

  /**
   * Get all supported module names
   * @returns Array of supported module names
   */
  getSupportedModules(): string[] {
    return Array.from(this.validatorClasses.keys());
  }

  /**
   * Register a validator for a specific module
   * @param moduleName Module name
   * @param validator Validator instance to register
   */
  registerModule(moduleName: string, validator: ActivityValidator): void {
    const normalizedModule = moduleName.toLowerCase();
    this.validators.set(normalizedModule, validator);
  }

  /**
   * Register a validator class for a specific module
   * @param moduleName Module name
   * @param ValidatorClass Validator class to register
   */
  registerModuleClass(
    moduleName: string,
    ValidatorClass: new () => ActivityValidator,
  ): void {
    const normalizedModule = moduleName.toLowerCase();
    this.validatorClasses.set(normalizedModule, ValidatorClass);
  }

  /**
   * Check if a module is supported
   * @param moduleName Module name to check
   * @returns True if supported
   */
  isSupported(moduleName: string): boolean {
    return this.validatorClasses.has(moduleName.toLowerCase());
  }

  /**
   * Get validator instance if it exists, otherwise create one
   * @param moduleName Module name
   * @returns ActivityValidator instance
   */
  getValidator(moduleName: string): ActivityValidator {
    return this.createModuleValidator(moduleName);
  }

  /**
   * Register default validators for common modules
   */
  private registerDefaultValidators(): void {
    // Register FlashcardValidator for general flashcard activities
    this.registerModuleClass("flashcard", FlashcardValidator);
    this.registerModuleClass("hiragana", FlashcardValidator);
    this.registerModuleClass("katakana", FlashcardValidator);
    this.registerModuleClass("colors", FlashcardValidator);
    this.registerModuleClass("numbers", FlashcardValidator);

    // Register ConjugationValidator for verb conjugation activities
    this.registerModuleClass("verbs", ConjugationValidator);
    this.registerModuleClass("conjugation", ConjugationValidator);
  }
}
