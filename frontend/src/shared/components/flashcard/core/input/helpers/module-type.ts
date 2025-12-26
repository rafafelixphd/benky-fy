import { ModuleTypeInfo } from "@/components/flashcard/types/input";

const defaultModuleType: ModuleTypeInfo = {
  hasKatakana: false,
  hasKanji: false,
  hasFurigana: false,
  isConjugationModule: false,
};

const moduleTypeMap: Record<string, ModuleTypeInfo> = {
  hiragana: defaultModuleType,
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

export const getModuleType = (moduleName?: string): ModuleTypeInfo => {
  if (!moduleName) return defaultModuleType;
  return moduleTypeMap[moduleName] || {
    hasKatakana: false,
    hasKanji: true,
    hasFurigana: true,
    isConjugationModule: false,
  };
};
