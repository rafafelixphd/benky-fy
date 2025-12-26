import { UserSettings } from "@/core/api-client";

/**
 * Input mode configuration interface
 */
export interface InputModeConfig {
  hasKatakana: boolean;
  hasKanji: boolean;
  hasFurigana: boolean;
  isConjugationModule: boolean;
}

/**
 * Input mode types
 */
export const INPUT_MODE_TYPES = {
  HIRAGANA: "hiragana",
  KATAKANA: "katakana",
  ENGLISH: "english",
  KANJI: "kanji",
  ROMAJI: "romaji",
} as const;

/**
 * Get enabled input modes based on user settings
 * @param settings User settings
 * @returns Array of enabled input mode strings
 */
export const getEnabledInputModes = (settings: UserSettings): string[] => {
  const enabledModes: string[] = [];

  if (settings.input_hiragana) enabledModes.push(INPUT_MODE_TYPES.HIRAGANA);
  if (settings.input_katakana) enabledModes.push(INPUT_MODE_TYPES.KATAKANA);
  if (settings.input_english) enabledModes.push(INPUT_MODE_TYPES.ENGLISH);
  if (settings.input_kanji) enabledModes.push(INPUT_MODE_TYPES.KANJI);
  if (settings.input_romaji) enabledModes.push(INPUT_MODE_TYPES.ROMAJI);

  return enabledModes;
};

/**
 * Get input mode configuration for a specific module
 * @param moduleName Name of the module
 * @returns InputModeConfig object
 */
export const getInputModeConfig = (moduleName?: string): InputModeConfig => {
  if (!moduleName) {
    return {
      hasKatakana: false,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    };
  }

  const moduleTypeMap: Record<string, InputModeConfig> = {
    hiragana: {
      hasKatakana: false,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    },
    katakana: {
      hasKatakana: true,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    },
    katakana_words: {
      hasKatakana: true,
      hasKanji: false,
      hasFurigana: false,
      isConjugationModule: false,
    },
    verbs: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: true,
    },
    adjectives: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: true,
    },
    base_nouns: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    colors_basic: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    days_of_week: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    greetings_essential: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    months_complete: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    numbers_basic: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    numbers_extended: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    question_words: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
    vocab: {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    },
  };

  return (
    moduleTypeMap[moduleName] || {
      hasKatakana: false,
      hasKanji: true,
      hasFurigana: true,
      isConjugationModule: false,
    }
  );
};

/**
 * Validate if an input mode is supported for a module
 * @param mode Input mode to validate
 * @param moduleName Name of the module
 * @returns True if mode is supported
 */
export const validateInputMode = (
  mode: string,
  moduleName?: string,
): boolean => {
  const config = getInputModeConfig(moduleName);

  switch (mode) {
    case INPUT_MODE_TYPES.HIRAGANA:
      return true; // All modules support hiragana
    case INPUT_MODE_TYPES.KATAKANA:
      return config.hasKatakana;
    case INPUT_MODE_TYPES.ENGLISH:
      return true; // All modules support English
    case INPUT_MODE_TYPES.KANJI:
      return config.hasKanji;
    case INPUT_MODE_TYPES.ROMAJI:
      return true; // All modules support romaji
    default:
      return false;
  }
};

/**
 * Get available input modes for a module
 * @param moduleName Name of the module
 * @returns Array of available input modes
 */
export const getAvailableInputModes = (moduleName?: string): string[] => {
  const allModes = Object.values(INPUT_MODE_TYPES);
  return allModes.filter((mode) => validateInputMode(mode, moduleName));
};
