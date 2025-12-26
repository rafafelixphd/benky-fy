import { FlashcardItem, UserSettings } from "@/core/api-client";
import { ValidationResult } from "@/core/validation";

export interface ModuleTypeInfo {
  hasKatakana: boolean;
  hasKanji: boolean;
  hasFurigana: boolean;
  isConjugationModule: boolean;
}

export interface AnswerInputProps {
  onSubmit: (
    answer:
      | string
      | {
          english: string;
          hiragana: string;
          katakana?: string;
          kanji?: string;
          romaji?: string;
        },
    validationResult?: any,
  ) => void;
  onAdvance?: () => void;
  disabled: boolean;
  settings: UserSettings;
  isCorrect?: boolean;
  currentItem?: FlashcardItem;
  lastAnswer?: string;
  lastMatchedType?: string;
  lastConvertedAnswer?: string;
  moduleName?: string;
  enableServerValidation?: boolean;
  enableRealtimeFeedback?: boolean;
}

export interface InputFieldProps {
  mode: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  isSubmitting: boolean;
  feedbackColor?: string;
  ref?: React.Ref<HTMLInputElement>;
}

export interface MultiInputTableProps {
  modes: string[];
  answers: Record<string, string>;
  disabled: boolean;
  isSubmitting: boolean;
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | null>>;
  handleInputChange: (mode: string) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  getFeedbackColor: (mode: string) => string;
}
