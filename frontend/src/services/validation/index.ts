/**
 * Validation System - Main exports
 */

// Core interfaces and types
export type {
  ValidationStrategy,
  ValidationResult,
  ValidationEngine,
} from "./core/ValidationStrategy";
export { ValidationEngine as ValidationEngineClass } from "./core/ValidationEngine";
export {
  createSuccessResult,
  createFailureResult,
  createPartialResult,
} from "./core/ValidationResult";

// Import for internal use
import { ValidationEngine as ValidationEngineClass } from "./core/ValidationEngine";
import { HiraganaValidator } from "./input-types/HiraganaValidator";
import { EnglishValidator } from "./input-types/EnglishValidator";
import { KatakanaValidator } from "./input-types/KatakanaValidator";
import { KanjiValidator } from "./input-types/KanjiValidator";
import { ValidatorFactory } from "./factories/ValidatorFactory";
import { ModuleValidatorFactory } from "./factories/ModuleValidatorFactory";

// Activity validator interfaces and types
export type {
  ActivityValidator,
  AnswerSet,
  ConjugationForm,
  Verb,
} from "./core/ActivityValidator";

// Input type validators
export { HiraganaValidator } from "./input-types/HiraganaValidator";
export { EnglishValidator } from "./input-types/EnglishValidator";
export { KatakanaValidator } from "./input-types/KatakanaValidator";
export { KanjiValidator } from "./input-types/KanjiValidator";

// Factory classes
export { ValidatorFactory } from "./factories/ValidatorFactory";
export { ModuleValidatorFactory } from "./factories/ModuleValidatorFactory";

// Activity-type validators
export { FlashcardValidator } from "./activity-types/FlashcardValidator";
export { ConjugationValidator } from "./activity-types/ConjugationValidator";

// Factory function to create a configured validation engine
export function createValidationEngine() {
  const engine = new ValidationEngineClass();

  // Register all validators
  engine.registerValidator("hiragana", new HiraganaValidator());
  engine.registerValidator("english", new EnglishValidator());
  engine.registerValidator("katakana", new KatakanaValidator());
  engine.registerValidator("kanji", new KanjiValidator());

  return engine;
}

// Factory function to create a configured validator factory
export function createValidatorFactory(): ValidatorFactory {
  return new ValidatorFactory();
}

// Factory function to create a configured module validator factory
export function createModuleValidatorFactory(): ModuleValidatorFactory {
  return new ModuleValidatorFactory();
}

// Default instances
export const defaultValidationEngine = createValidationEngine();
export const defaultValidatorFactory = createValidatorFactory();
export const defaultModuleValidatorFactory = createModuleValidatorFactory();
